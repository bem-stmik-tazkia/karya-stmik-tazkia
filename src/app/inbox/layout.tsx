import React from "react";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardBottomNav } from "@/components/dashboard/DashboardBottomNav";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Pesan - KaryaTazkia",
  description: "Kotak masuk dan obrolan mahasiswa",
};

export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Jika user ini terdaftar sebagai Admin, tendang keluar
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminRecord) {
    redirect("/admin/karya");
  }

  return (
    <div className="h-dvh bg-background flex flex-col overflow-hidden">
      {/* Dedicated Dashboard Topbar */}
      <DashboardTopbar />

      {/* Main Inbox Content — flex-1 with min-h-0 so children can control their own scroll */}
      <main className="flex-1 min-h-0 w-full max-w-full overflow-hidden">
        {children}
      </main>

      {/* Dedicated Floating Dashboard Bottom Nav */}
      <DashboardBottomNav />
    </div>
  );
}
