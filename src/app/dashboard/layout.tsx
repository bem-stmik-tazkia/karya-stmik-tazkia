import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Mahasiswa - KaryaTazkia",
  description: "Portal dashboard mahasiswa STMIK Tazkia",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Jika user ini terdaftar sebagai Admin, tendang keluar dari dashboard mahasiswa!
    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminRecord) {
      redirect("/admin/karya");
    }
  }

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
