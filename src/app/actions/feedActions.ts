"use server";

import { createClient } from "@/lib/supabase-server";

export async function getTrendingHashtagsServerSide() {
  const supabase = await createClient();
  
  // Ambil 500 post terakhir untuk dianalisis tag-nya di server
  const { data, error } = await supabase
    .from("feed_posts")
    .select("tags")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    return [];
  }

  const tagCount: Record<string, number> = {};
  
  data.forEach((p) => {
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: string) => { 
        tagCount[t] = (tagCount[t] || 0) + 1; 
      });
    }
  });

  // Urutkan berdasarkan jumlah terbanyak, ambil 8 teratas
  const trending = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  return trending;
}
