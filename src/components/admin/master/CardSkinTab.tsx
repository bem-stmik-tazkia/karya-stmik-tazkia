"use client";

import React, { useState } from "react";
import {
  Crown,
  Award,
  Search,
  Check,
  Info,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import type { MahasiswaProfile } from "@/types/karya";
import {
  grantExclusiveBadgeBatch,
  type ExclusiveBadgeGrant,
} from "@/lib/badgeService";
import {
  EXCLUSIVE_SKIN_REWARDS,
  getExclusiveRewardById,
  type ExclusiveRewardItem,
} from "@/data/exclusiveRewardsCatalog";
import { CardSkinPreview, getSkinDefinition } from "@/components/cards";
import type { GrantToRevokeState } from "./types";
import { CardSkinTable } from "./CardSkinTable";

interface CardSkinTabProps {
  exclusiveGrants: ExclusiveBadgeGrant[];
  studentsList: MahasiswaProfile[];
  myStudentProfile?: MahasiswaProfile | null;
  isSubmitting: boolean;
  onGrantSuccess: () => Promise<void>;
  onOpenRevokeModal: (grant: GrantToRevokeState) => void;
}

export default function CardSkinTab({
  exclusiveGrants,
  studentsList,
  myStudentProfile,
  isSubmitting,
  onGrantSuccess,
  onOpenRevokeModal,
}: CardSkinTabProps) {
  const [selectedRewardId, setSelectedRewardId] = useState<string>(
    EXCLUSIVE_SKIN_REWARDS[0]?.id || "reward_bem_2026"
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [grantNote, setGrantNote] = useState<string>("");
  const [studentFilter, setStudentFilter] = useState<string>("");

  const selectedReward: ExclusiveRewardItem =
    getExclusiveRewardById(selectedRewardId) || EXCLUSIVE_SKIN_REWARDS[0];

  const skinBadgeIds = EXCLUSIVE_SKIN_REWARDS.map((r) => r.badgeId);
  const skinGrants = exclusiveGrants.filter(
    (g) =>
      skinBadgeIds.includes(g.badgeId) ||
      (g.badgeName || "").toLowerCase().includes("skin")
  );

  const filteredStudents = studentsList.filter((s) => {
    if (!studentFilter.trim()) return true;
    const q = studentFilter.toLowerCase();
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.prodi && s.prodi.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredStudents.map((s) => s.id || s.user_id || "").filter(Boolean);
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleClearAllSelected = () => {
    setSelectedStudentIds([]);
  };

  const handleSelectMe = () => {
    if (!myStudentProfile) {
      toast.error("Profil mahasiswa Anda tidak ditemukan.");
      return;
    }
    const myId = myStudentProfile.id || myStudentProfile.user_id;
    if (!myId) return;

    if (!selectedStudentIds.includes(myId)) {
      setSelectedStudentIds((prev) => [...prev, myId]);
      toast.success("Akun profil Anda berhasil dipilih!");
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== myId));
    }
  };

  const handleGrantSkin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedStudentIds.length === 0) {
      toast.error("Silakan pilih minimal satu mahasiswa calon penerima skin terlebih dahulu.");
      return;
    }

    const toastId = toast.loading(
      selectedStudentIds.length === 1
        ? `Memberikan hak akses ${selectedReward.name}...`
        : `Memberikan hak akses ${selectedReward.name} ke ${selectedStudentIds.length} mahasiswa terpilih...`
    );

    const grantsPayload = selectedStudentIds.map((targetId) => {
      const s = studentsList.find((m) => m.id === targetId || m.user_id === targetId);
      const recipientUserId = s?.user_id || s?.id || targetId;
      return {
        recipientId: recipientUserId,
        recipientName: s?.full_name || "Mahasiswa",
        recipientEmail: s?.email || "",
        badgeId: selectedReward.badgeId,
        badgeName: selectedReward.name,
        note: grantNote.trim() || selectedReward.notePlaceholder,
      };
    });

    const res = await grantExclusiveBadgeBatch(grantsPayload);

    if (res.success) {
      toast.success(
        selectedStudentIds.length === 1
          ? `Hak akses ${selectedReward.name} berhasil diberikan!`
          : `Hak akses ${selectedReward.name} berhasil diberikan ke ${selectedStudentIds.length} mahasiswa!`,
        { id: toastId }
      );
      setSelectedStudentIds([]);
      setGrantNote("");
      await onGrantSuccess();
    } else {
      toast.error(res.error || "Gagal memberikan hak akses skin kartu.", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Form Grant & Live 3D Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Pemberian Akses Skin */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="mb-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <Crown className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Pemberian Hak Akses Skin Kartu 3D
                </h3>
                <p className="text-xs text-muted-foreground">
                  Distribusi tema Skin Kartu 3D eksklusif kampus untuk fungsionaris &amp; talenta berprestasi.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGrantSkin} className="space-y-5">
            {/* Step 1: Pemilihan Tema Skin Kartu (Mini Card Preview Thumbnail) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Pilih Tema Skin Kartu 3D:</span>
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {EXCLUSIVE_SKIN_REWARDS.length} skin tersedia
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {EXCLUSIVE_SKIN_REWARDS.map((skinReward) => {
                  const isSelected = skinReward.id === selectedReward.id;
                  const skinDef = getSkinDefinition(skinReward.skinId);

                  return (
                    <button
                      type="button"
                      key={skinReward.id}
                      onClick={() => {
                        setSelectedRewardId(skinReward.id);
                        setSelectedStudentIds([]);
                      }}
                      className={`group p-2.5 rounded-[14px] border-2 text-left cursor-pointer transition-all bg-card ${
                        isSelected
                          ? "shadow-md scale-[1.01]"
                          : "border-border hover:border-border/80 hover:-translate-y-0.5"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: skinDef.primaryColor,
                              boxShadow: `0 8px 20px -8px ${skinDef.primaryColor}88`,
                            }
                          : undefined
                      }
                    >
                      {/* Mini Card Preview (Persis seperti modal tema mahasiswa) */}
                      <div
                        className="h-[54px] sm:h-[60px] rounded-[10px] relative overflow-hidden"
                        style={{
                          background:
                            skinDef.headerGradient ||
                            `linear-gradient(135deg, ${skinDef.secondaryColor}, ${skinDef.secondaryColor}dd)`,
                        }}
                      >
                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <span
                            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-slate-950 flex items-center gap-0.5 shadow-xs z-10"
                            style={{ backgroundColor: skinDef.primaryColor }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Pilihan</span>
                          </span>
                        )}

                        {/* Top-Right Mini Badge */}
                        <span
                          className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded text-[7.5px] font-mono font-black border backdrop-blur-xs"
                          style={{
                            backgroundColor: `${skinDef.primaryColor}30`,
                            borderColor: `${skinDef.primaryColor}70`,
                            color: "#ffffff",
                          }}
                        >
                          {skinDef.badge || skinReward.tierLabel}
                        </span>

                        {/* Bottom Accent Strip Line */}
                        <div
                          className="absolute left-0 right-0 bottom-0 h-[3px]"
                          style={{
                            background: skinDef.primaryColor,
                            boxShadow: `0 0 6px ${skinDef.primaryColor}`,
                          }}
                        />

                        {/* Mini Avatar Ring */}
                        <div
                          className="absolute left-2.5 -bottom-2 w-5 h-5 rounded-full bg-slate-900 border-2"
                          style={{
                            borderColor: skinDef.primaryColor,
                            boxShadow: `0 0 8px ${skinDef.primaryColor}88`,
                          }}
                        />
                      </div>

                      {/* Text & Tagline */}
                      <div className="mt-2 px-0.5">
                        <div className="font-bold text-xs text-foreground truncate">
                          {skinDef.name || skinReward.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {skinDef.tagline || skinReward.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Pemilihan Mahasiswa */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Pilih Mahasiswa Calon Penerima Skin:</span>
                  <span className="font-normal text-muted-foreground ml-1">
                    ({selectedStudentIds.length} dipilih)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  {myStudentProfile && (
                    <button
                      type="button"
                      onClick={handleSelectMe}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>
                        {selectedStudentIds.includes(
                          myStudentProfile.id || myStudentProfile.user_id || ""
                        )
                          ? "Batal Pilih Saya"
                          : "Pilih Saya Sendiri"}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-2 py-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Pilih Semua ({filteredStudents.length})
                  </button>
                  {selectedStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllSelected}
                      className="px-2 py-1 text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                    >
                      Batal Pilih
                    </button>
                  )}
                </div>
              </div>

              {/* Search Filter Student */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  placeholder="Cari nama, prodi, atau email mahasiswa..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs outline-none focus:border-amber-500 transition-all shadow-2xs"
                />
              </div>

              {/* Student Scrollable List */}
              <div className="max-h-56 overflow-y-auto rounded-xl border border-border divide-y divide-border bg-background/50">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Tidak ada mahasiswa yang cocok dengan pencarian.
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const studentId = s.id || s.user_id || "";
                    const isSelected = selectedStudentIds.includes(studentId);
                    const isMe =
                      myStudentProfile &&
                      (s.id === myStudentProfile.id || s.user_id === myStudentProfile.user_id);
                    const hasSelectedSkin = skinGrants.some(
                      (g) =>
                        (g.recipientId === s.id || g.recipientId === s.user_id) &&
                        g.badgeId === selectedReward.badgeId
                    );

                    return (
                      <div
                        key={studentId}
                        onClick={() => toggleSelectStudent(studentId)}
                        className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-amber-500/10 dark:bg-amber-500/15"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                                : "border-muted-foreground/40 bg-background"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                              <span className="truncate">{s.full_name}</span>
                              {isMe && (
                                <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[9.5px] font-bold">
                                  Akun Saya
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-muted-foreground font-mono truncate">
                              {s.prodi || "STMIK Tazkia"}
                              {s.angkatan ? ` · Angkatan ${s.angkatan}` : ""}
                            </div>
                          </div>
                        </div>

                        {hasSelectedSkin && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-400/40 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>Sudah Memiliki Skin Ini</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Step 3: Catatan / Amanah */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-black">
                  3
                </span>
                <span>Amanah Kepengurusan / Catatan Admin:</span>
              </label>
              <input
                type="text"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder={selectedReward.notePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-2xs"
              />
            </div>

            {/* Ringkasan Hak Istimewa */}
            {selectedReward.privilegeDetails && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Hak Istimewa yang Otomatis Didapat Mahasiswa:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11.5px] pl-1">
                  {selectedReward.privilegeDetails.map((privilege, idx) => (
                    <li key={idx}>{privilege}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={selectedStudentIds.length === 0 || isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm hover:brightness-105 transition-all shadow-lg shadow-amber-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Sedang Memproses Hak Akses..."
                  : selectedStudentIds.length === 0
                  ? `Pilih Minimal 1 Mahasiswa Calon Penerima ${selectedReward.name}`
                  : selectedStudentIds.length === 1
                  ? `Berikan Hak ${selectedReward.name} ke 1 Mahasiswa`
                  : `Berikan Hak ${selectedReward.name} ke ${selectedStudentIds.length} Mahasiswa Terpilih`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Interactive 3D Skin Preview (KOSONGAN / TEMPLATE MURNI) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span>Pratinjau {selectedReward.name}</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
                Skin Kartu 3D
              </span>
            </div>

            {/* Interactive Card Render Container without zoom breaking 3D transform */}
            <div className="relative border border-amber-500/30 rounded-2xl p-4 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent flex flex-col items-center">
              <div className="w-full flex justify-center py-2">
                <div className="w-[338px] max-w-full mx-auto flex justify-center">
                  <CardSkinPreview
                    skinId={selectedReward.skinId || "bem2026"}
                    enableTilt={true}
                  />
                </div>
              </div>

              {/* Status Pemilihan Calon Penerima */}
              <div className="w-full mt-3 p-3 rounded-xl bg-card/90 border border-amber-500/20 text-xs space-y-1 relative z-10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Status Pilihan:</span>
                  <span className="font-bold text-foreground">
                    {selectedStudentIds.length === 0
                      ? "Belum ada mahasiswa dipilih"
                      : `${selectedStudentIds.length} Mahasiswa Terpilih`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Edisi Tema:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {selectedReward.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Pratinjau Desain Murni (Template Kosongan):</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Tampilan di atas sengaja dibuat kosongan sebagai pratinjau murni tata letak Skin Kartu 3D.
                Arahkan kursor untuk 3D tilt atau klik kartu untuk membalik ke Lemari Penghargaan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabel Mahasiswa Pemegang Skin Kartu */}
      <CardSkinTable
        skinGrants={skinGrants}
        isSubmitting={isSubmitting}
        onOpenRevokeModal={onOpenRevokeModal}
      />
    </div>
  );
}
