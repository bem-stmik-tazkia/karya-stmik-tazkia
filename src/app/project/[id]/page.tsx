"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [showToast, setShowToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      const data = await getKaryaById(id);
      if (data) {
        setKarya(data);
        
        // Fetch related karya
        const all = await getKarya({ category: data.category });
        setRelatedKarya(all.filter((k) => k.id !== data.id).slice(0, 3));

        setLikeCount(data.likes ?? 0);
        
        // Track View
        const deviceId = getDeviceId();
        
        // Check if liked
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        
        const isLiked = await checkKaryaLiked(data.id, deviceId, userId);
        setLikedLocal(isLiked);
        
        // Increment view (this will only increment in DB once per 24 hours per device due to anti-spam in RPC)
        await incrementKaryaView(data.id, deviceId);
      }
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
      
      const isNowLiked = await toggleKaryaLike(karya.id, deviceId, userId);
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


  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group"
      >
        <div className="w-10 h-10 rounded-2xl border-2 border-border flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]">
          <ArrowLeft className="h-5 w-5" />
        </div>
        KEMBALI
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Main Image dengan badge kategori di thumbnail */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden border-4 border-border shadow-[4px_4px_0px_var(--color-border)] bg-card"
          >
            <div className="aspect-[16/9] relative bg-muted">
              {karya.image_url ? (
                <img
                  src={karya.image_url}
                  alt={karya.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">📁</span>
                </div>
              )}
              {/* Badge kategori di kanan atas thumbnail */}
              <div className="absolute top-4 right-4">
                <StickerBadge variant="default" className="text-xs sm:text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                  {categoryLabel}
                </StickerBadge>
              </div>

              {/* Stats di pojok kanan bawah thumbnail */}
              <div className="absolute bottom-4 right-4 flex items-center gap-4 py-2 px-4 bg-background/90 backdrop-blur-sm border-2 border-border rounded-xl text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                <span className="flex items-center gap-1.5 text-primary">
                  <Eye className="w-4 h-4" /> {formatNumber(karya.views ?? 0)} Views
                </span>
                <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-4 font-black text-sm uppercase shadow-[4px_4px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-none transition-all ${
                  likedLocal
                    ? "bg-red-500 border-red-600 text-white"
                    : "bg-muted border-border text-foreground hover:bg-red-100 hover:text-red-500"
                } ${isLiking ? "opacity-70 cursor-wait" : ""}`}
              >
                <Heart className={`w-5 h-5 ${likedLocal ? "fill-white" : ""}`} />
                {formatNumber(likeCount)} Suka
              </button>
              </div>
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[2rem] p-6 sm:p-10"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase leading-tight bg-gradient-to-br from-white to-slate-400 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
              {karya.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              {karya.live_url && !isResearch && (
                <a href={karya.live_url} target="_blank" rel="noreferrer">
                  <BouncyButton className="text-sm px-5 py-3">
                    {linkConfig.icon}
                    <span className="ml-2">{linkConfig.label.toUpperCase()}</span>
                  </BouncyButton>
                </a>
              )}
              {karya.github_url && (
                <a href={karya.github_url} target="_blank" rel="noreferrer">
                  <BouncyButton variant="secondary" className="text-sm px-5 py-3">
                    REPOSITORI GITHUB <Code className="w-4 h-4 ml-2" />
                  </BouncyButton>
                </a>
              )}
            </div>

            <div className="space-y-4 text-foreground font-medium">
              <h3 className="text-xl font-black uppercase text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-secondary block shrink-0" />
                {isResearch ? "Abstrak" : "Deskripsi Projek"}
              </h3>
              <p className="leading-relaxed text-muted-foreground text-base sm:text-lg whitespace-pre-wrap">
                {karya.description}
              </p>
            </div>

            {/* Tech Stack dengan logo */}
            {(karya.tech_stack ?? []).length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-black uppercase text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-secondary block shrink-0" />
                  {isResearch ? "Metodologi / Tools" : "Tools & Teknologi"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(karya.tech_stack ?? []).map((tech) => {
                    const iconUrl = getTechIconUrl(tech);
                    const isSimple = iconUrl?.startsWith("https://cdn.simpleicons.org") ?? false;
                    return (
                      <div
                        key={tech}
                        className="flex items-center gap-2 rounded-xl bg-muted border-2 border-border px-3 py-2 text-sm font-bold text-foreground"
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
              <div className="mt-8">
                <h3 className="text-xl font-black uppercase text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-secondary block shrink-0" />
                  {isResearch ? "Poin Penemuan" : "Fitur Utama"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feat: any, i: number) => (
                    <div
                      key={i}
                      className="bg-muted rounded-2xl p-5 border-2 border-border shadow-[2px_2px_0px_var(--color-border)] hover:translate-y-[-2px] transition-transform"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
                        <span className="text-primary font-black text-sm">{i + 1}</span>
                      </div>
                      <h4 className="font-black text-foreground mb-2 text-sm">{feat.title || "Poin"}</h4>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        {feat.description || feat.desc || ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery & Documentation */}
            {gallery.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-black uppercase text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-secondary block shrink-0" />
                  Gallery & Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((item: any, i: number) => {
                    const imgUrl = typeof item === "string" ? item : item.url;
                    return (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden border-2 border-border shadow-[2px_2px_0px_var(--color-border)] bg-muted group"
                    >
                      <button
                        onClick={() => setSelectedImage(imgUrl)}
                        className="overflow-hidden relative border-b-2 border-border w-full block text-left outline-none cursor-zoom-in"
                      >
                        <img
                          src={imgUrl}
                          alt={typeof item === "object" && item.caption ? item.caption : `Dokumentasi ${i + 1}`}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Eye className="text-white w-5 h-5" />
                          </div>
                        </div>
                      </button>
                      {typeof item === "object" && item.caption && (
                        <div className="p-4 bg-muted">
                          <p className="text-xs font-bold text-muted-foreground border-l-4 border-secondary pl-3">
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
        <div className="space-y-6">
          {/* Info Karya */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] bg-card border-4 border-border p-6 shadow-[4px_4px_0px_var(--color-border)]"
          >
            <h3 className="text-xs font-black uppercase mb-5 text-muted-foreground text-center">
              Info Karya
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b-2 border-border">
                <span className="font-bold text-muted-foreground">Kategori</span>
                <span className="font-black text-foreground">{categoryLabel}</span>
              </div>
              {karya.created_at && (
                <div className="flex items-center justify-between py-2 border-b-2 border-border">
                  <span className="font-bold text-muted-foreground">Diunggah</span>
                  <span className="font-black text-foreground">
                    {new Date(karya.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="font-bold text-muted-foreground">Views</span>
                <span className="font-black text-foreground">{formatNumber(karya.views ?? 0)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {karya.live_url && !isResearch && (
                <a href={karya.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-2xl bg-primary text-primary-foreground border-2 border-border hover:opacity-90 transition-all font-bold text-sm shadow-[2px_2px_0px_var(--color-border)]">
                  {linkConfig.icon} {linkConfig.label}
                </a>
              )}
              {karya.github_url && (
                <a href={karya.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-2xl bg-muted border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground transition-all font-bold text-sm shadow-[2px_2px_0px_var(--color-border)]">
                  <Code className="w-4 h-4" /> Source Code
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 p-3 rounded-2xl bg-muted text-foreground border-2 border-border hover:bg-secondary hover:text-secondary-foreground transition-all font-bold text-sm shadow-[2px_2px_0px_var(--color-border)] w-full"
              >
                <Share2 className="w-4 h-4" /> Bagikan Karya
              </button>
            </div>
          </motion.div>

          {/* Tim di Sidebar (foto besar) */}
          {team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[2rem] bg-card border-4 border-border p-6 shadow-[4px_4px_0px_var(--color-border)]"
            >
              <h3 className="text-xs font-black uppercase mb-5 text-muted-foreground text-center flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Tim Pembuat
              </h3>
              <div className="flex flex-col gap-3">
                {team.map((member) => (
                  <Link 
                    href={`/student/${member.user_id || `temp-${member.name}`}`} 
                    key={member.user_id || member.name}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted border-2 border-border cursor-pointer hover:border-primary hover:translate-y-[-2px] transition-all group">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-border shrink-0 group-hover:border-primary transition-colors">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-sm font-black uppercase">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">{member.name}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">{member.role || "Project Lead"}</p>
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
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Folder className="w-6 h-6 text-primary" /> Karya {categoryLabel} Lainnya
            </h2>
            <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedKarya.map((k) => (
              <div key={k.id}>
                <Link href={`/project/${k.id}`} className="block h-full">
                  <div className="card-3d overflow-hidden flex flex-col h-full group bg-card">
                    <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border bg-muted">
                      {k.image_url ? (
                        <img
                          src={k.image_url}
                          alt={k.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">📁</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StickerBadge variant="default" className="text-[10px]">
                          {KARYA_CATEGORIES.find((c) => c.value === k.category)?.label ?? k.category}
                        </StickerBadge>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {k.title}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground line-clamp-2 mt-1">
                        {k.description}
                      </p>
                      {/* Author info */}
                      {k.team && k.team.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-border">
                          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-border shrink-0">
                            {k.team[0].avatar ? (
                              <img src={k.team[0].avatar} alt={k.team[0].name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-[9px] font-black uppercase">
                                {k.team[0].name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-muted-foreground truncate">{k.team[0].name}</span>
                          {k.team.length > 1 && (
                            <span className="text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-md">+{k.team.length - 1}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Custom Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full font-bold shadow-[4px_4px_0px_var(--color-primary)] flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-primary" />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="relative z-10 max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-10 h-10 rounded-xl bg-card border-2 border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-colors shadow-[4px_4px_0px_var(--color-border)] z-20"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedImage}
                alt="Galeri Fullscreen"
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border-4 border-border shadow-[8px_8px_0px_var(--color-border)] bg-muted"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
