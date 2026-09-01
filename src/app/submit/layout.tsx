import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Upload Karya - KaryaTazkia",
  description: "Formulir upload portofolio mahasiswa",
};

export default async function SubmitLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Jika user ini terdaftar sebagai Admin, blokir dari halaman submit!
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
    <div className="min-h-screen bg-background relative">
      {children}
    </div>
  );
}
