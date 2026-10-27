import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder, Plus, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { ProjectActions } from "@/components/dashboard/ProjectActions";
import { RealtimeProjectsListener } from "@/components/dashboard/RealtimeProjectsListener";
import { KARYA_CATEGORIES } from "@/types/karya";

export const revalidate = 0;

function StatusBadge({ status, rejectReason, pendingEdits }: { status: string; rejectReason?: string; pendingEdits?: any }) {
  if (status === "approved") {
    return (
      <div className="flex flex-col gap-1 items-start md:items-center">
        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Publik</span>
        </span>
        {pendingEdits && (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-xs">
            <Clock className="w-2.5 h-2.5" />
            <span>{pendingEdits.type === 'delete' ? 'Hapus Menunggu Review' : 'Edit Menunggu Review'}</span>
          </span>
        )}
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex flex-col items-start md:items-center gap-1">
        <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
          <XCircle className="w-3.5 h-3.5" />
          <span>Ditolak</span>
        </span>
        {rejectReason && (
          <span className="text-[11px] text-rose-500 font-medium max-w-[160px] line-clamp-2" title={rejectReason}>{rejectReason}</span>
        )}
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-xs">
      <Clock className="w-3.5 h-3.5" />
      <span>Menunggu Review</span>
    </span>
  );
}

export default async function ProjectsListPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: rawKaryaList } = await supabase
    .from("karya")
    .select("*")
    .or(`user_id.eq.${user.id},team.cs.[{"user_id":"${user.id}"}]`)
    .order("created_at", { ascending: false });

  const karyaList = (rawKaryaList?.filter(k => k.status !== "deleted" && k.status !== "DELETED") || []).filter((k: any) => {
    if (k.user_id === user.id) return true;
    if (Array.isArray(k.team)) {
      const myMembership = k.team.find((m: any) => m.user_id === user.id);
      if (myMembership && myMembership.status === "rejected") return false;
    }
    return true;
  });

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <RealtimeProjectsListener userId={user.id} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Folder className="w-7 h-7 text-primary" />
            <span>Daftar Karya Saya</span>
          </h1>
          <p className="text-muted-foreground font-normal mt-1 text-sm">
            Kelola semua karya dan portofolio yang telah kamu unggah beserta status kurasinya.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Karya Baru</span>
        </Link>
      </div>

      {karyaList.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <Folder className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum Ada Karya</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto font-normal">
            Kamu belum mengunggah karya apapun ke platform ini. Tunjukkan proyek terbaikmu!
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-[#ea580c] shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Karya Pertama</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Judul Karya</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Kategori</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {karyaList.map((karya) => (
                    <tr key={karya.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-middle">
                        <div className="font-semibold text-sm text-foreground line-clamp-1">
                          {karya.title}
                          {karya.pending_edits && karya.pending_edits.type === "delete" ? (
                            <span className="inline-block bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                              HAPUS
                            </span>
                          ) : karya.status === "approved" && karya.pending_edits ? (
                            <span className="inline-block bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                              EDIT
                            </span>
                          ) : karya.status === "pending" ? (
                            <span className="inline-block bg-sky-500/10 text-sky-600 border border-sky-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                              BARU
                            </span>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground font-normal mt-0.5 line-clamp-1">
                          {karya.description}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="bg-muted text-foreground border border-border/70 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                          {KARYA_CATEGORIES.find(c => c.value === karya.category)?.label || karya.category || "-"}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-xs font-normal text-muted-foreground whitespace-nowrap">
                        {formatDate(karya.created_at)}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <StatusBadge status={karya.status} rejectReason={karya.reject_reason} pendingEdits={karya.pending_edits} />
                      </td>
                      <td className="p-4 align-middle">
                        <ProjectActions
                          projectId={karya.id}
                          isApproved={karya.status === "approved"}
                          karyaObj={karya}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List (hidden on desktop) */}
          <div className="md:hidden flex flex-col gap-3">
            {karyaList.map((karya) => (
              <div
                key={karya.id}
                className="bg-card border border-border rounded-xl shadow-xs p-4 flex flex-col gap-3"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-snug">
                      {karya.title}
                      {karya.pending_edits && karya.pending_edits.type === "delete" ? (
                        <span className="inline-block bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                          HAPUS
                        </span>
                      ) : karya.status === "approved" && karya.pending_edits ? (
                        <span className="inline-block bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                          EDIT
                        </span>
                      ) : karya.status === "pending" ? (
                        <span className="inline-block bg-sky-500/10 text-sky-600 border border-sky-500/20 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2">
                          BARU
                        </span>
                      ) : null}
                    </h3>
                    {karya.description && (
                      <p className="text-xs text-muted-foreground font-normal mt-0.5 line-clamp-2">
                        {karya.description}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={karya.status} rejectReason={karya.reject_reason} pendingEdits={karya.pending_edits} />
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-muted text-foreground border border-border/70 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {KARYA_CATEGORIES.find(c => c.value === karya.category)?.label || karya.category || "Tanpa Kategori"}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {formatDate(karya.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-3">
                  <ProjectActions
                    projectId={karya.id}
                    isApproved={karya.status === "approved"}
                    karyaObj={karya}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
