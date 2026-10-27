"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function AnnouncementBanner() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState("v2.0.0");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [duration, setDuration] = useState(20);
  const [isPaused, setIsPaused] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    fetch("/api/announcement")
      .then((res) => res.json())
      .then((data) => {
        if (data.active && data.message) {
          const dismissedMessage = localStorage.getItem("dismissed_announcement");
          // Jika pesan berbeda dari yang didismiss, tampilkan lagi
          if (dismissedMessage !== data.message) {
            setActive(true);
            setMessage(data.message);
            setVersion(data.version || "v1.0.0");
            setIsVisible(true);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const updateOverflow = useCallback(() => {
    if (!bannerRef.current || !measureRef.current) return;
    const bannerWidth = bannerRef.current.clientWidth;
    const textWidth = measureRef.current.offsetWidth;
    const badgeWidth = badgeRef.current?.offsetWidth || 65;

    // Buffer for padding, gap, and dismiss button clearance
    // Mobile (<640px): ~20px horizontal padding + ~28px close button + ~8px badge gap = ~56px
    // Desktop (>=640px): ~48px horizontal padding + ~36px close button + ~12px badge gap = ~96px
    const isMobile = window.innerWidth < 640;
    const clearance = isMobile ? 56 : 96;
    const availableWidth = Math.max(0, bannerWidth - badgeWidth - clearance);

    const overflows = textWidth > availableWidth;
    setIsOverflowing(overflows);

    if (overflows) {
      // Dynamic reading velocity (~45px/second)
      // Jarak 1 siklus penuh (2 item) = 2 * (textWidth + 32px gap)
      const calculatedDuration = Math.max(12, Math.round((2 * (textWidth + 32)) / 45));
      setDuration(calculatedDuration);
    }
  }, []);

  useEffect(() => {
    if (!isVisible || !message) return;

    updateOverflow();
    const rafId = requestAnimationFrame(updateOverflow);
    const timer = setTimeout(updateOverflow, 80);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(updateOverflow).catch(() => {});
    }

    const handleResize = () => {
      updateOverflow();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && bannerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateOverflow();
      });
      resizeObserver.observe(bannerRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [isVisible, message, updateOverflow]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("dismissed_announcement", message);
    // Beri waktu animasi selesai sebelum menghapus dari DOM (ditangani oleh AnimatePresence)
    setTimeout(() => setActive(false), 300);
  };

  if (loading || !active) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-[#091530] via-[#0F2559] to-[#091530] text-white relative overflow-hidden z-50 shadow-[0_2px_16px_rgba(255,138,43,0.18)]"
        >
          {/* Subtle Orange Laser Accent Line at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF8A2B] to-transparent opacity-90" />

          {/* Centered Content Container */}
          <div
            ref={bannerRef}
            className="max-w-[1200px] mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2 relative flex items-center justify-center min-h-[34px] sm:min-h-[38px]"
          >
            {/* Center Content: Pill + Message */}
            <div
              className={`flex items-center gap-2 sm:gap-2.5 min-w-0 ${
                isOverflowing
                  ? "w-full justify-start pr-6 sm:pr-8"
                  : "justify-center max-w-full text-center"
              }`}
            >
              {/* Vibrant Glowing Beacon Pill */}
              <span
                ref={badgeRef}
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF8A2B] to-[#EA580C] text-white font-mono text-[9.5px] sm:text-[10px] font-black tracking-wide shrink-0 shadow-sm shadow-orange-500/40 ring-1 ring-white/20 select-none"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span>{version}</span>
              </span>

              {/* Message: Running marquee when overflowing, or static when fitting */}
              {isOverflowing ? (
                <div
                  className="min-w-0 flex-1 overflow-hidden relative group cursor-default select-none"
                  style={{
                    maskImage:
                      "linear-gradient(to right, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(to right, transparent 0%, black 14px, black calc(100% - 14px), transparent 100%)",
                  }}
                  title={message}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <div
                    className="flex items-center w-max animate-banner-marquee group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused]"
                    style={{
                      animationDuration: `${duration}s`,
                      animationPlayState: isPaused ? "paused" : "running",
                    }}
                  >
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        aria-hidden={index > 0 ? "true" : undefined}
                        className="flex items-center gap-2.5 shrink-0 pr-8"
                      >
                        <span className="font-semibold text-[11px] sm:text-xs text-white/95 dark:text-[#F2F5FA] whitespace-nowrap leading-tight tracking-tight drop-shadow-xs">
                          {message}
                        </span>
                        <span className="text-[#FF8A2B] text-[9px] select-none shrink-0 font-bold opacity-80">
                          ✦
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-[11px] sm:text-xs text-white/95 dark:text-[#F2F5FA] leading-tight tracking-tight drop-shadow-xs whitespace-nowrap">
                  {message}
                </p>
              )}
            </div>

            {/* Hidden measurement span for exact unclipped text width */}
            <span
              ref={measureRef}
              className="absolute left-[-9999px] top-[-9999px] invisible whitespace-nowrap font-semibold text-[11px] sm:text-xs pointer-events-none select-none"
              aria-hidden="true"
            >
              {message}
            </span>

            {/* Dismiss Button pinned to the right edge */}
            <button
              onClick={handleDismiss}
              className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 p-1 sm:p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer z-10"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
