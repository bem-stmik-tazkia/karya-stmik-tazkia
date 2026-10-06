import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder, Plus, Clock, CheckCircle2, XCircle, Search } from "lucide-react";
import { ProjectActions } from "@/components/dashboard/ProjectActions";
import { RealtimeProjectsListener } from "@/components/dashboard/RealtimeProjectsListener";
import { KARYA_CATEGORIES } from "@/types/karya";

export const revalidate = 0;

function StatusBadge({ status, aiStatus, rejectReason }: { status: string; aiStatus?: string; rejectReason?: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border-2 border-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_#15803d] dark:shadow-none">
        <CheckCircle2 className="w-3 h-3" /> Publik
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border-2 border-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_#b91c1c] dark:shadow-none">
          <XCircle className="w-3 h-3" /> Ditolak
        </span>
        {rejectReason && (
          <span className="text-[10px] text-red-500 font-bold max-w-[160px] line-clamp-2">{rejectReason}</span>
        )}
      </div>
    );
  }
  if (aiStatus === "processing") {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 border-2 border-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_#1d4ed8] dark:shadow-none animate-pulse">
        <Search className="w-3 h-3" /> Direview
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 border-2 border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-[2px_2px_0px_#854d0e] dark:shadow-none">
      <Clock className="w-3 h-3" /> Menunggu
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

  const karyaList = rawKaryaList?.filter(k => k.status !== "deleted" && k.status !== "DELETED") || [];

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <RealtimeProjectsListener userId={user.id} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-2">
            <Folder className="w-8 h-8 text-primary" /> Daftar Karya Saya
          </h1>
          <p className="text-muted-foreground font-bold mt-1 text-sm">
            Kelola semua karya yang telah kamu unggah beserta statusnya.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-4 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-0 active:shadow-[2px_2px_0px_var(--color-border)] transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Upload Karya
        </Link>
      </div>

      {karyaList.length === 0 ? (
        /* Empty State */
        <div className="bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border-4 border-border text-muted-foreground mb-4">
            <Folder className="w-8 h-8" />
          </div>
          <p className="text-lg font-black text-foreground uppercase">Belum Ada Karya</p>
          <p className="text-sm font-bold text-muted-foreground mt-1 mb-6">
            Kamu belum mengunggah karya apapun.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-2 border-border shadow-[3px_3px_0px_var(--color-border)] hover:-translate-y-0.5 transition-all uppercase"
          >
            <Plus className="w-4 h-4" /> Upload Karya Pertama
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden md:block bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted border-b-4 border-border text-foreground">
                    <th className="p-4 font-black uppercase text-sm">Judul Karya</th>
                    <th className="p-4 font-black uppercase text-sm">Kategori</th>
                    <th className="p-4 font-black uppercase text-sm">Tanggal</th>
                    <th className="p-4 font-black uppercase text-sm text-center">Status</th>
                    <th className="p-4 font-black uppercase text-sm text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border/30">
                  {karyaList.map((karya) => (
                    <tr key={karya.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 align-middle">
                        <div className="font-black text-base text-foreground line-clamp-1">{karya.title}</div>
                        <div className="text-xs text-muted-foreground font-bold mt-0.5 line-clamp-1">
                          {karya.description}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="bg-secondary/10 text-secondary border-2 border-secondary/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap">
                          {KARYA_CATEGORIES.find(c => c.value === karya.category)?.label || karya.category || "-"}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-sm font-bold text-muted-foreground whitespace-nowrap">
                        {formatDate(karya.created_at)}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <StatusBadge status={karya.status} aiStatus={karya.ai_review_status} rejectReason={karya.reject_reason} />
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
                className="bg-card border-4 border-border rounded-2xl shadow-[4px_4px_0px_var(--color-border)] p-4 flex flex-col gap-3"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-foreground text-base line-clamp-2 leading-snug">{karya.title}</h3>
                    {karya.description && (
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-2">{karya.description}</p>
                    )}
                  </div>
                  <StatusBadge status={karya.status} aiStatus={karya.ai_review_status} rejectReason={karya.reject_reason} />
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-secondary/10 text-secondary border-2 border-secondary/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                    {KARYA_CATEGORIES.find(c => c.value === karya.category)?.label || karya.category || "Tanpa Kategori"}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {formatDate(karya.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="border-t-2 border-border pt-3">
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
