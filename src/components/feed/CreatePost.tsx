"use client";

import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Image as ImageIcon, Send, X, Code, Users, Lightbulb, Hash, Loader2, ShieldAlert, Clock } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";

interface CreatePostProps {
  onPostSubmit: (postData: { content: string; type: "project" | "update" | "collab"; tags: string[]; imageUrl?: string }) => Promise<void>;
}

export default function CreatePost({ onPostSubmit }: CreatePostProps) {
  const { user } = useAuth();
  const router = useRouter();

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "A";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<"project" | "update" | "collab">("update");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // ── Review / Moderation States ──
  const [reviewState, setReviewState] = useState<"idle" | "checking" | "failed" | "cooldown">("idle");
  const [reviewReason, setReviewReason] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  React.useEffect(() => {
    const handleOpen = () => setIsExpanded(true);
    window.addEventListener("open-create-post", handleOpen);
    return () => window.removeEventListener("open-create-post", handleOpen);
  }, []);

  // Countdown timer untuk cooldown
  React.useEffect(() => {
    if (!cooldownUntil) return;
    const update = () => {
      const remaining = Math.ceil((cooldownUntil.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setCooldownUntil(null);
        setCooldownSeconds(0);
        setReviewState("idle");
      } else {
        setCooldownSeconds(remaining);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  // Auto-grow textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
  };

  // Hashtag chip logic
  const addTag = useCallback((raw: string) => {
    const cleaned = raw.trim().replace(/^#+/, "").replace(/\s+/g, "");
    if (cleaned && !tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput("");
  }, [tags]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) addTag(tagInput);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  // Format MM:SS untuk countdown
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting || reviewState === "checking") return;

    // Kumpulkan tag final (termasuk yang belum di-enter)
    const finalTags = [...tags];
    if (tagInput.trim()) {
      const cleaned = tagInput.trim().replace(/^#+/, "").replace(/\s+/g, "");
      if (cleaned && !finalTags.includes(cleaned)) finalTags.push(cleaned);
    }

    // ── STEP 1: Moderasi Konten ──
    setReviewState("checking");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const modRes = await fetch("/api/moderate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content, type, tags: finalTags }),
      });

      const modData = await modRes.json();

      if (modRes.status === 429) {
        // Rate limit atau cooldown
        if (modData.cooldown_until) {
          setCooldownUntil(new Date(modData.cooldown_until));
          setReviewReason(
            "Kamu terlalu sering mengirim konten yang melanggar aturan komunitas. Silakan tunggu sebelum mencoba lagi."
          );
          setReviewState("cooldown");
        } else {
          setReviewReason(
            modData.message || "Terlalu banyak permintaan. Coba lagi dalam beberapa menit."
          );
          setReviewState("failed");
        }
        return;
      }

      if (!modData.approved) {
        // Cek apakah penolakan ini sekaligus memicu cooldown
        if (modData.cooldown_triggered && modData.cooldown_until) {
          setCooldownUntil(new Date(modData.cooldown_until));
          setReviewReason(
            `Kamu sudah mencapai batas ${modData.max_fails || 3} pelanggaran. Silakan tunggu sebelum mencoba lagi.`
          );
          setReviewState("cooldown");
        } else {
          const attemptsLeft = (modData.max_fails || 3) - (modData.fail_count || 1);
          setReviewReason(
            `${modData.reason}${attemptsLeft > 0 ? ` (${attemptsLeft} percobaan tersisa)` : ""}`
          );
          setReviewState("failed");
        }
        return;
      }
    } catch (err) {
      // Gagal koneksi ke server moderasi — izinkan posting agar user tidak stuck
      console.warn("[Moderation] Tidak bisa terhubung, posting dilanjutkan:", err);
    }

    // ── STEP 2: Konten lulus — kirim postingan ──
    setReviewState("idle");
    setIsSubmitting(true);

    let imageUrl: string | undefined;
    if (imageFile && user) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `feed-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `feed_images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public_images")
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("public_images")
          .getPublicUrl(filePath);
        imageUrl = publicUrl;
      } else {
        console.error("Gagal upload gambar", uploadError);
      }
    }

    await onPostSubmit({ content, type, tags: finalTags, imageUrl });

    setContent("");
    setTags([]);
    setTagInput("");
    setPreviewImage(null);
    setImageFile(null);
    setType("update");
    setIsSubmitting(false);
    setIsExpanded(false);
  };

  const closeModal = () => {
    if (!isSubmitting) setIsExpanded(false);
  };

  return (
    <div className="card-3d bg-card border-4 border-border rounded-3xl p-4 sm:p-5 mb-8">
      {/* Trigger Bar */}
      <div 
        onClick={() => {
          if (!user) {
            router.push("/login");
            return;
          }
          setIsExpanded(true);
        }} 
        className="flex items-center gap-4 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center font-black text-white text-xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)] shrink-0 overflow-hidden">
          {user?.user_metadata?.avatar_url && !avatarError ? (
            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
          ) : (
            avatarLetter
          )}
        </div>
        <div className="flex-1 min-w-0 h-12 bg-muted border-2 border-border rounded-xl px-3 sm:px-4 flex items-center text-muted-foreground font-bold hover:bg-muted/80 transition-colors shadow-[2px_2px_0px_var(--color-border)]">
          <span className="truncate min-w-0 w-full text-xs sm:text-sm">Bagikan karya atau idemu hari ini...</span>
        </div>
        <button className="hidden sm:flex items-center gap-2 p-3 bg-secondary text-white border-2 border-border rounded-xl font-black text-sm shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--color-border)] transition-all">
          <ImageIcon className="w-5 h-5" />
          Media
        </button>
      </div>

      {/* Modal via Portal */}
      {isExpanded && typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
              />

              {/* Modal Box */}
              <motion.div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto card-3d bg-card border-4 border-border rounded-3xl shadow-2xl z-10"
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
              >
                {/* ── Tampilkan Panel Review atau Form Normal ── */}
                {(reviewState === "failed" || reviewState === "cooldown") ? (

                  /* ── Panel Hasil Moderasi ── */
                  <div className="p-5 sm:p-6 flex flex-col" style={{ minHeight: "380px" }}>
                    {/* Header panel */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-border">
                      <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-500 flex items-center justify-center text-base">🛡️</span>
                        Moderasi Konten
                      </h3>
                      {reviewState !== "cooldown" && (
                        <motion.button
                          type="button"
                          onClick={() => setReviewState("idle")}
                          whileTap={{ scale: 0.85 }}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors border-2 border-transparent hover:border-border"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>

                    {/* Isi panel */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-2">
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className={`w-20 h-20 rounded-2xl border-4 flex items-center justify-center ${
                          reviewState === "cooldown"
                            ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-500"
                            : "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-500"
                        }`}
                      >
                        {reviewState === "cooldown"
                          ? <Clock className="w-9 h-9" />
                          : <ShieldAlert className="w-9 h-9" />}
                      </motion.div>

                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-foreground uppercase">
                          {reviewState === "cooldown"
                            ? "Terlalu Banyak Pelanggaran"
                            : "Konten Tidak Dapat Diposting"}
                        </h4>
                        <p className="text-sm font-bold text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          {reviewReason}
                        </p>
                      </div>

                      {reviewState === "cooldown" ? (
                        <motion.div
                          initial={{ y: 12, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="px-8 py-4 bg-card border-4 border-amber-400 rounded-2xl shadow-[4px_4px_0px_theme(colors.amber.400)]">
                            <p className="text-4xl font-black text-amber-500 font-mono tracking-widest tabular-nums">
                              {formatCountdown(cooldownSeconds)}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-muted-foreground">Tunggu sebelum mencoba lagi</p>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setReviewState("idle")}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl border-4 border-border shadow-[4px_4px_0px_var(--color-border)] font-black text-sm uppercase hover:shadow-[6px_6px_0px_var(--color-border)] transition-all"
                        >
                          ✏️ Edit &amp; Perbaiki Postingan
                        </motion.button>
                      )}
                    </div>
                  </div>

                ) : (

                  /* ── Form Postingan Normal ── */
                  <form onSubmit={handleSubmit} className="p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-border">
                      <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm border-2 border-border">✏️</span>
                        Buat Postingan
                      </h3>
                      <motion.button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting || reviewState === "checking"}
                        whileTap={{ scale: 0.85 }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors border-2 border-transparent hover:border-border disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Textarea (auto-grow) */}
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={handleContentChange}
                      disabled={isSubmitting || reviewState === "checking"}
                      placeholder="Apa yang sedang kamu kerjakan? Butuh tim atau masukan?"
                      className="w-full min-h-[100px] bg-muted/50 border-2 border-border rounded-2xl p-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-5 disabled:opacity-70"
                      autoFocus
                      style={{ height: "100px", overflowY: "hidden" }}
                    />

                    {/* Image Preview */}
                    {previewImage && (
                      <div className="relative mb-5">
                        <div className="w-full max-h-[280px] rounded-2xl border-2 border-border overflow-hidden bg-muted">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          disabled={isSubmitting || reviewState === "checking"}
                          onClick={() => { setPreviewImage(null); setImageFile(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-card border-2 border-border rounded-lg hover:bg-rose-100 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-5 mb-5">
                      {/* Kategori */}
                      <div>
                        <label className="text-xs font-black uppercase text-muted-foreground mb-2 block">Kategori Postingan</label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            { value: "update", label: "Ide/Update", icon: <Lightbulb className="w-4 h-4" />, active: "bg-primary/10 border-primary text-primary shadow-[2px_2px_0px_var(--color-primary)]" },
                            { value: "project", label: "Pamer Karya", icon: <Code className="w-4 h-4" />, active: "bg-secondary/10 border-secondary text-secondary shadow-[2px_2px_0px_var(--color-secondary)]" },
                            { value: "collab", label: "Cari Tim", icon: <Users className="w-4 h-4" />, active: "bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-400 shadow-[2px_2px_0px_theme(colors.amber.500)]" },
                          ] as const).map((opt) => (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all font-bold text-xs ${
                                type === opt.value ? opt.active : "bg-card border-border text-muted-foreground hover:bg-muted"
                              } ${(isSubmitting || reviewState === "checking") ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <input type="radio" name="type" value={opt.value} checked={type === opt.value} onChange={() => !(isSubmitting || reviewState === "checking") && setType(opt.value)} disabled={isSubmitting || reviewState === "checking"} className="hidden" />
                              {opt.icon} {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Hashtag chips */}
                      <div>
                        <label className="text-xs font-black uppercase text-muted-foreground mb-2 block flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" /> Hashtag (tekan Enter atau koma untuk tambah)
                        </label>
                        <div className="w-full min-h-[44px] bg-card border-2 border-border rounded-xl px-3 py-2 flex flex-wrap gap-1.5 items-center focus-within:border-primary transition-colors">
                          <AnimatePresence>
                            {tags.map((tag) => (
                              <motion.span
                                key={tag}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-1 px-2 py-0.5 bg-secondary/10 border-2 border-secondary text-secondary rounded-lg text-xs font-black"
                              >
                                #{tag}
                                {!(isSubmitting || reviewState === "checking") && (
                                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-0.5 hover:text-rose-500">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </motion.span>
                            ))}
                          </AnimatePresence>
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            onBlur={handleTagBlur}
                            disabled={isSubmitting || reviewState === "checking"}
                            placeholder={tags.length === 0 ? "InfoKampus, LombaDesign, WebDev..." : ""}
                            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-border">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} disabled={isSubmitting || reviewState === "checking"} />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        disabled={isSubmitting || reviewState === "checking"}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border-2 border-border text-foreground font-black text-xs hover:bg-muted transition-all shadow-[2px_2px_0px_var(--color-border)] disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline">Upload Gambar</span>
                      </motion.button>

                      {reviewState === "checking" ? (
                        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-muted/50 rounded-2xl border-2 border-primary/40 shadow-inner">
                          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                          <div className="text-left">
                            <p className="text-xs font-black text-foreground leading-none">Memeriksa konten...</p>
                            <p className="text-[10px] font-bold text-muted-foreground leading-none mt-0.5">AI sedang menganalisis</p>
                          </div>
                        </div>
                      ) : (
                        <BouncyButton type="submit" disabled={!content.trim() || isSubmitting} className="px-6 py-2.5 text-sm">
                          <span className="flex items-center gap-2">
                            {isSubmitting ? (
                              <>POSTING... <Loader2 className="w-4 h-4 animate-spin" /></>
                            ) : (
                              <>POSTING <Send className="w-4 h-4" /></>
                            )}
                          </span>
                        </BouncyButton>
                      )}
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )
      }
    </div>
  );
}
