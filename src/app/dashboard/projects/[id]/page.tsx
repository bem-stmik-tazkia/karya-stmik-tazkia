"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKarya, formatNumber, checkKaryaLiked, toggleKaryaLike } from "@/lib/data";
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import toast from "react-hot-toast";

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

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [karya, setKarya] = useState<Karya | null>(null);
  const [relatedKarya, setRelatedKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedLocal, setLikedLocal] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showToast, setShowToast] = useState(false); // kept for potential other uses
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        router.push("/login");
        return;
      }

      // Fetch private data directly
      const { data, error } = await supabase
        .from("karya")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Verify ownership
      const isOwner = data.user_id === userId;
      const isTeamMember = (data.team ?? []).some((m: any) => m.user_id === userId);
      
      if (!isOwner && !isTeamMember) {
        router.push("/dashboard/projects");
        return;
      }

      setKarya(data);
      
      // Fetch related karya (public only)
      const all = await getKarya({ category: data.category });
      setRelatedKarya(all.filter((k) => k.id !== data.id).slice(0, 3));

      setLikeCount(data.likes ?? 0);
      
      const deviceId = getDeviceId();
      const isLiked = await checkKaryaLiked(data.id, deviceId, userId);
      setLikedLocal(isLiked);
      
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleLike = async () => {
    if (!karya || isLiking) return;
    
    setIsLiking(true);
    // Optimistic update
    setLikedLocal(!likedLocal);
    setLikeCount(prev => likedLocal ? Math.max(0, prev - 1) : prev + 1);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();
      
      const actionToTake = likedLocal ? 'unlike' : 'like';
      const isNowLiked = await toggleKaryaLike(karya.id, deviceId, userId, actionToTake);
      setLikedLocal(isNowLiked);
    } catch (err) {
      console.error(err);
      // Revert if error
      setLikedLocal(likedLocal);
      setLikeCount(prev => likedLocal ? prev + 1 : Math.max(0, prev - 1));
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
        toast.success("Link berhasil disalin! 📋");
      } catch (err) {
        toast.error("Gagal menyalin link.");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-bold text-muted-foreground">Memuat detail karya...</p>
      </div>
    );
  }

  if (!karya) return null;

  const categoryLabel =
    KARYA_CATEGORIES.find((c) => c.value === karya.category)?.label ?? karya.category;
  const linkConfig = getLinkLabel(karya.category);
  const team = karya.team ?? [];
  const isResearch = karya.category === "Research";
  
  // Default features if none provided
  const features = karya.features ?? [];
  const gallery = karya.gallery ?? [];

  const statusBanner = {
    approved: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      icon: <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
      title: "Karya Terverifikasi & Publik",
      label: "Karya ini sudah dipublikasikan secara resmi dan dapat dilihat semua pengunjung di galeri.",
    },
    rejected: {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400",
      badge: "bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30",
      icon: <XCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />,
      title: "Karya Memerlukan Perbaikan",
      label: "Karya ini belum disetujui. Perbaiki data karya dan ajukan kembali untuk ditinjau.",
    },
    pending: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
      badge: "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30",
      icon: <Clock className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />,
      title: "Menunggu Peninjauan Admin",
      label: "Karya ini sedang dalam antrean verifikasi kampus. Belum dapat diakses oleh publik.",
    },
  }[karya.status as "approved" | "rejected" | "pending"] ?? {
    bg: "bg-muted/80 border-border text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    icon: <AlertCircle className="w-5 h-5 shrink-0 text-muted-foreground" />,
    title: "Status Belum Diketahui",
    label: "Status karya saat ini belum ditentukan.",
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/dashboard/projects");
          }
        }}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:-translate-x-0.5 transition-all mb-8 shadow-2xs group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali</span>
      </button>

      {/* Modern Status Banner */}
      <div className={`p-5 rounded-2xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm ${statusBanner.bg}`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2 rounded-xl bg-background/60 shadow-2xs shrink-0">
            {statusBanner.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">{statusBanner.title}</h4>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{statusBanner.label}</p>
            {karya.status === "rejected" && karya.reject_reason && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                Catatan revisi: {karya.reject_reason}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {karya.status !== "approved" && (
            <Link
              href={`/submit/form?id=${karya.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-[#ea580c] shadow-xs hover:shadow-md transition-all btn-shine whitespace-nowrap"
            >
              <span>Edit Karya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {karya.status === "approved" && (
            <Link
              href={`/project/${karya.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-xs hover:shadow-md transition-all whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Halaman Publik</span>
            </Link>
          )}
        </div>
      </div>

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

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Badge kategori di kiri atas thumbnail */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-xs">
                    {categoryLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border shadow-xs rounded-2xl p-6 sm:p-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-6 text-foreground leading-tight font-heading">
              {karya.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {karya.live_url && (
                <a
                  href={karya.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 btn-shine"
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
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-muted/60 border border-border text-muted-foreground hover:text-foreground font-semibold text-sm hover:bg-muted hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-xs cursor-pointer"
                title="Bagikan link karya"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </button>
            </div>

            <div className="space-y-3 pt-2 text-foreground">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-primary block shrink-0" />
                {isResearch ? "Abstrak" : "Deskripsi Projek"}
              </h3>
              <p className="leading-relaxed text-muted-foreground text-sm sm:text-base font-normal whitespace-pre-wrap">
                {karya.description}
              </p>
            </div>

            {/* Tech Stack dengan logo */}
            {(karya.tech_stack ?? []).length > 0 && (
              <div className="mt-7">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary block shrink-0" />
                  {isResearch ? "Metodologi / Tools" : "Tools & Teknologi"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(karya.tech_stack ?? []).map((tech) => {
                    const iconUrl = getTechIconUrl(tech);
                    const isSimple = iconUrl?.startsWith("https://cdn.simpleicons.org") ?? false;
                    return (
                      <div
                        key={tech}
                        className="flex items-center gap-2 rounded-lg bg-muted border border-border px-3 py-1.5 text-sm font-medium text-foreground"
                      >
                        {iconUrl ? (
                          <TechIcon url={iconUrl} tech={tech} isSimple={isSimple} />
                        ) : (
                          <Code className="w-4 h-4 text-primary shrink-0" />
                        )}
                        {tech}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features / Temuan */}
            {features.length > 0 && (
              <div className="mt-7">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary block shrink-0" />
                  {isResearch ? "Poin Penemuan" : "Fitur Utama"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feat: any, i: number) => (
                    <div
                      key={i}
                      className="bg-muted rounded-xl p-4 border border-border hover:-translate-y-0.5 transition-transform duration-200"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5">
                        <span className="text-primary font-semibold text-xs">{i + 1}</span>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1.5 text-sm">{feat.title || "Poin"}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feat.description || feat.desc || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery & Documentation */}
            {gallery.length > 0 && (
              <div className="mt-7">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-primary block shrink-0" />
                  Gallery &amp; Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gallery.map((item: any, i: number) => {
                    const imgUrl = typeof item === "string" ? item : item.url;
                    return (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-border shadow-sm bg-muted group"
                    >
                      <button
                        onClick={() => setSelectedImage(imgUrl)}
                        className="overflow-hidden relative w-full block text-left outline-none cursor-zoom-in"
                      >
                        <img
                          src={imgUrl}
                          alt={typeof item === "object" && item.caption ? item.caption : `Dokumentasi ${i + 1}`}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                            <Eye className="text-white w-4 h-4" />
                          </div>
                        </div>
                      </button>
                      {typeof item === "object" && item.caption && (
                        <div className="p-3 bg-muted">
                          <p className="text-xs text-muted-foreground border-l-2 border-primary pl-2.5">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              </div>
            )}

          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Info Karya */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-card border border-border p-5 shadow-sm"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground text-center">
              Info Karya
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Kategori</span>
                <span className="font-semibold text-foreground text-xs">{categoryLabel}</span>
              </div>
              {karya.created_at && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Diunggah</span>
                  <span className="font-semibold text-foreground text-xs">
                    {new Date(karya.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Views</span>
                <span className="font-semibold text-foreground text-xs">{formatNumber(karya.views ?? 0)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {karya.live_url && (
                <a href={karya.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-primary text-white border border-primary hover:bg-[#ea580c] transition-all duration-200 font-medium text-sm shadow-sm">
                  {linkConfig.icon} {linkConfig.label}
                </a>
              )}
              {karya.github_url && (
                <a href={karya.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-muted border border-border hover:bg-card hover:border-foreground/30 transition-all duration-200 font-medium text-sm shadow-sm">
                  <Code className="w-4 h-4" /> Source Code
                </a>
              )}
            </div>
          </motion.div>

          {/* Tim di Sidebar */}
          {team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl bg-card border border-border p-5 shadow-sm"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-muted-foreground text-center flex items-center justify-center gap-2">
                <Users className="w-3.5 h-3.5" /> Tim Pembuat
              </h3>
              <div className="flex flex-col gap-2">
                {team.map((member) => (
                  <Link
                    href={`/student/${member.user_id || `temp-${member.name}`}`}
                    key={member.user_id || member.name}
                  >
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted border border-border cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-border shrink-0 group-hover:border-primary/40 transition-colors">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary text-white flex items-center justify-center text-sm font-bold uppercase">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors duration-200">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground">{member.role || "Project Lead"}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>


      {/* Custom Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-3 text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Share2 className="w-3.5 h-3.5 text-primary" />
            </div>
            Link berhasil disalin!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />
            
            {/* Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2 }}
              className="relative z-10 max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors shadow-md z-20"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={selectedImage}
                alt="Galeri Fullscreen"
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl border border-border shadow-xl bg-muted"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

