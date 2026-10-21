import HomePageClient from "@/components/home/HomePageClient";
import { supabaseServer } from "@/lib/supabase-server";
import type { Karya, MahasiswaProfile } from "@/types/karya";

// Selalu ambil data live terbaru agar angka views dan likes langsung update
export const revalidate = 0;

export default async function Home() {
  // Fetch approved karya on the server (cukup untuk Hero Showcase + Live Gallery)
  const { data: karyaData } = await supabaseServer
    .from("karya")
    .select("*")
    .eq("status", "approved")
    .order("likes", { ascending: false })
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  // Fetch real stats dan profil mahasiswa untuk hero floating card
  const [karyaRes, mahasiswaRes, profilesRes] = await Promise.all([
    supabaseServer.from("karya").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabaseServer.from("mahasiswa_profiles").select("user_id", { count: "exact", head: true }),
    supabaseServer.from("mahasiswa_profiles").select("*").limit(3),
  ]);

  const featuredKarya = (karyaData as Karya[]) || [];
  const totalKarya = karyaRes.count || 0;
  const totalMahasiswa = mahasiswaRes.count || 0;
  const sampleProfiles = (profilesRes.data as MahasiswaProfile[]) || [];

  return (
    <HomePageClient
      featuredKarya={featuredKarya}
      totalKarya={totalKarya}
      totalMahasiswa={totalMahasiswa}
      sampleProfiles={sampleProfiles}
    />
  );
}
