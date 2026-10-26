"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getKarya, toggleKaryaLike, getLikedKaryaIds } from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";
import type { Karya } from "@/types/karya";
import { SkeletonProjectCard } from "@/components/ui/Skeleton";
import {
  ExploreHero,
  ExploreSpotlightSection,
  ExploreFilterBar,
  ExploreProjectGrid,
} from "@/components/explore";

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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();

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
        // ignore
      }
      setKarya(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Refresh data otomatis saat tab/jendela kembali aktif
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: karya.length };
    karya.forEach((k) => {
      counts[k.category] = (counts[k.category] || 0) + 1;
    });
    return counts;
  }, [karya]);

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

    if (sortBy === "likes") {
      result = [...result].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (sortBy === "views") {
      result = [...result].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    } else if (sortBy === "az") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [karya, searchQuery, activeCategory, sortBy]);

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
      {/* 1. HERO SECTION */}
      <ExploreHero
        isLoggedIn={Boolean(user)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
          updateURL(q, activeCategory);
        }}
        onSelectTag={handleSelectTag}
      />

      {/* 2. SPOTLIGHT PILIHAN KURATOR */}
      {!loading && !searchQuery && activeCategory === "All" && (
        <ExploreSpotlightSection
          spotlightKarya={spotlightKarya}
          likedKarya={likedKarya}
          onToggleLike={toggleLike}
        />
      )}

      {/* 3. SEMUA KARYA (#galeri) */}
      <section id="galeri" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground mb-6">
          Semua karya
        </h2>

        {/* Filters and Sorting */}
        <ExploreFilterBar
          activeCategory={activeCategory}
          categoryCounts={categoryCounts}
          totalResults={filteredKarya.length}
          hasActiveFilters={Boolean(searchQuery || activeCategory !== "All")}
          sortBy={sortBy}
          onCategoryChange={(cat) => {
            setActiveCategory(cat);
            setCurrentPage(1);
            updateURL(searchQuery, cat);
          }}
          onSortChange={(sort) => {
            setSortBy(sort);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
        />

        {/* Projects Grid */}
        <ExploreProjectGrid
          loading={loading}
          paginatedKarya={paginatedKarya}
          likedKarya={likedKarya}
          currentPage={currentPage}
          totalPages={totalPages}
          totalFiltered={filteredKarya.length}
          onToggleLike={toggleLike}
          onPageChange={(page) => setCurrentPage(page)}
          onResetFilters={handleResetFilters}
        />
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
