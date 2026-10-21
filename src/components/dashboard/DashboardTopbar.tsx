"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useState, useRef, useEffect } from "react";
import { LogOut, Home, UploadCloud, ChevronDown, User, Folder, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";

export function DashboardTopbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
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
    .maybeSingle()
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
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Left: Brand + Dashboard label */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-1 h-5 bg-primary rounded-full group-hover:h-6 transition-all duration-200" />
              <span className="font-bold text-lg tracking-tight">
                <span className="text-foreground">Karya</span>
                <span className="text-primary">Tazkia</span>
              </span>
            </Link>
            <span className="hidden sm:inline text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Dashboard
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Home Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background font-medium text-xs hover:bg-muted hover:border-primary/30 transition-all shadow-xs"
              title="Kembali ke Beranda"
            >
              <Home className="w-4 h-4 text-primary" />
              <span className="hidden md:inline font-semibold">Beranda Utama</span>
            </Link>

            <NotificationBell />
            <ThemeToggle />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card font-medium text-sm shadow-xs hover:bg-muted hover:border-primary/30 transition-all"
              >
                {avatarUrl && !avatarError ? (
                  <img src={avatarUrl} alt={fullName} className="w-6 h-6 rounded-md object-cover" onError={() => setAvatarError(true)} />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {avatarLetter}
                  </div>
                )}
                <span className="max-w-[110px] truncate hidden sm:inline text-foreground">{fullName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 sm:right-2 top-[calc(100%+8px)] w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-border bg-muted/40">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{isAdmin ? "Akun Admin" : "Akun Mahasiswa"}</p>
                    <p className="text-sm font-semibold text-foreground truncate mt-0.5">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {isAdmin && (
                      <Link
                        href="/admin/karya"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted font-medium text-sm text-foreground transition-colors"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Kelola Karya
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted font-medium text-sm text-foreground transition-colors"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Dashboard Profil
                    </Link>
                    <Link
                      href="/dashboard/projects"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted font-medium text-sm text-foreground transition-colors"
                    >
                      <Folder className="w-4 h-4 text-blue-500" />
                      Karya Saya
                    </Link>
                    <Link
                      href="/submit"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted font-medium text-sm text-foreground transition-colors"
                    >
                      <UploadCloud className="w-4 h-4 text-orange-500" />
                      Upload Karya
                    </Link>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 font-medium text-sm text-muted-foreground transition-colors w-full text-left"
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
