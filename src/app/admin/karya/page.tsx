import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";
import { FiCpu, FiCheckCircle, FiXCircle, FiList } from "react-icons/fi";
import Link from "next/link";

export const revalidate = 0;

const STATUS_CONFIG = {
  approved: { label: "✅ Publik", className: "bg-green-100 text-green-700 border-green-700" },
  rejected: { label: "❌ Ditolak", className: "bg-red-100 text-red-700 border-red-700" },
  pending: { label: "⏳ Menunggu", className: "bg-yellow-100 text-yellow-800 border-yellow-700" },
};

const AI_STATUS_CONFIG = {
  processing: { label: "🤖 Sedang Diperiksa", className: "bg-blue-100 text-blue-700 border-blue-500 animate-pulse" },
  pending_review: { label: "🕐 Dalam Antrean", className: "bg-gray-100 text-gray-600 border-gray-400" },
  reviewed: { label: "✔️ Sudah Diperiksa", className: "bg-green-50 text-green-600 border-green-400" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string }>;
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
    .single();

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

  let filteredKarya = allKarya || [];
  if (activeStatus === "pending") filteredKarya = filteredKarya.filter(k => k.status === "pending");
  else if (activeStatus === "approved") filteredKarya = filteredKarya.filter(k => k.status === "approved");
  else if (activeStatus === "rejected") filteredKarya = filteredKarya.filter(k => k.status === "rejected");
  else if (activeStatus === "ai_processing") filteredKarya = filteredKarya.filter(k => k.ai_review_status === "processing");

  if (activeCategory !== "all") filteredKarya = filteredKarya.filter(k => k.category === activeCategory);

  // Helper untuk membangun URL filter
  const buildUrl = (status?: string, category?: string) => {
    const p = new URLSearchParams();
    const s = status ?? activeStatus;
    const c = category ?? activeCategory;
    if (s && s !== "all") p.set("status", s);
    if (c && c !== "all") p.set("category", c);
    const qs = p.toString();
    return `/admin/karya${qs ? `?${qs}` : ""}`;
  };

  const statCards = [
    { label: "Semua", value: totalAll, color: "text-foreground bg-card border-border", statusKey: "all" },
    { icon: <FiList />, label: "Menunggu", value: totalPending, color: "text-yellow-600 bg-yellow-100 border-yellow-600", statusKey: "pending" },
    { icon: <FiCpu />, label: "Diperiksa AI", value: totalAiProcessing, color: "text-blue-600 bg-blue-100 border-blue-600", statusKey: "ai_processing" },
    { icon: <FiCheckCircle />, label: "Disetujui", value: totalApproved, color: "text-green-600 bg-green-100 border-green-600", statusKey: "approved" },
    { icon: <FiXCircle />, label: "Ditolak", value: totalRejected, color: "text-red-600 bg-red-100 border-red-600", statusKey: "rejected" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
        <div className="p-4 border-b-4 border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
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

          {/* Filter Kategori */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-muted-foreground uppercase">Kategori:</span>
            <Link
              href={buildUrl(activeStatus, "all")}
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
                href={buildUrl(activeStatus, cat)}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted border-b-4 border-border text-foreground text-xs font-black uppercase">
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
              {filteredKarya.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground font-bold">
                    Tidak ada karya yang cocok dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredKarya.map((karya) => {
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
                      <td className="p-3 max-w-[200px]">
                        <div className="font-black text-sm text-foreground line-clamp-1">{karya.title}</div>
                        <div className="text-[10px] text-muted-foreground font-bold line-clamp-1">{karya.description}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-secondary/10 text-secondary border-2 border-secondary/30 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                          {karya.category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`border-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                        {karya.status === "rejected" && karya.reject_reason && (
                          <div className="text-[9px] text-red-500 mt-1 max-w-[100px] mx-auto line-clamp-2">{karya.reject_reason}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`border-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${aiCfg.className}`}>
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
                      <td className="p-3">
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
      </div>
    </div>
  );
}
