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
      const { error } = await supabase
        .from("karya")
        .update({
          status: "approved",
          reject_reason: null,
          ai_review_status: "reviewed",
          ai_review_reason: "Disetujui manual oleh admin.",
          ai_reviewed_at: new Date().toISOString(),
        })
        .eq("id", karyaId);

      if (error) {
        toast.error("Gagal menyetujui karya: " + error.message);
      } else {
        toast.success("✅ Karya berhasil disetujui!");
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
      const { error } = await supabase
        .from("karya")
        .update({
          status: "rejected",
          reject_reason: rejectReason.trim(),
          ai_review_status: "reviewed",
          ai_review_reason: rejectReason.trim(),
          ai_reviewed_at: new Date().toISOString(),
        })
        .eq("id", karyaId);

      if (error) {
        toast.error("Gagal menolak karya: " + error.message);
      } else {
        toast.success("❌ Karya berhasil ditolak.");
        setActiveConfirm(null);
        setRejectReason("");
        router.refresh();
      }
    });
  };

  const handleRetriggerAI = async () => {
    const toastId = toast.loading("Mengirim ulang ke antrean AI...");
    const { error } = await supabase
      .from("karya")
      .update({
        status: "pending",
        ai_review_status: "pending_review",
        ai_review_reason: null,
        ai_review_score: null,
        ai_reviewed_at: null,
      })
      .eq("id", karyaId);

    if (error) {
      toast.error("Gagal reset: " + error.message, { id: toastId });
    } else {
      toast.success("Karya dikembalikan ke antrean AI!", { id: toastId });
      setActiveConfirm(null);
      router.refresh();

      // Trigger worker AI secara asinkron di background (fire and forget)
      fetch("/api/ai-review", {
        method: "POST",
        headers: {
          Authorization: "Bearer karya-tazkia-cron-2025" // Sesuaikan dengan CRON_SECRET di env
        }
      }).catch(err => console.error("Gagal trigger AI worker:", err));
    }
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {/* Tombol Lihat Detail */}
        {karyaObj && (
          <button
            onClick={() => setShowDetailModal(true)}
            title="Lihat Detail Penuh"
            className="p-2 rounded-lg bg-purple-100 border-2 border-purple-600 text-purple-700 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-[2px_2px_0px_#7e22ce]"
          >
            <FiEye size={16} />
          </button>
        )}

        {/* Tombol Setujui Manual */}
        <button
          onClick={() => toggleConfirm("approve")}
          disabled={isPending || currentStatus === "approved"}
          title="Setujui Manual"
          className="p-2 rounded-lg bg-green-100 border-2 border-green-600 text-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#15803d]"
        >
          <FiCheck size={16} />
        </button>

        {/* Tombol Tolak Manual */}
        <button
          onClick={() => toggleConfirm("reject")}
          disabled={isPending || currentStatus === "rejected"}
          title="Tolak Manual"
          className="p-2 rounded-lg bg-orange-100 border-2 border-orange-600 text-orange-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#c2410c]"
        >
          <FiX size={16} />
        </button>

        {/* Tombol Kirim Ulang ke AI */}
        <button
          onClick={() => toggleConfirm("ai")}
          disabled={isPending || aiStatus === "processing"}
          title="Kirim Ulang ke AI"
          className="p-2 rounded-lg bg-blue-100 border-2 border-blue-600 text-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#1d4ed8]"
        >
          <FiCpu size={16} />
        </button>

        {/* Tombol Hapus Permanen */}
        <button
          onClick={() => toggleConfirm("delete")}
          disabled={isPending}
          title="Hapus Karya"
          className="p-2 rounded-lg bg-red-100 border-2 border-red-600 text-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#b91c1c]"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {/* --- PANEL KONFIRMASI (Hanya satu yang tampil dalam satu waktu) --- */}

      {/* 1. Konfirmasi Setujui */}
      {activeConfirm === "approve" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-bold text-green-700 leading-tight text-center">
            Setujui dan publikasikan karya ini?
          </p>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="text-xs font-black text-white bg-green-600 border-2 border-green-800 rounded-lg py-1.5 hover:bg-green-700 transition-colors disabled:opacity-50"
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
            className="text-xs border-2 border-orange-300 rounded-lg px-2 py-1.5 bg-background text-foreground font-bold focus:outline-none focus:border-orange-500"
            onKeyDown={(e) => e.key === "Enter" && handleReject()}
          />
          <button
            onClick={handleReject}
            disabled={isPending}
            className="text-xs font-black text-white bg-orange-600 border-2 border-orange-800 rounded-lg py-1.5 hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : "Konfirmasi Tolak"}
          </button>
        </div>
      )}

      {/* 3. Konfirmasi Kirim Ulang ke AI */}
      {activeConfirm === "ai" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-bold text-blue-700 leading-tight text-center">
            Kirim ulang karya ini untuk dicek bot AI?
          </p>
          <button
            onClick={handleRetriggerAI}
            disabled={isPending}
            className="text-xs font-black text-white bg-blue-600 border-2 border-blue-800 rounded-lg py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "Ya, Kirim ke AI"}
          </button>
        </div>
      )}

      {/* 4. Konfirmasi Hapus */}
      {activeConfirm === "delete" && (
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="text-[10px] font-bold text-red-600 leading-tight text-center">
            Yakin ingin menghapus permanen? Data tidak bisa dikembalikan.
          </p>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs font-black text-white bg-red-600 border-2 border-red-800 rounded-lg py-1.5 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Menghapus..." : "Ya, Hapus Permanen"}
          </button>
        </div>
      )}

      {/* --- MODAL DETAIL KARYA --- */}
      {showDetailModal && karyaObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-border shadow-[8px_8px_0px_var(--color-border)] p-6 relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-2 bg-muted hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
            >
              <FiXCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase pr-10 mb-2">{karyaObj.title}</h2>
            <div className="flex gap-2 mb-6">
              <span className="bg-secondary/10 text-secondary border-2 border-secondary/30 px-3 py-1 rounded-xl text-xs font-black uppercase">
                {karyaObj.category}
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border-2 ${
                karyaObj.status === 'approved' ? 'bg-green-100 text-green-700 border-green-700' :
                karyaObj.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-700' :
                'bg-yellow-100 text-yellow-800 border-yellow-700'
              }`}>
                {karyaObj.status === 'approved' ? 'Publik' : karyaObj.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
              </span>
            </div>

            {karyaObj.image_url && (
              <div className="w-full h-48 md:h-64 mb-6 rounded-2xl overflow-hidden border-4 border-border bg-muted">
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
                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-2xl">
                  <h3 className="text-sm font-black text-blue-800 uppercase mb-2 flex items-center gap-2">
                    <FiCpu /> Hasil Review AI
                  </h3>
                  
                  <div className="mb-3">
                    <span className="text-xs font-black text-muted-foreground uppercase">Skor AI: </span>
                    {karyaObj.ai_review_score != null ? (
                      <span className={`text-lg font-black ${
                        karyaObj.ai_review_score >= 70 ? "text-green-600" :
                        karyaObj.ai_review_score >= 40 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {karyaObj.ai_review_score}/100
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-500">Belum Dinilai</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-xs font-black text-muted-foreground uppercase block mb-1">Alasan / Feedback AI:</span>
                    <p className="text-sm font-bold text-gray-700 whitespace-pre-line bg-white/50 p-3 rounded-xl border border-blue-100">
                      {karyaObj.ai_review_reason || "Tidak ada feedback."}
                    </p>
                  </div>
                </div>
                
                {karyaObj.reject_reason && (
                  <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl">
                    <span className="text-xs font-black text-red-800 uppercase block mb-1">Alasan Penolakan Admin:</span>
                    <p className="text-sm font-bold text-red-600">{karyaObj.reject_reason}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons inside Modal */}
            <div className="mt-8 pt-4 border-t-2 border-border/50 flex gap-3 justify-end">
              <button onClick={() => { setShowDetailModal(false); toggleConfirm("approve"); }} className="px-4 py-2 bg-green-100 text-green-700 font-black text-sm rounded-xl hover:bg-green-200 transition-colors">
                Setujui
              </button>
              <button onClick={() => { setShowDetailModal(false); toggleConfirm("reject"); }} className="px-4 py-2 bg-orange-100 text-orange-700 font-black text-sm rounded-xl hover:bg-orange-200 transition-colors">
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
