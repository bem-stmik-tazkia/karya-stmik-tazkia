"use client";

import React, { useState, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiCpu, FiTrash2, FiEye, FiXCircle } from "react-icons/fi";
import toast from "react-hot-toast";

interface AdminReviewActionsProps {
  karyaId: string;
  currentStatus: string;
  aiStatus?: string;
  karyaObj?: any; // Seluruh data karya untuk modal detail
}

export function AdminReviewActions({ karyaId, currentStatus, aiStatus, karyaObj }: AdminReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  
  // State untuk mengontrol visibilitas masing-masing konfirmasi
  const [activeConfirm, setActiveConfirm] = useState<"approve" | "reject" | "ai" | "delete" | null>(null);
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
            toast.error("Gagal menyetujui penghapusan: " + deleteError.message);
            return;
          }
          await supabase.from("notifications").insert({
            user_id: karyaObj.user_id,
            title: "[HAPUS] Penghapusan Karya Disetujui",
            message: `Pengajuan hapus untuk karya "${karyaObj.title}" telah disetujui.`,
            karya_id: karyaId,
            type: "success"
          });
          toast.success("✅ Pengajuan hapus disetujui, karya dihapus.");
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
        toast.error("Gagal menyetujui karya: " + error.message);
      } else {
        if (karyaObj?.pending_edits) {
          // Manual in-app notification insertion
          await supabase.from("notifications").insert({
            user_id: karyaObj.user_id,
            title: "[EDIT] Perubahan Karya Disetujui",
            message: `Edit untuk karya "${karyaObj.title}" telah disetujui dan diperbarui.`,
            karya_id: karyaId,
            type: "success"
          });
        }
        
        toast.success(karyaObj?.pending_edits ? "✅ Perubahan berhasil disetujui!" : "✅ Karya berhasil disetujui!");
        
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
        // If it's a pending edit, we don't reject the whole post, just discard the edit
        updatePayload = {
          // Keep the original status (approved)
          status: "approved",
          reject_reason: null, // Wait, maybe we want to notify user of edit rejection? For now just clear it.
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
        toast.error("Gagal menolak karya: " + error.message);
      } else {
        if (karyaObj?.pending_edits) {
          const isDeleteReq = karyaObj.pending_edits.type === "delete";
          // Manual in-app notification insertion
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
        toast.success(karyaObj?.pending_edits ? (karyaObj.pending_edits.type === "delete" ? "❌ Pengajuan hapus ditolak." : "❌ Perubahan ditolak.") : "❌ Karya berhasil ditolak.");
        
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
        toast.error("Gagal menghapus karya: " + error.message);
      } else {
        toast.success("🗑️ Karya berhasil dihapus permanen.");

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

  // Fungsi pembantu untuk toggle (buka/tutup) tab konfirmasi
  const toggleConfirm = (tab: "approve" | "reject" | "ai" | "delete") => {
    setActiveConfirm(activeConfirm === tab ? null : tab);
  };

  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      <div className="flex items-center gap-1.5 justify-center">
        {/* Tombol Lihat Detail */}
        {karyaObj && (
          <button
            onClick={() => setShowDetailModal(true)}
            title="Lihat Detail Penuh"
            className="w-8 h-8 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80 flex items-center justify-center transition-all shadow-xs cursor-pointer"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Tombol Setujui Manual */}
        <button
          onClick={() => toggleConfirm("approve")}
          disabled={isPending || currentStatus === "approved"}
          title="Setujui Manual"
          className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiCheck className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Tolak Manual */}
        <button
          onClick={() => toggleConfirm("reject")}
          disabled={isPending || currentStatus === "rejected"}
          title="Tolak Manual"
          className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>

        {/* Tombol Hapus Permanen */}
        <button
          onClick={() => toggleConfirm("delete")}
          disabled={isPending}
          title="Hapus Karya"
          className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs cursor-pointer"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* --- PANEL KONFIRMASI (Hanya satu yang tampil dalam satu waktu) --- */}

      {/* 1. Konfirmasi Setujui */}
      {activeConfirm === "approve" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 leading-tight text-center">
            Setujui dan publikasikan karya ini?
          </p>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="text-xs font-semibold text-white bg-emerald-600 rounded-lg py-1.5 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isPending ? "Menyimpan..." : "Ya, Setujui"}
          </button>
        </div>
      )}

      {/* 2. Konfirmasi Tolak (Input alasan) */}
      {activeConfirm === "reject" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Alasan penolakan..."
            className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleReject()}
          />
          <button
            onClick={handleReject}
            disabled={isPending}
            className="text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5 hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isPending ? "Menyimpan..." : "Konfirmasi Tolak"}
          </button>
        </div>
      )}

      {/* 4. Konfirmasi Hapus */}
      {activeConfirm === "delete" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 leading-tight text-center">
            Hapus permanen karya ini?
          </p>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-semibold text-white bg-rose-600 rounded-lg py-1.5 hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
          </button>
        </div>
      )}

      {/* --- MODAL DETAIL KARYA --- */}
      {showDetailModal && karyaObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl p-6 relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-2 bg-muted hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors"
            >
              <FiXCircle size={20} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold pr-10 mb-2">{karyaObj.title}</h2>
            <div className="flex gap-2 mb-6">
              <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-semibold">
                {karyaObj.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                karyaObj.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                karyaObj.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {karyaObj.status === 'approved' ? 'Publik' : karyaObj.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
              </span>
            </div>
            
            {karyaObj.pending_edits && (
              <div className={`mb-6 p-4 rounded-xl border-l-4 ${karyaObj.pending_edits.type === "delete" ? "bg-rose-500/10 border-rose-500" : "bg-amber-500/10 border-amber-500"}`}>
                <h3 className={`text-sm font-semibold flex items-center gap-2 mb-1 ${karyaObj.pending_edits.type === "delete" ? "text-rose-600" : "text-amber-600"}`}>
                  ⚠️ {karyaObj.pending_edits.type === "delete" ? "Terdapat Pengajuan Penghapusan Karya" : "Terdapat Pengajuan Perubahan (Edit)"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {karyaObj.pending_edits.type === "delete"
                    ? "Mahasiswa mengajukan penghapusan untuk karya ini. Klik setujui untuk menghapus permanen, atau tolak untuk membatalkan pengajuan hapus."
                    : "Mahasiswa mengubah detail karya ini. Klik setujui untuk memperbarui ke versi edit (otomatis mengganti data utama), atau tolak untuk membuang perubahan ini dan tetap menampilkan versi lama. Data di bawah ini adalah data asli."}
                </p>
              </div>
            )}

            {karyaObj.image_url && (
              <div className="w-full h-48 md:h-64 mb-6 rounded-xl overflow-hidden border border-border bg-muted">
                <img src={karyaObj.image_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-muted-foreground uppercase mb-1">Deskripsi</h3>
                  <p className="text-sm font-bold bg-muted/30 p-3 rounded-xl border-2 border-border/50">{karyaObj.description}</p>
                </div>
                
                {karyaObj.tech_stack && karyaObj.tech_stack.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-muted-foreground uppercase mb-1">Tech Stack / Tools</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {karyaObj.tech_stack.map((t: string, i: number) => (
                        <span key={i} className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  {karyaObj.live_url && (
                    <a href={karyaObj.live_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                      🔗 Live URL / Demo
                    </a>
                  )}
                  {karyaObj.github_url && (
                    <a href={karyaObj.github_url} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-700 hover:underline">
                      🐙 GitHub
                    </a>
                  )}
                </div>

                {karyaObj.team && karyaObj.team.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-muted-foreground uppercase mb-2">Anggota Tim</h3>
                    <div className="space-y-2">
                      {karyaObj.team.map((t: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border/30">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-black text-xs">
                            {t.avatar ? <img src={t.avatar} className="w-full h-full rounded-full object-cover" /> : t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black leading-tight">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground font-bold">{t.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {karyaObj.features && karyaObj.features.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-muted-foreground uppercase mb-2">Fitur / Poin Utama</h3>
                    <ul className="space-y-2">
                      {karyaObj.features.map((f: any, i: number) => (
                        <li key={i} className="bg-muted/20 p-2.5 rounded-xl border border-border/30">
                          <p className="text-xs font-black">{f.title}</p>
                          <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{f.desc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {karyaObj.gallery && karyaObj.gallery.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black text-muted-foreground uppercase mb-2">Galeri / Dokumentasi</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {karyaObj.gallery.map((g: any, i: number) => (
                        <div key={i} className="group relative rounded-xl overflow-hidden border-2 border-border/30 aspect-video bg-muted/30">
                          <img src={g.url} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          {g.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                              <p className="text-[8px] text-white font-bold truncate">{g.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-muted/40 border border-border p-4 rounded-2xl">
                  <h3 className="text-sm font-heading font-extrabold text-foreground uppercase mb-2 flex items-center gap-2">
                    <FiCpu className="text-primary" /> Hasil Review AI
                  </h3>
                  
                  <div className="mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Skor AI: </span>
                    {karyaObj.ai_review_score != null ? (
                      <span className={`text-lg font-heading font-extrabold ${
                        karyaObj.ai_review_score >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                        karyaObj.ai_review_score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {karyaObj.ai_review_score}/100
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">Belum Dinilai</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Catatan / Feedback AI:</span>
                    <p className="text-sm text-foreground whitespace-pre-line bg-card p-3 rounded-xl border border-border/80">
                      {karyaObj.ai_review_reason || "Tidak ada feedback."}
                    </p>
                  </div>
                </div>
                
                {karyaObj.reject_reason && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase block mb-1">Alasan Penolakan Admin:</span>
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{karyaObj.reject_reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons inside Modal */}
            <div className="mt-8 pt-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => { setShowDetailModal(false); toggleConfirm("approve"); }} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xs">
                Setujui
              </button>
              <button onClick={() => { setShowDetailModal(false); toggleConfirm("reject"); }} className="px-4 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-xs sm:text-sm rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-xs">
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
