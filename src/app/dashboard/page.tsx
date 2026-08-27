import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { NeobrutalismProfileView } from "@/components/mahasiswa/NeobrutalismProfileView";

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

  // Get user's public projects
  const { data: karyaList } = await supabase
    .from("karya")
    .select("*")
    .eq("status", "approved")
    .or(`user_id.eq.${user.id},team.cs.[{"user_id":"${user.id}"}]`)
    .order("created_at", { ascending: false });

  // Map to ProjectData format
  const projects = (karyaList || []).map((k: any) => ({
    id: k.id,
    title: k.title,
    description: k.description,
    cover_image: k.image_url, // Assuming image_url in DB maps to cover_image
    category: k.category,
    tech_stack: k.tech_stack || [],
    tags: k.tags || [],
    github_url: k.github_url,
    demo_url: k.demo_url,
    drive_url: k.drive_url,
    figma_url: k.figma_url,
    youtube_url: k.youtube_url,
    likes_count: k.likes || 0,
    views_count: k.views || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <NeobrutalismProfileView
        profile={profile}
        projects={projects}
        isOwnProfile={true}
      />
    </div>
  );
}
