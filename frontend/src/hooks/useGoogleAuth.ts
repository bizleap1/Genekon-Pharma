"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/auth";
import { authStore } from "@/stores/authStore";
import { cartStore } from "@/stores/cartStore";
import { useToast } from "@/context/ToastContext";

declare global {
  interface Window {
    google?: any;
  }
}

export function useGoogleAuth() {
  const router = useRouter();
  const toast = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) {
        toast.error("Google authentication failed: No token received from Google");
        setIsGoogleLoading(false);
        return;
      }

      try {
        setIsGoogleLoading(true);
        const res = await authApi.googleLogin(response.credential);
        if (res.success && res.data) {
          authStore.loginCustomer(res.data.user, res.data.token);
          cartStore.mergeGuestCart();
          toast.success(`Welcome ${res.data.user.name || "Customer"}!`);
          router.push("/account");
        } else {
          toast.error(res.message || "Google authentication failed");
        }
      } catch (err: any) {
        toast.error(err.message || "Google sign-in error occurred");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [router, toast]
  );

  // Dynamically inject Google Identity Services script & pre-initialize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGsi = () => {
      setIsGsiLoaded(true);
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (e) {
          console.error("GSI init failed", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", initGsi);
    }
  }, [handleCredentialResponse]);

  const triggerGoogleLogin = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Check if real Google Client ID is configured
    if (!clientId || clientId.trim() === "" || clientId.includes("placeholder")) {
      toast.info(
        "Google Client ID set nahi hai. Demo test account se Google login simulate kiya ja raha hai..."
      );
      setIsGoogleLoading(true);
      setTimeout(async () => {
        try {
          const res = await authApi.googleLogin(`mock_google_token_${Date.now()}`);
          if (res.success && res.data) {
            authStore.loginCustomer(res.data.user, res.data.token);
            cartStore.mergeGuestCart();
            toast.success(`Signed in as ${res.data.user.name}!`);
            router.push("/account");
          } else {
            toast.error(res.message || "Login failed");
          }
        } catch (err: any) {
          toast.error(err.message || "Demo login failed");
        } finally {
          setIsGoogleLoading(false);
        }
      }, 700);
      return;
    }

    if (!window.google?.accounts?.id) {
      toast.error("Google sign-in service load ho raha hai, kripya 1 second baad dobara koshish karein.");
      return;
    }

    setIsGoogleLoading(true);
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMomentum?.()) {
          setIsGoogleLoading(false);
        }
      });
    } catch (e: any) {
      setIsGoogleLoading(false);
      toast.error("Google sign-in popup open nahi ho paya.");
    }
  }, [handleCredentialResponse, router, toast]);

  return {
    triggerGoogleLogin,
    isGoogleLoading,
    isGsiLoaded,
  };
}
