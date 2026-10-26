"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Mail, ExternalLink, Check, Palette, X, User, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { CARD_SKINS, CardSkin, getSkinById, createCustomSkin } from "@/utils/skinConfig";
import { getSkinDefinition, isSkinUnlocked, StudentCardRenderer } from "@/components/cards";
import { getClaimedExclusiveBadgeIds } from "@/lib/badgeService";
import { getPersistedEarnedBadges, PENGHARGAAN_CATALOG } from "@/data/penghargaanCatalog";
import toast from "react-hot-toast";

interface SkinPreviewModalProps {
  studentName?: string;
  prodi?: string | null;
  angkatan?: number | string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  skills?: string[];
  statusBadge?: string | null;
  activeSkinId?: string;
  featuredBadgeIds?: number[];
  unlockedBadgeIds?: number[];
  studentId?: string | null;
  userId?: string | null;
  onApplySkin?: (skinId: string) => void;
  onClose: () => void;
}

export default function SkinPreviewModal({
  studentName = "Muhammad Hafidz Alaziz",
  prodi = "STMIK Tazkia · Informatika",
  angkatan = 2026,
  avatarUrl,
  bio,
  skills,
  statusBadge,
  activeSkinId = "classic",
  featuredBadgeIds: propFeaturedBadgeIds,
  unlockedBadgeIds: propUnlockedBadgeIds,
  studentId,
  userId,
  onApplySkin,
  onClose,
}: SkinPreviewModalProps) {
  // Custom colors state for the "custom" skin option (defaults to Tazkia official colors)
  const [customPrimary, setCustomPrimary] = useState<string>("#FF8A2B");
  const [customSecondary, setCustomSecondary] = useState<string>("#0B1F4A");
  const [savedPrimary, setSavedPrimary] = useState<string>("#FF8A2B");
  const [savedSecondary, setSavedSecondary] = useState<string>("#0B1F4A");

  // Quick Presets horizontal scrolling & dragging state
  const presetScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isDraggingPresetRef = useRef(false);
  const presetStartXRef = useRef(0);
  const presetScrollStartRef = useRef(0);
  const hasMovedPresetRef = useRef(false);

  const updatePresetScrollState = () => {
    if (presetScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = presetScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  const handleScrollPresetStep = (direction: "left" | "right") => {
    if (presetScrollRef.current) {
      const amount = direction === "left" ? -140 : 140;
      presetScrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(updatePresetScrollState, 250);
    }
  };

  const handlePresetMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!presetScrollRef.current) return;
    isDraggingPresetRef.current = true;
    hasMovedPresetRef.current = false;
    presetStartXRef.current = e.pageX;
    presetScrollStartRef.current = presetScrollRef.current.scrollLeft;
  };

  const handlePresetMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPresetRef.current || !presetScrollRef.current) return;
    const delta = e.pageX - presetStartXRef.current;
    if (Math.abs(delta) > 3) {
      hasMovedPresetRef.current = true;
    }
    presetScrollRef.current.scrollLeft = presetScrollStartRef.current - delta;
    updatePresetScrollState();
  };

  const handlePresetMouseUp = () => {
    isDraggingPresetRef.current = false;
  };

  const handlePresetWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (presetScrollRef.current && e.deltaY !== 0) {
      presetScrollRef.current.scrollLeft += e.deltaY;
      updatePresetScrollState();
    }
  };

  // Global mouse up for smooth dragging release
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingPresetRef.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // Kumpulan ID badge yang dimiliki / diklaim oleh mahasiswa ini
  const availableBadgeIds = useMemo<number[]>(() => {
    const ids = new Set<number>();
    if (Array.isArray(propUnlockedBadgeIds)) {
      propUnlockedBadgeIds.forEach((id) => ids.add(Number(id)));
    }
    if (Array.isArray(propFeaturedBadgeIds)) {
      propFeaturedBadgeIds.forEach((id) => ids.add(Number(id)));
    }
    const uid = userId || studentId;
    if (uid) {
      getClaimedExclusiveBadgeIds(uid, studentId || undefined).forEach((id) => ids.add(Number(id)));
      getPersistedEarnedBadges(uid).forEach((id) => ids.add(Number(id)));
    }
    if (typeof window !== "undefined") {
      try {
        const storedClaims = localStorage.getItem(`tazkia_claimed_badges_${uid || "user"}`);
        if (storedClaims) {
          const parsed = JSON.parse(storedClaims);
          if (Array.isArray(parsed)) parsed.forEach((id: any) => ids.add(Number(id)));
        }
      } catch {}
    }
    return Array.from(ids).filter((n) => !isNaN(n));
  }, [propUnlockedBadgeIds, propFeaturedBadgeIds, studentId, userId]);

  // Filter kategori tema: semua, umum, atau khusus (eksklusif)
  const [activeCategoryTab, setActiveCategoryTab] = useState<"semua" | "umum" | "khusus">("semua");

  // Selected skin for live preview
  const [selectedIdx, setSelectedIdx] = useState<number>(() => {
    const idx = CARD_SKINS.findIndex(
      (s) => s.id === activeSkinId || (activeSkinId === "default" && s.id === "classic")
    );
    return idx >= 0 ? idx : 0;
  });

  // Applied/saved skin index
  const [appliedIdx, setAppliedIdx] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tazkia_profile_skin");
      if (saved) {
        const skinDef = getSkinDefinition(saved);
        if (isSkinUnlocked(skinDef, availableBadgeIds)) {
          const idx = CARD_SKINS.findIndex((s) => s.id === saved);
          if (idx >= 0) return idx;
        } else {
          localStorage.setItem("tazkia_profile_skin", "classic");
          if (studentId) localStorage.setItem(`tazkia_profile_skin_${studentId}`, "classic");
        }
      }
    }
    const idx = CARD_SKINS.findIndex(
      (s) => s.id === activeSkinId || (activeSkinId === "default" && s.id === "classic")
    );
    if (idx >= 0) {
      const skinDef = getSkinDefinition(CARD_SKINS[idx].id);
      if (isSkinUnlocked(skinDef, availableBadgeIds)) return idx;
    }
    return 0;
  });

  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<number[]>(() => {
    if (propFeaturedBadgeIds !== undefined) {
      return propFeaturedBadgeIds;
    }
    return [];
  });

  // Sync saved skin, custom colors & featured badges from props/localStorage on mount
  useEffect(() => {
    if (propFeaturedBadgeIds !== undefined) {
      setFeaturedBadgeIds(propFeaturedBadgeIds);
    }
  }, [propFeaturedBadgeIds]);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tazkia_profile_skin");
      if (saved && isMounted) {
        const skinDef = getSkinDefinition(saved);
        if (isSkinUnlocked(skinDef, availableBadgeIds)) {
          const idx = CARD_SKINS.findIndex((s) => s.id === saved);
          if (idx >= 0 && isMounted) {
            setAppliedIdx(idx);
            setSelectedIdx(idx);
          }
        } else {
          localStorage.setItem("tazkia_profile_skin", "classic");
          if (studentId) localStorage.setItem(`tazkia_profile_skin_${studentId}`, "classic");
          setAppliedIdx(0);
          setSelectedIdx(0);
        }
      }

      try {
        const savedCustom = localStorage.getItem("tazkia_custom_skin_colors");
        if (savedCustom && isMounted) {
          const parsed = JSON.parse(savedCustom);
          if (parsed.primary) {
            setCustomPrimary(parsed.primary);
            setSavedPrimary(parsed.primary);
          }
          if (parsed.secondary) {
            setCustomSecondary(parsed.secondary);
            setSavedSecondary(parsed.secondary);
          }
        }
      } catch {
        // fallback
      }

      if (propFeaturedBadgeIds === undefined) {
        try {
          const storageKey = studentId
            ? `tazkia_featured_badges_${studentId}`
            : "tazkia_featured_badges";
          const savedBadges = localStorage.getItem(storageKey);
          if (savedBadges && isMounted) {
            const parsed = JSON.parse(savedBadges);
            if (Array.isArray(parsed)) {
              setFeaturedBadgeIds(parsed.slice(0, 5));
            }
          }
        } catch {
          // fallback
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [propFeaturedBadgeIds, studentId, availableBadgeIds]);

  const rawSkin = CARD_SKINS[selectedIdx] || CARD_SKINS[0];
  const curSkin: CardSkin =
    rawSkin.id === "custom"
      ? createCustomSkin(customPrimary, customSecondary)
      : rawSkin;

  // Daftar skin terfilter berdasarkan tab kategori (Semua / Umum / Khusus)
  const displayedSkinEntries = useMemo(() => {
    return CARD_SKINS.map((skin, idx) => ({ skin, originalIdx: idx })).filter(
      ({ skin }) => {
        if (activeCategoryTab === "semua") return true;
        const group = skin.group || "umum";
        return group === activeCategoryTab;
      }
    );
  }, [activeCategoryTab]);

  const umumCount = useMemo(
    () => CARD_SKINS.filter((s) => (s.group || "umum") === "umum").length,
    []
  );
  const khususCount = useMemo(
    () => CARD_SKINS.filter((s) => s.group === "khusus").length,
    []
  );

  const isCurSkinLocked = useMemo(() => {
    const skinDef = getSkinDefinition(curSkin.id);
    return !isSkinUnlocked(skinDef, availableBadgeIds);
  }, [curSkin.id, availableBadgeIds]);

  const rawAppliedSkin = CARD_SKINS[appliedIdx] || CARD_SKINS[0];
  const appliedSkin: CardSkin =
    rawAppliedSkin.id === "custom"
      ? createCustomSkin(savedPrimary, savedSecondary)
      : rawAppliedSkin;

  const isColorsChanged =
    curSkin.id === "custom" &&
    (customPrimary !== savedPrimary || customSecondary !== savedSecondary);
  const isSame = selectedIdx === appliedIdx && !isColorsChanged;

  const handleApply = () => {
    const skin = CARD_SKINS[selectedIdx];
    const skinDef = getSkinDefinition(skin.id);

    // Keamanan ketat: Tolak penerapan jika skin eksklusif masih terkunci
    if (!isSkinUnlocked(skinDef, availableBadgeIds)) {
      toast.error(`Tema "${skin.name}" masih terkunci. Anda dapat menggunakannya setelah menerima lencana kehormatan terkait.`);
      return;
    }

    setAppliedIdx(selectedIdx);
    if (skin.id === "custom") {
      setSavedPrimary(customPrimary);
      setSavedSecondary(customSecondary);
      if (typeof window !== "undefined") {
        localStorage.setItem("tazkia_profile_skin", "custom");
        localStorage.setItem(
          "tazkia_custom_skin_colors",
          JSON.stringify({ primary: customPrimary, secondary: customSecondary })
        );
        if (studentId) {
          localStorage.setItem(`tazkia_profile_skin_${studentId}`, "custom");
          localStorage.setItem(
            `tazkia_custom_skin_colors_${studentId}`,
            JSON.stringify({ primary: customPrimary, secondary: customSecondary })
          );
        }
        window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
        window.dispatchEvent(
          new CustomEvent("tazkia_profile_skin_updated", { detail: { skinId: "custom", studentId } })
        );
        window.dispatchEvent(new Event("storage"));
      }
      if (onApplySkin) {
        onApplySkin("custom");
      }
      toast.success("Tema Custom Warna berhasil diterapkan!");
    } else {
      if (typeof window !== "undefined") {
        localStorage.setItem("tazkia_profile_skin", skin.id);
        if (studentId) {
          localStorage.setItem(`tazkia_profile_skin_${studentId}`, skin.id);
        }
        window.dispatchEvent(new Event("tazkia_profile_skin_updated"));
        window.dispatchEvent(
          new CustomEvent("tazkia_profile_skin_updated", { detail: { skinId: skin.id, studentId } })
        );
        window.dispatchEvent(new Event("storage"));
      }
      if (onApplySkin) {
        onApplySkin(skin.id);
      }
      toast.success(`Tema "${skin.name}" berhasil diterapkan!`);
    }
  };

  return (
    <AnimatePresence>
      {/* Outer Scrollable Overlay */}
      <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-start justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-[1040px] bg-card border border-border rounded-[20px] sm:rounded-[24px] shadow-2xl z-10 flex flex-col my-auto max-h-[96vh] md:max-h-[92vh] overflow-hidden"
          style={
            {
              "--c1": curSkin.secondaryColor,
              "--c2": curSkin.primaryColor,
            } as React.CSSProperties
          }
        >
          {/* ── Modal Head ── */}
          <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-border shrink-0 bg-card">
            <div className="w-[36px] h-[36px] rounded-xl flex items-center justify-center shadow-xs bg-[#FF8A2B] text-white">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Skin Kartu Mahasiswa
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pilih tema, lihat hasilnya langsung di kartu depan &amp; belakang.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-auto w-[32px] h-[32px] rounded-full border border-border bg-transparent hover:bg-muted text-foreground flex items-center justify-center text-sm cursor-pointer transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Modal Body: 2 Kolom (Stage Kiri, Side Kanan) ── */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
            {/* ══════════════════════════════════════════════
                KOLOM KIRI: STAGE 3D INTERAKTIF
            ══════════════════════════════════════════════ */}
            <div
              className="w-full md:w-[50%] lg:w-[52%] shrink-0 h-[215px] sm:h-[260px] md:h-full overflow-y-auto relative px-2 sm:px-4 py-2 sm:py-3.5 flex flex-col items-center transition-all duration-500"
              style={{
                background: `radial-gradient(120% 90% at 50% 0%, ${curSkin.primaryColor}22, transparent 65%), linear-gradient(180deg, ${curSkin.secondaryColor}14, var(--background))`,
              }}
            >
              {/* Floating lock indicator in 3D Stage if current skin is locked */}
              {isCurSkinLocked && (
                <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg select-none">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Pratinjau Eksklusif · Terkunci</span>
                </div>
              )}

              <div className="w-full flex flex-col items-center py-0.5 antialiased">
                <div className="w-full flex justify-center py-0.5 [zoom:0.66] sm:[zoom:0.78] md:[zoom:0.92]">
                  <StudentCardRenderer
                    skinId={curSkin.id}
                    isSkeleton={false}
                    isPreview={true}
                    data={{
                      name: studentName,
                      initials:
                        studentName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "MH",
                      angkatan: angkatan ? `ANGKATAN ${angkatan}` : "ANGKATAN 2",
                      status: statusBadge || "Open for Collab",
                      major: prodi || "STMIK Tazkia · Informatika",
                      skills: skills && skills.length > 0 ? skills : [],
                      bio: bio || undefined,
                      roleTitle: "Mahasiswa Aktif STMIK Tazkia",
                      serial: "KTZ-2026-STD-001",
                      featuredBadgeIds: featuredBadgeIds,
                      unlockedBadgeIds: availableBadgeIds,
                      avatarUrl: avatarUrl || null,
                      socials: {
                        website: "https://tazkia.ac.id",
                        github: "https://github.com",
                        linkedin: "https://linkedin.com",
                        instagram: "https://instagram.com",
                      },
                    }}
                    customPrimary={customPrimary}
                    customSecondary={customSecondary}
                    enableTilt={true}
                    onContactClick={() => {
                      toast.success("Mode Preview: Tombol Hubungi aktif");
                    }}
                    onProfileClick={() => {
                      toast.success("Membuka profil mahasiswa (Mode Preview)");
                    }}
                  />
                </div>

                {/* Hint */}
                <div className="text-[10px] sm:text-[11px] text-muted-foreground z-10 text-center select-none mt-1 sm:mt-2 px-2 pb-1">
                  Hover kursor untuk 3D tilt · Klik tombol <strong>Balik</strong> untuk membuka Lemari Penghargaan
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                KOLOM KANAN: KOLEKSI TEMA
            ══════════════════════════════════════════════ */}
            <div className="w-full md:flex-1 flex-1 min-h-0 overflow-hidden p-3 sm:p-4.5 md:p-6 flex flex-col bg-card">
              {/* Header: Judul, Tagline, Atur Warna & Label Koleksi (DIKUNCI / SHRINK-0 - TIDAK PERNAH TENGGELAM) */}
              <div className="shrink-0 flex flex-col gap-1.5 sm:gap-2 pb-1.5 sm:pb-2.5 bg-card">
                {/* Meta Skin Title & Tag */}
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight truncate flex items-center gap-2">
                      <span className="truncate">{curSkin.name}</span>
                      {isCurSkinLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 shrink-0">
                          <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                          <span>Terkunci</span>
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {curSkin.tagline}
                    </p>
                  </div>

                  <span
                    className="shrink-0 font-bold text-[9.5px] sm:text-[10px] px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex items-center gap-1"
                    style={{
                      backgroundColor: isCurSkinLocked ? "rgba(245, 158, 11, 0.15)" : `${curSkin.primaryColor}22`,
                      color: isCurSkinLocked ? "#f59e0b" : curSkin.primaryColor,
                      border: isCurSkinLocked ? "1px solid rgba(245, 158, 11, 0.35)" : undefined,
                    }}
                  >
                    {isCurSkinLocked && <Lock className="w-3 h-3 text-amber-500" />}
                    <span>{curSkin.badge}</span>
                  </span>
                </div>

                {/* Locked notice alert banner */}
                {isCurSkinLocked && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 my-0.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-300 block text-xs">
                        Skin Eksklusif Terkunci
                      </span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed mt-0.5">
                        {curSkin.unlockRequirement || "Skin kehormatan ini hanya dapat digunakan oleh penerima Lencana Kehormatan Vanguard BEM 2026."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interactive 2-Color Customizer (Aktif jika memilih tema Custom Warna) */}
                {curSkin.id === "custom" && (
                  <div className="pt-0.5 pb-0.5 flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px]">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Atur 2 Warna Kartu
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-muted-foreground font-mono">
                        Preview Langsung
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Warna 1: Aksen */}
                      <div className="bg-muted/40 border border-border/80 rounded-xl p-1.5 sm:p-2 flex items-center gap-2">
                        <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden shrink-0 border border-border shadow-xs">
                          <input
                            type="color"
                            value={customPrimary}
                            onChange={(e) => setCustomPrimary(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            aria-label="Pilih Warna Aksen"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customPrimary }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] sm:text-[9.5px] text-muted-foreground block font-medium leading-none mb-0.5">
                            Warna Aksen
                          </span>
                          <span className="text-[10.5px] sm:text-[11px] font-mono font-bold text-foreground uppercase truncate block">
                            {customPrimary}
                          </span>
                        </div>
                      </div>

                      {/* Warna 2: Latar Header */}
                      <div className="bg-muted/40 border border-border/80 rounded-xl p-1.5 sm:p-2 flex items-center gap-2">
                        <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden shrink-0 border border-border shadow-xs">
                          <input
                            type="color"
                            value={customSecondary}
                            onChange={(e) => setCustomSecondary(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            aria-label="Pilih Warna Latar"
                          />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customSecondary }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] sm:text-[9.5px] text-muted-foreground block font-medium leading-none mb-0.5">
                            Warna Latar
                          </span>
                          <span className="text-[10.5px] sm:text-[11px] font-mono font-bold text-foreground uppercase truncate block">
                            {customSecondary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets with Scroll / Drag & Arrow Controls */}
                    <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] select-none pt-0.5">
                      <span className="text-muted-foreground font-medium shrink-0 mr-0.5 text-[10px]">
                        Preset:
                      </span>

                      {/* Tombol Geser Kiri */}
                      <button
                        type="button"
                        onClick={() => handleScrollPresetStep("left")}
                        disabled={!canScrollLeft}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border border-border bg-card transition-all ${
                          canScrollLeft
                            ? "text-foreground hover:bg-muted cursor-pointer active:scale-95 shadow-xs"
                            : "text-muted-foreground/30 opacity-30 cursor-not-allowed border-transparent"
                        }`}
                        title="Geser preset ke kiri"
                        aria-label="Geser ke kiri"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Scrollable & Draggable Area */}
                      <div
                        ref={presetScrollRef}
                        onScroll={updatePresetScrollState}
                        onWheel={handlePresetWheel}
                        onMouseDown={handlePresetMouseDown}
                        onMouseMove={handlePresetMouseMove}
                        onMouseUp={handlePresetMouseUp}
                        onMouseLeave={handlePresetMouseUp}
                        className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar cursor-grab active:cursor-grabbing touch-pan-x"
                      >
                        {[
                          { name: "Tazkia Default", pri: "#FF8A2B", sec: "#0B1F4A" },
                          { name: "Neon Cyber", pri: "#00ffcc", sec: "#0a192f" },
                          { name: "Sunset Gold", pri: "#f59e0b", sec: "#26170a" },
                          { name: "Purple Neon", pri: "#c084fc", sec: "#1e1035" },
                          { name: "Rose Crimson", pri: "#fb7185", sec: "#2b0d18" },
                          { name: "Electric Blue", pri: "#38bdf8", sec: "#081b2e" },
                          { name: "Emerald Tech", pri: "#10b981", sec: "#06281e" },
                          { name: "Midnight Red", pri: "#f43f5e", sec: "#1a0b12" },
                        ].map((p) => {
                          const isCurrent =
                            customPrimary.toLowerCase() === p.pri.toLowerCase() &&
                            customSecondary.toLowerCase() === p.sec.toLowerCase();
                          return (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                if (hasMovedPresetRef.current) return;
                                setCustomPrimary(p.pri);
                                setCustomSecondary(p.sec);
                              }}
                              className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9.5px] sm:text-[10px] cursor-pointer transition-colors ${
                                isCurrent
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                                  : "border-border bg-card hover:bg-muted text-foreground"
                              }`}
                            >
                              <span
                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: p.pri }}
                              />
                              <span className="whitespace-nowrap">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Tombol Geser Kanan */}
                      <button
                        type="button"
                        onClick={() => handleScrollPresetStep("right")}
                        disabled={!canScrollRight}
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border border-border bg-card transition-all ${
                          canScrollRight
                            ? "text-foreground hover:bg-muted cursor-pointer active:scale-95 shadow-xs"
                            : "text-muted-foreground/30 opacity-30 cursor-not-allowed border-transparent"
                        }`}
                        title="Geser preset ke kanan"
                        aria-label="Geser ke kanan"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Filter Tab Kategori Skin: Semua, Umum, Khusus */}
                <div className="flex items-center justify-between gap-2 pt-1 pb-0.5">
                  <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-xl border border-border/60">
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab("semua")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryTab === "semua"
                          ? "bg-card text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Semua</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                        {CARD_SKINS.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab("umum")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryTab === "umum"
                          ? "bg-card text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>Umum</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                        {umumCount}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCategoryTab("khusus")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeCategoryTab === "khusus"
                          ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                          : "text-amber-600/90 dark:text-amber-400 hover:text-amber-500"
                      }`}
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>Khusus</span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                          activeCategoryTab === "khusus"
                            ? "bg-slate-950/20 text-slate-950"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {khususCount}
                      </span>
                    </button>
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
                    {displayedSkinEntries.length} skin
                  </span>
                </div>
              </div>

              {/* Grid Container (HANYA BAGIAN INI YANG SCROLL - JUDUL DI ATAS TETAP KOKOH) */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-1 pb-2 px-1 -mx-1">
                {displayedSkinEntries.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs">
                    Tidak ada skin dalam kategori ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {displayedSkinEntries.map(({ skin, originalIdx: idx }) => {
                    const isSelected = selectedIdx === idx;
                    const isApplied = appliedIdx === idx;
                    const displaySkin =
                      skin.id === "custom"
                        ? createCustomSkin(customPrimary, customSecondary)
                        : skin;
                    const skinDef = getSkinDefinition(skin.id);
                    const isLocked = !isSkinUnlocked(skinDef, availableBadgeIds);

                    return (
                      <button
                        key={skin.id}
                        type="button"
                        onClick={() => setSelectedIdx(idx)}
                        className={`border-[1.5px] bg-card rounded-[14px] p-2 cursor-pointer text-left font-inherit transition-all relative ${
                          isSelected
                            ? "shadow-md scale-[1.015]"
                            : isApplied
                            ? "border-emerald-500/60 shadow-xs hover:-translate-y-0.5"
                            : isLocked
                            ? "border-amber-500/35 hover:border-amber-500/60 hover:-translate-y-0.5 opacity-90"
                            : "border-border hover:border-border/80 hover:-translate-y-0.5"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: isLocked ? "#f59e0b" : displaySkin.primaryColor,
                                boxShadow: `0 8px 18px -10px ${isLocked ? "#f59e0b" : displaySkin.primaryColor}`,
                              }
                            : undefined
                        }
                      >
                        {/* Checkmark badge */}
                        {isApplied && (
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs z-10 leading-none"
                            title="Tema sedang digunakan"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Dipakai</span>
                          </span>
                        )}

                        {/* Lock indicator pill */}
                        {isLocked && !isApplied && (
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-xs border border-amber-500/50 text-amber-300 text-[8.5px] font-bold flex items-center gap-0.5 shadow-xs z-10 leading-none"
                            title="Skin eksklusif terkunci"
                          >
                            <Lock className="w-2.5 h-2.5 stroke-[2.5]" />
                            <span>Terkunci</span>
                          </span>
                        )}

                        {/* Tag Preview */}
                        {!isApplied && !isLocked && isSelected && (
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs z-10 leading-none"
                            style={{ backgroundColor: displaySkin.primaryColor }}
                          >
                            Preview
                          </span>
                        )}

                        {/* Mini Card Preview */}
                        <div
                          className="h-[52px] sm:h-[60px] rounded-[10px] relative overflow-hidden transition-transform"
                          style={{
                            background:
                              displaySkin.headerGradient ||
                              `linear-gradient(135deg, ${displaySkin.secondaryColor}, ${displaySkin.secondaryColor}dd)`,
                          }}
                        >
                          {/* Mini Skin Type Badge */}
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-black border backdrop-blur-xs shadow-xs"
                            style={{
                              backgroundColor:
                                skin.id === "bem2026"
                                  ? "rgba(245, 158, 11, 0.35)"
                                  : `${displaySkin.primaryColor}28`,
                              borderColor:
                                skin.id === "bem2026"
                                  ? "rgba(251, 191, 36, 0.7)"
                                  : `${displaySkin.primaryColor}66`,
                              color: skin.id === "bem2026" ? "#fef08a" : "#ffffff",
                            }}
                          >
                            {skin.id === "custom"
                              ? "CUSTOM"
                              : skin.id === "bem2026"
                              ? "BEM '26"
                              : "TAZKIA"}
                          </span>

                          {/* Lock watermarked overlay if locked */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none">
                              <div className="w-6 h-6 rounded-full bg-slate-900/90 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-sm">
                                <Lock className="w-3 h-3" />
                              </div>
                            </div>
                          )}

                          {/* Bottom strip line */}
                          <div
                            className="absolute left-0 right-0 bottom-0 h-[3px]"
                            style={{
                              background:
                                skin.id === "bem2026"
                                  ? "linear-gradient(90deg, #f59e0b, #fde047, #f59e0b)"
                                  : displaySkin.primaryColor,
                            }}
                          />
                          {/* Mini avatar ring */}
                          <u
                            className="absolute left-2 -bottom-2.5 w-6 h-6 rounded-full bg-slate-900 block"
                            style={{
                              border: `2px solid ${displaySkin.primaryColor}`,
                              boxShadow: `0 0 8px ${displaySkin.primaryColor}88`,
                            }}
                          />
                        </div>

                        {/* Text */}
                        <b className="block text-[11px] font-bold text-foreground mt-1.5 truncate flex items-center gap-1">
                          <span className="truncate">{displaySkin.name}</span>
                          {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                        </b>
                        <small className="text-[9.5px] text-muted-foreground block truncate">
                          {isLocked ? "Perlu Lencana Eksklusif" : displaySkin.badge}
                        </small>
                      </button>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* ── Modal Foot ── */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border shrink-0 bg-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <i
                className="w-[8px] h-[8px] rounded-full block"
                style={{ backgroundColor: appliedSkin.primaryColor }}
              />
              <span className="text-[11.5px]">
                Skin aktif: <b>{appliedSkin.name}</b>
              </span>
            </div>

            <div className="flex-1 hidden sm:block" />

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={isSame || isCurSkinLocked}
                className={`font-bold text-xs px-4.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 ${
                  isCurSkinLocked
                    ? "opacity-60 cursor-not-allowed bg-muted text-muted-foreground border border-amber-500/30"
                    : isSame
                    ? "opacity-55 cursor-default bg-muted text-muted-foreground border border-border"
                    : "bg-[#FF8A2B] hover:bg-[#ea7920] text-white shadow-xs hover:brightness-105 active:scale-95 cursor-pointer"
                }`}
              >
                {isCurSkinLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">Skin Terkunci</span>
                  </>
                ) : isSame ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Sedang digunakan</span>
                  </>
                ) : (
                  "Terapkan tema"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
