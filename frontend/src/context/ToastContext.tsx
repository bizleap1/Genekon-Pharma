"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer, ToastMessage } from "@/components/ui/Toast";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info" | "warning", duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning" = "success", duration = 3500) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type, duration };
      setToasts((prev) => [...prev.slice(-3), newToast]); // keep at most 4 toasts

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => showToast(msg, "success"), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, "error"), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, "info"), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, "warning"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      showToast: (msg) => console.log(msg),
      success: (msg) => console.log(msg),
      error: (msg) => console.error(msg),
      info: (msg) => console.info(msg),
      warning: (msg) => console.warn(msg),
    };
  }
  return context;
};
