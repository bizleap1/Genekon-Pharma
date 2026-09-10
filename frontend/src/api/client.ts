/**
 * Unified API Client for Genekon Pharmacy
 * Handles HTTP requests, JWT token injection, query parameter serialization,
 * timeouts, automatic 401 silent token refresh, and error handling.
 */

import { ApiResponse, ApiError, RequestOptions } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api/v1";

const DEFAULT_TIMEOUT_MS = 15000;

export class ApiClient {
  private baseUrl: string;
  private tokenGetter: (() => string | null) | null = null;
  private refreshTokenGetter: (() => string | null) | null = null;
  private tokenUpdater: ((tokens: { accessToken: string; refreshToken?: string }) => void) | null = null;
  private sessionExpiredHandler: (() => void) | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register dynamic auth token providers and handlers
   */
  public setTokenGetter(getter: () => string | null): void {
    this.tokenGetter = getter;
  }

  public setRefreshTokenGetter(getter: () => string | null): void {
    this.refreshTokenGetter = getter;
  }

  public setTokenUpdater(updater: (tokens: { accessToken: string; refreshToken?: string }) => void): void {
    this.tokenUpdater = updater;
  }

  public setSessionExpiredHandler(handler: () => void): void {
    this.sessionExpiredHandler = handler;
  }

  /**
   * Retrieve active bearer token from storage or registered getter
   */
  private getAuthToken(): string | null {
    if (this.tokenGetter) {
      const token = this.tokenGetter();
      if (token) return token;
    }
    if (typeof window !== "undefined") {
      try {
        const session = localStorage.getItem("genekon_auth_session_v3");
        if (session) {
          const parsed = JSON.parse(session);
          return parsed.token || null;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  /**
   * Retrieve active refresh token from storage or registered getter
   */
  private getRefreshToken(): string | null {
    if (this.refreshTokenGetter) {
      const token = this.refreshTokenGetter();
      if (token) return token;
    }
    if (typeof window !== "undefined") {
      try {
        const session = localStorage.getItem("genekon_auth_session_v3");
        if (session) {
          const parsed = JSON.parse(session);
          return parsed.refreshToken || null;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }

  private handleSessionExpired(): void {
    if (this.sessionExpiredHandler) {
      this.sessionExpiredHandler();
    }
  }

  /**
   * Silent Token Refresh with concurrency mutex
   */
  private async performTokenRefresh(refreshToken: string): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise<string | null>((resolve) => {
        this.refreshSubscribers.push((token: string | null) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to refresh token");
      }

      const newAccessToken =
        data.data?.tokens?.accessToken || data.data?.accessToken;
      const newRefreshToken =
        data.data?.tokens?.refreshToken || data.data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint");
      }

      if (this.tokenUpdater) {
        this.tokenUpdater({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }

      this.refreshSubscribers.forEach((callback) => callback(newAccessToken));
      this.refreshSubscribers = [];

      return newAccessToken;
    } catch (err) {
      this.refreshSubscribers.forEach((callback) => callback(null));
      this.refreshSubscribers = [];
      throw err;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Serialize URL query parameters cleanly
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Core request executor with timeout, standard response parsing, and 401 retry
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      skipAuth = false,
      headers: customHeaders = {},
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);

    const headers = new Headers(customHeaders);
    if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch {
        throw {
          success: false,
          message: response.statusText || "Unexpected server response",
          statusCode: response.status,
        } as ApiError;
      }

      // Check if 401 Unauthorized (Expired or Invalid access token)
      if (
        response.status === 401 &&
        !skipAuth &&
        !endpoint.includes("/auth/refresh-token") &&
        !endpoint.includes("/auth/login") &&
        !endpoint.includes("/auth/verify-otp")
      ) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          try {
            const newAccessToken = await this.performTokenRefresh(refreshToken);
            if (newAccessToken) {
              // Retry request with fresh access token
              const retryHeaders = new Headers(customHeaders);
              if (!retryHeaders.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
                retryHeaders.set("Content-Type", "application/json");
              }
              retryHeaders.set("Accept", "application/json");
              retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

              const retryResponse = await fetch(url, {
                ...fetchOptions,
                headers: retryHeaders,
              });

              const retryData = await retryResponse.json();
              if (retryResponse.ok && retryData.success) {
                return retryData;
              }
            }
          } catch (refreshErr) {
            console.warn("Silent token refresh failed, prompting re-auth:", refreshErr);
            this.handleSessionExpired();
          }
        } else {
          this.handleSessionExpired();
        }
      }

      if (!response.ok || !data.success) {
        const isAuthError = response.status === 401;
        throw {
          success: false,
          message: isAuthError
            ? "Your session has expired. Please log in to continue."
            : data.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
          errorCode: (data as unknown as ApiError).errorCode || (isAuthError ? "INVALID_TOKEN" : undefined),
          details: (data as unknown as ApiError).details,
        } as ApiError;
      }

      return data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if ((err as Error)?.name === "AbortError") {
        throw {
          success: false,
          message: "Request timed out. Please check your internet connection.",
          statusCode: 408,
          errorCode: "TIMEOUT",
        } as ApiError;
      }

      if ((err as ApiError)?.success === false) {
        throw err as ApiError;
      }

      throw {
        success: false,
        message: (err as Error)?.message || "Network error. Please try again later.",
        statusCode: 500,
        errorCode: "NETWORK_ERROR",
      } as ApiError;
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
