"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Compass, UploadCloud, Users, LogOut, Home } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Galeri Karya", href: "/explore", icon: Compass },
    { label: "Upload Karya", href: "/submit", icon: UploadCloud, highlight: true },
    { label: "Feed", href: "/feed", icon: Users },
    { label: "Beranda", href: "/", icon: Home, exact: true },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  return (
    <>
      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95%] sm:max-w-max">
        <nav className="bg-card border-4 border-border px-3 py-2 rounded-2xl shadow-[6px_6px_0px_0px_var(--color-border)] flex items-center gap-1.5 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm border-2 border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-black text-xs sm:text-sm border-2 transition-all ${
                  active
                    ? "bg-muted border-border text-foreground shadow-[2px_2px_0px_0px_var(--color-border)]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs sm:text-sm text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive transition-all"
            title="Keluar Akun"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </nav>
      </div>

      {/* Neobrutalism Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="relative bg-card border-4 border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_var(--color-border)] z-10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 border-4 border-destructive text-destructive flex items-center justify-center mb-4">
                <LogOut className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">Keluar Akun?</h3>
              <p className="text-muted-foreground font-bold text-xs sm:text-sm mb-6 leading-relaxed">
                Kamu akan keluar dari akun KaryaTazkia. Kamu harus masuk kembali untuk mengunggah atau mengomentari karya.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-foreground bg-muted border-2 border-border hover:bg-muted/80 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-sm text-destructive-foreground bg-destructive border-2 border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-y-0.5 active:translate-y-1 transition-all"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
