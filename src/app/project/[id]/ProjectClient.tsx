"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getKaryaById, getKarya, formatNumber, incrementKaryaView, checkKaryaLiked, toggleKaryaLike } from "@/lib/data";

import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/utils/identity";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import Link from "next/link";
import {
  ArrowLeft,
  X,
  ExternalLink,
  Globe,
  Code,
  Eye,
  Heart,
  Folder,
  Loader2,
  BookOpen,
  Link2,
  FileText,
  Users,
  Play,
  Image as ImageIcon,
  Share2,
} from "lucide-react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";

// Mapping tech/tools ke ikon CDN
// Returns: { src, type } where type = 'devicon' | 'simple'
function getTechIconUrl(tech: string): string | null {
  const lower = tech.toLowerCase().trim();

  // Simple Icons (simpleicons.org) — pakai slug langsung
  const simpleIconsMap: Record<string, string | null> = {
    "google scholar": "googlescholar",
    "google sheets": "googlesheets",
    "google forms": "googleforms",
    "google docs": "googledocs",
    "google drive": "googledrive",
    "google slides": "googleslides",
    "microsoft word": "microsoftword",
    "excel": "microsoftexcel",
    "microsoft excel": "microsoftexcel",
    "powerpoint": "microsoftpowerpoint",
    "microsoft powerpoint": "microsoftpowerpoint",
    "notion": "notion",
    "trello": "trello",
    "slack": "slack",
    "discord": "discord",
    "postman": "postman",
    "vercel": "vercel",
    "netlify": "netlify",
    "aws": "amazonaws",
    "gcp": "googlecloud",
    "google cloud": "googlecloud",
    "azure": "microsoftazure",
    "vscode": "visualstudiocode",
    "jetbrains": "jetbrains",
    "xcode": "xcode",
    "android studio": "androidstudio",
    "canva": "canva",
    "spss": "ibm",
    "mendeley": "mendeley",
    "zotero": "zotero",
    "overleaf": "overleaf",
    "latex": "latex",
    "quipper": "quipper",
    "zoom": "zoom",
    "kuantitatif": null,
  };

  // Devicon — untuk bahasa pemrograman dan framework
  const deviconMap: Record<string, string> = {
    "react": "react",
    "next.js": "nextjs",
    "nextjs": "nextjs",
    "vue": "vuejs",
    "vue.js": "vuejs",
    "angular": "angular",
    "typescript": "typescript",
    "javascript": "javascript",
    "python": "python",
    "java": "java",
    "kotlin": "kotlin",
    "swift": "swift",
    "dart": "dart",
    "flutter": "flutter",
    "node.js": "nodejs",
    "nodejs": "nodejs",
    "express": "express",
    "laravel": "laravel",
    "php": "php",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "mysql": "mysql",
    "postgresql": "postgresql",
    "mongodb": "mongodb",
    "firebase": "firebase",
    "supabase": "supabase",
    "redis": "redis",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "git": "git",
    "github": "github",
    "figma": "figma",
    "tailwind": "tailwindcss",
    "tailwindcss": "tailwindcss",
    "css": "css3",
    "html": "html5",
    "sass": "sass",
    "tensorflow": "tensorflow",
    "pytorch": "pytorch",
    "arduino": "arduino",
    "raspberry pi": "raspberrypi",
    "unity": "unity",
    "blender": "blender",
    "photoshop": "photoshop",
    "illustrator": "illustrator",
    "after effects": "aftereffects",
  };

  // Cek simpleicons dulu
  for (const [key, slug] of Object.entries(simpleIconsMap)) {
    if (lower.includes(key)) {
      return slug ? `https://cdn.simpleicons.org/${slug}` : null;
    }
  }
  // Lalu cek devicon
  for (const [key, iconName] of Object.entries(deviconMap)) {
    if (lower.includes(key)) {
      return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-original.svg`;
    }
  }
  return null;
}

// Label & ikon tombol link berdasarkan kategori
function getLinkLabel(category: string | undefined): { label: string; icon: React.ReactNode } {
  switch (category) {
    case "Research":
      return { label: "Baca Jurnal / Paper", icon: <BookOpen className="w-4 h-4" /> };
    case "IoT":
      return { label: "Tonton Demo Video", icon: <Play className="w-4 h-4" /> };
    case "Multimedia":
      return { label: "Lihat Berkas Karya", icon: <ImageIcon className="w-4 h-4" /> };
    case "Technology":
    case "Programming":
    default:
      return { label: "Lihat Live Demo", icon: <Globe className="w-4 h-4" /> };
  }
}

// Simple Icons yang ikonnya monokrom (hitam) — perlu di-invert di dark mode
const SIMPLE_ICONS_MONOCHROME = new Set([
  "googlescholar", "mendeley", "zotero", "overleaf", "latex",
  "androidstudio", "xcode", "ibm",
]);

// Komponen TechIcon dengan error fallback
function TechIcon({ url, tech, isSimple }: { url: string; tech: string; isSimple: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Code className="w-4 h-4 text-primary shrink-0" />;
  const isMonochrome = isSimple && SIMPLE_ICONS_MONOCHROME.has(
    url.replace("https://cdn.simpleicons.org/", "").split("/")[0]
  );
  return (
    <img
      src={url}
      alt={tech}
      className={`w-5 h-5 object-contain shrink-0 ${isMonochrome ? "dark:invert" : ""}`}
      onError={() => setFailed(true)}
    />
  );
}

export default function ProjectClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [karya, setKarya] = useState<Karya | null>(null);
  const [relatedKarya, setRelatedKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedLocal, setLikedLocal] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const viewTrackedRef = useRef<string | null>(null);

  // Inisialisasi status like langsung dari localStorage agar tombol langsung NYALA jika sudah liked
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      if (localStorage.getItem(`liked_${id}`) === "true") {
        setLikedLocal(true);
      }
    }
  }, [id]);

  // Efek terpisah untuk cek status like saat user auth berubah tanpa me-reset data karya
  useEffect(() => {
    if (!id) return;
    const deviceId = getDeviceId();
    const currentUserId = user?.id || null;
    checkKaryaLiked(id, deviceId, currentUserId).then((isLiked) => {
      setLikedLocal(isLiked);
    });
  }, [id, user?.id]);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const data = await getKaryaById(id);
      if (data) {
        // Pertahankan views tertinggi (jangan biarkan reset backwards jika sudah naik di sesi ini)
        setKarya(prev => {
          if (!prev || prev.id !== data.id) return data;
          return {
            ...data,
            views: Math.max(data.views || 0, prev.views || 0),
          };
        });
        
        // Fetch related karya
        const all = await getKarya({ category: data.category });
        setRelatedKarya(all.filter((k) => k.id !== data.id).slice(0, 3));

        setLikeCount(data.likes ?? 0);
        
        // Track View (anti-spam 24 jam per device, hanya 1x per id per mount)
        const deviceId = getDeviceId();
        const currentUserId = user?.id || null;
        const lastViewed = localStorage.getItem(`viewed_${data.id}`);
        const now = Date.now();
        const isExpired = !lastViewed || (now - parseInt(lastViewed, 10)) > 24 * 60 * 60 * 1000;

        if (isExpired && viewTrackedRef.current !== data.id) {
          viewTrackedRef.current = data.id;
          incrementKaryaView(data.id, deviceId, currentUserId).then((success) => {
            if (success) {
              localStorage.setItem(`viewed_${data.id}`, Date.now().toString());
              setKarya(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
            } else {
              // Jika gagal, reset flag agar bisa dicoba ulang
              viewTrackedRef.current = null;
            }
          });
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!karya || isLiking) return;
    
    setIsLiking(true);
    const wasLiked = likedLocal;
    const newLikedState = !wasLiked;

    // Optimistic toggle: langsung nyala (+1) atau mati (-1)
    setLikedLocal(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

    if (newLikedState) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#f97316", "#1e3a8a", "#f59e0b"] });
    }

    try {
      const deviceId = getDeviceId();
      const userId = user?.id || null;
      
      const actionToTake = newLikedState ? 'like' : 'unlike';
      const isNowLiked = await toggleKaryaLike(karya.id, deviceId, userId, actionToTake);
      setLikedLocal(isNowLiked);
      
      // Jika server reject (state tidak berubah), revert count
      if (isNowLiked === wasLiked) {
        setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
      }

      if (isNowLiked) {
        localStorage.setItem(`liked_${karya.id}`, 'true');
      } else {
        localStorage.removeItem(`liked_${karya.id}`);
      }
    } catch (err) {
      console.error(err);
      // Revert if error
      setLikedLocal(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsLiking(false);
    }
  };



  const handleShare = async () => {
    if (!karya) return;
    const shareData = {
      title: karya.title,
      text: `Lihat karya inovatif "${karya.title}" di Portal Karya STMIK Tazkia!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  };

  useEffect(() => {
    if (!loading && karya) {
      const duration = 1500;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#f97316", "#1e3a8a", "#f59e0b"] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#f97316", "#1e3a8a", "#f59e0b"] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [loading, karya]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
        <SkeletonBlock className="h-9 w-36 rounded-lg mb-8 bg-muted" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonBlock className="w-full aspect-[16/9] rounded-2xl border border-border bg-card shadow-xs" />
            <SkeletonBlock className="h-64 w-full rounded-2xl border border-border bg-card shadow-xs p-6" />
          </div>
          <div className="space-y-6">
            <SkeletonBlock className="h-72 w-full rounded-2xl border border-border bg-card shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (!karya) notFound();

  const categoryLabel =
    KARYA_CATEGORIES.find((c) => c.value === karya.category)?.label ?? karya.category;
  const linkConfig = getLinkLabel(karya.category);
  const team = karya.team ?? [];
  const isResearch = karya.category === "Research";
  const features = karya.features ?? [];
  const gallery = karya.gallery ?? [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/explore");
          }
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-x-0.5 transition-all mb-8 shadow-xs group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Cover Image with Ambient Cinema Glow */}
          <div className="relative">
            {karya.image_url && (
              <div
                className="absolute -inset-2.5 sm:-inset-4 bg-cover bg-center rounded-3xl blur-2xl opacity-20 dark:opacity-35 -z-10 pointer-events-none transition-opacity"
                style={{ backgroundImage: `url(${karya.image_url})` }}
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-border shadow-xs bg-card relative"
            >
              <div className="aspect-[16/9] relative bg-muted">
                {karya.image_url ? (
                  <img
                    src={karya.image_url}
                    alt={karya.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ProjectCoverPlaceholder id={karya.id} title={karya.title} />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-xs">
                  {categoryLabel}
                </span>
              </div>

              {/* Interactive Stats Pill */}
              <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-background/90 backdrop-blur-md border border-border/60 rounded-xl shadow-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatNumber(karya.views ?? 0)} Views</span>
                </div>

                <div className="w-px h-4 bg-border/60" />

                <button
                  type="button"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    likedLocal
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      : "text-muted-foreground hover:bg-muted hover:text-red-500"
                  } ${isLiking ? "opacity-70 cursor-wait" : ""}`}
                  title={likedLocal ? "Batal suka" : "Sukai karya ini"}
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                      likedLocal ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{formatNumber(likeCount)} Suka</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border shadow-xs rounded-2xl p-6 sm:p-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
              {karya.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {karya.live_url && (
                <a
                  href={karya.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {linkConfig.icon}
                  <span>{linkConfig.label}</span>
                </a>
              )}
              {karya.github_url && (
                <a
                  href={karya.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs"
                >
                  <Code className="w-4 h-4 text-primary" />
                  <span>Repositori GitHub</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:text-foreground font-semibold text-sm hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs"
                title="Bagikan link karya"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
                {isResearch ? "Abstrak Riset" : "Deskripsi Proyek"}
              </h2>
              <p className="leading-relaxed text-muted-foreground text-sm sm:text-base font-normal whitespace-pre-wrap">
                {karya.description}
              </p>
            </div>

            {/* Tech Stack */}
            {(karya.tech_stack ?? []).length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
                  {isResearch ? "Metodologi & Tools" : "Tools & Teknologi"}
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {(karya.tech_stack ?? []).map((tech) => {
                    const iconUrl = getTechIconUrl(tech);
                    const isSimple = iconUrl?.startsWith("https://cdn.simpleicons.org") ?? false;
                    return (
                      <div
                        key={tech}
                        className="flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-muted transition-all"
                      >
                        {iconUrl ? (
                          <TechIcon url={iconUrl} tech={tech} isSimple={isSimple} />
                        ) : (
                          <Code className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span>{tech}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features / Temuan */}
            {features.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
                  {isResearch ? "Poin Penemuan" : "Fitur Utama"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {features.map((feat: any, i: number) => (
                    <div
                      key={i}
                      className="bg-muted/40 rounded-xl p-4 border border-border/80 hover:border-primary/40 transition-all"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-2.5">
                        {i + 1}
                      </div>
                      <h4 className="font-semibold text-foreground mb-1 text-sm">
                        {feat.title || "Poin"}
                      </h4>
                      <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                        {feat.description || feat.desc || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery & Documentation */}
            {gallery.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h2 className="text-base sm:text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
                  Dokumentasi &amp; Galeri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((item: any, i: number) => {
                    const imgUrl = typeof item === "string" ? item : item.url;
                    return (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden border border-border bg-muted group hover:border-primary/40 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedImage(imgUrl)}
                          className="overflow-hidden relative w-full block text-left outline-none cursor-zoom-in"
                        >
                          <img
                            src={imgUrl}
                            alt={
                              typeof item === "object" && item.caption
                                ? item.caption
                                : `Dokumentasi ${i + 1}`
                            }
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm rounded-full p-2.5 shadow-sm">
                              <Eye className="text-foreground w-4 h-4" />
                            </div>
                          </div>
                        </button>
                        {typeof item === "object" && item.caption && (
                          <div className="p-3 bg-card border-t border-border">
                            <p className="text-xs text-muted-foreground">
                              {item.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Karya Card */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-2xl bg-card border border-border p-6 shadow-xs"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Informasi Karya
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-semibold text-foreground">{categoryLabel}</span>
              </div>
              {karya.created_at && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Diunggah</span>
                  <span className="font-semibold text-foreground">
                    {new Date(karya.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(karya.views ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Total Apresiasi</span>
                <span className="font-semibold text-foreground">
                  {formatNumber(likeCount)} Suka
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              {karya.live_url && (
                <a
                  href={karya.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] transition-all shadow-xs"
                >
                  {linkConfig.icon}
                  <span>{linkConfig.label}</span>
                </a>
              )}
              {karya.github_url && (
                <a
                  href={karya.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-muted/60 border border-border text-foreground hover:bg-muted text-xs font-semibold hover:border-primary/40 transition-all"
                >
                  <Code className="w-4 h-4 text-primary" />
                  <span>Lihat Source Code</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Tim Pembuat Card */}
          {team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="rounded-2xl bg-card border border-border p-6 shadow-xs"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Tim Pembuat</span>
              </h3>
              <div className="flex flex-col gap-2.5">
                {team.filter((m: any) => m.status !== "rejected").map((member: any) => (
                  <Link
                    href={`/student/${member.user_id || `temp-${member.name}`}`}
                    key={member.user_id || member.name}
                  >
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-border/70 hover:border-primary/40 hover:bg-muted/40 transition-all group">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0 relative bg-muted">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                            {member.name}
                          </p>
                          {member.status === "pending" && (
                            <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded-full shrink-0">
                              ⏳ Konfirmasi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {member.role || "Project Lead"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Related Projects */}
      {relatedKarya.length > 0 && (
        <div className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                Karya Terkait
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Karya {categoryLabel} Lainnya
              </h2>
            </div>
            <Link
              href={`/explore?category=${karya.category}`}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat Kategori →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedKarya.map((k) => (
              <div key={k.id}>
                <Link href={`/project/${k.id}`} className="block h-full group">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-xl hover:shadow-orange-500/5 hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                    <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted">
                      {k.image_url ? (
                        <img
                          src={k.image_url}
                          alt={k.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ProjectCoverPlaceholder id={k.id} title={k.title} />
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-background/85 backdrop-blur-md text-foreground border border-border/50 shadow-xs">
                          {KARYA_CATEGORIES.find((c) => c.value === k.category)?.label ?? k.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                          {k.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                          {k.description}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Eye className="w-3.5 h-3.5" />
                          {formatNumber(k.views ?? 0)}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                          {formatNumber(k.likes ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 backdrop-blur-md"
          >
            <Share2 className="w-3.5 h-3.5 text-primary" />
            <span>Link karya berhasil disalin ke clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-colors shadow-md z-20"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedImage}
                alt="Galeri Fullscreen"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl border border-border shadow-2xl bg-card"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
