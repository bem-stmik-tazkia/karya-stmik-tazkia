"use client";

import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Image as ImageIcon, Send, X, Code, Users, Lightbulb, Hash } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { motion, AnimatePresence } from "framer-motion";

interface CreatePostProps {
  onPostSubmit: (postData: { content: string; type: "project" | "update" | "collab"; tags: string[]; imageUrl?: string }) => void;
}

export default function CreatePost({ onPostSubmit }: CreatePostProps) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<"project" | "update" | "collab">("update");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const handleOpen = () => setIsExpanded(true);
    window.addEventListener("open-create-post", handleOpen);
    return () => window.removeEventListener("open-create-post", handleOpen);
  }, []);

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
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Also add any remaining tagInput
    const finalTags = [...tags];
    if (tagInput.trim()) {
      const cleaned = tagInput.trim().replace(/^#+/, "").replace(/\s+/g, "");
      if (cleaned && !finalTags.includes(cleaned)) finalTags.push(cleaned);
    }

    onPostSubmit({ content, type, tags: finalTags, imageUrl: previewImage || undefined });

    setContent("");
    setTags([]);
    setTagInput("");
    setPreviewImage(null);
    setType("update");
    setIsExpanded(false);
  };

  const closeModal = () => setIsExpanded(false);

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
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-black text-white text-xl border-2 border-border shadow-[2px_2px_0px_var(--color-border)] shrink-0">
          A
        </div>
        <div className="flex-1 h-12 bg-muted border-2 border-border rounded-xl px-4 flex items-center text-muted-foreground font-bold hover:bg-muted/80 transition-colors shadow-[2px_2px_0px_var(--color-border)] truncate">
          Bagikan karya atau idemu hari ini...
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
                      whileTap={{ scale: 0.85 }}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors border-2 border-transparent hover:border-border"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Textarea (auto-grow) */}
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Apa yang sedang kamu kerjakan? Butuh tim atau masukan?"
                    className="w-full min-h-[100px] bg-muted/50 border-2 border-border rounded-2xl p-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-none mb-5"
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
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-card border-2 border-border rounded-lg hover:bg-rose-100 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-sm"
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
                            }`}
                          >
                            <input type="radio" name="type" value={opt.value} checked={type === opt.value} onChange={() => setType(opt.value)} className="hidden" />
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
                              <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="ml-0.5 hover:text-rose-500">
                                <X className="w-3 h-3" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          onBlur={handleTagBlur}
                          placeholder={tags.length === 0 ? "InfoKampus, LombaDesign, WebDev..." : ""}
                          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-border">
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border-2 border-border text-foreground font-black text-xs hover:bg-muted transition-all shadow-[2px_2px_0px_var(--color-border)]"
                    >
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <span className="hidden sm:inline">Upload Gambar</span>
                    </motion.button>

                    <BouncyButton type="submit" disabled={!content.trim()} className="px-6 py-2.5 text-sm">
                      <span className="flex items-center gap-2">POSTING <Send className="w-4 h-4" /></span>
                    </BouncyButton>
                  </div>
                </form>
              </motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )
      }
    </div>
  );
}
