"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BellRing } from "lucide-react";

export function AnnouncementBanner() {
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

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
          className="bg-primary text-primary-foreground border-b-4 border-primary-shadow relative overflow-hidden z-50"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="bg-primary-foreground/20 p-2 rounded-xl border-2 border-primary-foreground/30 hidden sm:block"
              >
                <BellRing className="w-4 h-4 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                <span className="inline-flex px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-black text-[10px] uppercase tracking-wider self-start sm:self-auto shadow-sm">
                  {version}
                </span>
                <p className="font-bold text-xs sm:text-sm leading-tight text-primary-foreground/90">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-primary-foreground/20 rounded-lg transition-colors border-2 border-transparent hover:border-primary-foreground/30"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
