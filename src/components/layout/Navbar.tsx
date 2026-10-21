"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ThemeToggle } from "../ui/ThemeToggle";
import {
  LayoutGrid,
  Users,
  Info,
  LogOut,
  UploadCloud,
  ChevronDown,
  User,
  Shield,
  Home,
  Search,
  Command,
  MessageSquare,
  LogIn,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "../dashboard/NotificationBell";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";
import { AnnouncementBanner } from "../ui/AnnouncementBanner";

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/explore", label: "Galeri Karya", icon: LayoutGrid },
  { href: "/student", label: "Mahasiswa", icon: Users },
  { href: "/about", label: "Tentang", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cek apakah user adalah admin
  useEffect(() => {
    if (user) {
      supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setIsAdmin(!!data);
        });
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    setIsDropdownOpen(false);
  };

  const openSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-command-palette"));
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const isHome = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-40 w-full flex flex-col transition-colors bg-white/90 dark:bg-[#0B1F4A]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1E3E82] text-slate-900 dark:text-[#F2F5FA]">
        <AnnouncementBanner />
        <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group select-none"
          >
            <span className="w-2.5 h-7 rounded-[5px] bg-[#FF8A2B] block shrink-0 group-hover:scale-y-105 transition-transform shadow-sm" />
            <span className="font-heading font-extrabold text-[22px] tracking-tight transition-colors">
              <span className="text-slate-900 dark:text-white">Karya</span>
              <span className="text-[#FF8A2B]"> Tazkia</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 group select-none ${
                    isActive
                      ? "text-[#FF8A2B] font-semibold bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 shadow-2xs"
                      : "text-slate-600 dark:text-[#94A9C9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0E1D3F]"
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.72, rotate: -15 }}
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="flex items-center justify-center shrink-0"
                  >
                    <Icon className="w-4 h-4 transition-colors" />
                  </motion.div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Search & Actions Right */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Command Palette Button */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-2xs group cursor-pointer border border-slate-200 dark:border-[#1D3A73] bg-slate-50 dark:bg-[#0E1D3F] text-slate-600 dark:text-[#94A9C9] hover:text-slate-900 dark:hover:text-[#F2F5FA] hover:border-[#FF8A2B]/50"
              title="Cari karya & navigasi (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A9C9] group-hover:text-primary transition-colors" />
              <span className="hidden sm:inline font-sans">Cari...</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border bg-slate-200/60 dark:bg-[#132854] border-slate-300 dark:border-[#1D3A73] text-slate-600 dark:text-[#94A9C9]">
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </span>
            </motion.button>

            <ThemeToggle />
            <NotificationBell />

            {/* Auth section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-border bg-card text-xs font-medium hover:bg-muted hover:border-primary/40 transition-all duration-200 shadow-2xs cursor-pointer"
                  title="Menu Akun & Dashboard"
                  aria-label="Menu Akun"
                >
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-7 h-7 sm:w-5 sm:h-5 rounded-lg sm:rounded-md object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-5 sm:h-5 rounded-lg sm:rounded-md bg-[#FF8A2B] text-white flex items-center justify-center text-[11px] sm:text-[10px] font-bold">
                      {avatarLetter}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate text-foreground font-semibold">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`hidden sm:inline w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 sm:w-60 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border bg-muted/40">
                      <p className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                        {isAdmin ? "AKUN ADMIN" : "MASUK SEBAGAI"}
                      </p>
                      <p className="text-xs font-medium text-foreground truncate mt-0.5 font-mono">
                        {user.email}
                      </p>
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      {isAdmin ? (
                        <>
                          <Link
                            href="/admin/karya"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-xs text-foreground transition-colors"
                          >
                            <Shield className="w-4 h-4 text-violet-500" />
                            <span>Kelola Karya Admin</span>
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-xs text-foreground transition-colors"
                          >
                            <User className="w-4 h-4 text-primary" />
                            <span>Dashboard Mahasiswa</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-xs text-foreground transition-colors"
                          >
                            <User className="w-4 h-4 text-primary" />
                            <span>Dashboard Mahasiswa</span>
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-xs text-foreground transition-colors"
                          >
                            <User className="w-4 h-4 text-[#FF8A2B]" />
                            <span>Profil &amp; Skin Kartu</span>
                          </Link>
                          <Link
                            href="/submit"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted font-medium text-xs text-foreground transition-colors"
                          >
                            <UploadCloud className="w-4 h-4 text-foreground" />
                            <span>Unggah Karya Baru</span>
                          </Link>
                        </>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs text-muted-foreground transition-colors w-full text-left cursor-pointer"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold bg-[#FF8A2B] text-white dark:text-[#0B1F4A] hover:bg-[#ea580c] transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Link>
            )}
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

