"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, GraduationCap, Send, Check, Trash2, Link2, CornerDownLeft, X } from "lucide-react";
import { Student } from "@/lib/feedData";
import { RealFeedPost, RealFeedComment, toggleFeedPostLike, getFeedComments, addFeedComment, deleteFeedPost, deleteFeedComment } from "@/lib/feedService";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";
import toast from "react-hot-toast";

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
  post: RealFeedPost;
  author: Student;
  isCommentsOpen?: boolean;
  onToggleComments?: () => void;
  onCloseComments?: () => void;
  onDelete?: (postId: string) => void;
}

export default function FeedPostCard({ post, author, isCommentsOpen = false, onToggleComments, onCloseComments, onDelete }: FeedPostCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [liked, setLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [shareCopied, setShareCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  const [comments, setComments] = useState<RealFeedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyTo, setReplyTo] = useState<{ name: string; commentId: string } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<{ type: "comment" | "post"; id: string } | null>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isOwnPost = user?.id === post.student_id;

  // Sync liked state when post changes (e.g. on refresh/re-fetch)
  useEffect(() => {
    setLiked(post.has_liked || false);
    setLikesCount(post.likes_count || 0);
  }, [post.has_liked, post.likes_count, post.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-comment-toggle="true"]')) return;
      if (isCommentsOpen && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onCloseComments?.();
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCommentsOpen, onCloseComments]);

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const currentlyLiked = liked;
    setLiked(!currentlyLiked);
    setLikesCount(currentlyLiked ? likesCount - 1 : likesCount + 1);
    
    try {
      await toggleFeedPostLike(post.id, user.id, currentlyLiked);
    } catch (error) {
      console.error("Gagal toggle like", error);
      // revert if error
      setLiked(currentlyLiked);
      setLikesCount(currentlyLiked ? likesCount : likesCount - 1);
    }
  };

  useEffect(() => {
    if (isCommentsOpen) {
      loadComments();
    }
  }, [isCommentsOpen]);

  const loadComments = async () => {
    setLoadingComments(true);
    const data = await getFeedComments(post.id);
    setComments(data);
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!user || !commentInput.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    const parentId = replyTo ? replyTo.commentId : undefined;
    const content = replyTo ? `@${replyTo.name} ${commentInput.trim()}` : commentInput.trim();
    try {
      await addFeedComment(post.id, user.id, content, parentId);
      
      // Expand replies for the parent we just replied to
      if (parentId) {
        setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
      }
      
      await loadComments(); // Fetch again to get real profiles from DB
      setCommentInput("");
      setReplyTo(null);
      setCommentsCount(prev => prev + 1);
    } catch (error) {
      console.error("Gagal komentar", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user) return;
    setConfirmModal({ type: "comment", id: commentId });
  };

  const handleDeletePost = () => {
    if (!user || isDeleting) return;
    setMenuOpen(false);
    setConfirmModal({ type: "post", id: post.id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    const { type, id } = confirmModal;
    setConfirmModal(null);
    if (type === "comment") {
      try {
        await deleteFeedComment(id, user!.id);
        setCommentsCount(prev => Math.max(0, prev - 1));
        setComments(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
        toast.success("Komentar dihapus");
      } catch (error) {
        console.error("Gagal menghapus komentar", error);
        toast.error("Gagal menghapus komentar");
      }
    } else {
      setIsDeleting(true);
      try {
        await deleteFeedPost(id, user!.id);
        onDelete?.(id);
        toast.success("Postingan dihapus");
      } catch (error) {
        console.error("Gagal hapus postingan", error);
        toast.error("Gagal menghapus postingan");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Prepare grouped comments
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  const getPostUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/feed#post-${post.id}`;
    }
    return "";
  };

  const handleCopyLink = async () => {
    const url = getPostUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // fallback
    }
    setShareMenuOpen(false);
  };

  const handleShareWhatsApp = () => {
    const url = getPostUrl();
    const text = encodeURIComponent(`${post.content.slice(0, 100)}... ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareMenuOpen(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(getPostUrl());
    const text = encodeURIComponent(`${post.content.slice(0, 100)}...`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    setShareMenuOpen(false);
  };

  const handleShareTelegram = () => {
    const url = encodeURIComponent(getPostUrl());
    const text = encodeURIComponent(post.content.slice(0, 100));
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
    setShareMenuOpen(false);
  };

  return (
    <div ref={cardRef} className="card-3d bg-card border-4 border-border rounded-3xl overflow-hidden mb-6">
      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 bg-card border-4 border-border rounded-2xl shadow-[6px_6px_0px_var(--color-border)] p-5 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-sm">Konfirmasi Hapus</h3>
                  <p className="text-xs text-muted-foreground font-bold">
                    {confirmModal.type === "comment" ? "Yakin ingin menghapus komentar ini?" : "Yakin ingin menghapus postingan ini?"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-xs font-black rounded-xl border-2 border-border hover:bg-muted text-muted-foreground transition-colors uppercase"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-black rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-[2px_2px_0px_#be123c] uppercase"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Header: Profil Penulis ── */}
      <div className="p-4 sm:p-5 flex items-start justify-between border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary border-2 border-border overflow-hidden shrink-0">
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
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        {/* Menu Titik Tiga */}
        <div ref={menuRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 z-50 bg-card border-2 border-border rounded-2xl shadow-[4px_4px_0px_var(--color-border)] min-w-[140px] overflow-hidden"
              >
                {isOwnPost && (
                  <button
                    onClick={handleDeletePost}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase text-rose-500 hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Menghapus..." : "Hapus Post"}
                  </button>
                )}
                {!isOwnPost && (
                  <p className="px-4 py-2.5 text-xs font-bold text-muted-foreground">Tidak ada opsi</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
        {post.image_url && (
          <div className="w-full aspect-[16/9] sm:aspect-video rounded-2xl border-4 border-border overflow-hidden bg-muted mt-2 shadow-[4px_4px_0px_var(--color-border)]">
            <img src={post.image_url} alt="Post media" className="w-full h-full object-cover" />
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
            {commentsCount} <span className="hidden sm:inline">Komentar</span>
          </motion.button>
        </div>

        {/* Tombol Share - Dropdown Sosmed */}
        <div ref={shareMenuRef} className="relative">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShareMenuOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-black text-xs sm:text-sm transition-all shadow-[2px_2px_0px_var(--color-border)] ${
              shareCopied ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {shareCopied ? (
              <><Check className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Tersalin!</span></>
            ) : (
              <><Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> <span className="hidden sm:inline">Bagikan</span></>
            )}
          </motion.button>

          <AnimatePresence>
            {shareMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-2 z-50 bg-card border-2 border-border rounded-2xl shadow-[4px_4px_0px_var(--color-border)] min-w-[180px] overflow-hidden"
              >
                {/* WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-foreground hover:bg-[#25d366] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>

                {/* Twitter / X */}
                <button
                  onClick={handleShareTwitter}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-foreground hover:bg-black hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter / X
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-foreground hover:bg-[#0088cc] hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-foreground hover:bg-muted transition-colors"
                >
                  <Link2 className="w-4 h-4 shrink-0 text-primary" />
                  Salin Tautan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
                {loadingComments ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Memuat komentar...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Belum ada komentar.</p>
                ) : (
                  topLevelComments.map((comment) => {
                    const replies = getReplies(comment.id);
                    const isExpanded = expandedReplies[comment.id];
                    
                    return (
                      <div key={comment.id} className="flex flex-col gap-3">
                        {/* Komentar Utama */}
                        <div className="flex gap-3 group/comment">
                          <div className="w-8 h-8 rounded-lg bg-secondary text-white font-black flex items-center justify-center shrink-0 border-2 border-border text-xs overflow-hidden">
                            {comment.author?.avatarUrl ? (
                              <img src={comment.author.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              comment.author?.name?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-muted/50 border-2 border-border rounded-xl rounded-tl-none p-3 shadow-sm">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-black text-xs text-foreground hover:text-primary cursor-pointer">{comment.author?.name}</h4>
                                <span className="text-[10px] text-muted-foreground font-bold">{formatTimeAgo(comment.created_at)}</span>
                              </div>
                              <p className="text-xs font-medium text-foreground leading-relaxed">{comment.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                {/* Toggle Balasan (jika ada) */}
                                {replies.length > 0 ? (
                                  <button
                                    onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !isExpanded }))}
                                    className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                                  >
                                    <div className="w-4 border-b-2 border-muted-foreground/30"></div>
                                    {isExpanded ? "Sembunyikan balasan" : `Lihat balasan (${replies.length})`}
                                  </button>
                                ) : <div />}

                                <div className="flex items-center gap-1">
                                  {user && user.id === comment.student_id && (
                                    <motion.button
                                      whileHover={{ y: -2 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" /> Hapus
                                    </motion.button>
                                  )}
                                  <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => {
                                      if (!user) { router.push("/login"); return; }
                                      setReplyTo({ name: comment.author?.name || "User", commentId: comment.id });
                                      setCommentInput("");
                                      setTimeout(() => commentInputRef.current?.focus(), 80);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-colors"
                                  >
                                    <CornerDownLeft className="w-3 h-3" /> Balas
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Area Balasan (Nested) */}
                        <AnimatePresence>
                          {isExpanded && replies.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-11 flex flex-col gap-3 overflow-hidden"
                            >
                              {replies.map(reply => (
                                <div key={reply.id} className="flex gap-2 group/reply">
                                  <div className="w-6 h-6 rounded-lg bg-secondary text-white font-black flex items-center justify-center shrink-0 border-2 border-border text-[10px] overflow-hidden">
                                    {reply.author?.avatarUrl ? (
                                      <img src={reply.author.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      reply.author?.name?.charAt(0).toUpperCase() || "U"
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-muted/30 border-2 border-border/70 rounded-xl rounded-tl-none p-2 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-black text-[11px] text-foreground hover:text-primary cursor-pointer">{reply.author?.name}</h4>
                                        <span className="text-[9px] text-muted-foreground font-bold">{formatTimeAgo(reply.created_at)}</span>
                                      </div>
                                      <p className="text-[11px] font-medium text-foreground leading-relaxed">
                                        {reply.content.startsWith("@") ? (
                                          <>
                                            <span className="text-primary font-black">{reply.content.split(" ")[0]}</span>
                                            {" "}{reply.content.split(" ").slice(1).join(" ")}
                                          </>
                                        ) : reply.content}
                                      </p>
                                      <div className="flex justify-end w-full mt-1.5 gap-1">
                                        {user && user.id === reply.student_id && (
                                          <motion.button
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" /> Hapus
                                          </motion.button>
                                        )}
                                        <motion.button
                                          whileHover={{ y: -2 }}
                                          whileTap={{ scale: 0.9 }}
                                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                          onClick={() => {
                                            if (!user) { router.push("/login"); return; }
                                            setReplyTo({ name: reply.author?.name || "User", commentId: comment.id });
                                            setCommentInput("");
                                            setTimeout(() => commentInputRef.current?.focus(), 80);
                                          }}
                                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black text-muted-foreground hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-colors"
                                        >
                                          <CornerDownLeft className="w-2.5 h-2.5" /> Balas
                                        </motion.button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Input Komentar Baru */}
              <div className="mt-4 pt-4 border-t-2 border-dashed border-border">
                <AnimatePresence>
                  {replyTo && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center justify-between bg-primary/10 border-2 border-primary/30 rounded-xl px-3 py-1.5 mb-2"
                    >
                      <span className="text-[11px] font-black text-primary flex items-center gap-1.5">
                        <CornerDownLeft className="w-3 h-3" />
                        Membalas <strong>{replyTo.name}</strong>
                      </span>
                      <button
                        onClick={() => { setReplyTo(null); setCommentInput(""); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    disabled={isSubmittingComment}
                    placeholder={replyTo ? `Balas ${replyTo.name}...` : "Tulis komentarmu..."}
                    className="flex-1 bg-card border-2 border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  />
                  <motion.button 
                    onClick={handleAddComment}
                    disabled={isSubmittingComment || !commentInput.trim()}
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.9 }} 
                    className="p-2 bg-primary text-white rounded-xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
