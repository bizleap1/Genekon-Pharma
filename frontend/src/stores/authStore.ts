"use client";

import { useSyncExternalStore } from "react";
import { UserProfile, UserRole } from "@/types/user";
import { Product } from "@/types/product";

export type { UserProfile, UserRole };

export type IntendedActionType =
  | "ADD_TO_CART"
  | "BUY_NOW"
  | "CHECKOUT"
  | "WISHLIST"
  | "UPLOAD_PRESCRIPTION"
  | "TRACK_ORDER"
  | "SAVED_ADDRESSES"
  | "REORDER"
  | "REDIRECT";

export interface IntendedActionPayload {
  product?: Product;
  quantity?: number;
  variant?: string;
  orderId?: string;
  items?: Array<{ product?: Product; id?: string; name?: string; price?: number; quantity?: number; qty?: number; variant?: string }>;
  [key: string]: unknown;
}

export interface IntendedAction {
  type: IntendedActionType;
  title?: string;
  payload?: IntendedActionPayload;
  redirectUrl?: string;
}

export interface AuthState {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  guestUser: boolean;
  isAdmin: boolean;
  isWholesale: boolean;
  intendedAction: IntendedAction | null;
  redirectPath: string | null;
  sessionExpiresAt: number | null;
  otpSent: boolean;
  tempMobile: string;
  loading: boolean;
  error: string | null;
  loginModal: {
    isOpen: boolean;
    message: string;
    action: IntendedAction | null;
  };
}

const AUTH_STORAGE_KEY = "genekon_auth_session_v3";
const INTENDED_ACTION_KEY = "genekon_intended_action_v2";

// 7 days default session duration
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getStoredIntendedAction(): IntendedAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(INTENDED_ACTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitialState(): AuthState {
  if (typeof window === "undefined") {
    return {
      user: null,
      currentUser: null,
      isLoggedIn: false,
      guestUser: true,
      isAdmin: false,
      isWholesale: false,
      intendedAction: null,
      redirectPath: null,
      sessionExpiresAt: null,
      otpSent: false,
      tempMobile: "",
      loading: false,
      error: null,
      loginModal: {
        isOpen: false,
        message: "Login required to continue",
        action: null,
      },
    };
  }

  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const isExpired = parsed.sessionExpiresAt && Date.now() > parsed.sessionExpiresAt;

      if (parsed.user && !isExpired) {
        return {
          user: parsed.user,
          currentUser: parsed.user,
          isLoggedIn: true,
          guestUser: false,
          isAdmin: parsed.user.role === "admin",
          isWholesale: parsed.user.role === "wholesale",
          intendedAction: getStoredIntendedAction(),
          redirectPath: parsed.redirectPath || null,
          sessionExpiresAt: parsed.sessionExpiresAt,
          otpSent: false,
          tempMobile: "",
          loading: false,
          error: null,
          loginModal: {
            isOpen: false,
            message: "Login required to continue",
            action: null,
          },
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    user: null,
    currentUser: null,
    isLoggedIn: false,
    guestUser: true,
    isAdmin: false,
    isWholesale: false,
    intendedAction: getStoredIntendedAction(),
    redirectPath: null,
    sessionExpiresAt: null,
    otpSent: false,
    tempMobile: "",
    loading: false,
    error: null,
    loginModal: {
      isOpen: false,
      message: "Login required to continue",
      action: null,
    },
  };
}

let state: AuthState = getInitialState();
const listeners = new Set<() => void>();

function emitChange() {
  if (typeof window !== "undefined") {
    try {
      if (state.user) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: state.user,
            redirectPath: state.redirectPath,
            sessionExpiresAt: state.sessionExpiresAt,
          })
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      if (state.intendedAction) {
        localStorage.setItem(
          INTENDED_ACTION_KEY,
          JSON.stringify(state.intendedAction)
        );
      } else {
        localStorage.removeItem(INTENDED_ACTION_KEY);
      }
    } catch (err) {
      console.error("Failed to persist auth state", err);
    }
  }
  listeners.forEach((listener) => listener());
}

export const authStore = {
  getSnapshot(): AuthState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getRoleRedirectPath(role: UserRole = "customer"): string {
    switch (role) {
      case "wholesale":
        return "/wholesale/dashboard";
      case "admin":
        return "/admin";
      case "customer":
      default:
        return "/account";
    }
  },

  openLoginModal(action?: IntendedAction, customMessage = "Login required to continue"): void {
    state = {
      ...state,
      intendedAction: action || state.intendedAction,
      loginModal: {
        isOpen: true,
        message: customMessage,
        action: action || state.intendedAction,
      },
    };
    emitChange();
  },

  closeLoginModal(): void {
    state = {
      ...state,
      loginModal: {
        ...state.loginModal,
        isOpen: false,
      },
    };
    emitChange();
  },

  saveIntendedAction(action: IntendedAction): void {
    state = {
      ...state,
      intendedAction: action,
      redirectPath: action.redirectUrl || null,
    };
    emitChange();
  },

  getIntendedAction(): IntendedAction | null {
    return state.intendedAction || getStoredIntendedAction();
  },

  clearIntendedAction(): void {
    state = {
      ...state,
      intendedAction: null,
      redirectPath: null,
      loginModal: {
        ...state.loginModal,
        action: null,
      },
    };
    emitChange();
  },

  async requestOtp(mobile: string): Promise<{ success: boolean; error?: string }> {
    state = { ...state, loading: true, error: null };
    emitChange();

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      state = {
        ...state,
        loading: false,
        error: "Please enter a valid 10-digit Indian mobile number (e.g. 9822XXXXXX)",
      };
      emitChange();
      return { success: false, error: state.error! };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        state = {
          ...state,
          loading: false,
          otpSent: true,
          tempMobile: cleanMobile,
          error: null,
        };
        emitChange();
        resolve({ success: true });
      }, 500);
    });
  },

  async verifyOtp(otp: string): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    state = { ...state, loading: true, error: null };
    emitChange();

    if (!otp || otp.length < 6) {
      state = { ...state, loading: false, error: "Please enter the complete 6-digit security code" };
      emitChange();
      return { success: false, error: state.error! };
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const expiresAt = Date.now() + SESSION_DURATION_MS;
        const loggedUser: UserProfile = {
          id: `cust-${Date.now().toString().slice(-6)}`,
          name: "Prerna Sharma",
          mobile: state.tempMobile || "9370102691",
          email: "prerna.sharma@gmail.com",
          role: "customer",
          city: "Nagpur",
          pincode: "440013",
          address: "Flat 402, Green Valley Apartments, Katol Road",
        };

        state = {
          ...state,
          loading: false,
          isLoggedIn: true,
          guestUser: false,
          user: loggedUser,
          currentUser: loggedUser,
          isAdmin: false,
          isWholesale: false,
          sessionExpiresAt: expiresAt,
          otpSent: false,
          tempMobile: "",
          error: null,
          loginModal: {
            ...state.loginModal,
            isOpen: false,
          },
        };
        emitChange();
        resolve({ success: true, user: loggedUser });
      }, 500);
    });
  },

  loginCustomer(profile?: Partial<UserProfile>): UserProfile {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const user: UserProfile = {
      id: profile?.id || `cust-${Date.now().toString().slice(-6)}`,
      name: profile?.name || "Prerna Sharma",
      mobile: profile?.mobile || "9370102691",
      email: profile?.email || "prerna.sharma@gmail.com",
      role: "customer",
      city: profile?.city || "Nagpur",
      pincode: profile?.pincode || "440013",
      address: profile?.address || "Flat 402, Green Valley Apartments, Katol Road",
      ...profile,
    };

    state = {
      ...state,
      isLoggedIn: true,
      guestUser: false,
      user,
      currentUser: user,
      isAdmin: false,
      isWholesale: false,
      sessionExpiresAt: expiresAt,
      loginModal: {
        ...state.loginModal,
        isOpen: false,
      },
      error: null,
    };
    emitChange();
    return user;
  },

  loginWholesalePartner(profile?: Partial<UserProfile>): UserProfile {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const user: UserProfile = {
      id: profile?.id || `whl-${Date.now().toString().slice(-6)}`,
      name: profile?.name || "Ramesh Patel",
      businessName: profile?.businessName || "LifeCare Medicos",
      gstNumber: profile?.gstNumber || "27AABCL7782A1Z4",
      mobile: profile?.mobile || "9822001122",
      email: profile?.email || "lifecare.med@gmail.com",
      role: "wholesale",
      city: profile?.city || "Nagpur",
      pincode: profile?.pincode || "440010",
      ...profile,
    };

    state = {
      ...state,
      isLoggedIn: true,
      guestUser: false,
      user,
      currentUser: user,
      isAdmin: false,
      isWholesale: true,
      sessionExpiresAt: expiresAt,
      loginModal: {
        ...state.loginModal,
        isOpen: false,
      },
      error: null,
    };
    emitChange();
    return user;
  },

  loginAsAdmin(): void {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const adminUser: UserProfile = {
      id: "admin-1",
      name: "Pharmacy Lead Administrator",
      mobile: "9370102691",
      email: "admin@genekon.in",
      role: "admin",
      city: "Nagpur",
    };
    state = {
      ...state,
      isLoggedIn: true,
      guestUser: false,
      user: adminUser,
      currentUser: adminUser,
      isAdmin: true,
      isWholesale: false,
      sessionExpiresAt: expiresAt,
      error: null,
    };
    emitChange();
  },

  logout(): void {
    state = {
      ...state,
      isLoggedIn: false,
      guestUser: true,
      user: null,
      currentUser: null,
      isAdmin: false,
      isWholesale: false,
      sessionExpiresAt: null,
      otpSent: false,
      tempMobile: "",
      error: null,
      intendedAction: null,
      redirectPath: null,
    };
    emitChange();
  },

  checkSessionExpiry(): boolean {
    if (state.sessionExpiresAt && Date.now() > state.sessionExpiresAt) {
      this.logout();
      return true; // was expired
    }
    return false;
  },

  setRedirectPath(path: string | null): void {
    state = { ...state, redirectPath: path };
    emitChange();
  },
};

export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    () => ({
      user: null,
      currentUser: null,
      isLoggedIn: false,
      guestUser: true,
      isAdmin: false,
      isWholesale: false,
      intendedAction: null,
      redirectPath: null,
      sessionExpiresAt: null,
      otpSent: false,
      tempMobile: "",
      loading: false,
      error: null,
      loginModal: {
        isOpen: false,
        message: "Login required to continue",
        action: null,
      },
    })
  );

  return {
    ...snapshot,
    getRoleRedirectPath: authStore.getRoleRedirectPath.bind(authStore),
    openLoginModal: authStore.openLoginModal.bind(authStore),
    closeLoginModal: authStore.closeLoginModal.bind(authStore),
    saveIntendedAction: authStore.saveIntendedAction.bind(authStore),
    getIntendedAction: authStore.getIntendedAction.bind(authStore),
    clearIntendedAction: authStore.clearIntendedAction.bind(authStore),
    requestOtp: authStore.requestOtp.bind(authStore),
    verifyOtp: authStore.verifyOtp.bind(authStore),
    loginCustomer: authStore.loginCustomer.bind(authStore),
    loginWholesalePartner: authStore.loginWholesalePartner.bind(authStore),
    loginAsAdmin: authStore.loginAsAdmin.bind(authStore),
    logout: authStore.logout.bind(authStore),
    checkSessionExpiry: authStore.checkSessionExpiry.bind(authStore),
  };
}
