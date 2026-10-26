"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  getKaryaById,
  getKarya,
  incrementKaryaView,
  checkKaryaLiked,
  toggleKaryaLike,
} from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { ArrowLeft, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import {
  ProjectCoverHeader,
  ProjectMainContent,
  ProjectSidebar,
  RelatedProjectsSection,
  ImageZoomModal,
  getLinkLabel,
} from "@/components/project/detail";

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

  // Inisialisasi status like dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      if (localStorage.getItem(`liked_${id}`) === "true") {
        setLikedLocal(true);
      }
    }
  }, [id]);

  // Cek status like saat user auth berubah
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
        setKarya((prev) => {
          if (!prev || prev.id !== data.id) return data;
          return {
            ...data,
            views: Math.max(data.views || 0, prev.views || 0),
          };
        });

        const all = await getKarya({ category: data.category });
        setRelatedKarya(all.filter((k) => k.id !== data.id).slice(0, 3));
        setLikeCount(data.likes ?? 0);

        const deviceId = getDeviceId();
        const currentUserId = user?.id || null;
        const lastViewed = localStorage.getItem(`viewed_${data.id}`);
        const now = Date.now();
        const isExpired = !lastViewed || now - parseInt(lastViewed, 10) > 24 * 60 * 60 * 1000;

        if (isExpired && viewTrackedRef.current !== data.id) {
          viewTrackedRef.current = data.id;
          incrementKaryaView(data.id, deviceId, currentUserId).then((success) => {
            if (success) {
              localStorage.setItem(`viewed_${data.id}`, Date.now().toString());
              setKarya((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev));
            } else {
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

    setLikedLocal(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    if (newLikedState) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#1e3a8a", "#f59e0b"],
      });
    }

    try {
      const deviceId = getDeviceId();
      const userId = user?.id || null;

      const actionToTake = newLikedState ? "like" : "unlike";
      const isNowLiked = await toggleKaryaLike(karya.id, deviceId, userId, actionToTake);
      setLikedLocal(isNowLiked);

      if (isNowLiked === wasLiked) {
        setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
      }

      if (isNowLiked) {
        localStorage.setItem(`liked_${karya.id}`, "true");
      } else {
        localStorage.removeItem(`liked_${karya.id}`);
      }
    } catch (err) {
      console.error(err);
      setLikedLocal(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
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
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#f97316", "#1e3a8a", "#f59e0b"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#f97316", "#1e3a8a", "#f59e0b"],
        });
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
  const isResearch = karya.category === "Research";

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
          {/* 1. Cover Header with Glow & Stats */}
          <ProjectCoverHeader
            karya={karya}
            categoryLabel={categoryLabel}
            likedLocal={likedLocal}
            likeCount={likeCount}
            isLiking={isLiking}
            onLike={handleLike}
          />

          {/* 2. Project Details, Description, Tech, Features, Gallery */}
          <ProjectMainContent
            karya={karya}
            isResearch={isResearch}
            linkConfig={linkConfig}
            onShare={handleShare}
            onSelectImage={(imgUrl) => setSelectedImage(imgUrl)}
          />
        </div>

        {/* 3. Sidebar: Info & Tim Pembuat */}
        <ProjectSidebar
          karya={karya}
          categoryLabel={categoryLabel}
          likeCount={likeCount}
          linkConfig={linkConfig}
        />
      </div>

      {/* 4. Related Projects */}
      <RelatedProjectsSection
        relatedKarya={relatedKarya}
        category={karya.category}
        categoryLabel={categoryLabel}
      />

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

      {/* Fullscreen Image Zoom Modal */}
      <ImageZoomModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
