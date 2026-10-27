"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface UseUnsavedChangesWarningOptions {
  isDirty: boolean;
  defaultBackUrl?: string;
  onConfirmLeave?: () => void;
}

export function useUnsavedChangesWarning({
  isDirty,
  defaultBackUrl = "/dashboard",
  onConfirmLeave,
}: UseUnsavedChangesWarningOptions) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const bypassRef = useRef(false);

  // 1. Browser Tab Close / Reload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !bypassRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 2. Browser Back / Forward button (popstate)
  useEffect(() => {
    if (!isDirty) return;

    // Push dummy history entry so back button can be intercepted
    window.history.pushState({ unsavedWarning: true }, "", window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (bypassRef.current) return;

      // Keep user on the page until confirmed
      window.history.pushState(null, "", window.location.href);

      setPendingAction(() => () => {
        bypassRef.current = true;
        if (defaultBackUrl) {
          router.push(defaultBackUrl);
        } else {
          window.history.go(-2);
        }
      });
      setShowPrompt(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, defaultBackUrl, router]);

  // 3. In-app navigation clicks (Links in topbar, bottom nav, etc.)
  useEffect(() => {
    if (!isDirty) return;

    const handleLinkClick = (e: MouseEvent) => {
      if (bypassRef.current) return;

      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || target.target === "_blank" || target.hasAttribute("download")) {
        return;
      }

      // If clicking the current path without navigation, ignore
      if (href === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();

      setPendingAction(() => () => {
        bypassRef.current = true;
        router.push(href);
      });
      setShowPrompt(true);
    };

    // Use capture phase to intercept before Next.js Link router fires
    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [isDirty, router]);

  // Programmatic leave trigger (for "Batal" or "Kembali" buttons)
  const triggerLeave = useCallback(
    (targetUrl?: string) => {
      const destination = targetUrl || defaultBackUrl;
      const doLeave = () => {
        bypassRef.current = true;
        if (onConfirmLeave) {
          try {
            onConfirmLeave();
          } catch (e) {
            console.error("Error in onConfirmLeave:", e);
          }
        }
        if (destination) {
          router.push(destination);
        } else if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        }
      };

      if (!isDirty) {
        doLeave();
        return;
      }

      setPendingAction(() => doLeave);
      setShowPrompt(true);
    },
    [isDirty, defaultBackUrl, router, onConfirmLeave]
  );

  const confirmLeave = useCallback(() => {
    setShowPrompt(false);
    bypassRef.current = true;
    if (onConfirmLeave) {
      try {
        onConfirmLeave();
      } catch (e) {
        console.error("Error in onConfirmLeave:", e);
      }
    }
    if (pendingAction) {
      pendingAction();
    } else if (defaultBackUrl) {
      router.push(defaultBackUrl);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    }
  }, [pendingAction, defaultBackUrl, router, onConfirmLeave]);

  const cancelLeave = useCallback(() => {
    setShowPrompt(false);
    setPendingAction(null);
  }, []);

  const allowNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return {
    showPrompt,
    setShowPrompt,
    triggerLeave,
    confirmLeave,
    cancelLeave,
    allowNavigation,
  };
}

