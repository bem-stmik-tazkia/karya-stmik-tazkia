import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";

export const metadata = {
  title: "Dashboard Mahasiswa - KaryaTazkia",
  description: "Portal dashboard mahasiswa STMIK Tazkia",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative pb-28">
      {/* Dedicated Dashboard Topbar */}
      <DashboardTopbar />

      {/* Main Dashboard Content */}
      <main className="flex-1 w-full max-w-full">
        {children}
      </main>

      {/* Dedicated Floating Dashboard Bottom Nav */}
      <DashboardBottomNav />
    </div>
  );
}
