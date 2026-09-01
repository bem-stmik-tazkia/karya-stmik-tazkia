import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminNav } from "@/components/admin/AdminNav";

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
    .single();

  if (!adminRecord) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-4 border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl font-black uppercase text-foreground flex items-center gap-2">
                🛡️ Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground font-bold">
                Role: <span className="text-primary uppercase">{adminRecord.role}</span>
              </p>
            </div>
            <div className="hidden sm:block h-8 w-[2px] bg-border" />
            <AdminNav />
          </div>

          <nav className="flex items-center gap-3 text-sm font-black">
            <a
              href="/"
              className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground text-xs uppercase font-extrabold border-2 border-border hover:bg-muted/80 transition-all"
            >
              Beranda Utama
            </a>
            <ThemeToggle />
            <AdminLogoutButton />
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
