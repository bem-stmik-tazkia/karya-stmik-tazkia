"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { LogOut, Home, UploadCloud, ChevronDown, User, Compass, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function DashboardTopbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setIsAdmin(true);
        });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  const fullName = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0]) ?? "Mahasiswa";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const avatarLetter = fullName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b-4 border-border bg-card/90 backdrop-blur-md shadow-[0_4px_0_0_var(--color-border)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Left: Brand + Dashboard label */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <span className="font-black text-xl tracking-tight">
                Karya<span className="text-primary">Tazkia</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-[11px] font-black px-2.5 py-0.5 rounded-lg uppercase bg-primary/10 text-primary border-2 border-primary/30">
              Dashboard
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-border bg-background font-bold text-xs hover:-translate-y-0.5 shadow-[2px_2px_0px_var(--color-border)] transition-all"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 text-primary" />
              <span className="hidden md:inline font-black">Beranda Utama</span>
            </Link>

            <NotificationBell />
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-border bg-card font-black text-sm shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--color-border)] transition-all"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-7 h-7 rounded-lg border-2 border-border object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black border-2 border-border">
                    {avatarLetter}
                  </div>
                )}
                <span className="max-w-[110px] truncate hidden sm:inline">{fullName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-card border-4 border-border rounded-2xl shadow-[6px_6px_0px_var(--color-border)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b-2 border-border bg-muted/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{isAdmin ? "Akun Admin" : "Akun Mahasiswa"}</p>
                    <p className="text-sm font-black text-foreground truncate mt-0.5">{fullName}</p>
                    <p className="text-[11px] font-bold text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    {isAdmin && (
                      <Link
                        href="/admin/karya"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Kelola Karya
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Dashboard Saya
                    </Link>
                    <Link
                      href="/submit"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-colors"
                    >
                      <UploadCloud className="w-4 h-4 text-secondary" />
                      Upload Karya
                    </Link>
                    <Link
                      href="/explore"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-colors"
                    >
                      <Compass className="w-4 h-4 text-orange-500" />
                      Galeri Karya
                    </Link>
                    <div className="my-1 border-t-2 border-border" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-destructive/10 hover:text-destructive font-bold text-sm text-foreground transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
