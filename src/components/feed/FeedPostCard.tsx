"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, GraduationCap, Send, Check } from "lucide-react";
import { FeedPost, Student } from "@/lib/feedData";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";

// Utility untuk format waktu sederhana
function formatTimeAgo(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} hari yang lalu`;
}

interface FeedPostCardProps {
  post: FeedPost;
  author: Student;
  isCommentsOpen?: boolean;
  onToggleComments?: () => void;
  onCloseComments?: () => void;
}

export default function FeedPostCard({ post, author, isCommentsOpen = false, onToggleComments, onCloseComments }: FeedPostCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [shareCopied, setShareCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Jangan tutup jika yang diklik adalah tombol komentar di postingan lain
      if (target.closest('[data-comment-toggle="true"]')) {
        return;
      }

      if (isCommentsOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onCloseComments?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCommentsOpen, onCloseComments]);

  const handleLike = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  const handleShare = () => {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div ref={cardRef} className="card-3d bg-card border-4 border-border rounded-3xl overflow-hidden mb-6">
      {/* ── Header: Profil Penulis ── */}
      <div className="p-4 sm:p-5 flex items-start justify-between border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted border-2 border-border overflow-hidden shrink-0">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center font-black text-white text-xl">
                {author.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-foreground text-sm sm:text-base leading-tight hover:text-primary cursor-pointer transition-colors">
              {author.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-muted-foreground mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-secondary" />
              <span>{author.prodi}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Body: Konten Postingan ── */}
      <div className="p-4 sm:p-5">
        {/* Tipe Postingan Badge */}
        <div className="mb-3">
          <StickerBadge variant={post.type === "collab" ? "warning" : post.type === "project" ? "default" : "default"} className="text-[10px] px-2 py-0.5">
            {post.type === "collab" ? "🤝 CARI TIM" : post.type === "project" ? "💻 PAMER KARYA" : "💡 IDE/UPDATE"}
          </StickerBadge>
        </div>

        {/* Teks Konten */}
        <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Tags / Skills */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className={`px-2 py-0.5 rounded-lg border-2 text-[10px] font-bold ${getSkillColor(tag)}`}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media (Gambar) */}
        {post.imageUrl && (
          <div className="w-full aspect-[16/9] sm:aspect-video rounded-2xl border-4 border-border overflow-hidden bg-muted mt-2 shadow-[4px_4px_0px_var(--color-border)]">
            <img src={post.imageUrl} alt="Post media" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* ── Footer: Interaksi (FULL ANIMASI) ── */}
      <div className="px-4 sm:px-5 py-3 border-t-2 border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          
          {/* Tombol Like Animasi */}
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm transition-all shadow-[2px_2px_0px_var(--color-border)] ${
              liked 
                ? "bg-rose-100 border-rose-500 text-rose-600 dark:bg-rose-900/30 dark:border-rose-700" 
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <motion.div animate={liked ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? "fill-rose-500" : ""}`} /> 
            </motion.div>
            <span className="w-4 text-left">{likesCount}</span>
          </motion.button>

          {/* Tombol Comment Animasi */}
          <motion.button 
            data-comment-toggle="true"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (!user) {
                router.push("/login");
                return;
              }
              onToggleComments?.();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm transition-all shadow-[2px_2px_0px_var(--color-border)] ${
              isCommentsOpen ? "bg-secondary/10 border-secondary text-secondary" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" /> 
            {post.comments} <span className="hidden sm:inline">Komentar</span>
          </motion.button>
        </div>

        {/* Tombol Share Animasi */}
        <motion.button 
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm transition-all shadow-[2px_2px_0px_var(--color-border)] ${
            shareCopied ? "bg-green-100 border-green-500 text-green-700" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          {shareCopied ? (
            <><Check className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Tersalin</span></>
          ) : (
            <><Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> <span className="hidden sm:inline">Bagikan</span></>
          )}
        </motion.button>
      </div>

      {/* ── Komentar Area (Bisa di-expand) ── */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-border bg-card overflow-hidden"
          >
            <div className="p-4 sm:p-5">
              {/* Daftar Komentar Scrollable */}
              <div className="max-h-48 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {/* Dummy Comment Item 1 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-white font-black flex items-center justify-center shrink-0 border-2 border-border text-xs">
                    B
                  </div>
                  <div className="flex-1 bg-muted/50 border-2 border-border rounded-xl rounded-tl-none p-3 shadow-sm">
                    <h4 className="font-black text-xs text-foreground mb-1 hover:text-primary cursor-pointer">Budi Santoso</h4>
                    <p className="text-xs font-medium text-muted-foreground">Keren banget aplikasinya bro! Tech stack nya lumayan menantang ya pakai Supabase.</p>
                  </div>
                </div>

                {/* Dummy Comment Item 2 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary text-white font-black flex items-center justify-center shrink-0 border-2 border-border text-xs">
                    A
                  </div>
                  <div className="flex-1 bg-muted/50 border-2 border-border rounded-xl rounded-tl-none p-3 shadow-sm">
                    <h4 className="font-black text-xs text-foreground mb-1 hover:text-primary cursor-pointer">Aisha Rahma</h4>
                    <p className="text-xs font-medium text-muted-foreground">Wah, izin fork repo-nya ya! Kebetulan lagi nyari referensi buat skripsi. Mantap! 🔥</p>
                  </div>
                </div>

                {/* Dummy Comment Item 3 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground font-black flex items-center justify-center shrink-0 border-2 border-border text-xs">
                    D
                  </div>
                  <div className="flex-1 bg-muted/50 border-2 border-border rounded-xl rounded-tl-none p-3 shadow-sm">
                    <h4 className="font-black text-xs text-foreground mb-1 hover:text-primary cursor-pointer">Dimas Prayoga</h4>
                    <p className="text-xs font-medium text-muted-foreground">Desain UI-nya clean banget. Btw itu animasi loadingnya pakai framer-motion juga kah?</p>
                  </div>
                </div>
              </div>
              
              {/* Input Komentar Baru */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-dashed border-border">
                <input 
                  type="text" 
                  placeholder="Tulis komentarmu..." 
                  className="flex-1 bg-card border-2 border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} className="p-2 bg-primary text-white rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)]">
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
