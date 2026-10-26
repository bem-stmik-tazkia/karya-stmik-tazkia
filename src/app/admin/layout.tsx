import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminNav } from "@/components/admin/AdminNav";
import { ShieldCheck, Home } from "lucide-react";

export const revalidate = 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cek apakah user adalah admin via DB
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="container mx-auto px-4 py-3.5 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-heading font-extrabold tracking-tight text-foreground">
                    Admin Portal
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {adminRecord.role || "Admin"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Karya STMIK Tazkia
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-7 w-px bg-border" />
            <AdminNav />
          </div>

          <nav className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-semibold border border-border shadow-xs transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Beranda Utama</span>
            </Link>
            <ThemeToggle />
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
