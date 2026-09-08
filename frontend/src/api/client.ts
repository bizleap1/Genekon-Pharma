/**
 * Unified API Client for Genekon Pharmacy
 * Handles HTTP requests, JWT token injection, query parameter serialization,
 * timeouts, and error handling for future Node.js + Express backend integration.
 */

import { ApiResponse, ApiError, RequestOptions } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api/v1";

const DEFAULT_TIMEOUT_MS = 15000;

export class ApiClient {
  private baseUrl: string;
  private tokenGetter: (() => string | null) | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a dynamic auth token provider (e.g. from authStore)
   */
  public setTokenGetter(getter: () => string | null): void {
    this.tokenGetter = getter;
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
   * Core request executor with timeout and standard response parsing
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

      if (!response.ok || !data.success) {
        throw {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
          errorCode: (data as unknown as ApiError).errorCode,
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
