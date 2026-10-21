import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import AiStatusWidget from "@/components/admin/AiStatusWidget";
import { Layers, Clock, Cpu, CheckCircle2, XCircle, Search, RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

const STATUS_CONFIG = {
  approved: { label: "Publik", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  rejected: { label: "Ditolak", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  pending: { label: "Menunggu", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
};

const AI_STATUS_CONFIG = {
  processing: { label: "Diperiksa AI", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse" },
  pending_review: { label: "Dalam Antrean", className: "bg-muted text-muted-foreground border-border" },
  reviewed: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string; page?: string; q?: string }>;
}

export default async function AdminKaryaPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) redirect("/dashboard");

  // Ambil SEMUA karya untuk keperluan filter & statistik
  const { data: allKarya } = await supabase
    .from("karya")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  // Statistik dari semua data
  const totalPending = allKarya?.filter(k => k.status === "pending").length || 0;
  const totalApproved = allKarya?.filter(k => k.status === "approved").length || 0;
  const totalRejected = allKarya?.filter(k => k.status === "rejected").length || 0;
  const totalAiProcessing = allKarya?.filter(k => k.ai_review_status === "processing").length || 0;
  const totalAll = allKarya?.length || 0;

  // Ambil daftar kategori unik untuk dropdown filter
  const categories = [...new Set(allKarya?.map(k => k.category).filter(Boolean))].sort();

  // Terapkan filter berdasarkan searchParams
  const activeStatus = params.status || "all";
  const activeCategory = params.category || "all";
  const searchQuery = params.q || "";

  let filteredKarya = allKarya || [];
  if (activeStatus === "pending") filteredKarya = filteredKarya.filter(k => k.status === "pending");
  else if (activeStatus === "approved") filteredKarya = filteredKarya.filter(k => k.status === "approved");
  else if (activeStatus === "rejected") filteredKarya = filteredKarya.filter(k => k.status === "rejected");
  else if (activeStatus === "ai_processing") filteredKarya = filteredKarya.filter(k => k.ai_review_status === "processing");

  if (activeCategory !== "all") filteredKarya = filteredKarya.filter(k => k.category === activeCategory);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredKarya = filteredKarya.filter(k => 
      k.title.toLowerCase().includes(q) || 
      (k.description || "").toLowerCase().includes(q)
    );
  }

  // Helper untuk membangun URL filter & paginasi
  const buildUrl = (status?: string, category?: string, page?: number, q?: string) => {
    const p = new URLSearchParams();
    const s = status ?? activeStatus;
    const c = category ?? activeCategory;
    const sq = q !== undefined ? q : searchQuery;
    
    if (s && s !== "all") p.set("status", s);
    if (c && c !== "all") p.set("category", c);
    if (sq) p.set("q", sq);
    if (page && page > 1) p.set("page", page.toString());
    
    const qs = p.toString();
    return `/admin/karya${qs ? `?${qs}` : ""}`;
  };

  // Logic Paginasi
  const ITEMS_PER_PAGE = 10;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const totalPages = Math.ceil(filteredKarya.length / ITEMS_PER_PAGE) || 1;
  const paginatedKarya = filteredKarya.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statCards = [
    { 
      label: "Semua", 
      value: totalAll, 
      icon: Layers, 
      iconColor: "text-primary bg-primary/10 border-primary/20", 
      statusKey: "all" 
    },
    { 
      label: "Menunggu", 
      value: totalPending, 
      icon: Clock, 
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20", 
      statusKey: "pending" 
    },
    { 
      label: "Diperiksa AI", 
      value: totalAiProcessing, 
      icon: Cpu, 
      iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20", 
      statusKey: "ai_processing" 
    },
    { 
      label: "Disetujui", 
      value: totalApproved, 
      icon: CheckCircle2, 
      iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", 
      statusKey: "approved" 
    },
    { 
      label: "Ditolak", 
      value: totalRejected, 
      icon: XCircle, 
      iconColor: "text-rose-500 bg-rose-500/10 border-rose-500/20", 
      statusKey: "rejected" 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* AI Status Widget */}
      <AiStatusWidget />

      {/* Stat Cards (Clickable Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
        {statCards.map((stat, i) => {
          const isActive = activeStatus === stat.statusKey;
          const Icon = stat.icon;
          return (
            <Link
              key={i}
              href={buildUrl(stat.statusKey, activeCategory)}
              className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all duration-150 relative overflow-hidden group bg-card ${
                isActive
                  ? "border-primary bg-primary/[0.04] shadow-xs ring-1 ring-primary/40"
                  : "border-border/80 hover:border-border hover:bg-muted/40 hover:-translate-y-0.5 hover:shadow-xs"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-heading font-extrabold text-foreground tracking-tight leading-none">
                  {stat.value}
                </div>
                <div className={`text-[11px] font-bold uppercase tracking-wider mt-1.5 truncate ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {stat.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Header + Filter Kategori */}
        <div className="p-4 sm:p-5 border-b border-border flex flex-col xl:flex-row xl:items-center gap-4 justify-between bg-muted/20">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-foreground tracking-tight">
                Daftar Kurasi Karya
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                {filteredKarya.length} karya
              </span>
              {activeStatus !== "all" && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border capitalize">
                  Filter: {activeStatus === "ai_processing" ? "Diperiksa AI" : activeStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Kelola peninjauan, status publikasi, dan verifikasi AI karya mahasiswa
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            {/* Search Bar */}
            <form method="GET" className="flex items-center gap-2 w-full sm:w-auto">
              {activeStatus !== "all" && <input type="hidden" name="status" value={activeStatus} />}
              {activeCategory !== "all" && <input type="hidden" name="category" value={activeCategory} />}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <input 
                  type="text" 
                  name="q" 
                  defaultValue={searchQuery} 
                  placeholder="Cari judul atau deskripsi..." 
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border bg-background text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-colors"
                />
              </div>
              <button 
                type="submit" 
                className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs transition-all cursor-pointer shrink-0"
              >
                Cari
              </button>
              {searchQuery && (
                <Link 
                  href={buildUrl(activeStatus, activeCategory, 1, "")} 
                  className="p-2 rounded-xl bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted shadow-xs transition-colors flex items-center justify-center shrink-0"
                  title="Reset Pencarian"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Link>
              )}
            </form>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-start xl:justify-end">
              <Link
                href={buildUrl(activeStatus, "all", 1, searchQuery)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Semua
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={buildUrl(activeStatus, cat, 1, searchQuery)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all uppercase ${
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Judul Karya</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3 text-center">Status Karya</th>
                <th className="py-3.5 px-3 text-center">Status AI</th>
                <th className="py-3.5 px-3 text-center">Skor AI</th>
                <th className="py-3.5 px-4">Catatan AI</th>
                <th className="py-3.5 px-4 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedKarya.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground font-medium">
                    Tidak ada karya yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                paginatedKarya.map((karya) => {
                  let statusCfg = STATUS_CONFIG[karya.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  
                  if (karya.pending_edits) {
                    if (karya.pending_edits.type === 'delete') {
                      statusCfg = { label: "Hapus (Menunggu)", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
                    } else {
                      statusCfg = { label: "Edit (Menunggu)", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
                    }
                  } else if (karya.status === 'pending') {
                    statusCfg = { label: "Baru (Menunggu)", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
                  }

                  const isAlreadyFinal = (karya.status === "approved" || karya.status === "rejected") && karya.ai_review_status !== "reviewed";
                  const isAiError = karya.ai_review_status === "reviewed" && karya.ai_review_score == null;

                  const aiCfg = isAlreadyFinal
                    ? { label: "Manual", className: "bg-muted text-muted-foreground border-border" }
                    : isAiError
                    ? { label: "Gagal Periksa", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" }
                    : AI_STATUS_CONFIG[karya.ai_review_status as keyof typeof AI_STATUS_CONFIG] || AI_STATUS_CONFIG.pending_review;

                  return (
                    <tr key={karya.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <Link 
                            href={`/project/${karya.id}`}
                            target="_blank"
                            className="font-heading font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1 group inline-flex items-center gap-1"
                            title="Lihat halaman karya publik"
                          >
                            <span>{karya.title}</span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </Link>
                          {karya.pending_edits && karya.pending_edits.type === "delete" ? (
                            <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold">HAPUS</span>
                          ) : karya.pending_edits ? (
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold">EDIT</span>
                          ) : karya.status === 'pending' ? (
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold">BARU</span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{karya.description}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="bg-muted/60 text-foreground border border-border px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">
                          {karya.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`border px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 whitespace-nowrap ${statusCfg.className}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusCfg.label}
                        </span>
                        {karya.status === "rejected" && karya.reject_reason && (
                          <div className="text-[10px] text-rose-500 mt-1 max-w-[120px] mx-auto line-clamp-2">{karya.reject_reason}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`border px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 whitespace-nowrap ${aiCfg.className}`}>
                          {aiCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {karya.ai_review_score != null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-heading font-extrabold border ${
                            karya.ai_review_score >= 70 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                            karya.ai_review_score >= 40 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}>
                            {karya.ai_review_score}/100
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-medium">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {karya.ai_review_reason || "-"}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <AdminReviewActions
                          karyaId={karya.id}
                          currentStatus={karya.status}
                          aiStatus={karya.ai_review_status}
                          karyaObj={karya}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between gap-4 bg-muted/20">
            <p className="text-xs font-medium text-muted-foreground hidden sm:block">
              Halaman <span className="text-foreground font-semibold">{currentPage}</span> dari <span className="text-foreground font-semibold">{totalPages}</span>
            </p>
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Link
                href={currentPage > 1 ? buildUrl(activeStatus, activeCategory, currentPage - 1, searchQuery) : "#"}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold uppercase transition-all ${
                  currentPage > 1
                    ? "bg-card border-border hover:bg-muted text-foreground shadow-xs"
                    : "bg-muted border-border/50 text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                Sebelumnya
              </Link>
              <Link
                href={currentPage < totalPages ? buildUrl(activeStatus, activeCategory, currentPage + 1, searchQuery) : "#"}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold uppercase transition-all ${
                  currentPage < totalPages
                    ? "bg-card border-border hover:bg-muted text-foreground shadow-xs"
                    : "bg-muted border-border/50 text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                Selanjutnya
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
