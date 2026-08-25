"use client";

import React, { useState, useMemo } from "react";
import { dummyPosts, FeedPost, students } from "@/lib/data";
import FeedPostCard from "@/components/feed/FeedPostCard";
import CreatePost from "@/components/feed/CreatePost";
import { MessageSquare, TrendingUp, Users, UserPlus, PenSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>(dummyPosts);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const handlePostSubmit = (postData: {
    content: string;
    type: "project" | "update" | "collab";
    tags: string[];
    imageUrl?: string;
  }) => {
    const newPost: FeedPost = {
      id: `post-temp-${Date.now()}`,
      studentId: "stu-1",
      content: postData.content,
      type: postData.type,
      tags: postData.tags,
      imageUrl: postData.imageUrl,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts([newPost, ...posts]);
  };

  // Kumpulkan semua hashtag dari postingan dan hitung kemunculannya
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
              <AnimatePresence mode="popLayout">
                {posts.map((post, i) => {
                  const author = students.find((s) => s.id === post.studentId);
                  if (!author) return null;
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
                        author={author} 
                        isCommentsOpen={activeCommentPostId === post.id}
                        onToggleComments={() => setActiveCommentPostId(prev => prev === post.id ? null : post.id)}
                        onCloseComments={() => setActiveCommentPostId(null)}
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
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="hidden lg:flex flex-col w-72 shrink-0 gap-5 sticky top-24 self-start">

            {/* Trending Hashtag (dari data real) */}
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
              <h3 className="font-black text-foreground text-sm uppercase flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
                <TrendingUp className="w-4 h-4 text-secondary" /> Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag) => (
                  <motion.span
                    key={tag}
                    whileHover={{ y: -2 }}
                    className="px-3 py-1 rounded-xl bg-muted border-2 border-border text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Rekomendasi */}
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
              <h3 className="font-black text-foreground text-sm uppercase flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
                <UserPlus className="w-4 h-4 text-secondary" /> Rekomendasi
              </h3>
              <div className="space-y-3">
                {students.slice(0, 4).map((student) => (
                  <div key={student.id} className="flex items-center gap-3 group">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl border-2 border-border object-cover bg-muted shrink-0 group-hover:border-primary transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-foreground truncate group-hover:text-secondary cursor-pointer transition-colors">
                        {student.name}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground truncate">{student.prodi}</p>
                    </div>
                    <button className="shrink-0 px-2 py-1 rounded-lg bg-secondary/10 border border-secondary text-secondary text-[10px] font-black hover:bg-secondary hover:text-white transition-all">
                      Follow
                    </button>
                  </div>
                ))}
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
