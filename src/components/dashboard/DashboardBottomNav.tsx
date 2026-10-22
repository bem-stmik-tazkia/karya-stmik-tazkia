"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Folder, UploadCloud, User, Home, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { getExclusiveBadgeGrants, getClaimableGrantsForUser } from "@/lib/badgeService";

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hasBadgeNotification, setHasBadgeNotification] = useState(false);

  // Cek notifikasi penghargaan baru atau lencana eksklusif yang belum diklaim
  useEffect(() => {
    const checkBadgeNotifications = async () => {
      if (typeof window === "undefined") return;

      // Cek apakah ada lencana eksklusif dari admin yang belum diklaim
      try {
        const grants = await getExclusiveBadgeGrants();
        const claimable = getClaimableGrantsForUser(grants, {
          userId: user?.id,
          email: user?.email,
        });
        if (claimable.length > 0) {
          setHasBadgeNotification(true);
          return;
        }
      } catch {}

      // Cek apakah ada notifikasi penghargaan unread di localStorage
      try {
        const hasUnread = localStorage.getItem("tazkia_has_unopened_badge") === "true";
        setHasBadgeNotification(hasUnread);
      } catch {
        setHasBadgeNotification(false);
      }
    };

    checkBadgeNotifications();

    const handleUpdated = () => checkBadgeNotifications();
    const handleViewed = () => {
      setHasBadgeNotification(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("tazkia_has_unopened_badge", "false");
      }
    };

    window.addEventListener("tazkia_badges_updated", handleUpdated);
    window.addEventListener("tazkia_badges_viewed", handleViewed);
    window.addEventListener("storage", handleUpdated);

    return () => {
      window.removeEventListener("tazkia_badges_updated", handleUpdated);
      window.removeEventListener("tazkia_badges_viewed", handleViewed);
      window.removeEventListener("storage", handleUpdated);
    };
  }, [user?.id, user?.email]);

  const navItems = [
    {
      label: "Karya",
      href: "/dashboard/projects",
      icon: Folder,
    },
    {
      label: "Upload",
      href: "/submit",
      icon: UploadCloud,
    },
    {
      label: "Profil",
      href: "/dashboard",
      icon: User,
    },
    {
      label: "Beranda",
      href: "/",
      icon: Home,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/profile";
    }
    if (href === "/dashboard/projects") {
      return pathname?.startsWith("/dashboard/projects");
    }
    if (href === "/submit") {
      return pathname?.startsWith("/submit");
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  return (
    <>
      {/* Floating Bottom Nav - Identik dengan MobileBottomNav Beranda */}
      <div
        className="fixed bottom-3.5 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none flex justify-center"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <nav
          aria-label="Navigasi Dashboard"
          className="pointer-events-auto w-full max-w-[400px] rounded-full p-1.5 bg-white/92 dark:bg-[#0B1F4A]/92 backdrop-blur-2xl border border-slate-200/90 dark:border-[#1E3A8A]/60 shadow-[0_12px_36px_rgba(8,17,38,0.16)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(30,58,138,0.3)] select-none"
        >
          <div className="grid grid-cols-5 gap-0.5 sm:gap-1 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center py-2 px-1 rounded-full z-10 transition-colors"
                >
                  {/* Interactive Animated Sliding Pill Indicator */}
                  {active && (
                    <motion.div
                      layoutId="dashboard-dock-pill"
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
                      className="relative"
                    >
                      <Icon
                        className={`w-[19px] h-[19px] transition-colors ${
                          active
                            ? "text-white stroke-[2.4]"
                            : "text-slate-600 dark:text-[#94A9C9] stroke-[2]"
                        }`}
                      />
                      {/* Red notification dot if Profil has unread badges */}
                      {item.label === "Profil" && hasBadgeNotification && (
                        <span className="absolute -top-1 -right-1 z-30 flex h-2.5 w-2.5 pointer-events-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-[#0B1F4A] shadow-xs" />
                        </span>
                      )}
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

            {/* Logout Button in the exact same dock style */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="relative flex flex-col items-center justify-center py-2 px-1 rounded-full z-10 transition-colors group cursor-pointer"
            >
              <motion.div
                whileTap={{ scale: 0.76, rotate: -10 }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className="relative z-10 flex flex-col items-center"
              >
                <LogOut className="w-[19px] h-[19px] text-slate-600 dark:text-[#94A9C9] group-hover:text-red-500 transition-colors stroke-[2]" />
                <span className="text-[10px] tracking-tight mt-0.5 leading-none text-slate-600 dark:text-[#94A9C9] group-hover:text-red-500 font-medium transition-colors">
                  Keluar
                </span>
              </motion.div>
            </button>
          </div>
        </nav>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
