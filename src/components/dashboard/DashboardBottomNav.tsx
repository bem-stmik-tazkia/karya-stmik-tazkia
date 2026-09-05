"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Folder, User, Home, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { LogoutConfirmModal } from "@/components/ui/LogoutConfirmModal";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Use hook inline to avoid creating a new file, or use the one we just created
  // Wait, I created useUnreadMessages hook, so I'll import it.
  const unreadCount = useUnreadMessages(userId);

  const navItems = [
    { label: "Projek", href: "/dashboard/projects", icon: Folder, exact: true },
    { label: "Pesan", href: "/inbox", icon: MessageSquare, exact: false, badge: unreadCount },
    { label: "Profile", href: "/dashboard", icon: User, exact: true },
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

  // Hide bottom nav inside individual chat rooms (they have their own input bar)
  const isChatRoom = /^\/inbox\/[^/]+$/.test(pathname || "");
  if (isChatRoom) return null;

  return (
    <>
      {/* Floating Bottom Nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
        <nav className="bg-card border-4 border-border px-2 py-2 rounded-2xl shadow-[6px_6px_0px_0px_var(--color-border)] flex items-center justify-between gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl font-black text-[10px] border-2 transition-all flex-1 min-w-0 ${
                  active
                    ? "bg-primary border-primary-shadow text-primary-foreground shadow-[3px_3px_0px_0px_var(--color-primary-shadow)] -translate-y-1"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="truncate w-full text-center leading-none">{item.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-10 bg-border shrink-0" />

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl font-black text-[10px] text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive/30 transition-all shrink-0"
            title="Keluar Akun"
          >
            <LogOut className="w-5 h-5" />
            <span className="leading-none">Keluar</span>
          </button>
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
