"use client";

import React, { useState } from "react";
import {
  Award,
  Send,
  Search,
  Check,
  Info,
  UserCheck,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import type { MahasiswaProfile } from "@/types/karya";
import {
  grantExclusiveBadgeBatch,
  type ExclusiveBadgeGrant,
} from "@/lib/badgeService";
import {
  EXCLUSIVE_BADGE_REWARDS,
  getExclusiveRewardById,
  getBadgeForReward,
  type ExclusiveRewardItem,
} from "@/data/exclusiveRewardsCatalog";
import { BadgePreview } from "@/components/penghargaan";
import type { GrantToRevokeState } from "./types";
import { ExclusiveBadgesTable } from "./ExclusiveBadgesTable";

interface ExclusiveBadgesTabProps {
  exclusiveGrants: ExclusiveBadgeGrant[];
  studentsList: MahasiswaProfile[];
  myStudentProfile?: MahasiswaProfile | null;
  isSubmitting: boolean;
  onGrantSuccess: () => Promise<void>;
  onOpenRevokeModal: (grant: GrantToRevokeState) => void;
}

export default function ExclusiveBadgesTab({
  exclusiveGrants,
  studentsList,
  myStudentProfile,
  isSubmitting,
  onGrantSuccess,
  onOpenRevokeModal,
}: ExclusiveBadgesTabProps) {
  const [selectedRewardId, setSelectedRewardId] = useState<string>(
    EXCLUSIVE_BADGE_REWARDS[0]?.id || "reward_bem_badge"
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [grantNote, setGrantNote] = useState<string>("");
  const [studentFilter, setStudentFilter] = useState<string>("");

  const badgeGrants = exclusiveGrants.filter(
    (g) => g.badgeId !== 101 && !(g.badgeName || "").toLowerCase().includes("skin")
  );

  const selectedReward: ExclusiveRewardItem =
    getExclusiveRewardById(selectedRewardId) || EXCLUSIVE_BADGE_REWARDS[0];

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

  const handleGrantBadge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedStudentIds.length === 0) {
      toast.error("Silakan pilih minimal satu mahasiswa penerima lencana terlebih dahulu.");
      return;
    }

    const toastId = toast.loading(
      selectedStudentIds.length === 1
        ? `Menganugerahkan ${selectedReward.name}...`
        : `Menganugerahkan ${selectedReward.name} ke ${selectedStudentIds.length} mahasiswa...`
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
      // Kirim notifikasi ke Telegram bot
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exclusive_badge_granted",
          rewardName: selectedReward.name,
          category: "Lencana Kehormatan Kampus",
          recipientName:
            selectedStudentIds.length === 1
              ? studentsList.find(
                  (s) =>
                    s.id === selectedStudentIds[0] ||
                    s.user_id === selectedStudentIds[0]
                )?.full_name || "Mahasiswa"
              : `${selectedStudentIds.length} Mahasiswa`,
          recipientIds: selectedStudentIds,
          badgeId: selectedReward.badgeId,
          note: grantNote.trim() || undefined,
        }),
      }).catch(() => {});

      toast.success(
        selectedStudentIds.length === 1
          ? `Lencana "${selectedReward.name}" berhasil dianugerahkan!`
          : `Lencana "${selectedReward.name}" berhasil dianugerahkan ke ${selectedStudentIds.length} mahasiswa!`,
        { id: toastId }
      );
      setSelectedStudentIds([]);
      setGrantNote("");
      await onGrantSuccess();
    } else {
      toast.error(res.error || "Gagal menganugerahkan lencana.", { id: toastId });
    }
  };

  const activeBadgeForPreview = getBadgeForReward(selectedReward);

  return (
    <div className="space-y-6">
      {/* Top Grid: Form Grant & Live 3D Hexagon Medallion Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Pemberian Lencana */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="mb-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold shadow-xs">
                <Award className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Pemberian Lencana Kehormatan (Badge Heksagon)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Penganugerahan medali kehormatan resmi institusi yang disematkan langsung di rak profil mahasiswa.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGrantBadge} className="space-y-5">
            {/* LANGKAH 1: Pilih Lencana Kehormatan (Kotak Compact) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">
                    1
                  </span>
                  <span>Pilih Lencana Kehormatan:</span>
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {EXCLUSIVE_BADGE_REWARDS.length} lencana tersedia
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {EXCLUSIVE_BADGE_REWARDS.map((item) => {
                  const isSelected = selectedRewardId === item.id;
                  const badgeData = getBadgeForReward(item);

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelectedRewardId(item.id);
                        setSelectedStudentIds([]);
                      }}
                      className={`group p-3 rounded-2xl border-2 text-center cursor-pointer transition-all bg-card flex flex-col items-center justify-between relative overflow-hidden ${
                        isSelected
                          ? "shadow-md scale-[1.02]"
                          : "border-border hover:border-border/80 hover:-translate-y-0.5"
                      }`}
                      style={
                        isSelected
                          ? {
                              borderColor: item.accentColor,
                              boxShadow: `0 6px 20px -6px ${item.accentColor}80`,
                            }
                          : undefined
                      }
                    >
                      {/* Selected Pill on Top-Right */}
                      {isSelected && (
                        <span
                          className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8.5px] font-black text-white flex items-center gap-0.5 shadow-2xs z-10 animate-in fade-in duration-200"
                          style={{ backgroundColor: item.accentColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Pilihan</span>
                        </span>
                      )}

                      {/* Mini Hexagon Medallion Stage (Tanpa kotak artifisial) */}
                      <div className="w-full py-2.5 flex items-center justify-center">
                        <div className="pointer-events-none scale-110 sm:scale-120">
                          <BadgePreview
                            badge={badgeData}
                            size="sm"
                            animated={true}
                            shimmer={true}
                            showTooltip={false}
                          />
                        </div>
                      </div>

                      {/* Nama Lencana & Tier */}
                      <div className="w-full mt-0.5 text-center px-1">
                        <div className="font-bold text-xs sm:text-[13px] text-foreground truncate leading-snug">
                          {item.name.replace("Lencana ", "")}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5 font-medium">
                          #{item.badgeId} · {item.tierLabel}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LANGKAH 2: Pilih Mahasiswa Penerima */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Pilih Mahasiswa Calon Penerima Lencana:</span>
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
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs outline-none focus:border-primary transition-all shadow-2xs"
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
                    const existingGrant = badgeGrants.find(
                      (g) =>
                        (g.recipientId === s.id || (s.user_id && g.recipientId === s.user_id)) &&
                        g.badgeId === selectedReward.badgeId
                    );
                    const isClaimed = !!(
                      existingGrant &&
                      ((s.id && existingGrant.claimedBy?.includes(s.id)) ||
                        (s.user_id && existingGrant.claimedBy?.includes(s.user_id)))
                    );
                    const isPending = !!(existingGrant && !isClaimed);

                    return (
                      <div
                        key={studentId}
                        onClick={() => {
                          if (existingGrant) {
                            toast.error(
                              isClaimed
                                ? `${s.full_name} sudah memiliki lencana ini.`
                                : `${s.full_name} sudah diberikan lencana ini (menunggu dibuka).`
                            );
                            return;
                          }
                          toggleSelectStudent(studentId);
                        }}
                        className={`flex items-center justify-between p-2.5 text-xs transition-colors ${
                          existingGrant
                            ? "opacity-80 cursor-default bg-muted/20"
                            : isSelected
                            ? "bg-primary/10 dark:bg-primary/15 cursor-pointer"
                            : "hover:bg-muted/50 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              existingGrant
                                ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                                : isSelected
                                ? "bg-primary border-primary text-white font-bold"
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

                        {isClaimed && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Sudah Memiliki Lencana</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Menunggu Klaim</span>
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* LANGKAH 3: Catatan / Alasan Admin */}
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-black">
                  3
                </span>
                <span>Pesan Apresiasi / Alasan Pemberian:</span>
              </label>
              <input
                type="text"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                placeholder={selectedReward.notePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
              />
            </div>

            {/* Hak Istimewa Box */}
            {selectedReward.privilegeDetails && (
              <div className="p-3.5 rounded-xl border border-primary/25 bg-primary/10 text-foreground text-xs space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-primary">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Hak Istimewa Penerima Lencana Ini:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11.5px] pl-1 text-muted-foreground">
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
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-white hover:bg-[#ea580c] font-black text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Sedang Memproses Lencana..."
                  : selectedStudentIds.length === 0
                  ? "Pilih Minimal 1 Mahasiswa Calon Penerima"
                  : selectedStudentIds.length === 1
                  ? `Anugerahkan ${selectedReward.name} ke 1 Mahasiswa`
                  : `Anugerahkan ${selectedReward.name} ke ${selectedStudentIds.length} Mahasiswa Terpilih`}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Dynamic 3D Hexagon Medallion Preview */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                Pratinjau Medali 3D
              </h3>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0"
                style={{
                  backgroundColor: `${selectedReward.accentColor}18`,
                  borderColor: `${selectedReward.accentColor}40`,
                  color: selectedReward.accentColor,
                }}
              >
                Lencana Kehormatan
              </span>
            </div>

            <div
              className="relative rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center space-y-3.5 border transition-all"
              style={{
                borderColor: `${selectedReward.accentColor}40`,
                background: `radial-gradient(circle at 50% 30%, ${selectedReward.accentColor}20, transparent 75%), linear-gradient(180deg, ${selectedReward.accentColor}08, transparent)`,
              }}
            >
              <div className="py-2 flex items-center justify-center">
                <BadgePreview
                  badge={activeBadgeForPreview}
                  size="lg"
                  animated={true}
                  shimmer={true}
                  showTooltip={false}
                  className="scale-90 sm:scale-100"
                />
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-foreground">
                  {selectedReward.name}
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  {selectedReward.description}
                </p>
              </div>

              <div className="w-full p-3 rounded-xl bg-card/90 border border-border text-xs space-y-1.5 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Status Pilihan:</span>
                  <span className="font-bold text-foreground">
                    {selectedStudentIds.length === 0
                      ? "Belum ada mahasiswa dipilih"
                      : `${selectedStudentIds.length} Mahasiswa Terpilih`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Kode Lencana:</span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: selectedReward.accentColor }}
                  >
                    #{selectedReward.badgeId} ({selectedReward.badgeCode})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Tampilan Medali Heksagon 3D:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Arahkan kursor ke lencana di atas untuk melihat pantulan kilau metallic heksagon yang akan terpasang di rak profil mahasiswa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Riwayat Lencana Kehormatan yang Diberikan */}
      <ExclusiveBadgesTable
        badgeGrants={badgeGrants}
        isSubmitting={isSubmitting}
        onOpenRevokeModal={onOpenRevokeModal}
      />
    </div>
  );
}

