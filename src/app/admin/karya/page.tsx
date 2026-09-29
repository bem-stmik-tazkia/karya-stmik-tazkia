import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import AiStatusWidget from "@/components/admin/AiStatusWidget";
import { FiCpu, FiCheckCircle, FiXCircle, FiList } from "react-icons/fi";
import Link from "next/link";

export const revalidate = 0;

const STATUS_CONFIG = {
  approved: { label: "✅ Publik", className: "bg-green-100 text-green-800 border-green-800 shadow-[2px_2px_0px_#166534]" },
  rejected: { label: "❌ Ditolak", className: "bg-red-100 text-red-800 border-red-800 shadow-[2px_2px_0px_#991b1b]" },
  pending: { label: "⏳ Menunggu", className: "bg-yellow-100 text-yellow-800 border-yellow-800 shadow-[2px_2px_0px_#854d0e]" },
};

const AI_STATUS_CONFIG = {
  processing: { label: "🤖 Sedang Diperiksa", className: "bg-blue-100 text-blue-800 border-blue-800 shadow-[2px_2px_0px_#1e40af] animate-pulse" },
  pending_review: { label: "🕐 Dalam Antrean", className: "bg-gray-100 text-gray-700 border-gray-700 shadow-[2px_2px_0px_#374151]" },
  reviewed: { label: "✔️ Selesai", className: "bg-green-50 text-green-800 border-green-800 shadow-[2px_2px_0px_#166534]" },
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
    { label: "Semua", value: totalAll, color: "text-foreground bg-card border-border", statusKey: "all" },
    { icon: <FiList />, label: "Menunggu", value: totalPending, color: "text-yellow-600 bg-yellow-100 border-yellow-600", statusKey: "pending" },
    { icon: <FiCpu />, label: "Diperiksa AI", value: totalAiProcessing, color: "text-blue-600 bg-blue-100 border-blue-600", statusKey: "ai_processing" },
    { icon: <FiCheckCircle />, label: "Disetujui", value: totalApproved, color: "text-green-600 bg-green-100 border-green-600", statusKey: "approved" },
    { icon: <FiXCircle />, label: "Ditolak", value: totalRejected, color: "text-red-600 bg-red-100 border-red-600", statusKey: "rejected" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* AI Status Widget */}
      <AiStatusWidget />

      {/* Stat Cards (Clickable Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statCards.map((stat, i) => {
          const isActive = activeStatus === stat.statusKey;
          return (
            <Link
              key={i}
              href={buildUrl(stat.statusKey, activeCategory)}
              className={`rounded-2xl border-4 p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 ${stat.color} ${
                isActive
                  ? "shadow-[4px_4px_0px_0px_currentColor] scale-[1.02]"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {stat.icon && <div className="text-xl">{stat.icon}</div>}
              <div>
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs font-black uppercase">{stat.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] overflow-hidden">
        {/* Header + Filter Kategori */}
        <div className="p-4 border-b-4 border-border flex flex-col xl:flex-row xl:items-center gap-4 justify-between bg-muted/10">
          <div className="flex-shrink-0">
            <h2 className="text-lg font-black uppercase">
              Daftar Karya
              {activeStatus !== "all" && (
                <span className="ml-2 text-sm text-primary capitalize">— {activeStatus === "ai_processing" ? "Diperiksa AI" : activeStatus}</span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-bold mt-0.5">
              Menampilkan <span className="text-foreground font-black">{filteredKarya.length}</span> karya
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
            {/* Search Bar */}
            <form method="GET" className="flex items-center gap-2 w-full sm:w-auto">
              {activeStatus !== "all" && <input type="hidden" name="status" value={activeStatus} />}
              {activeCategory !== "all" && <input type="hidden" name="category" value={activeCategory} />}
              <input 
                type="text" 
                name="q" 
                defaultValue={searchQuery} 
                placeholder="Cari judul atau deskripsi..." 
                className="px-3 py-1.5 rounded-xl border-2 border-border bg-background text-xs font-bold w-full sm:w-64 focus:outline-none focus:border-primary shadow-[2px_2px_0px_var(--color-border)]"
              />
              <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground border-2 border-primary text-xs font-black hover:opacity-90 shadow-[2px_2px_0px_var(--color-primary-shadow)]">
                Cari
              </button>
              {searchQuery && (
                <Link href={buildUrl(activeStatus, activeCategory, 1, "")} className="px-3 py-1.5 rounded-xl bg-card text-muted-foreground border-2 border-border text-xs font-black hover:text-foreground hover:bg-muted shadow-[2px_2px_0px_var(--color-border)]">
                  Reset
                </Link>
              )}
            </form>

            {/* Filter Kategori */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1 justify-start xl:justify-end">
              <Link
                href={buildUrl(activeStatus, "all", 1, searchQuery)}
              className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildUrl(activeStatus, cat, 1, searchQuery)}
                className={`px-3 py-1.5 rounded-xl border-2 text-xs font-black transition-all uppercase ${
                  activeCategory === cat
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "bg-muted border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="bg-muted">
              <tr className="border-b-4 border-border text-foreground text-xs font-black uppercase">
                <th className="p-3">Judul</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-center">Status Karya</th>
                <th className="p-3 text-center">Status AI</th>
                <th className="p-3 text-center">Skor AI</th>
                <th className="p-3">Alasan AI</th>
                <th className="p-3 text-center">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border/30">
              {paginatedKarya.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground font-bold">
                    Tidak ada karya yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                paginatedKarya.map((karya) => {
                  const statusCfg = STATUS_CONFIG[karya.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

                  const isAlreadyFinal = (karya.status === "approved" || karya.status === "rejected") && karya.ai_review_status !== "reviewed";
                  const isAiError = karya.ai_review_status === "reviewed" && karya.ai_review_score == null;

                  const aiCfg = isAlreadyFinal
                    ? { label: "➖ Diputuskan Manual", className: "bg-gray-100 text-gray-500 border-gray-300" }
                    : isAiError
                    ? { label: "⚠️ Gagal Diperiksa", className: "bg-red-50 text-red-600 border-red-400" }
                    : AI_STATUS_CONFIG[karya.ai_review_status as keyof typeof AI_STATUS_CONFIG] || AI_STATUS_CONFIG.pending_review;

                  return (
                    <tr key={karya.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 max-w-[250px]">
                        <div className="font-black text-sm text-foreground line-clamp-2 leading-snug">{karya.title}</div>
                        <div className="text-[10px] text-muted-foreground font-bold line-clamp-2 mt-1">{karya.description}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-secondary/10 text-secondary border-2 border-secondary/30 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-block whitespace-nowrap">
                          {karya.category}
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`border-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 whitespace-nowrap ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                        {karya.status === "rejected" && karya.reject_reason && (
                          <div className="text-[9px] text-red-500 mt-1 max-w-[100px] mx-auto line-clamp-2">{karya.reject_reason}</div>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className={`border-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 whitespace-nowrap ${aiCfg.className}`}>
                          {aiCfg.label}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {karya.ai_review_score != null ? (
                          <span className={`text-sm font-black ${
                            karya.ai_review_score >= 70 ? "text-green-600" :
                            karya.ai_review_score >= 40 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {karya.ai_review_score}/100
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs font-bold">-</span>
                        )}
                      </td>
                      <td className="p-3 max-w-[200px]">
                        <p className="text-[10px] text-muted-foreground font-bold line-clamp-2">
                          {karya.ai_review_reason || "-"}
                        </p>
                      </td>
                      <td className="p-3 min-w-[180px]">
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
          <div className="p-4 border-t-4 border-border flex items-center justify-between gap-4 bg-muted/30">
            <p className="text-xs font-bold text-muted-foreground hidden sm:block">
              Halaman <span className="text-foreground font-black">{currentPage}</span> dari <span className="text-foreground font-black">{totalPages}</span>
            </p>
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Link
                href={currentPage > 1 ? buildUrl(activeStatus, activeCategory, currentPage - 1, searchQuery) : "#"}
                className={`px-4 py-2 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                  currentPage > 1
                    ? "bg-card border-border hover:bg-muted text-foreground"
                    : "bg-muted border-border/50 text-muted-foreground opacity-50 cursor-not-allowed pointer-events-none"
                }`}
              >
                Sebelumnya
              </Link>
              <Link
                href={currentPage < totalPages ? buildUrl(activeStatus, activeCategory, currentPage + 1, searchQuery) : "#"}
                className={`px-4 py-2 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                  currentPage < totalPages
                    ? "bg-card border-border hover:bg-muted text-foreground"
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
