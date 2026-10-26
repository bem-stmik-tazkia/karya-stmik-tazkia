import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { NeobrutalismProfileView } from "@/components/mahasiswa";
import { CompleteProfileModalWrapper } from "@/components/mahasiswa/modals/CompleteProfileModalWrapper";

export const revalidate = 0;

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user profile from mahasiswa_profiles
  let { data: profile } = await supabase
    .from("mahasiswa_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
    
  if (!profile) {
    // Auto-create minimal profile if it doesn't exist
    const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Mahasiswa";
    
    const minimalProfile = {
      user_id: user.id,
      full_name: defaultName,
      email: user.email || "",
      prodi: "",
      angkatan: null, // Let user fill this later
      skills: [],
      avatar_url: user.user_metadata?.avatar_url || "",
    };

    const { data: newProfile, error } = await supabase
      .from("mahasiswa_profiles")
      .insert([minimalProfile])
      .select()
      .single();

    if (!error && newProfile) {
      profile = newProfile;
    } else {
      // Fallback if insert fails
      profile = minimalProfile;
    }
  }

  // Get user's projects
  const { data: karyaList } = await supabase
    .from("karya")
    .select("*")
    .neq("status", "deleted")
    .or(`user_id.eq.${user.id},team.cs.[{"user_id":"${user.id}"}]`)
    .order("created_at", { ascending: false });

  // Ambil semua karya approved untuk menentukan 3 Karya Terbaik Pilihan Kurator (Podium Beranda / Explore)
  const { data: allApprovedKarya } = await supabase
    .from("karya")
    .select("id, likes, views")
    .eq("status", "approved");

  const top3CuratorIds = new Set(
    (allApprovedKarya || [])
      .sort((a: any, b: any) => {
        const scoreA = (a.likes || 0) * 3 + (a.views || 0);
        const scoreB = (b.likes || 0) * 3 + (b.views || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3)
      .map((k: any) => k.id)
  );

  // Map to ProjectData format (filter out if this user explicitly rejected this project)
  const projects = (karyaList || []).filter((k: any) => {
    if (k.user_id === user.id) return true;
    if (Array.isArray(k.team)) {
      const myMembership = k.team.find((m: any) => m.user_id === user.id);
      if (myMembership && myMembership.status === "rejected") return false;
    }
    return true;
  }).map((k: any) => {
    const isCuratorSpotlight = top3CuratorIds.has(k.id) || Boolean(k.is_featured);
    return {
      id: k.id,
      title: k.title,
      description: k.description,
      cover_image: k.image_url, // Assuming image_url in DB maps to cover_image
      category: k.category,
      tech_stack: k.tech_stack || [],
      tags: k.tags || [],
      github_url: k.github_url || null,
      live_url: k.live_url || k.demo_url || null,
      demo_url: k.demo_url || k.live_url || null,
      drive_url: k.drive_url || null,
      figma_url: k.figma_url || null,
      youtube_url: k.youtube_url || null,
      likes: k.likes || 0,
      views: k.views || 0,
      likes_count: k.likes || 0,
      views_count: k.views || 0,
      is_featured: isCuratorSpotlight,
      is_curator_spotlight: isCuratorSpotlight,
      pending_edits: k.pending_edits,
      status: k.status,
      image_url: k.image_url,
      team: k.team && k.team.length > 0 ? k.team : [{ name: profile?.full_name || "Mahasiswa", user_id: user.id }],
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <NeobrutalismProfileView
        profile={profile}
        projects={projects}
        isOwnProfile={true}
      />
      {(!profile.prodi || !profile.angkatan) && (
        <CompleteProfileModalWrapper userId={user.id} />
      )}
    </div>
  );
}
