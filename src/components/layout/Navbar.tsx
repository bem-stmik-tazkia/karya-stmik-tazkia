"use client";

import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Menu, X, Sparkles, Compass, Users, Info, LogOut, UploadCloud, ChevronDown, User, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BouncyButton } from "../ui/BouncyButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { NotificationBell } from "../dashboard/NotificationBell";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";

const navLinks = [
  { href: "/feed", label: "Feed & Koneksi", icon: Users },
  { href: "/explore", label: "Galeri Karya", icon: Compass },
  { href: "/student", label: "Mahasiswa", icon: Users },
  { href: "/about", label: "Tentang Kami", icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
        .single()
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
    setIsOpen(false);
  };

  const displayName = (user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0])
    ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b-4 border-border bg-background shadow-[0_4px_0_0_var(--color-border)]">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between bg-background">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsOpen(false)}>
            <span className="font-black text-lg sm:text-xl tracking-tight">
              Karya<span className="text-primary">Tazkia</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl font-bold text-sm hover:bg-muted border-2 border-transparent hover:border-border transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <NotificationBell />

            {/* Auth section */}
            {user ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-border bg-card font-black text-sm shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--color-border)] transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-lg border-2 border-border object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-black border-2 border-border">
                      {avatarLetter}
                    </div>
                  )}
                  <span className="max-w-[90px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-card border-4 border-border rounded-2xl shadow-[4px_4px_0px_var(--color-border)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b-2 border-border bg-muted/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{isAdmin ? "Akun Admin" : "Masuk sebagai"}</p>
                      <p className="text-xs font-black text-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      {isAdmin ? (
                        <Link
                          href="/admin/karya"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted font-bold text-sm text-foreground transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-500" />
                          Kelola Karya
                        </Link>
                      ) : (
                        <>
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
                        </>
                      )}
                      <button
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-destructive/10 hover:text-destructive font-bold text-sm text-foreground transition-colors w-full text-left"
                        onClick={() => { setIsDropdownOpen(false); setShowLogoutConfirm(true); }}>
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex btn-3d btn-3d-primary rounded-xl px-5 py-2 text-sm font-black"
              >
                GABUNG / MASUK
              </Link>
            )}

            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 rounded-xl border-2 border-border bg-card flex items-center justify-center shadow-[0_2px_0_0_var(--color-border)] active:translate-y-[2px] active:shadow-none transition-all"
              aria-label="Buka menu"
            >
              {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-6 border-b-4 border-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <span className="font-black text-xl">Karya<span className="text-primary">Tazkia</span></span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl border-2 border-border bg-muted flex items-center justify-center text-foreground font-bold shadow-[0_2px_0_0_var(--color-border)]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4 py-8">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 p-4 rounded-2xl border-4 border-border bg-card font-black text-xl shadow-[0_4px_0_0_var(--color-border)] active:translate-y-1"
            >
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center border-2 border-accent-shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              Beranda
            </Link>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl border-4 border-border bg-card font-black text-xl shadow-[0_4px_0_0_var(--color-border)] active:translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t-4 border-border border-dashed">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl border-2 border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl border-2 border-border">
                    {avatarLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                {isAdmin ? (
                  <Link href="/admin/karya" onClick={() => setIsOpen(false)} className="block w-full">
                    <BouncyButton className="w-full text-lg py-4">
                      <Shield className="w-5 h-5 mr-2 inline" /> KELOLA KARYA
                    </BouncyButton>
                  </Link>
                ) : (
                  <Link href="/submit" onClick={() => setIsOpen(false)} className="block w-full">
                    <BouncyButton className="w-full text-lg py-4">
                      <UploadCloud className="w-5 h-5 mr-2 inline" /> UPLOAD KARYA
                    </BouncyButton>
                  </Link>
                )}
                <button
                  onClick={() => { setIsOpen(false); setShowLogoutConfirm(true); }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-border font-black text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
                <BouncyButton className="w-full text-lg py-4">
                  GABUNG SEKARANG
                </BouncyButton>
              </Link>
            )}
          </div>
        </div>
      )}
      <LogoutConfirmModal
        open={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
