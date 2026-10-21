"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, Mail, ExternalLink, Check, Palette, X, User, Crown } from "lucide-react";
import { CARD_SKINS, CardSkin, getSkinById, createCustomSkin } from "@/utils/skinConfig";
import { PENGHARGAAN_CATALOG } from "@/data/penghargaanCatalog";
import StudentCardRenderer from "@/components/mahasiswa/cards/StudentCardRenderer";
import {
  TazkiaAchievementHexBadge,
  HardHatSvg,
  PickaxeSvg,
} from "@/components/penghargaan/TazkiaAchievementBadge";
import toast from "react-hot-toast";

interface SkinPreviewModalProps {
  studentName?: string;
  prodi?: string | null;
  angkatan?: number | string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  statusBadge?: string | null;
  activeSkinId?: string;
  featuredBadgeIds?: number[];
  studentId?: string | null;
  onApplySkin?: (skinId: string) => void;
  onClose: () => void;
}

export default function SkinPreviewModal({
  studentName = "Muhammad Hafidz Alaziz",
  prodi = "STMIK Tazkia · Informatika",
  angkatan = 2026,
  avatarUrl,
  bio,
  statusBadge,
  activeSkinId = "classic",
  featuredBadgeIds: propFeaturedBadgeIds,
  studentId,
  onApplySkin,
  onClose,
}: SkinPreviewModalProps) {
  // Custom colors state for the "custom" skin option
  const [customPrimary, setCustomPrimary] = useState<string>("#38bdf8");
  const [customSecondary, setCustomSecondary] = useState<string>("#0b132b");
  const [savedPrimary, setSavedPrimary] = useState<string>("#38bdf8");
  const [savedSecondary, setSavedSecondary] = useState<string>("#0b132b");

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
        const idx = CARD_SKINS.findIndex((s) => s.id === saved);
        if (idx >= 0) return idx;
      }
    }
    const idx = CARD_SKINS.findIndex(
      (s) => s.id === activeSkinId || (activeSkinId === "default" && s.id === "classic")
    );
    return idx >= 0 ? idx : 0;
  });

  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<number[]>(() => {
    if (propFeaturedBadgeIds && propFeaturedBadgeIds.length > 0) {
      return propFeaturedBadgeIds;
    }
    return [14, 4, 9, 13, 2];
  });

  // Sync saved skin, custom colors & featured badges from props/localStorage on mount
  useEffect(() => {
    if (propFeaturedBadgeIds !== undefined && propFeaturedBadgeIds.length > 0) {
      setFeaturedBadgeIds(propFeaturedBadgeIds);
    }
  }, [propFeaturedBadgeIds]);

  useEffect(() => {
    let isMounted = true;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tazkia_profile_skin");
      if (saved && isMounted) {
        const idx = CARD_SKINS.findIndex((s) => s.id === saved);
        if (idx >= 0 && isMounted) {
          setAppliedIdx(idx);
          setSelectedIdx(idx);
        }
      }

      try {
        const savedCustom = localStorage.getItem("tazkia_custom_skin_colors");
        if (savedCustom && isMounted) {
          const parsed = JSON.parse(savedCustom);
          if (parsed.primary && parsed.secondary && isMounted) {
            setCustomPrimary(parsed.primary);
            setCustomSecondary(parsed.secondary);
            setSavedPrimary(parsed.primary);
            setSavedSecondary(parsed.secondary);
          }
        }
      } catch {
        // ignore
      }

      if (!propFeaturedBadgeIds || propFeaturedBadgeIds.length === 0) {
        try {
          const savedBadges =
            (studentId ? localStorage.getItem(`tazkia_featured_badges_${studentId}`) : null) ||
            localStorage.getItem("tazkia_featured_badges");
          if (savedBadges && isMounted) {
            const parsed = JSON.parse(savedBadges);
            if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
              setFeaturedBadgeIds(parsed.slice(0, 5));
            }
          }
        } catch {
          // ignore
        }
      }
    }
    return () => {
      isMounted = false;
    };
  }, [propFeaturedBadgeIds, studentId]);

  const rawSkin = CARD_SKINS[selectedIdx] || CARD_SKINS[0];
  const curSkin: CardSkin =
    rawSkin.id === "custom"
      ? createCustomSkin(customPrimary, customSecondary)
      : rawSkin;

  // In preview mode, dynamically feature the exclusive limited badges if previewing limited skins
  const previewBadgeIds = useMemo(() => {
    if (curSkin.id === "bem2026") {
      return [15, 14, 4, 9, 13];
    }
    if (curSkin.id === "ristekA" || curSkin.id === "ristekB") {
      return [16, 15, 14, 9, 13];
    }
    return featuredBadgeIds;
  }, [curSkin.id, featuredBadgeIds]);

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
    setAppliedIdx(selectedIdx);
    const skin = CARD_SKINS[selectedIdx];
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
        window.dispatchEvent(new CustomEvent("tazkia_profile_skin_updated", { detail: { skinId: "custom", studentId } }));
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
        window.dispatchEvent(new CustomEvent("tazkia_profile_skin_updated", { detail: { skinId: skin.id, studentId } }));
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
      {/* Outer Scrollable Overlay (using items-start with my-auto prevents flex-center clipping) */}
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
          className="relative w-full max-w-[1040px] bg-card border border-border rounded-[24px] shadow-2xl z-10 flex flex-col my-auto max-h-[94vh] overflow-hidden"
          style={
            {
              "--c1": curSkin.secondaryColor,
              "--c2": curSkin.primaryColor,
            } as React.CSSProperties
          }
        >
          {/* ── Modal Head ── */}
          <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-border shrink-0 bg-card">
            {/* Header icon stays consistent Tazkia orange (#FF8A2B) */}
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

          {/* ── Modal Body: 2 Kolom (Stage Kiri, Side Kanan) dengan Scroll Terpisah ── */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1.05fr_1fr] divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
            {/* ══════════════════════════════════════════════
                KOLOM KIRI: STAGE 3D INTERAKTIF (MODULAR PER-SKIN)
            ══════════════════════════════════════════════ */}
            <div
              className="relative px-3 sm:px-5 py-3 sm:py-4 flex flex-col items-center min-h-0 h-full overflow-y-auto transition-all duration-500"
              style={{
                background: `radial-gradient(120% 90% at 50% 0%, ${curSkin.primaryColor}22, transparent 65%), linear-gradient(180deg, ${curSkin.secondaryColor}14, var(--background))`,
              }}
            >
              <div className="w-full flex flex-col items-center py-2">
                <div className="w-full flex justify-center py-1 origin-top scale-[0.82] sm:scale-[0.88] md:scale-[0.92] transition-transform">
                  <StudentCardRenderer
                    skinId={curSkin.id}
                    data={{
                      name: studentName,
                      initials:
                        studentName
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase() || "HA",
                      angkatan: angkatan ? `ANGKATAN ${angkatan}` : "ANGKATAN 26",
                      statusIcon: curSkin.id === "ristekB" ? "⚡" : "🚀",
                      status: statusBadge || (curSkin.id === "ristekB" ? "Core Architect" : "Open for Collab"),
                      major: prodi || "STMIK Tazkia · Informatika",
                      skills:
                        curSkin.id === "bem2026"
                          ? ["Leadership", "Manajemen Organisasi"]
                          : curSkin.id === "ristekA"
                          ? ["System Builder", "Web Architect"]
                          : curSkin.id === "ristekB"
                          ? ["Cloud & Security", "Fullstack Eng"]
                          : ["UI/UX Design", "Frontend Dev"],
                      bio:
                        bio ||
                        (curSkin.id === "bem2026"
                          ? "Pengurus aktif Badan Eksekutif Mahasiswa periode 2026 dengan lencana 26 emas eksklusif."
                          : curSkin.id === "ristekA"
                          ? "Core Builder BEM x Ristek 2026. Mengembangkan fitur interaktif dan arsitektur platform Karya Tazkia."
                          : curSkin.id === "ristekB"
                          ? "Lead Architect BEM x Ristek 2026 dengan skin Mecha Sapphire Ultra dan lencana 26 neon."
                          : "Mahasiswa kreatif STMIK Tazkia yang siap berkarya & berkolaborasi."),
                      roleTitle:
                        curSkin.id === "bem2026"
                          ? "Badan Eksekutif Mahasiswa 2026"
                          : curSkin.id === "ristekA"
                          ? "Core Builder • BEM x Ristek 2026"
                          : curSkin.id === "ristekB"
                          ? "Lead Architect • BEM x Ristek 2026"
                          : "Mahasiswa Aktif STMIK Tazkia",
                      serial: `KTZ-2026-${curSkin.id.toUpperCase()}-026`,
                      avatarUrl: avatarUrl,
                    }}
                    customPrimary={customPrimary}
                    customSecondary={customSecondary}
                    enableTilt={true}
                    onContactClick={() => {
                      toast.success(`Menghubungi ${studentName} (Mode Preview)`);
                    }}
                    onProfileClick={() => {
                      toast.success("Membuka profil mahasiswa (Mode Preview)");
                    }}
                  />
                </div>

                {/* Hint */}
                <div className="text-[11px] text-muted-foreground z-10 text-center select-none pt-2 pb-1">
                  Hover kursor untuk 3D tilt · Klik tombol <strong>Balik</strong> untuk melihat ID Pass
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                KOLOM KANAN: KOLEKSI TEMA
            ══════════════════════════════════════════════ */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col min-h-0 h-full overflow-hidden">
              {/* Header: Judul, Tagline & Label Koleksi (Fixed di atas, tidak ikut scroll) */}
              <div className="shrink-0 flex flex-col gap-2 pb-2.5 bg-card">
                {/* Meta Skin Title & Tag */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                      {curSkin.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {curSkin.tagline}
                    </p>
                  </div>

                  <span
                    className="shrink-0 font-bold text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: `${curSkin.primaryColor}22`,
                      color: curSkin.primaryColor,
                    }}
                  >
                    {curSkin.badge}
                  </span>
                </div>

                {/* Interactive 2-Color Customizer (Aktif jika memilih tema Custom Warna) */}
                {curSkin.id === "custom" && (
                  <div className="pt-1 pb-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Atur 2 Warna Kartu
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Preview Langsung
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Warna 1: Aksen */}
                      <div className="bg-muted/40 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-border shadow-xs">
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
                          <span className="text-[9.5px] text-muted-foreground block font-medium leading-none mb-1">
                            Warna Aksen
                          </span>
                          <span className="text-[11px] font-mono font-bold text-foreground uppercase truncate block">
                            {customPrimary}
                          </span>
                        </div>
                      </div>

                      {/* Warna 2: Latar Header */}
                      <div className="bg-muted/40 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-border shadow-xs">
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
                          <span className="text-[9.5px] text-muted-foreground block font-medium leading-none mb-1">
                            Warna Latar
                          </span>
                          <span className="text-[11px] font-mono font-bold text-foreground uppercase truncate block">
                            {customSecondary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[10px]">
                      <span className="text-muted-foreground font-medium shrink-0">
                        Preset:
                      </span>
                      {[
                        { name: "Neon Cyber", pri: "#00ffcc", sec: "#0a192f" },
                        { name: "Sunset Gold", pri: "#f59e0b", sec: "#26170a" },
                        { name: "Purple Neon", pri: "#c084fc", sec: "#1e1035" },
                        { name: "Rose Crimson", pri: "#fb7185", sec: "#2b0d18" },
                        { name: "Electric Blue", pri: "#38bdf8", sec: "#081b2e" },
                      ].map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setCustomPrimary(p.pri);
                            setCustomSecondary(p.sec);
                          }}
                          className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-card hover:bg-muted text-[10px] cursor-pointer transition-colors"
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: p.pri }}
                          />
                          <span
                            className="w-2 h-2 rounded-full inline-block -ml-0.5"
                            style={{ backgroundColor: p.sec }}
                          />
                          <span className="text-muted-foreground font-medium">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Label Koleksi Tema */}
                <div className="font-mono font-bold text-[10.5px] tracking-widest text-muted-foreground uppercase pt-1">
                  Koleksi tema · {CARD_SKINS.length} pilihan
                </div>
              </div>

              {/* Grid Container: Bagian yang scrollable jika tema banyak dengan padding agar tidak mentok/terpotong */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-2.5 pb-4 px-2 -mx-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CARD_SKINS.map((skin, idx) => {
                    const isSelected = selectedIdx === idx;
                    const isApplied = appliedIdx === idx;
                    const displaySkin =
                      skin.id === "custom"
                        ? createCustomSkin(customPrimary, customSecondary)
                        : skin;

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
                            : "border-border hover:border-border/80 hover:-translate-y-0.5"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: displaySkin.primaryColor,
                                boxShadow: `0 8px 18px -10px ${displaySkin.primaryColor}`,
                              }
                            : {}
                        }
                      >
                        {/* Checkmark badge: Selalu nempel pada tema yang sedang aktif digunakan */}
                        {isApplied && (
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs z-10 leading-none"
                            title="Tema sedang digunakan"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Dipakai</span>
                          </span>
                        )}

                        {/* Tag Preview: Muncul saat skin lain sedang di-preview tapi belum diterapkan */}
                        {!isApplied && isSelected && (
                          <span
                            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs z-10 leading-none"
                            style={{ backgroundColor: displaySkin.primaryColor }}
                          >
                            Preview
                          </span>
                        )}

                        {/* Mini Card Preview */}
                        <div
                          className="h-[64px] rounded-[10px] relative overflow-hidden transition-transform"
                          style={{
                            background:
                              skin.id === "bem2026"
                                ? "linear-gradient(135deg, #071936 0%, #132a56 50%, #2e1f10 100%)"
                                : skin.id === "ristekA"
                                ? "linear-gradient(135deg, #020817 0%, #071e46 60%, #032e61 100%)"
                                : skin.id === "ristekB"
                                ? "linear-gradient(135deg, #020617 0%, #09255c 60%, #023e7d 100%)"
                                : `linear-gradient(135deg, ${displaySkin.secondaryColor}, ${displaySkin.secondaryColor}dd)`,
                          }}
                        >
                          {/* Pattern / Aksen Khusus Tema Eksklusif */}
                          {skin.id === "bem2026" && (
                            <>
                              <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-500/25 rounded-full blur-xs pointer-events-none" />
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/40 font-mono shadow-xs">
                                '26
                              </span>
                            </>
                          )}
                          {skin.id === "ristekA" && (
                            <>
                              <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#00f0ff]/25 rounded-full blur-xs pointer-events-none" />
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-black bg-cyan-500/30 text-[#00f0ff] border border-cyan-400/50 shadow-xs">
                                RSTK
                              </span>
                            </>
                          )}
                          {skin.id === "ristekB" && (
                            <>
                              <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-500/30 rounded-full blur-xs pointer-events-none" />
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-black bg-sky-500/30 text-sky-200 border border-sky-400/50 shadow-xs">
                                MECHA
                              </span>
                            </>
                          )}
                          {skin.id === "custom" && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-bold bg-white/15 text-white border border-white/20">
                              CUSTOM
                            </span>
                          )}

                          {/* Bottom strip line */}
                          <div
                            className="absolute left-0 right-0 bottom-0 h-[3px]"
                            style={{
                              background:
                                skin.id === "bem2026"
                                  ? "linear-gradient(90deg, #f59e0b, #f97316)"
                                  : skin.id === "ristekA"
                                  ? "linear-gradient(90deg, #00f0ff, #3b82f6, #f97316)"
                                  : skin.id === "ristekB"
                                  ? "linear-gradient(90deg, #38bdf8, #00f0ff, #f97316)"
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
                        <b className="block text-[11px] font-bold text-foreground mt-1.5 truncate">
                          {displaySkin.name}
                        </b>
                        <small className="text-[9.5px] text-muted-foreground block truncate">
                          {displaySkin.badge}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Modal Foot ── */}
          <div className="flex items-center gap-2.5 px-5 sm:px-6 py-3 border-t border-border shrink-0 bg-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <i
                className="w-[8px] h-[8px] rounded-full block"
                style={{ backgroundColor: appliedSkin.primaryColor }}
              />
              <span className="text-[11.5px]">
                Skin aktif: <b>{appliedSkin.name}</b>
              </span>
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={onClose}
              className="border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Tutup
            </button>

            {/* Tombol Terapkan Tema: Selalu konsisten menggunakan warna oranye Tazkia (#FF8A2B), tidak berubah warna mengikuti preview skin */}
            <button
              type="button"
              onClick={handleApply}
              disabled={isSame}
              className={`font-bold text-xs px-4.5 py-2 rounded-xl cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                isSame
                  ? "opacity-55 cursor-default bg-muted text-muted-foreground border border-border"
                  : "bg-[#FF8A2B] hover:bg-[#ea7920] text-white shadow-xs hover:brightness-105 active:scale-95"
              }`}
            >
              {isSame ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sedang digunakan</span>
                </>
              ) : (
                "Terapkan tema"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
