"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FiMonitor, FiSmartphone, FiBookOpen, FiCpu, FiGrid, FiArrowRight, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";

const DotLottieReact = dynamic(
  () => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

const KATEGORI_KARYA = [
  {
    id: "Technology",
    title: "Aplikasi Web & Sistem",
    desc: "Website, sistem informasi, dan aplikasi berbasis web.",
    icon: <FiMonitor size={24} />,
    gradient: "from-blue-500/15 to-blue-600/5",
    borderColor: "#3b82f6",      // blue-500
    dotColor: "bg-blue-500",
    lottie: "/animations/Developer.lottie",
  },
  {
    id: "Programming",
    title: "Aplikasi Mobile",
    desc: "Aplikasi Android, iOS, atau cross-platform.",
    icon: <FiSmartphone size={24} />,
    gradient: "from-green-500/15 to-green-600/5",
    borderColor: "#22c55e",      // green-500
    dotColor: "bg-green-500",
    lottie: "/animations/mobile.lottie",
  },
  {
    id: "Research",
    title: "Karya Tulis & Jurnal",
    desc: "Penelitian ilmiah, jurnal, skripsi, dan karya tulis.",
    icon: <FiBookOpen size={24} />,
    gradient: "from-orange-500/15 to-orange-600/5",
    borderColor: "#f97316",      // orange-500
    dotColor: "bg-orange-500",
    lottie: "/animations/Learning.lottie",
  },
  {
    id: "IoT",
    title: "Proyek IoT",
    desc: "Proyek Internet of Things, hardware, dan embedded system.",
    icon: <FiCpu size={24} />,
    gradient: "from-purple-500/15 to-purple-600/5",
    borderColor: "#a855f7",      // purple-500
    dotColor: "bg-purple-500",
    lottie: "/animations/robot.lottie",
  },
  {
    id: "Multimedia",
    title: "Desain & Lainnya",
    desc: "Desain grafis, video, animasi, dan karya multimedia.",
    icon: <FiGrid size={24} />,
    gradient: "from-pink-500/15 to-pink-600/5",
    borderColor: "#ec4899",      // pink-500
    dotColor: "bg-pink-500",
    lottie: "/animations/kalkun.lottie",
    lottieScale: 1.1,
  },
];

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [activeIndex, setActiveIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    } else if (user) {
      // If there is an ID, it means we are editing. Go straight to the form.
      const id = searchParams.get("id");
      if (id) {
        router.replace(`/submit/form?id=${id}`);
      }
    }
  }, [user, isLoading, router, searchParams]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lottieRefs = useRef<Record<string, any>>({});

  const handleDotLottieRef = useCallback((id: string) => (dotLottie: any) => {
    lottieRefs.current[id] = dotLottie;
  }, []);

  useEffect(() => {
    const activeId = KATEGORI_KARYA[activeIndex].id;
    Object.keys(lottieRefs.current).forEach((id) => {
      const dl = lottieRefs.current[id];
      if (!dl) return;
      if (id === activeId) { dl.play(); } else { dl.stop(); }
    });
  }, [activeIndex]);

  const handleCardClick = (index: number, id: string) => {
    if (index === activeIndex) {
      // Pass the selected category as type
      router.push(`/submit/form?type=${encodeURIComponent(id)}`);
    } else {
      setActiveIndex(index);
    }
  };

  const nextCard = () => { if (activeIndex < KATEGORI_KARYA.length - 1) setActiveIndex(activeIndex + 1); };
  const prevCard = () => { if (activeIndex > 0) setActiveIndex(activeIndex - 1); };

  if (isLoading || !user) return null;

  return (
    <>
      {/* Close Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 right-6 md:top-10 md:right-10 p-3 rounded-full bg-card shadow-[4px_4px_0px_var(--color-border)] border-2 border-border text-foreground hover:text-red-500 hover:border-red-500 transition-all hover:scale-110 z-[100]"
      >
        <FiX size={24} />
      </button>

      <div className="max-w-5xl mx-auto flex flex-col justify-start pt-16 md:pt-12 pb-24 md:pb-12 relative z-10 overflow-x-clip overflow-y-visible w-full px-4">
        <div className="text-center mb-2 mt-4 md:mt-0">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-black text-primary mb-2 uppercase"
          >
          Upload Karya Baru
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground max-w-xl mx-auto font-bold"
        >
          Pilih kategori karya yang ingin kamu unggah, lalu klik lagi untuk mulai mengisi formulir.
        </motion.p>
      </div>

      <div className="relative h-[430px] md:h-[470px] w-full flex items-center justify-center mt-2 md:mt-4">

        {/* Navigation Arrows */}
        <button
          onClick={prevCard}
          disabled={activeIndex === 0}
          className="absolute left-1 sm:left-4 md:left-8 z-50 p-2.5 md:p-4 rounded-full bg-card shadow-xl border-2 border-border text-foreground hover:text-primary disabled:opacity-0 transition-all hover:scale-110"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          onClick={nextCard}
          disabled={activeIndex === KATEGORI_KARYA.length - 1}
          className="absolute right-1 sm:right-4 md:right-8 z-50 p-2.5 md:p-4 rounded-full bg-card shadow-xl border-2 border-border text-foreground hover:text-primary disabled:opacity-0 transition-all hover:scale-110"
        >
          <FiChevronRight size={24} />
        </button>

        {KATEGORI_KARYA.map((item, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;
          const isVisible = absOffset <= 1;
          const xOffsetBase = isMobile ? 120 : 220;
          const cardOpacity = isActive ? 1 : absOffset === 1 ? 0.75 : 0;
          const cardY = isActive ? 0 : 18;
          const cardScale = isActive ? 1 : 0.87;

          return (
            <motion.div
              key={item.id}
              onClick={() => handleCardClick(index, item.id)}
              initial={false}
              animate={{
                x: `calc(-50% + ${offset * xOffsetBase}px)`,
                y: `calc(-50% + ${cardY}px)`,
                opacity: cardOpacity,
                scale: cardScale,
                zIndex: 20 - absOffset,
              }}
              // hover kecil aja, jangan kegedean
              whileHover={isActive ? { scale: 1.015 } : { scale: 0.895 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`absolute top-1/2 left-1/2 w-[280px] sm:w-[320px] md:w-[340px] h-[410px] md:h-[430px] bg-card rounded-3xl cursor-pointer select-none flex flex-col overflow-hidden`}
              style={{
                pointerEvents: absOffset > 1 ? "none" : "auto",
                // Border warna sesuai kategori, lebih tebal untuk yang aktif
                border: isActive
                  ? `4px solid ${item.borderColor}`
                  : `3px solid ${item.borderColor}60`,
                boxShadow: isActive
                  ? `0 20px 60px ${item.borderColor}40, 0 0 0 1px ${item.borderColor}20`
                  : "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl pointer-events-none`} />

              {/* Lottie area — tidak ada overflow hidden agar tidak terpotong */}
              <div className="relative w-full h-[180px] md:h-[200px] flex-shrink-0 flex items-center justify-center">
                {item.lottie && isVisible && (
                  <div
                    className="w-[155px] h-[155px] md:w-[175px] md:h-[175px]"
                    style={item.lottieScale ? { transform: `scale(${item.lottieScale})` } : undefined}
                  >
                    <DotLottieReact
                      key={item.id}
                      src={item.lottie}
                      loop
                      autoplay={isActive}
                      dotLottieRefCallback={handleDotLottieRef(item.id)}
                      renderConfig={{ devicePixelRatio: 3 }}
                    />
                  </div>
                )}
              </div>

              {/* Text content — tampil di semua card (aktif & non-aktif) */}
              <div className="relative z-10 flex flex-col flex-grow px-5 pb-5 pt-3 md:px-6">
                <div className="flex-grow flex flex-col justify-center">
                  <h3
                    className="text-lg sm:text-xl font-black mb-1.5 transition-colors"
                    style={{ color: item.borderColor }}
                  >
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed font-bold transition-opacity ${isActive ? "text-muted-foreground opacity-100" : "text-muted-foreground opacity-70"}`}>
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t-2 border-border/20">
                  {isActive ? (
                    <button
                      className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:-translate-y-0.5 active:scale-95"
                      style={{ backgroundColor: item.borderColor }}
                    >
                      Mulai Upload <FiArrowRight size={16} />
                    </button>
                  ) : (
                    <div
                      className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 opacity-50"
                      style={{ border: `2px dashed ${item.borderColor}80`, color: item.borderColor }}
                    >
                      Klik untuk pilih
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {KATEGORI_KARYA.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all ${i === activeIndex ? "w-6" : "w-2 bg-border"}`}
            style={i === activeIndex ? { backgroundColor: item.borderColor, width: "1.5rem" } : {}}
          />
        ))}
      </div>
    </div>
    </>
  );
}
