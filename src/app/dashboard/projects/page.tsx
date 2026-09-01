import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder, Plus } from "lucide-react";
import { ProjectActions } from "@/components/dashboard/ProjectActions";
import { RealtimeProjectsListener } from "@/components/dashboard/RealtimeProjectsListener";

export const revalidate = 0;

export default async function ProjectsListPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Get user's projects (all statuses except deleted)
  const { data: rawKaryaList } = await supabase
    .from("karya")
    .select("*")
    .or(`user_id.eq.${user.id},team.cs.[{"user_id":"${user.id}"}]`)
    .order("created_at", { ascending: false });

  // Filter out soft-deleted projects
  const karyaList = rawKaryaList?.filter(k => k.status !== "deleted" && k.status !== "DELETED") || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <RealtimeProjectsListener userId={user.id} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-2">
            <Folder className="w-8 h-8 text-primary" /> Daftar Projek Saya
          </h1>
          <p className="text-muted-foreground font-bold mt-1">
            Kelola semua projek karya yang telah Anda unggah beserta statusnya.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-sm border-4 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-0 active:shadow-[2px_2px_0px_var(--color-border)] transition-all uppercase"
        >
          <Plus className="w-4 h-4" /> Tambah Projek
        </Link>
      </div>

      <div className="bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-muted border-b-4 border-border text-foreground">
                <th className="p-4 font-black uppercase text-sm">Judul Projek</th>
                <th className="p-4 font-black uppercase text-sm">Kategori</th>
                <th className="p-4 font-black uppercase text-sm">Tanggal</th>
                <th className="p-4 font-black uppercase text-sm text-center">Status</th>
                <th className="p-4 font-black uppercase text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-border/30">
              {karyaList && karyaList.length > 0 ? (
                karyaList.map((karya) => (
                  <tr key={karya.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 align-middle">
                      <div className="font-black text-base text-foreground line-clamp-1">{karya.title}</div>
                      <div className="text-xs text-muted-foreground font-bold mt-1 line-clamp-1">
                        {karya.description}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="bg-secondary/10 text-secondary border-2 border-secondary/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                        {karya.category || "-"}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-sm font-bold text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(karya.created_at))}
                    </td>
                    <td className="p-4 align-middle text-center whitespace-nowrap">
                      {karya.status === "approved" ? (
                        <span className="bg-green-100 text-green-700 border-2 border-green-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#15803d]">✅ Publik</span>
                      ) : karya.status === "rejected" ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-red-100 text-red-700 border-2 border-red-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#b91c1c]">❌ Ditolak</span>
                          {karya.reject_reason && (
                            <span className="text-[10px] text-red-500 font-bold max-w-[160px] text-center line-clamp-2">{karya.reject_reason}</span>
                          )}
                        </div>
                      ) : karya.ai_review_status === "processing" ? (
                        <span className="bg-blue-100 text-blue-700 border-2 border-blue-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#1d4ed8] animate-pulse">🔍 Sedang Direview</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 border-2 border-yellow-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_#854d0e]">⏳ Menunggu</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <ProjectActions 
                        projectId={karya.id} 
                        isApproved={karya.status === "approved"} 
                        karyaObj={karya}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border-4 border-border text-muted-foreground mb-4">
                      <Folder className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-black text-foreground uppercase">Belum Ada Projek</p>
                    <p className="text-sm font-bold text-muted-foreground mt-1">
                      Anda belum mengunggah karya apapun.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
