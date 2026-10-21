"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutGrid, GraduationCap, Info } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on dashboard or admin pages if needed, but let's check pathname
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = pathname?.startsWith("/admin");
  const isMaintenance = pathname?.startsWith("/maintenance");

  if (isDashboard || isAdmin || isMaintenance) return null;

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Galeri",
      href: "/explore",
      icon: LayoutGrid,
      isActive: pathname?.startsWith("/explore") || pathname?.startsWith("/project"),
    },
    {
      label: "Mahasiswa",
      href: "/student",
      icon: GraduationCap,
      isActive: pathname?.startsWith("/student") || pathname?.startsWith("/mahasiswa"),
    },
    {
      label: "Tentang",
      href: "/about",
      icon: Info,
      isActive: pathname === "/about",
    },
  ];

  return (
    <div
      className="md:hidden fixed bottom-3.5 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <nav
        aria-label="Navigasi Seluler Utama"
        className="pointer-events-auto w-full max-w-[360px] rounded-full p-1.5 bg-white/92 dark:bg-[#0B1F4A]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-[#1E3A8A]/60 shadow-[0_12px_36px_rgba(8,17,38,0.16)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(30,58,138,0.3)] select-none"
      >
        <div className="grid grid-cols-4 gap-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center py-2 px-1 rounded-full z-10 transition-colors"
              >
                {/* Interactive Animated Sliding Pill Indicator */}
                {active && (
                  <motion.div
                    layoutId="mobile-dock-pill"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF8A2B] to-[#ea580c] shadow-md shadow-orange-500/35"
                  />
                )}

                {/* Icon with bouncy micro-animation on active / click */}
                <motion.div
                  animate={{ scale: active ? 1.08 : 1 }}
                  whileTap={{ scale: 0.76, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <motion.div
                    animate={active ? { scale: [0.8, 1.25, 1], rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <Icon
                      className={`w-[19px] h-[19px] transition-colors ${
                        active
                          ? "text-white stroke-[2.4]"
                          : "text-slate-600 dark:text-[#94A9C9] stroke-[2]"
                      }`}
                    />
                  </motion.div>
                  <span
                    className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                      active
                        ? "text-white font-bold"
                        : "text-slate-600 dark:text-[#94A9C9] font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

