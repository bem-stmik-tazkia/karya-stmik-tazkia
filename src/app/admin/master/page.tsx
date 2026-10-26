"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building2, Calendar, Search, X, Send, Award, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { getMahasiswaProfiles } from "@/lib/data";
import type { MahasiswaProfile } from "@/types/karya";
import { getExclusiveBadgeGrants, type ExclusiveBadgeGrant } from "@/lib/badgeService";
import {
  EXCLUSIVE_SKIN_REWARDS,
  EXCLUSIVE_BADGE_REWARDS,
} from "@/data/exclusiveRewardsCatalog";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  DEFAULT_PRODI,
  DEFAULT_ANGKATAN,
  parseAngkatan,
  type AngkatanItem,
  type DeleteItemState,
  type GrantToRevokeState,
  ProdiTab,
  AngkatanTab,
  TelegramTab,
  CardSkinTab,
  ExclusiveBadgesTab,
  DeleteConfirmModal,
  RevokeGrantModal,
} from "@/components/admin/master";

export default function AdminMasterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"prodi" | "angkatan" | "telegram" | "card_skin" | "lencana">("prodi");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [prodiList, setProdiList] = useState<string[]>(DEFAULT_PRODI);
  const [angkatanList, setAngkatanList] = useState<AngkatanItem[]>(DEFAULT_ANGKATAN);

  // Telegram Settings
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Exclusive Badges Grants State
  const [exclusiveGrants, setExclusiveGrants] = useState<ExclusiveBadgeGrant[]>([]);
  const [studentsList, setStudentsList] = useState<MahasiswaProfile[]>([]);
  const [revokeReason, setRevokeReason] = useState<string>("");
  const [grantToRevoke, setGrantToRevoke] = useState<GrantToRevokeState | null>(null);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState<DeleteItemState>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodiRes, angkatanRes, tokenRes, chatRes, grants, students] = await Promise.all([
        supabase.from("system_settings").select("value").eq("key", "master_prodi").maybeSingle(),
        supabase.from("system_settings").select("value").eq("key", "master_angkatan").maybeSingle(),
        supabase.from("system_settings").select("value").eq("key", "telegram_bot_token").maybeSingle(),
        supabase.from("system_settings").select("value").eq("key", "telegram_chat_id").maybeSingle(),
        getExclusiveBadgeGrants(),
        getMahasiswaProfiles(),
      ]);

      if (prodiRes.data?.value) {
        try {
          const parsed = JSON.parse(prodiRes.data.value);
          if (Array.isArray(parsed) && parsed.length > 0) setProdiList(parsed);
        } catch {
          /* use default */
        }
      }
      if (angkatanRes.data?.value) {
        setAngkatanList(parseAngkatan(angkatanRes.data.value));
      }
      if (tokenRes.data?.value) setTelegramToken(tokenRes.data.value);
      if (chatRes.data?.value) setTelegramChatId(chatRes.data.value);

      setExclusiveGrants(grants);
      setStudentsList(students);
    } catch (err) {
      console.error("Error fetching master page data:", err);
      toast.error("Gagal memuat data master.");
    } finally {
      setLoading(false);
    }
  };

  const refreshGrants = async () => {
    const updated = await getExclusiveBadgeGrants();
    setExclusiveGrants(updated);
  };

  const saveProdi = async (list: string[]) => {
    const { error } = await supabase
      .from("system_settings")
      .upsert({ key: "master_prodi", value: JSON.stringify(list) }, { onConflict: "key" });
    return error;
  };

  const saveAngkatan = async (list: AngkatanItem[]) => {
    const { error } = await supabase
      .from("system_settings")
      .upsert({ key: "master_angkatan", value: JSON.stringify(list) }, { onConflict: "key" });
    return error;
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan pengaturan Telegram...");

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase
        .from("system_settings")
        .upsert({ key: "telegram_bot_token", value: telegramToken.trim() }, { onConflict: "key" }),
      supabase
        .from("system_settings")
        .upsert({ key: "telegram_chat_id", value: telegramChatId.trim() }, { onConflict: "key" }),
    ]);

    if (err1 || err2) {
      toast.error(
        "Mohon maaf, pengaturan Telegram belum berhasil disimpan. Silakan coba kembali.",
        { id: toastId }
      );
    } else {
      toast.success("Pengaturan Telegram berhasil disimpan! ðŸš€", { id: toastId });
    }
    setIsSubmitting(false);
  };

  // --- PRODI HANDLERS ---
  const handleAddProdi = async (val: string) => {
    if (prodiList.some((p) => p.toLowerCase() === val.toLowerCase())) {
      toast.error(`Program studi "${val}" sudah ada dalam daftar.`);
      return;
    }
    setIsSubmitting(true);
    const updated = [...prodiList, val];
    const error = await saveProdi(updated);
    if (error) {
      toast.error("Mohon maaf, program studi belum berhasil ditambahkan.");
    } else {
      setProdiList(updated);
      toast.success(`Program studi "${val}" berhasil ditambahkan! ðŸŽ‰`);
    }
    setIsSubmitting(false);
  };

  const handleSaveEditProdi = async (oldValue: string, newVal: string) => {
    if (prodiList.some((p) => p !== oldValue && p.toLowerCase() === newVal.toLowerCase())) {
      toast.error(`Program studi "${newVal}" sudah ada dalam daftar.`);
      return;
    }
    setIsSubmitting(true);
    const updated = prodiList.map((p) => (p === oldValue ? newVal : p));
    const error = await saveProdi(updated);
    if (error) {
      toast.error("Mohon maaf, pembaruan program studi belum berhasil disimpan.");
    } else {
      setProdiList(updated);
      toast.success("Program studi berhasil diperbarui! âœ¨");
    }
    setIsSubmitting(false);
  };

  // --- ANGKATAN HANDLERS ---
  const handleAddAngkatan = async (num: string, year: string) => {
    if (angkatanList.some((a) => a.value === num)) {
      toast.error(`Angkatan ${num} sudah ada dalam daftar.`);
      return;
    }
    const composedLabel = `Angkatan ${num}${year ? ` (${year})` : ""}`;
    const newItem: AngkatanItem = { value: num, label: composedLabel };
    setIsSubmitting(true);
    const updated = [...angkatanList, newItem].sort((a, b) => Number(a.value) - Number(b.value));
    const error = await saveAngkatan(updated);
    if (error) {
      toast.error("Mohon maaf, angkatan belum berhasil ditambahkan.");
    } else {
      setAngkatanList(updated);
      toast.success(`${newItem.label} berhasil ditambahkan! ðŸŽ‰`);
    }
    setIsSubmitting(false);
  };

  const handleSaveEditAngkatan = async (oldValue: string, num: string, year: string) => {
    const newLabel = `Angkatan ${num}${year ? ` (${year})` : ""}`;
    if (num !== oldValue && angkatanList.some((a) => a.value === num)) {
      toast.error(`Angkatan ${num} sudah ada dalam daftar.`);
      return;
    }
    setIsSubmitting(true);
    const updated = angkatanList
      .map((a) => (a.value === oldValue ? { value: num, label: newLabel } : a))
      .sort((a, b) => Number(a.value) - Number(b.value));
    const error = await saveAngkatan(updated);
    if (error) {
      toast.error("Mohon maaf, pembaruan angkatan belum berhasil disimpan.");
    } else {
      setAngkatanList(updated);
      toast.success("Angkatan berhasil diperbarui! âœ¨");
    }
    setIsSubmitting(false);
  };

  // --- DELETE MODAL CONFIRMATION ---
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Sedang menghapus data...");
    let error;
    if (deleteItem.type === "prodi") {
      const updated = prodiList.filter((p) => p !== deleteItem.value);
      error = await saveProdi(updated);
      if (!error) setProdiList(updated);
    } else {
      const updated = angkatanList.filter((a) => a.value !== deleteItem.item.value);
      error = await saveAngkatan(updated);
      if (!error) setAngkatanList(updated);
    }
    if (error) {
      toast.error("Mohon maaf, data belum berhasil dihapus. Silakan coba lagi.", { id: toastId });
    } else {
      toast.success("Data berhasil dihapus dari daftar.", { id: toastId });
      setDeleteItem(null);
    }
    setIsSubmitting(false);
  };

  // --- REVOKE BADGE/CARD CONFIRMATION ---
  const handleConfirmRevoke = async () => {
    if (!grantToRevoke) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Sedang memproses penarikan...");
    const { revokeExclusiveBadgeGrant } = await import("@/lib/badgeService");
    const ok = await revokeExclusiveBadgeGrant(
      grantToRevoke.id,
      grantToRevoke.recipientId,
      grantToRevoke.badgeId,
      revokeReason.trim() || undefined
    );
    if (ok) {
      const isSkinGrant =
        grantToRevoke.badgeId === 101 ||
        grantToRevoke.badgeId === 15 ||
        (grantToRevoke.badgeName || "").toLowerCase().includes("skin");

      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "exclusive_badge_revoked",
          message: `Pemberitahuan Penarikan: "${grantToRevoke.badgeName}" ditarik dari ${
            grantToRevoke.recipientName
          }.${revokeReason.trim() ? `\nCatatan Pengelola: "${revokeReason.trim()}"` : ""}${
            isSkinGrant ? "\nHak akses Skin Kartu dinonaktifkan." : ""
          }`,
        }),
      }).catch(() => {});

      toast.success(
        isSkinGrant
          ? `Hak Skin Kartu "${grantToRevoke.badgeName}" berhasil ditarik kembali dari ${grantToRevoke.recipientName}. Kartu kembali ke Tazkia Classic.`
          : `Lencana "${grantToRevoke.badgeName}" berhasil ditarik kembali dari ${grantToRevoke.recipientName}.`,
        { id: toastId, duration: 5000 }
      );
      setGrantToRevoke(null);
      setRevokeReason("");
      await refreshGrants();
    } else {
      toast.error(
        "Mohon maaf, penarikan belum berhasil. Silakan periksa koneksi dan coba beberapa saat lagi.",
        { id: toastId }
      );
    }
    setIsSubmitting(false);
  };

  const myStudentProfile = studentsList.find(
    (s) => (user?.id && s.user_id === user.id) || (user?.email && s.email === user.email)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Data Master &amp; Penghargaan
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Kelola Program Studi, Angkatan, Integrasi Notifikasi Telegram, serta Lencana &amp; Skin Kartu BEM Eksklusif.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => {
                setActiveTab("prodi");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "prodi"
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Building2 className="w-4 h-4" /> <span>Program Studi ({prodiList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("angkatan");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "angkatan"
                  ? "bg-secondary text-secondary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Calendar className="w-4 h-4" /> <span>Angkatan ({angkatanList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("telegram");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "telegram"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Send className="w-4 h-4" /> <span>Telegram</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("card_skin");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "card_skin"
                  ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black shadow-md shadow-amber-500/20 border border-amber-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500" />{" "}
              <span>Skin Kartu Eksklusif ({EXCLUSIVE_SKIN_REWARDS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("lencana");
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === "lencana"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/20 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Award className="w-4 h-4" />{" "}
              <span>Lencana Kehormatan ({EXCLUSIVE_BADGE_REWARDS.length})</span>
            </button>
          </div>
          <div
            className={`relative flex-1 sm:max-w-xs ${
              activeTab === "telegram" || activeTab === "card_skin" || activeTab === "lencana" ? "hidden" : ""
            }`}
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari ${activeTab === "prodi" ? "jurusan..." : "angkatan..."}`}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-muted-foreground text-sm">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* ---- PRODI TAB ---- */}
          {activeTab === "prodi" && (
            <ProdiTab
              prodiList={prodiList}
              searchQuery={searchQuery}
              isSubmitting={isSubmitting}
              onAddProdi={handleAddProdi}
              onSaveEditProdi={handleSaveEditProdi}
              onDeleteClick={(prodi) => setDeleteItem({ type: "prodi", value: prodi })}
            />
          )}

          {/* ---- ANGKATAN TAB ---- */}
          {activeTab === "angkatan" && (
            <AngkatanTab
              angkatanList={angkatanList}
              searchQuery={searchQuery}
              isSubmitting={isSubmitting}
              onAddAngkatan={handleAddAngkatan}
              onSaveEditAngkatan={handleSaveEditAngkatan}
              onDeleteClick={(item) => setDeleteItem({ type: "angkatan", item })}
            />
          )}

          {/* ---- TELEGRAM TAB ---- */}
          {activeTab === "telegram" && (
            <TelegramTab
              telegramToken={telegramToken}
              telegramChatId={telegramChatId}
              setTelegramToken={setTelegramToken}
              setTelegramChatId={setTelegramChatId}
              isSubmitting={isSubmitting}
              onSave={handleSaveTelegram}
            />
          )}

          {/* ---- SKIN KARTU BEM 2026 TAB ---- */}
          {activeTab === "card_skin" && (
            <CardSkinTab
              exclusiveGrants={exclusiveGrants}
              studentsList={studentsList}
              myStudentProfile={myStudentProfile}
              isSubmitting={isSubmitting}
              onGrantSuccess={refreshGrants}
              onOpenRevokeModal={(grant) => setGrantToRevoke(grant)}
            />
          )}

          {/* ---- LENCANA KEHORMATAN TAB ---- */}
          {activeTab === "lencana" && (
            <ExclusiveBadgesTab
              exclusiveGrants={exclusiveGrants}
              studentsList={studentsList}
              myStudentProfile={myStudentProfile}
              isSubmitting={isSubmitting}
              onGrantSuccess={refreshGrants}
              onOpenRevokeModal={(grant) => setGrantToRevoke(grant)}
            />
          )}
        </>
      )}

      {/* MODAL KONFIRMASI TARIK LENCANA / CARD BEM */}
      <RevokeGrantModal
        grantToRevoke={grantToRevoke}
        revokeReason={revokeReason}
        setRevokeReason={setRevokeReason}
        isSubmitting={isSubmitting}
        onClose={() => {
          setGrantToRevoke(null);
          setRevokeReason("");
        }}
        onConfirm={handleConfirmRevoke}
      />

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        deleteItem={deleteItem}
        isSubmitting={isSubmitting}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
