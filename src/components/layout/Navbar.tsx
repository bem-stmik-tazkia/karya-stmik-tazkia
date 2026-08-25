"use client";

import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Menu, X, BookOpen, Sparkles, Compass, Users, Info } from "lucide-react";
import { useState } from "react";
import { BouncyButton } from "../ui/BouncyButton";

const navLinks = [
  { href: "/feed", label: "Feed / Connect", icon: Users },
  { href: "/explore", label: "Galeri Karya", icon: Compass },
  { href: "/student", label: "Mahasiswa Showcase", icon: Users },
  { href: "/about", label: "Tentang Kami", icon: Info },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b-4 border-border bg-background shadow-[0_4px_0_0_var(--color-border)]">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between bg-background">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setIsOpen(false)}>
            <div className="w-9 h-9 bg-primary rounded-xl border-2 border-primary-shadow shadow-[0_2px_0_0_var(--color-primary-shadow)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
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
            <Link
              href="/login"
              className="hidden md:inline-flex btn-3d btn-3d-primary rounded-xl px-5 py-2 text-sm font-black"
            >
              GABUNG / JOIN
            </Link>

            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 rounded-xl border-2 border-border bg-card flex items-center justify-center shadow-[0_2px_0_0_var(--color-border)] active:translate-y-[2px] active:shadow-none transition-all"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header inside mobile menu */}
          <div className="flex items-center justify-between pb-6 border-b-4 border-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
              <div className="w-9 h-9 bg-primary rounded-xl border-2 border-primary-shadow flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl">Karya<span className="text-primary">Tazkia</span></span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-xl border-2 border-border bg-muted flex items-center justify-center text-foreground font-bold shadow-[0_2px_0_0_var(--color-border)]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
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

          {/* Bottom Action */}
          <div className="pt-4 border-t-4 border-border border-dashed">
            <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full">
              <BouncyButton className="w-full text-lg py-4">
                GABUNG SEKARANG
              </BouncyButton>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
