"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { CommandPalette } from "../ui/CommandPalette";
import { BypassIndicator } from "../ui/BypassIndicator";
import { NewBadgeFloatingNotification, RewardClaimModal, BadgeRevokedModal } from "../penghargaan";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isLogin = pathname?.startsWith("/login");
  const isSubmit = pathname?.startsWith("/submit");
  const isAdmin = pathname?.startsWith("/admin");
  const isMaintenance = pathname === "/maintenance" || pathname?.startsWith("/maintenance/");
  const hidePublicLayout = isDashboard || isLogin || isSubmit || isAdmin || isMaintenance;

  return (
    <>
      <CommandPalette />
      {!hidePublicLayout && <Navbar />}
      <main className="flex-1 w-full max-w-full overflow-x-clip">
        {children}
      </main>
      {!hidePublicLayout && <Footer />}
      {!hidePublicLayout && <MobileBottomNav />}
      <BypassIndicator />
      <NewBadgeFloatingNotification />
      <RewardClaimModal />
      <BadgeRevokedModal />
    </>
  );
}
