import HomePageClient from "@/components/home/HomePageClient";
import { supabaseServer } from "@/lib/supabase-server";
import type { Karya } from "@/types/karya";

// Opt into static rendering and revalidate every hour, or stay dynamic.
// We'll keep it default (dynamic if using cookies, otherwise static).
export const revalidate = 60; // Revalidate every 60 seconds (ISR) for super fast performance!

export default async function Home() {
  // Fetch featured karya (latest 3 approved) on the server!
  const { data: karyaData } = await supabaseServer
    .from("karya")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch real stats in parallel on the server!
  const [karyaRes, mahasiswaRes] = await Promise.all([
    supabaseServer.from("karya").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabaseServer.from("mahasiswa_profiles").select("user_id", { count: "exact", head: true }),
  ]);

  const featuredKarya = (karyaData as Karya[]) || [];
  const totalKarya = karyaRes.count || 0;
  const totalMahasiswa = mahasiswaRes.count || 0;

  return (
    <HomePageClient
      featuredKarya={featuredKarya}
      totalKarya={totalKarya}
      totalMahasiswa={totalMahasiswa}
    />
  );
}
