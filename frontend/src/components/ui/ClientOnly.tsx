"use client";

import React, { useEffect, useState } from "react";
import { LoadingScreen } from "./LoadingScreen";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  message?: string;
  fullScreen?: boolean;
}

export function ClientOnly({
  children,
  fallback,
  message = "Loading genuine healthcare...",
  fullScreen = true,
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <LoadingScreen fullScreen={fullScreen} message={message} />
    );
  }

  return <>{children}</>;
}
