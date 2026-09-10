"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Complete progress bar whenever route successfully updates
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks to immediately trigger the top loader
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      // Only trigger for local navigation links
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("download") &&
        target.getAttribute("target") !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // Only if navigating to a different pathname
        const targetUrl = new URL(href, window.location.origin);
        if (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search) {
          setVisible(true);
          setProgress(25);

          const t1 = setTimeout(() => setProgress(55), 150);
          const t2 = setTimeout(() => setProgress(78), 350);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#1853A8] via-[#559620] to-[#74B634] shadow-[0_0_10px_rgba(85,150,32,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "all 300ms ease-out" : "width 250ms ease-out",
        }}
      />
    </div>
  );
}
