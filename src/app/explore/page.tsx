"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getKarya } from "@/lib/data";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import Link from "next/link";
import {
  Search,
  X,
  Eye,
  Heart,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { formatNumber } from "@/lib/data";

export default function ExplorePage() {
  const [karya, setKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getKarya();
      setKarya(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedKarya((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredKarya = useMemo(() => {
    return karya.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tech_stack ?? []).some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        activeCategory === "All" ||
        item.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [karya, searchQuery, activeCategory]);

  // Pagination
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredKarya.length / ITEMS_PER_PAGE) || 1;
  const paginatedKarya = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKarya.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredKarya, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
      {/* Page Title Header */}
      <div className="mb-12 text-center">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase"
          style={{ textShadow: "3px 3px 0px var(--color-border)" }}
        >
          Eksplorasi <span className="text-primary">Portofolio Karya</span>
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl font-bold text-muted-foreground max-w-2xl mx-auto"
        >
          Temukan berbagai hasil karya inovatif, riset, dan proyek teknologi
          terbaik ciptaan mahasiswa STMIK Tazkia.
        </motion.p>
      </div>

      {/* Category Filter */}
      <div className="mb-10 max-w-5xl mx-auto relative px-2">
        <div className="absolute top-12 left-8 right-8 h-0 border-b-4 border-border/50 border-dashed hidden md:block" />
        <div className="flex items-center gap-3 overflow-x-auto px-4 py-3 md:justify-between no-scrollbar scroll-smooth">
          {KARYA_CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setCurrentPage(1);
                }}
                className="relative group flex flex-col items-center gap-2 outline-none shrink-0 py-2 px-1"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-4 flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary border-border text-primary-foreground scale-105 shadow-[4px_4px_0px_var(--color-border)] -translate-y-1"
                      : "bg-card border-border text-foreground shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_var(--color-border)]"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`font-black uppercase text-[10px] sm:text-xs tracking-wide text-center leading-tight max-w-[70px] ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground font-black pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, deskripsi, atau tech stack..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-14 w-full rounded-2xl border-4 border-border bg-card pl-12 pr-10 py-2 font-bold text-sm sm:text-base focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_var(--color-border)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted rounded-xl p-1 border-2 border-border"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="font-bold text-muted-foreground">Memuat karya...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          {filteredKarya.length > 0 ? (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedKarya.map((item) => {
                  const isLiked = likedKarya[item.id];
                  const likesCount = (item.likes ?? 0) + (isLiked ? 1 : 0);
                  const categoryLabel =
                    KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ??
                    item.category;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      key={item.id}
                      className="h-full"
                    >
                      <Link href={`/project/${item.id}`} className="block h-full">
                        <div className="card-3d overflow-hidden flex flex-col h-full bg-card group">
                          {/* Cover Image */}
                          <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border bg-muted">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <span className="text-4xl">📁</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex flex-wrap items-start gap-2">
                              <StickerBadge variant="default" className="text-xs">
                                {categoryLabel}
                              </StickerBadge>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="p-6 flex flex-col flex-grow justify-between">
                            <div>
                              <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                                {item.description}
                              </p>

                              {/* Tech Stack Tags */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {(item.tech_stack ?? []).slice(0, 3).map((tech) => (
                                  <span
                                    key={tech}
                                    className="inline-flex items-center rounded-lg bg-accent/20 border-2 border-border px-2.5 py-0.5 text-xs font-bold text-foreground"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Footer Info: Links & Stats */}
                            <div className="pt-4 border-t-2 border-border flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground max-w-[60%]">
                                {item.team && item.team.length > 0 ? (
                                  <>
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0 shadow-sm">
                                      {item.team[0].avatar ? (
                                        <img src={item.team[0].avatar} alt={item.team[0].name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-[11px] font-black uppercase">
                                          {item.team[0].name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <span className="truncate">{item.team[0].name}</span>
                                    {item.team.length > 1 && (
                                      <span className="text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-md">+{item.team.length - 1}</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm">
                                      K
                                    </div>
                                    <span className="truncate">Karya Tazkia</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs font-black text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-primary" />
                                  {formatNumber(item.views ?? 0)}
                                </span>
                                <button
                                  onClick={(e) => toggleLike(e, item.id)}
                                  className={`flex items-center gap-1 hover:text-secondary transition-colors ${
                                    isLiked ? "text-secondary font-black" : ""
                                  }`}
                                >
                                  <Heart
                                    className={`w-4 h-4 ${isLiked ? "fill-current text-secondary" : ""}`}
                                  />
                                  {formatNumber(likesCount)}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl border-2 border-border text-xs font-black transition-all ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                          : "bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-3d bg-card border-4 border-border rounded-3xl p-10 text-center max-w-lg mx-auto my-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border-2 border-border">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase text-foreground mb-2">
                Karya Tidak Ditemukan
              </h3>
              <p className="text-muted-foreground font-medium text-sm mb-6">
                Tidak ada karya yang sesuai dengan pencarian atau kategori yang
                dipilih.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-black uppercase border-2 border-border shadow-[2px_2px_0px_var(--color-border)] hover:bg-secondary/90 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> RESET FILTERS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
