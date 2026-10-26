"use client";

import React, { useState, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiTrash2, FiEye, FiXCircle, FiFileText, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";

interface AdminReviewActionsProps {
  karyaId: string;
  currentStatus: string;
  aiStatus?: string;
  karyaObj?: any; // Seluruh data karya untuk modal detail
}

export function AdminReviewActions({ karyaId, currentStatus, karyaObj }: AdminReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  
  // State untuk mengontrol visibilitas masing-masing konfirmasi
  const [activeConfirm, setActiveConfirm] = useState<"approve" | "reject" | "delete" | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleApprove = () => {
    startTransition(async () => {
      let updatePayload: any = {
        status: "approved",
        reject_reason: null,
        ai_review_status: "reviewed",
        ai_review_reason: "Disetujui manual oleh admin.",
        ai_reviewed_at: new Date().toISOString(),
      };

      if (karyaObj?.pending_edits) {
        if (karyaObj.pending_edits.type === "delete") {
          const { error: deleteError } = await supabase.from("karya").delete().eq("id", karyaId);
          if (deleteError) {
            toast.error("Mohon maaf, pengajuan penghapusan belum berhasil disetujui. Silakan coba kembali.");
            return;
          }
          await supabase.from("notifications").insert({
            user_id: karyaObj.user_id,
            title: "[HAPUS] Penghapusan Karya Disetujui",
            message: `Pengajuan hapus untuk karya "${karyaObj.title}" telah disetujui.`,
            karya_id: karyaId,
            type: "success"
          });
          toast.success("Pengajuan hapus disetujui, karya telah dihapus.");
          setActiveConfirm(null);
          router.refresh();
          return;
        }

        updatePayload = {
          ...updatePayload,
          ...karyaObj.pending_edits,
          pending_edits: null,
        };
      }

      const { error } = await supabase
        .from("karya")
        .update(updatePayload)
        .eq("id", karyaId);

      if (error) {
        toast.error("Mohon maaf, persetujuan karya belum berhasil diproses. Silakan coba kembali.");
      } else {
        if (karyaObj?.pending_edits) {
          await supabase.from("notifications").insert({
            user_id: karyaObj.user_id,
            title: "[EDIT] Perubahan Karya Disetujui",
            message: `Edit untuk karya "${karyaObj.title}" telah disetujui dan diperbarui.`,
            karya_id: karyaId,
            type: "success"
          });
        }
        
        toast.success(karyaObj?.pending_edits ? "Perubahan berhasil disetujui!" : "Karya berhasil disetujui dan dipublikasikan!");
        
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "info",
            message: karyaObj?.pending_edits 
              ? `[EDIT] ✅ Admin telah menyetujui edit untuk karya:\n📌 <b>${karyaObj?.title || 'Unknown'}</b>` 
              : `[BARU] ✅ Admin telah menyetujui karya baru:\n📌 <b>${karyaObj?.title || 'Unknown'}</b>`
          })
        }).catch(() => {});

        setActiveConfirm(null);
        router.refresh();
      }
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Harap isi alasan penolakan terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      let updatePayload: any = {
        status: "rejected",
        reject_reason: rejectReason.trim(),
        ai_review_status: "reviewed",
        ai_review_reason: rejectReason.trim(),
        ai_reviewed_at: new Date().toISOString(),
      };

      if (karyaObj?.pending_edits) {
        updatePayload = {
          status: "approved",
          reject_reason: null,
          pending_edits: null,
          ai_review_status: "reviewed",
          ai_review_reason: "Edit ditolak: " + rejectReason.trim(),
          ai_reviewed_at: new Date().toISOString(),
        };
      }

      const { error } = await supabase
        .from("karya")
        .update(updatePayload)
        .eq("id", karyaId);

      if (error) {
        toast.error("Mohon maaf, penolakan karya belum berhasil diproses. Silakan coba kembali.");
      } else {
        if (karyaObj?.pending_edits) {
          const isDeleteReq = karyaObj.pending_edits.type === "delete";
          await supabase.from("notifications").insert({
            user_id: karyaObj.user_id,
            title: isDeleteReq ? "[HAPUS] Pengajuan Hapus Ditolak" : "[EDIT] Perubahan Karya Ditolak",
            message: isDeleteReq 
              ? `Pengajuan hapus untuk karya "${karyaObj.title}" ditolak oleh admin. Alasan: ${rejectReason.trim()}`
              : `Edit untuk karya "${karyaObj.title}" ditolak oleh admin. Alasan: ${rejectReason.trim()}`,
            karya_id: karyaId,
            type: "error"
          });
        }
        toast.success(karyaObj?.pending_edits ? (karyaObj.pending_edits.type === "delete" ? "Pengajuan hapus ditolak." : "Perubahan ditolak.") : "Karya telah ditolak.");
        
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "error",
            message: karyaObj?.pending_edits 
              ? `[EDIT] ❌ Admin telah menolak edit untuk karya:\n📌 <b>${karyaObj?.title || 'Unknown'}</b>\n💬 Alasan: ${rejectReason.trim()}` 
              : `[BARU] ❌ Admin telah menolak karya baru:\n📌 <b>${karyaObj?.title || 'Unknown'}</b>\n💬 Alasan: ${rejectReason.trim()}`
          })
        }).catch(() => {});

        setActiveConfirm(null);
        setRejectReason("");
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const { error } = await supabase
        .from("karya")
        .delete()
        .eq("id", karyaId);

      if (error) {
        toast.error("Mohon maaf, karya belum berhasil dihapus. Silakan coba kembali.");
      } else {
        toast.success("Karya berhasil dihapus permanen.");

        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "error",
            message: `[HAPUS] 🗑️ Admin telah menghapus permanen karya:\n📌 <b>${karyaObj?.title || 'Unknown'}</b>`
          })
        }).catch(() => {});

        setActiveConfirm(null);
        router.refresh();
      }
    });
  };

  const toggleConfirm = (tab: "approve" | "reject" | "delete") => {
    setActiveConfirm(activeConfirm === tab ? null : tab);
  };

  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      <div className="flex items-center gap-1.5 justify-center">
        {/* Tombol Lihat Detail */}
        {karyaObj && (
          <button
            onClick={() => setShowDetailModal(true)}
            title="Lihat Detail Karya"
            aria-label="Lihat Detail Karya"
            className="w-8 h-8 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-xs flex items-center justify-center cursor-pointer"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Tombol Setujui */}
        <button
          onClick={() => toggleConfirm("approve")}
          disabled={isPending || currentStatus === "approved"}
          title={currentStatus === "approved" ? "Sudah disetujui" : "Setujui Publikasi"}
          aria-label="Setujui Karya"
          className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiCheck className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Tolak */}
        <button
          onClick={() => toggleConfirm("reject")}
          disabled={isPending || currentStatus === "rejected"}
          title={currentStatus === "rejected" ? "Sudah ditolak" : "Tolak Karya"}
          aria-label="Tolak Karya"
          className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Hapus Permanen */}
        <button
          onClick={() => toggleConfirm("delete")}
          disabled={isPending}
          title="Hapus Permanen"
          aria-label="Hapus Permanen"
          className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* --- PANEL KONFIRMASI INLINE RAMAH PENGGUNA --- */}
      {/* 1. Konfirmasi Setujui */}
      {activeConfirm === "approve" && (
        <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mt-1">
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 leading-tight text-center">
            Setujui dan tayangkan karya ini ke publik?
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={() => setActiveConfirm(null)}
              className="flex-1 text-[11px] font-medium text-muted-foreground bg-card hover:bg-muted border border-border rounded-lg py-1 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="flex-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg py-1 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPending ? "Proses..." : "Ya, Setujui"}
            </button>
          </div>
        </div>
      )}

      {/* 2. Konfirmasi Tolak (Input alasan) */}
      {activeConfirm === "reject" && (
        <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 mt-1">
          <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 leading-tight">
            Berikan alasan penolakan:
          </p>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Contoh: Lampiran link demo belum dapat dibuka..."
            className="text-[11px] border border-border rounded-lg px-2 py-1.5 bg-background text-foreground font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            onKeyDown={(e) => e.key === "Enter" && handleReject()}
          />
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={() => { setActiveConfirm(null); setRejectReason(""); }}
              className="flex-1 text-[11px] font-medium text-muted-foreground bg-card hover:bg-muted border border-border rounded-lg py-1 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleReject}
              disabled={isPending}
              className="flex-1 text-[11px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg py-1 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPending ? "Proses..." : "Kirim Penolakan"}
            </button>
          </div>
        </div>
      )}

      {/* 3. Konfirmasi Hapus */}
      {activeConfirm === "delete" && (
        <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 mt-1">
          <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 leading-tight text-center">
            Yakin ingin menghapus permanen karya ini?
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={() => setActiveConfirm(null)}
              className="flex-1 text-[11px] font-medium text-muted-foreground bg-card hover:bg-muted border border-border rounded-lg py-1 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg py-1 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPending ? "Hapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL KARYA (FRIENDLY & CLEAN) --- */}
      {showDetailModal && karyaObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border shadow-xl p-6 sm:p-7 relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 p-2 bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <FiXCircle size={20} />
            </button>
            
            <div className="pr-10 mb-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Detail Pengajuan Karya
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground mt-0.5">
                {karyaObj.title}
              </h2>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold">
                {karyaObj.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                karyaObj.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                karyaObj.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {karyaObj.status === 'approved' ? 'Status: Publik' : karyaObj.status === 'rejected' ? 'Status: Ditolak' : 'Status: Menunggu Kurasi'}
              </span>
            </div>
            
            {karyaObj.pending_edits && (
              <div className={`mb-6 p-4 rounded-2xl border ${karyaObj.pending_edits.type === "delete" ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300" : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"}`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <span>{karyaObj.pending_edits.type === "delete" ? "Pengajuan Penghapusan Karya" : "Pengajuan Perubahan Data (Edit)"}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {karyaObj.pending_edits.type === "delete"
                    ? "Mahasiswa mengajukan permohonan hapus untuk karya ini. Klik setujui untuk menghapus secara permanen, atau tolak untuk membatalkan pengajuan."
                    : "Mahasiswa memperbarui detail informasi karya ini. Klik setujui untuk menerapkan pembaruan, atau tolak untuk mempertahankan versi saat ini."}
                </p>
              </div>
            )}

            {karyaObj.image_url && (
              <div className="w-full h-52 sm:h-64 mb-6 rounded-2xl overflow-hidden border border-border bg-muted/40 shadow-xs">
                <img src={karyaObj.image_url} alt="Cover Karya" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/20 border border-border/70">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Deskripsi Karya
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {karyaObj.description}
                  </p>
                </div>
                
                {karyaObj.tech_stack && karyaObj.tech_stack.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Teknologi / Peralatan
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {karyaObj.tech_stack.map((t: string, i: number) => (
                        <span key={i} className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 pt-1">
                  {karyaObj.live_url && (
                    <a href={karyaObj.live_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                      🔗 Tautan Live Demo
                    </a>
                  )}
                  {karyaObj.github_url && (
                    <a href={karyaObj.github_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      📁 Repositori Proyek
                    </a>
                  )}
                </div>

                {karyaObj.team && karyaObj.team.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Anggota Tim Mahasiswa
                    </h3>
                    <div className="space-y-2">
                      {karyaObj.team.map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-2.5 bg-muted/20 p-2.5 rounded-xl border border-border/50">
                          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {t.avatar ? <img src={t.avatar} className="w-full h-full rounded-full object-cover" /> : (t.name || "?").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground leading-tight truncate">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{t.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Catatan Evaluasi & Review */}
                <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FiFileText className="text-primary w-4 h-4" />
                    <span>Catatan Evaluasi Kurasi</span>
                  </h3>
                  
                  <div className="mb-3.5 flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-xs font-semibold text-muted-foreground">Skor Kelayakan:</span>
                    {karyaObj.ai_review_score != null ? (
                      <span className={`text-base font-heading font-extrabold ${
                        karyaObj.ai_review_score >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                        karyaObj.ai_review_score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {karyaObj.ai_review_score} / 100
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">Belum Dinilai</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1.5">Feedback Evaluasi:</span>
                    <p className="text-xs text-foreground whitespace-pre-line bg-muted/20 p-3 rounded-xl border border-border/60 leading-relaxed">
                      {karyaObj.ai_review_reason || "Belum ada catatan evaluasi khusus untuk karya ini."}
                    </p>
                  </div>
                </div>
                
                {karyaObj.reject_reason && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1">Catatan Penolakan Admin:</span>
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-300 leading-relaxed">{karyaObj.reject_reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-2.5 justify-end">
              <button 
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button 
                type="button"
                onClick={() => { setShowDetailModal(false); toggleConfirm("reject"); }} 
                className="px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-xs rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                Tolak Karya
              </button>
              <button 
                type="button"
                onClick={() => { setShowDetailModal(false); toggleConfirm("approve"); }} 
                className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
              >
                Setujui Karya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
