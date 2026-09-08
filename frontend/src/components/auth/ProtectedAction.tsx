"use client";

import React from "react";
import { useAuthStore, IntendedAction } from "@/stores/authStore";

export interface ProtectedActionProps {
  action: IntendedAction;
  onAction?: () => void;
  customMessage?: string;
  children:
    | React.ReactNode
    | ((props: { execute: (e?: React.MouseEvent) => void; isLoggedIn: boolean }) => React.ReactNode);
  className?: string;
}

/**
 * Reusable ProtectedAction wrapper for Genekon.
 * Intercepts actions if user is a guest, stores the intended action,
 * and opens the non-intrusive "Login required to continue" modal.
 * If user is already authenticated, directly executes onAction.
 */
export const ProtectedAction: React.FC<ProtectedActionProps> = ({
  action,
  onAction,
  customMessage = "Login required to continue",
  children,
  className,
}) => {
  const { isLoggedIn, openLoginModal } = useAuthStore();

  const handleTrigger = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isLoggedIn) {
      onAction?.();
    } else {
      openLoginModal(action, customMessage);
    }
  };

  if (typeof children === "function") {
    return <>{children({ execute: handleTrigger, isLoggedIn })}</>;
  }

  return (
    <div
      onClick={handleTrigger}
      className={className || "contents"}
      role="presentation"
    >
      {children}
    </div>
  );
};

export default ProtectedAction;
