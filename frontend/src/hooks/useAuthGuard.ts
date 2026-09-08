"use client";

import { useAuthStore, IntendedAction, authStore } from "@/stores/authStore";
import { Product } from "@/types/product";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useAuthGuard() {
  const { isLoggedIn, guestUser, openLoginModal } = useAuthStore();

  const requireAuth = (
    onAuthorized: () => void,
    intendedAction: IntendedAction,
    customMessage = "Login required to continue"
  ): boolean => {
    if (isLoggedIn) {
      onAuthorized();
      return true;
    }
    openLoginModal(intendedAction, customMessage);
    return false;
  };

  return {
    isLoggedIn,
    guestUser,
    requireAuth,
  };
}

/**
 * Automatically restores and executes the saved intended action after a successful login.
 */
export function restoreIntendedActionAfterLogin(
  router: AppRouterInstance,
  cart: { addToCart: (product: Product, quantity?: number, variant?: string) => unknown },
  wishlist: { toggleWishlist: (product: Product) => void | boolean },
  toast?: { success: (msg: string) => void; info: (msg: string) => void }
) {
  const action = authStore.getIntendedAction();
  authStore.clearIntendedAction();

  const currentUser = authStore.getSnapshot().user;
  const roleDefaultPath = authStore.getRoleRedirectPath(currentUser?.role || "customer");

  if (!action) {
    router.push(roleDefaultPath);
    return;
  }

  switch (action.type) {
    case "ADD_TO_CART":
      if (action.payload?.product) {
        cart.addToCart(
          action.payload.product,
          action.payload.quantity || 1,
          action.payload.variant
        );
        if (toast) {
          toast.success(`"${action.payload.product.name}" added to your cart.`);
        }
      }
      router.push(action.redirectUrl || "/cart");
      break;

    case "BUY_NOW":
      if (action.payload?.product) {
        cart.addToCart(
          action.payload.product,
          action.payload.quantity || 1,
          action.payload.variant
        );
      }
      router.push("/checkout");
      break;

    case "WISHLIST":
      if (action.payload?.product) {
        wishlist.toggleWishlist(action.payload.product);
        if (toast) {
          toast.success(`"${action.payload.product.name}" saved to your Wishlist.`);
        }
      }
      router.push(action.redirectUrl || "/wishlist");
      break;

    case "CHECKOUT":
      router.push("/checkout");
      break;

    case "UPLOAD_PRESCRIPTION":
      router.push("/prescription/upload");
      break;

    case "TRACK_ORDER":
      router.push("/track-order");
      break;

    case "SAVED_ADDRESSES":
      router.push("/account/addresses");
      break;

    case "REORDER":
      if (action.payload?.items && Array.isArray(action.payload.items)) {
        action.payload.items.forEach((item: { product?: Product; id?: string; name?: string; price?: number; quantity?: number; qty?: number; variant?: string }) => {
          const prod = item.product || (item as unknown as Product);
          if (prod && prod.id) {
            cart.addToCart(
              prod,
              item.qty || item.quantity || 1,
              item.variant
            );
          }
        });
        if (toast) {
          toast.success("Items from your previous order added to cart!");
        }
        router.push("/cart");
      } else {
        router.push("/account/orders");
      }
      break;

    default:
      router.push(action.redirectUrl || roleDefaultPath);
      break;
  }
}
