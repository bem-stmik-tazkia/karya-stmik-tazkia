"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiMonitor, FiSmartphone, FiBookOpen, FiCpu, FiGrid, FiArrowRight, FiX } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";

const KATEGORI_KARYA = [
  {
    id: "Technology",
    title: "Website",
    desc: "Website, portal sistem informasi, dan aplikasi web.",
    icon: FiMonitor,
    gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
    borderColor: "#3b82f6",
    bgAccent: "bg-blue-500/10",
    iconColor: "text-blue-500",
    badge: "Website",
  },
  {
    id: "Programming",
    title: "Aplikasi Mobile",
    desc: "Aplikasi Android, iOS, atau cross-platform.",
    icon: FiSmartphone,
    gradient: "from-green-500/20 via-green-400/10 to-transparent",
    borderColor: "#22c55e",
    bgAccent: "bg-green-500/10",
    iconColor: "text-green-500",
    badge: "Mobile",
  },
  {
    id: "Research",
    title: "Riset / Jurnal",
    desc: "Penelitian ilmiah, jurnal, skripsi, dan karya tulis akademik.",
    icon: FiBookOpen,
    gradient: "from-orange-500/20 via-orange-400/10 to-transparent",
    borderColor: "#f97316",
    bgAccent: "bg-orange-500/10",
    iconColor: "text-orange-500",
    badge: "Riset",
  },
  {
    id: "IoT",
    title: "Proyek IoT & Hardware",
    desc: "Internet of Things, hardware, dan embedded system.",
    icon: FiCpu,
    gradient: "from-purple-500/20 via-purple-400/10 to-transparent",
    borderColor: "#a855f7",
    bgAccent: "bg-purple-500/10",
    iconColor: "text-purple-500",
    badge: "IoT",
  },
  {
    id: "Multimedia",
    title: "Desain & Lainnya",
    desc: "Desain grafis, UI/UX, video, animasi, dan karya kreatif lainnya.",
    icon: FiGrid,
    gradient: "from-pink-500/20 via-pink-400/10 to-transparent",
    borderColor: "#ec4899",
    bgAccent: "bg-pink-500/10",
    iconColor: "text-pink-500",
    badge: "Desain",
  },
];

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [clickedId, setClickedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    } else if (user) {
      const id = searchParams.get("id");
      if (id) {
        router.replace(`/submit/form?id=${id}`);
      }
    }
  }, [user, isLoading, router, searchParams]);

  const handleSelect = (id: string) => {
    if (clickedId) return; // prevent double click
    setClickedId(id);
    router.push(`/submit/form?type=${encodeURIComponent(id)}`);
  };

  if (isLoading || !user) return null;

  return (
    <>
      {/* Close Button */}
      <button
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/dashboard");
          }
        }}
        className="fixed top-5 right-5 md:top-8 md:right-8 w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-xs text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-all z-[100] cursor-pointer"
        title="Kembali"
      >
        <FiX size={18} />
      </button>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 md:py-12 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div className="w-full max-w-3xl relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4 shadow-xs">
              <FiArrowRight size={12} /> Upload Karya Baru
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              Pilih Kategori Karya
            </h1>
            <p className="text-muted-foreground font-normal text-sm max-w-md mx-auto leading-relaxed">
              Pilih rumpun kategori proyekmu untuk melanjutkan ke pengisian formulir portofolio.
            </p>
          </motion.div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KATEGORI_KARYA.map((item, i) => {
              const Icon = item.icon;
              const isHovered = hoveredId === item.id;
              const isClicked = clickedId === item.id;
              const isLoading = isClicked;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  onClick={() => handleSelect(item.id)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={!!clickedId}
                  className={`
                    relative w-full text-left rounded-2xl border p-5 transition-all duration-200 cursor-pointer group
                    bg-card overflow-hidden shadow-xs
                    ${isLoading
                      ? "scale-[0.98] opacity-80"
                      : "hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/5 active:translate-y-0"
                    }
                  `}
                  style={{
                    borderColor: isHovered || isLoading ? item.borderColor : "var(--border)",
                  }}
                >
                  {/* Background gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}
                  />

                  {/* Background ambient icon watermark */}
                  <div 
                    className={`absolute -right-5 -bottom-5 w-32 h-32 pointer-events-none transition-all duration-300 transform ${isHovered ? "opacity-20 -translate-y-1.5 -translate-x-1.5 scale-110" : "opacity-5"}`}
                  >
                    <Icon className="w-full h-full" style={{ color: item.borderColor }} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Badge top right */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors duration-200 ${item.bgAccent}`}
                        style={{ borderColor: `${item.borderColor}30` }}
                      >
                        <Icon size={20} style={{ color: item.borderColor }} />
                      </div>
                      {/* Category badge */}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-xs"
                        style={{ color: item.borderColor, borderColor: `${item.borderColor}40`, backgroundColor: `${item.borderColor}10` }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-foreground text-sm sm:text-base mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-xs font-normal leading-relaxed">
                      {item.desc}
                    </p>

                    {/* CTA */}
                    <div
                      className={`mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
                        isLoading ? "opacity-60" : ""
                      }`}
                      style={{ color: item.borderColor }}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Membuka form...</span>
                        </>
                      ) : (
                        <>
                          <span>Pilih kategori ini</span>
                          <FiArrowRight
                            size={12}
                            className={`transition-transform duration-200 ${isHovered ? "translate-x-1" : ""}`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground font-normal mt-8"
          >
            Tidak yakin? Pilih yang paling mendekati, kamu masih dapat mengganti kategori di formulir.
          </motion.p>
        </div>
      </div>
    </>
  );
}
