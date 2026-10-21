"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { getKarya, toggleKaryaLike, getLikedKaryaIds } from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import Link from "next/link";
import {
  Search,
  X,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  UploadCloud,
  ArrowUpDown,
} from "lucide-react";

import { formatNumber } from "@/lib/data";
import { CuratorMedalBadge } from "@/components/home/CuratorMedalBadge";
import { SkeletonProjectCard } from "@/components/ui/Skeleton";
import { ProjectCoverPlaceholder } from "@/components/ui/ProjectCoverPlaceholder";
import TechStackTags from "@/components/ui/TechStackTags";

const POPULAR_TAGS = [
  "Next.js",
  "Flutter",
  "Python AI",
  "IoT",
  "Figma",
  "Laravel",
  "Riset",
];

function ExploreContent() {
  const { user } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";

  const [karya, setKarya] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const qParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(qParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState<"newest" | "likes" | "views" | "az">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  // Sync category & query if URL param changes
  useEffect(() => {
    setActiveCategory(categoryParam);
    setSearchQuery(qParam);
    setCurrentPage(1);
  }, [categoryParam, qParam]);

  // Push changes to URL
  const updateURL = (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "All") params.set("category", category);

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  };

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getKarya();

      // Cek session dulu untuk tahu identity
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

      // ── Sync liked status dari localStorage & server ──────────────
      const initialLiked: Record<string, boolean> = {};
      data.forEach((k) => {
        if (localStorage.getItem(`liked_${k.id}`) === "true") {
          initialLiked[k.id] = true;
        }
      });
      setLikedKarya(initialLiked);

      try {
        const ids = await getLikedKaryaIds(deviceId, userId);
        if (ids && ids.length > 0) {
          setLikedKarya((prev) => {
            const updated = { ...prev };
            ids.forEach((id) => {
              updated[id] = true;
            });
            return updated;
          });
        }
      } catch {
        // abaikan jika gagal
      }
      setKarya(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Refresh data otomatis saat tab/jendela kembali aktif (misal setelah balik dari detail)
  useEffect(() => {
    const handleFocus = async () => {
      const data = await getKarya();
      setKarya(data);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking[id]) return;

    // Set isLiking SEBELUM optimistic update agar tidak bisa di-spam
    setIsLiking((prev) => ({ ...prev, [id]: true }));

    const wasLiked = likedKarya[id];
    // Optimistic update
    setLikedKarya((prev) => ({ ...prev, [id]: !wasLiked }));
    setKarya((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? -1 : 1)) }
          : k
      )
    );

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

      const actionToTake = wasLiked ? "unlike" : "like";
      const isNowLiked = await toggleKaryaLike(id, deviceId, userId, actionToTake);

      // Konfirmasi state dari server
      setLikedKarya((prev) => ({ ...prev, [id]: isNowLiked }));

      if (isNowLiked === wasLiked) {
        setKarya((prev) =>
          prev.map((k) =>
            k.id === id
              ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? 1 : -1)) }
              : k
          )
        );
      }

      if (isNowLiked) {
        localStorage.setItem(`liked_${id}`, "true");
      } else {
        localStorage.removeItem(`liked_${id}`);
      }
    } catch (err) {
      console.error(err);
      // Revert jika error
      setLikedKarya((prev) => ({ ...prev, [id]: wasLiked }));
      setKarya((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, likes: Math.max(0, (k.likes ?? 0) + (wasLiked ? 1 : -1)) }
            : k
        )
      );
    } finally {
      setIsLiking((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Hitung jumlah karya per kategori untuk badge count
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: karya.length };
    karya.forEach((k) => {
      counts[k.category] = (counts[k.category] || 0) + 1;
    });
    return counts;
  }, [karya]);

  // Sorotan 3 Karya Terbaik (Curator Spotlight)
  const spotlightKarya = useMemo(() => {
    if (karya.length === 0) return [];
    return karya.slice(0, 3);
  }, [karya]);

  const filteredKarya = useMemo(() => {
    let result = karya.filter((item) => {
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

    // Urutkan karya
    if (sortBy === "likes") {
      result = [...result].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (sortBy === "views") {
      result = [...result].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [karya, searchQuery, activeCategory, sortBy]);

  // Pagination (6 items per page persis seperti mockup)
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredKarya.length / ITEMS_PER_PAGE) || 1;
  const paginatedKarya = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredKarya.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredKarya, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSortBy("newest");
    setCurrentPage(1);
    updateURL("", "All");
  };

  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
    setCurrentPage(1);
    updateURL(tag, activeCategory);
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors selection:bg-[#FF8A2B] selection:text-[#0B1F4A]">
      {/* ── HERO SECTION (#atas) Sesuai Mockup Galeri.dc.html ── */}
      <section
        id="atas"
        className="w-full border-b border-border bg-slate-50/70 dark:bg-[#0F192D]/70 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-18 pb-10 sm:pb-14 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
          <div className="max-w-2xl">
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-foreground mb-4">
              Eksplorasi karya{" "}
              <span className="text-[#FF8A2B] dark:text-[#FF8A2B]">STMIK Tazkia</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Proyek sistem informasi, mobile apps, riset ilmiah, dan karya multimedia ciptaan mahasiswa STMIK Tazkia.
            </p>
          </div>

          <Link
            href={user ? "/submit" : "/login"}
            className="inline-flex items-center gap-2.5 h-[52px] sm:h-[56px] px-7 sm:px-8 rounded-full bg-[#FF8A2B] text-[#1A0F05] font-bold text-sm sm:text-base shadow-[0_5px_0_#B35A12] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#B35A12] transition-all shrink-0 self-start md:self-auto cursor-pointer"
          >
            <UploadCloud className="w-5 h-5 stroke-[2.2]" />
            <span>Upload karya anda</span>
          </Link>
        </div>

        {/* Search Input & Quick Filter Chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12">
          <div className="relative max-w-3xl">
            <label htmlFor="cari" className="sr-only">
              Cari karya
            </label>
            <Search className="w-5 h-5 text-muted-foreground absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="cari"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                updateURL(e.target.value, activeCategory);
              }}
              placeholder="Cari judul, deskripsi, atau teknologi (React, Flutter, Python...)"
              className="w-full h-[54px] sm:h-[58px] rounded-full border border-border bg-card pl-13 pr-12 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/75 focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/40 focus:border-[#FF8A2B] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                  updateURL("", activeCategory);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tag Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4 max-w-3xl">
            <span className="font-mono text-xs font-bold text-muted-foreground mr-1">
              POPULER
            </span>
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSelectTag(tag)}
                className={`min-h-[34px] sm:min-h-[36px] px-3.5 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                  searchQuery.toLowerCase() === tag.toLowerCase()
                    ? "bg-[#FF8A2B] text-[#1A0F05] border-[#FF8A2B] font-semibold shadow-xs"
                    : "bg-card border-border text-foreground hover:border-[#FF8A2B]/60 hover:bg-muted/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── KARYA TERBAIK / SOROTAN PILIHAN KURATOR (Sesuai Mockup Galeri.dc.html) ── */}
      {!loading && !searchQuery && activeCategory === "All" && spotlightKarya.length >= 3 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 pb-2">
          <div className="font-mono text-xs sm:text-sm font-bold text-[#FF8A2B] tracking-wider uppercase mb-1">
            KARYA TERBAIK
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground mb-6 sm:mb-8">
            Sorotan pilihan kurator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {spotlightKarya.map((item, idx) => {
              const rank = (idx + 1) as 1 | 2 | 3;
              const isLiked = likedKarya[item.id];
              const likesCount = item.likes ?? 0;
              const categoryLabel =
                KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ??
                item.category;

              const authorName = item.team?.[0]?.name || "Karya Tazkia";
              const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
              const extraTeamCount = Math.max(0, (item.team?.length ?? 0) - 1);

              return (
                <article
                  key={`spotlight-${item.id}`}
                  className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col group h-full shadow-xs hover:border-[#FF8A2B]"
                >
                  {/* Cover Area with Hover Pill */}
                  <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
                    <Link href={`/project/${item.id}`} className="block w-full h-full">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <ProjectCoverPlaceholder
                          id={item.id}
                          title={item.title}
                          category={item.category}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    </Link>

                    {/* Rosette Medal Ribbon Badge Top-Left */}
                    <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
                      <CuratorMedalBadge rank={rank} delayIndex={idx} size={18} />
                    </div>

                    {/* Category Badge Top-Right */}
                    <span className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                      {categoryLabel}
                    </span>

                    {/* Hover Slide-up 'Lihat detail' pill button on bottom-right of cover */}
                    <Link
                      href={`/project/${item.id}`}
                      className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
                    >
                      Lihat detail
                    </Link>
                  </div>

                  {/* Card Content - Identik dengan Card Bawah */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <Link
                        href={`/project/${item.id}`}
                        className="block group/title"
                      >
                        <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                        {item.description}
                      </p>

                      {/* Colorful Tech Stack & Tool Chips */}
                      <TechStackTags
                        techs={item.tech_stack ?? []}
                        maxVisible={3}
                        className="mb-4"
                      />
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3.5 border-t border-border flex items-center justify-between mt-auto">
                      {/* Author with initial circle avatar */}
                      <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                        <div className="w-[30px] h-[30px] rounded-full bg-[#FF8A2B] text-[#1A0F05] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                          {authorInitial}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {authorName}
                        </span>
                        {extraTeamCount > 0 && (
                          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground shrink-0">
                            +{extraTeamCount}
                          </span>
                        )}
                      </div>

                      {/* Views & Like Button in Pill style */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Eye className="w-3.5 h-3.5" />
                          <span className="tabular-nums">
                            {formatNumber(item.views ?? 0)}
                          </span>
                        </span>

                        <button
                          onClick={(e) => toggleLike(e, item.id)}
                          aria-label="Sukai karya"
                          className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            isLiked
                              ? "border-[#FF8A2B] bg-[#FF8A2B]/15 text-[#FF8A2B]"
                              : "border-border bg-card text-muted-foreground hover:border-[#FF8A2B]/50 hover:text-foreground"
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                              isLiked
                                ? "fill-[#FF8A2B] text-[#FF8A2B]"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="font-mono tabular-nums">
                            {likesCount}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SEMUA KARYA SECTION (#galeri) Sesuai Mockup ── */}
      <section
        id="galeri"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground mb-6">
          Semua karya
        </h2>

        {/* Category Filter Pills with Live Item Counts */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-8">
          {KARYA_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const count = categoryCounts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  setCurrentPage(1);
                  updateURL(searchQuery, cat.value);
                }}
                className={`min-h-[44px] px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#FF8A2B] text-[#1A0F05] border border-[#FF8A2B] font-bold shadow-xs"
                    : "bg-card border border-border text-foreground hover:border-[#FF8A2B]/50 hover:bg-muted/40"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`font-mono text-xs ml-0.5 px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-black/15 text-[#1A0F05]"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Info Bar & Sort Dropdown */}
        {!loading && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="text-sm sm:text-base text-muted-foreground">
                Menampilkan{" "}
                <strong className="text-foreground font-bold">
                  {filteredKarya.length}
                </strong>{" "}
                karya
              </div>

              {(searchQuery || activeCategory !== "All") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#FF8A2B] hover:underline font-semibold cursor-pointer ml-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label
                htmlFor="urut"
                className="text-xs sm:text-sm text-muted-foreground font-medium"
              >
                Urutkan
              </label>
              <select
                id="urut"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#FF8A2B]/30 focus:border-[#FF8A2B] outline-none cursor-pointer transition-all shadow-2xs"
              >
                <option value="newest">Terbaru</option>
                <option value="views">Terpopuler</option>
                <option value="likes">Paling disukai</option>
                <option value="az">Nama (A - Z)</option>
              </select>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonProjectCard key={i} />
              ))}
            </motion.div>
          ) : filteredKarya.length > 0 ? (
            <>
              <motion.div
                key="content"
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
              >
                {paginatedKarya.map((item) => {
                  const isLiked = likedKarya[item.id];
                  const likesCount = item.likes ?? 0;
                  const categoryLabel =
                    KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ??
                    item.category;

                  const authorName = item.team?.[0]?.name || "Karya Tazkia";
                  const authorInitial = authorName.replace("[", "").charAt(0).toUpperCase();
                  const extraTeamCount = Math.max(0, (item.team?.length ?? 0) - 1);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      key={item.id}
                      className="h-full"
                    >
                      <article className="kt-cardx relative rounded-[20px] border border-border bg-card overflow-hidden flex flex-col h-full group shadow-xs hover:border-[#FF8A2B]">
                        {/* Cover Area with Hover Pill */}
                        <div className="aspect-[16/10] w-full overflow-hidden relative bg-muted group/cover">
                          <Link
                            href={`/project/${item.id}`}
                            className="block w-full h-full"
                          >
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <ProjectCoverPlaceholder
                                id={item.id}
                                title={item.title}
                                category={item.category}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                          </Link>

                          {/* Category Badge on top-left of cover */}
                          <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-card/90 backdrop-blur-md border border-border/70 text-foreground text-xs font-semibold shadow-xs">
                            {categoryLabel}
                          </span>

                          {/* Hover Slide-up 'Lihat detail' pill badge on bottom-right of cover */}
                          <Link
                            href={`/project/${item.id}`}
                            className="kt-go hidden md:inline-flex absolute right-3.5 bottom-3.5 z-20 px-4 py-1.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-md hover:bg-[#ea580c] transition-colors"
                          >
                            Lihat detail
                          </Link>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                          <div>
                            <Link
                              href={`/project/${item.id}`}
                              className="block group/title"
                            >
                              <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground group-hover/title:text-[#FF8A2B] transition-colors line-clamp-1 mb-2">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4 font-normal">
                              {item.description}
                            </p>

                            {/* Colorful Tech Stack & Tool Chips */}
                            <TechStackTags
                              techs={item.tech_stack ?? []}
                              maxVisible={3}
                              className="mb-4"
                            />
                          </div>

                          {/* Card Footer */}
                          <div className="pt-3.5 border-t border-border flex items-center justify-between mt-auto">
                            {/* Author with initial circle avatar */}
                            <div className="flex items-center gap-2.5 min-w-0 max-w-[55%]">
                              <div className="w-[30px] h-[30px] rounded-full bg-[#FF8A2B] text-[#1A0F05] flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                                {authorInitial}
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-foreground truncate">
                                {authorName}
                              </span>
                              {extraTeamCount > 0 && (
                                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md font-semibold text-muted-foreground shrink-0">
                                  +{extraTeamCount}
                                </span>
                              )}
                            </div>

                            {/* Views & Like Button in Pill style */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                <Eye className="w-3.5 h-3.5" />
                                <span className="tabular-nums">
                                  {formatNumber(item.views ?? 0)}
                                </span>
                              </span>

                              <button
                                onClick={(e) => toggleLike(e, item.id)}
                                aria-label="Sukai karya"
                                className={`inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                  isLiked
                                    ? "border-[#FF8A2B] bg-[#FF8A2B]/15 text-[#FF8A2B]"
                                    : "border-border bg-card text-muted-foreground hover:border-[#FF8A2B]/50 hover:text-foreground"
                                }`}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                    isLiked
                                      ? "fill-[#FF8A2B] text-[#FF8A2B]"
                                      : "text-muted-foreground"
                                  }`}
                                />
                                <span className="font-mono tabular-nums">
                                  {likesCount}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* ── Pagination in Pill Button Shape ── */}
              {totalPages > 1 && (
                <div
                  className="mt-12 flex justify-center items-center gap-2"
                  role="navigation"
                  aria-label="Halaman"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[44px] min-h-[44px] rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-[#FF8A2B] text-[#1A0F05] border-[#FF8A2B] font-bold shadow-xs"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 min-h-[44px] px-4 rounded-full bg-card border border-border text-xs sm:text-sm font-semibold text-foreground disabled:opacity-40 hover:bg-muted transition-all cursor-pointer shadow-xs"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ── Empty State Sesuai Mockup ── */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed border-border rounded-[20px] p-10 sm:p-14 text-center max-w-lg mx-auto my-12 bg-card/40"
            >
              <div className="w-12 h-12 rounded-full bg-[#FF8A2B]/10 text-[#FF8A2B] flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 font-heading">
                Belum ada karya yang cocok
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 leading-relaxed">
                Coba pilih kategori lain atau gunakan kata kunci pencarian yang berbeda.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF8A2B] text-[#1A0F05] text-xs sm:text-sm font-bold shadow-xs hover:bg-[#ea580c] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Pencarian</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

export default function ExploreClient() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
