"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getFeedPosts, createFeedPost, RealFeedPost } from "@/lib/feedService";
import { toggleFollow, checkIsFollowingBulk } from "@/lib/followService";
import { supabase } from "@/lib/supabase";
import FeedPostCard from "@/components/feed/FeedPostCard";
import CreatePost from "@/components/feed/CreatePost";
import { MessageSquare, TrendingUp, Users, UserPlus, PenSquare, Loader2, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

// Tipe untuk rekomendasi mahasiswa
type RecommendedStudent = {
  id: string; // user_id
  name: string;
  avatarUrl: string | null;
  prodi: string;
  isFollowing: boolean;
};

export default function FeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<RealFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [recommendedStudents, setRecommendedStudents] = useState<RecommendedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RecommendedStudent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  // Fetch posts & recommendations on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load Posts
      const data = await getFeedPosts(user?.id);
      setPosts(data);

      // Load Recommendations
      const { data: profiles } = await supabase
        .from("mahasiswa_profiles")
        .select("user_id, full_name, avatar_url, prodi")
        .neq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .order("created_at", { ascending: false })
        .limit(5);

      if (profiles && profiles.length > 0) {
        let followingStatus: Record<string, boolean> = {};
        if (user) {
          const profileIds = profiles.map(p => p.user_id).filter(Boolean) as string[];
          followingStatus = await checkIsFollowingBulk(profileIds, user.id);
        }

        const mappedRecommendations: RecommendedStudent[] = profiles.map(p => ({
          id: p.user_id as string,
          name: p.full_name,
          avatarUrl: p.avatar_url,
          prodi: p.prodi,
          isFollowing: followingStatus[p.user_id as string] || false,
        })).filter(p => p.id); // Filter out profiles without user_id

        setRecommendedStudents(mappedRecommendations);
      }

      setLoading(false);
    }
    loadData();
  }, [user]);

  // Debounced search: query Supabase langsung ketika user mengetik
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      const { data: profiles } = await supabase
        .from("mahasiswa_profiles")
        .select("user_id, full_name, avatar_url, prodi")
        .neq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .or(`full_name.ilike.%${searchQuery}%,prodi.ilike.%${searchQuery}%`)
        .limit(20);

      if (profiles && profiles.length > 0) {
        let followingStatus: Record<string, boolean> = {};
        if (user) {
          const profileIds = profiles.map(p => p.user_id).filter(Boolean) as string[];
          followingStatus = await checkIsFollowingBulk(profileIds, user.id);
        }
        setSearchResults(profiles.map(p => ({
          id: p.user_id as string,
          name: p.full_name,
          avatarUrl: p.avatar_url,
          prodi: p.prodi,
          isFollowing: followingStatus[p.user_id as string] || false,
        })).filter(p => p.id));
      } else {
        setSearchResults([]);
      }
      setSearchLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery, user]);

  const handleFollowToggle = async (studentId: string, currentFollowingState: boolean) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Optimistic Update
    setRecommendedStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, isFollowing: !currentFollowingState } : s
    ));

    try {
      await toggleFollow(studentId, user.id, currentFollowingState);
    } catch (error) {
      console.error("Gagal follow/unfollow", error);
      // Revert if error
      setRecommendedStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, isFollowing: currentFollowingState } : s
      ));
    }
  };

  // Saat toggle follow di search results, update keduanya
  const handleFollowToggleWithSearch = async (studentId: string, currentFollowingState: boolean) => {
    await handleFollowToggle(studentId, currentFollowingState);
    setSearchResults(prev => prev.map(s =>
      s.id === studentId ? { ...s, isFollowing: !currentFollowingState } : s
    ));
  };

  const handlePostSubmit = async (postData: {
    content: string;
    type: "project" | "update" | "collab";
    tags: string[];
    imageUrl?: string;
  }) => {
    if (!user) return;
    
    // Optimistic UI atau kita buat loading state di CreatePost
    try {
      const newPost = await createFeedPost({
        student_id: user.id,
        type: postData.type,
        content: postData.content,
        tags: postData.tags,
        image_url: postData.imageUrl,
      });

      // Refetch atau prepend ke list dengan data author mock up sementara (akan ter-replace saat refresh)
      setPosts(prev => [
        {
          ...newPost,
          author: {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            avatarUrl: user.user_metadata?.avatar_url || "",
            prodi: "Mahasiswa",
            angkatan: new Date().getFullYear(),
          },
          has_liked: false,
          likes_count: 0,
          comments_count: 0
        } as RealFeedPost,
        ...prev
      ]);
    } catch (error) {
      console.error("Gagal membuat post", error);
    }
  };

  // Kumpulkan semua hashtag dari postingan dan hitung kemunculannya (kalkulasi lokal untuk trending)
  const trendingTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    posts.forEach((p) => p.tags?.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [posts]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Feed Column ── */}
          <div className="flex-1 w-full lg:max-w-[calc(100%-22rem)]">
            {/* Header */}
            <div className="mb-6">
              <h1
                className="text-3xl font-black text-foreground uppercase flex items-center gap-3"
                style={{ textShadow: "3px 3px 0px var(--color-border)" }}
              >
                <MessageSquare className="w-8 h-8 text-primary" />
                Medsos Kampus
              </h1>
              <p className="text-sm font-bold text-muted-foreground mt-2">
                Tempatnya mahasiswa STMIK Tazkia berbagi ide, karya, dan kolaborasi.
              </p>
            </div>

            {/* Create Post */}
            <div className="mb-6">
              <CreatePost onPostSubmit={handlePostSubmit} />
            </div>

            {/* Feed Stream */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="font-bold text-muted-foreground">Memuat postingan...</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {posts.map((post, i) => {
                      if (!post.author) return null;
                      return (
                        <motion.div
                          layout
                          key={post.id}
                          initial={{ opacity: 0, y: -24, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", bounce: 0.35, delay: i < 3 ? i * 0.05 : 0 }}
                        >
                          <FeedPostCard 
                            post={post} 
                            author={post.author} 
                            isCommentsOpen={activeCommentPostId === post.id}
                            onToggleComments={() => setActiveCommentPostId(prev => prev === post.id ? null : post.id)}
                            onCloseComments={() => setActiveCommentPostId(null)}
                            onDelete={(deletedId) => setPosts(prev => prev.filter(p => p.id !== deletedId))}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {posts.length === 0 && (
                    <div className="text-center p-16 bg-card border-4 border-dashed border-border rounded-3xl">
                      <span className="text-5xl mb-4 block">📭</span>
                      <p className="font-black text-muted-foreground text-lg">Belum ada postingan.</p>
                      <p className="font-bold text-muted-foreground text-sm mt-1">Jadilah yang pertama berbagi!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="hidden lg:flex flex-col w-72 shrink-0 gap-5 sticky top-24 self-start">

            {/* Trending Hashtag (dari data riil yang termuat) */}
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
              <h3 className="font-black text-foreground text-sm uppercase flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-secondary" /> Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.length > 0 ? (
                  trendingTags.map((tag) => (
                    <motion.span
                      key={tag}
                      whileHover={{ y: -2 }}
                      className="px-3 py-1 rounded-xl bg-muted border-2 border-border text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      #{tag}
                    </motion.span>
                  ))
                ) : (
                  <p className="text-xs font-bold text-muted-foreground">Belum ada hashtag trending</p>
                )}
              </div>
            </div>

            {/* Rekomendasi (Data Riil) */}
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
              <h3 className="font-black text-foreground text-sm uppercase flex items-center gap-2 border-b-2 border-border pb-3 mb-3">
                <UserPlus className="w-4 h-4 text-secondary" /> Ikuti
              </h3>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mahasiswa..."
                  className="w-full bg-muted border-2 border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-3">
                {/* Tampilkan hasil search atau default 5 rekomendasi */}
                {searchLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="ml-2 text-xs font-bold text-muted-foreground">Mencari...</span>
                  </div>
                ) : (searchQuery ? searchResults : recommendedStudents)
                  .map((student) => (
                  <div key={student.id} className="flex items-center gap-3 group">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-10 h-10 rounded-xl border-2 border-border object-cover shrink-0 group-hover:border-primary transition-colors"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border-2 border-border bg-secondary text-white flex items-center justify-center text-sm font-black shrink-0 group-hover:border-primary transition-colors uppercase">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0" onClick={() => router.push(`/student/${student.id}`)}>
                      <h4 
                        className="text-xs font-black text-foreground truncate group-hover:text-primary cursor-pointer transition-colors"
                        title={student.name}
                      >
                        {student.name}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground truncate" title={student.prodi}>
                        {student.prodi}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleFollowToggleWithSearch(student.id, student.isFollowing)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg border-2 text-[10px] font-black transition-all flex items-center gap-1 ${
                        student.isFollowing 
                          ? "bg-transparent border-border text-muted-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500"
                          : "bg-primary border-primary text-white hover:bg-primary/80 hover:border-primary/80"
                      }`}
                    >
                      {student.isFollowing ? (
                        <><Check className="w-3 h-3" /> Mengikuti</>
                      ) : (
                        "Ikuti"
                      )}
                    </button>
                  </div>
                ))}
                {!searchLoading && (searchQuery ? searchResults : recommendedStudents).length === 0 && (
                  <p className="text-xs font-bold text-muted-foreground text-center py-2">
                    {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Belum ada mahasiswa"}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FAB untuk mobile */}
      <motion.button
        onClick={() => window.dispatchEvent(new Event("open-create-post"))}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary border-4 border-border rounded-full flex items-center justify-center shadow-[4px_4px_0px_var(--color-border)] z-40 text-white"
      >
        <PenSquare className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

