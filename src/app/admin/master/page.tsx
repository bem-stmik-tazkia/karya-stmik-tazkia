"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  Plus,
  Trash2,
  Search,
  X,
  GraduationCap,
  Pencil,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_PRODI = ["Teknik Informatika", "Sistem Informasi", "Bisnis Digital"];

interface AngkatanItem {
  value: string;
  label: string;
}

const DEFAULT_ANGKATAN: AngkatanItem[] = [
  { value: "1", label: "Angkatan 1" },
  { value: "2", label: "Angkatan 2" },
];

function parseAngkatan(raw: string): AngkatanItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ANGKATAN;
    if (typeof parsed[0] === "string") {
      return parsed.map((v: string) => ({ value: v, label: `Angkatan ${v}` }));
    }
    return parsed as AngkatanItem[];
  } catch {
    return DEFAULT_ANGKATAN;
  }
}

export default function AdminMasterPage() {
  const [activeTab, setActiveTab] = useState<"prodi" | "angkatan">("prodi");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [prodiList, setProdiList] = useState<string[]>(DEFAULT_PRODI);
  const [angkatanList, setAngkatanList] = useState<AngkatanItem[]>(DEFAULT_ANGKATAN);

  // Add form: Prodi
  const [newProdi, setNewProdi] = useState("");

  // Add form: Angkatan
  const [newAngkatanNum, setNewAngkatanNum] = useState("");
  const [newAngkatanYear, setNewAngkatanYear] = useState("");

  // Edit state: Prodi (inline)
  const [editingProdi, setEditingProdi] = useState<string | null>(null);
  const [editProdiValue, setEditProdiValue] = useState("");

  // Edit state: Angkatan (inline)
  const [editingAngkatan, setEditingAngkatan] = useState<string | null>(null); // value key
  const [editAngkatanNum, setEditAngkatanNum] = useState("");
  const [editAngkatanYear, setEditAngkatanYear] = useState("");

  // Delete
  const [deleteItem, setDeleteItem] = useState<{ type: "prodi"; value: string } | { type: "angkatan"; item: AngkatanItem } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["master_prodi", "master_angkatan"]);

    if (!error && data) {
      const prodiRow = data.find((d) => d.key === "master_prodi");
      const angkatanRow = data.find((d) => d.key === "master_angkatan");
      if (prodiRow?.value) {
        try { setProdiList(JSON.parse(prodiRow.value)); } catch { setProdiList(DEFAULT_PRODI); }
      }
      if (angkatanRow?.value) {
        setAngkatanList(parseAngkatan(angkatanRow.value));
      }
    } else if (error) {
      toast.error("Gagal memuat data master.");
    }
    setLoading(false);
  };

  const saveProdi = async (updated: string[]) => {
    const { error } = await supabase.from("system_settings")
      .upsert({ key: "master_prodi", value: JSON.stringify(updated) }, { onConflict: "key" });
    return error;
  };

  const saveAngkatan = async (updated: AngkatanItem[]) => {
    const { error } = await supabase.from("system_settings")
      .upsert({ key: "master_angkatan", value: JSON.stringify(updated) }, { onConflict: "key" });
    return error;
  };

  // ---- ADD PRODI ----
  const handleAddProdi = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newProdi.trim();
    if (!val) return;
    if (prodiList.some((p) => p.toLowerCase() === val.toLowerCase())) {
      toast.error(`"${val}" sudah ada!`); return;
    }
    setIsSubmitting(true);
    const updated = [...prodiList, val];
    const error = await saveProdi(updated);
    if (error) { toast.error("Gagal menambahkan."); }
    else { setProdiList(updated); setNewProdi(""); toast.success(`"${val}" ditambahkan! 🎉`); }
    setIsSubmitting(false);
  };

  // ---- EDIT PRODI ----
  const startEditProdi = (item: string) => {
    setEditingProdi(item);
    setEditProdiValue(item);
    // close any angkatan edit
    setEditingAngkatan(null);
  };

  const handleSaveEditProdi = async (oldValue: string) => {
    const newVal = editProdiValue.trim();
    if (!newVal) { setEditingProdi(null); return; }
    if (newVal === oldValue) { setEditingProdi(null); return; }
    if (prodiList.some((p) => p !== oldValue && p.toLowerCase() === newVal.toLowerCase())) {
      toast.error(`"${newVal}" sudah ada!`); return;
    }
    setIsSubmitting(true);
    const updated = prodiList.map((p) => (p === oldValue ? newVal : p));
    const error = await saveProdi(updated);
    if (error) { toast.error("Gagal menyimpan."); }
    else { setProdiList(updated); setEditingProdi(null); toast.success("Prodi diperbarui! ✨"); }
    setIsSubmitting(false);
  };

  // ---- ADD ANGKATAN ----
  const composedLabel = newAngkatanNum
    ? `Angkatan ${newAngkatanNum}${newAngkatanYear ? ` (${newAngkatanYear})` : ""}`
    : "";

  const handleAddAngkatan = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = newAngkatanNum.trim();
    if (!num) return;
    if (angkatanList.some((a) => a.value === num)) {
      toast.error(`Angkatan ${num} sudah ada!`); return;
    }
    const newItem: AngkatanItem = { value: num, label: composedLabel };
    setIsSubmitting(true);
    const updated = [...angkatanList, newItem].sort((a, b) => Number(a.value) - Number(b.value));
    const error = await saveAngkatan(updated);
    if (error) { toast.error("Gagal menambahkan."); }
    else { setAngkatanList(updated); setNewAngkatanNum(""); setNewAngkatanYear(""); toast.success(`${newItem.label} ditambahkan! 🎉`); }
    setIsSubmitting(false);
  };

  // ---- EDIT ANGKATAN ----
  const startEditAngkatan = (item: AngkatanItem) => {
    setEditingAngkatan(item.value);
    setEditAngkatanNum(item.value);
    // Try to extract year from label like "Angkatan 1 (2024)"
    const match = item.label.match(/\((\d{4})\)/);
    setEditAngkatanYear(match ? match[1] : "");
    // close prodi edit
    setEditingProdi(null);
  };

  const handleSaveEditAngkatan = async (oldValue: string) => {
    const num = editAngkatanNum.trim();
    if (!num) { setEditingAngkatan(null); return; }
    const newLabel = `Angkatan ${num}${editAngkatanYear ? ` (${editAngkatanYear})` : ""}`;
    // Check duplicate value (only if changed)
    if (num !== oldValue && angkatanList.some((a) => a.value === num)) {
      toast.error(`Angkatan ${num} sudah ada!`); return;
    }
    setIsSubmitting(true);
    const updated = angkatanList.map((a) =>
      a.value === oldValue ? { value: num, label: newLabel } : a
    ).sort((a, b) => Number(a.value) - Number(b.value));
    const error = await saveAngkatan(updated);
    if (error) { toast.error("Gagal menyimpan."); }
    else { setAngkatanList(updated); setEditingAngkatan(null); toast.success("Angkatan diperbarui! ✨"); }
    setIsSubmitting(false);
  };

  // ---- DELETE ----
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Menghapus...");
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
    if (error) { toast.error("Gagal menghapus.", { id: toastId }); }
    else { toast.success("Dihapus! 🗑️", { id: toastId }); setDeleteItem(null); }
    setIsSubmitting(false);
  };

  const filteredProdi = prodiList.filter((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredAngkatan = angkatanList.filter((a) =>
    a.label.toLowerCase().includes(searchQuery.toLowerCase()) || a.value.includes(searchQuery)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-secondary text-secondary-foreground border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">Kelola Data Master</h1>
          <p className="text-xs sm:text-sm font-bold text-muted-foreground">Pengaturan Jurusan/Prodi dan Angkatan Mahasiswa STMIK Tazkia.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="card-3d bg-card border-4 border-border rounded-3xl p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-muted p-1.5 rounded-2xl border-2 border-border">
            <button
              onClick={() => { setActiveTab("prodi"); setSearchQuery(""); setEditingProdi(null); setEditingAngkatan(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase transition-all ${activeTab === "prodi"
                  ? "bg-primary text-primary-foreground border-2 border-border shadow-[3px_3px_0px_0px_var(--color-border)]"
                  : "text-muted-foreground hover:text-foreground border-2 border-transparent"}`}
            >
              <Building2 className="w-4 h-4" /> Program Studi ({prodiList.length})
            </button>
            <button
              onClick={() => { setActiveTab("angkatan"); setSearchQuery(""); setEditingProdi(null); setEditingAngkatan(null); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase transition-all ${activeTab === "angkatan"
                  ? "bg-secondary text-secondary-foreground border-2 border-border shadow-[3px_3px_0px_0px_var(--color-border)]"
                  : "text-muted-foreground hover:text-foreground border-2 border-transparent"}`}
            >
              <Calendar className="w-4 h-4" /> Angkatan ({angkatanList.length})
            </button>
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari ${activeTab === "prodi" ? "jurusan..." : "angkatan..."}`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-background font-bold text-xs sm:text-sm outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-3d bg-card border-4 border-border rounded-3xl p-16 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-muted-foreground text-sm">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* ---- PRODI TAB ---- */}
          {activeTab === "prodi" && (
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8">
              <form onSubmit={handleAddProdi} className="flex gap-3 mb-6 pb-6 border-b-2 border-border">
                <input type="text" value={newProdi} onChange={(e) => setNewProdi(e.target.value)}
                  placeholder="Tambah Program Studi baru, mis: Teknik Informatika..."
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-primary transition-all disabled:opacity-50"
                />
                <button type="submit" disabled={!newProdi.trim() || isSubmitting}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm border-3 border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-y-0.5 transition-all disabled:opacity-50 shrink-0">
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span className="hidden sm:block">Tambah</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProdi.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground font-bold text-sm">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada Program Studi"}
                  </div>
                ) : filteredProdi.map((item, idx) => (
                  <motion.div key={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="p-4 rounded-2xl bg-muted border-2 border-border group hover:border-primary transition-all"
                  >
                    {editingProdi === item ? (
                      // Inline Edit Mode
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editProdiValue}
                          onChange={(e) => setEditProdiValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditProdi(item); if (e.key === "Escape") setEditingProdi(null); }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 rounded-lg border-2 border-primary bg-background font-bold text-sm outline-none"
                        />
                        <button onClick={() => handleSaveEditProdi(item)} disabled={isSubmitting}
                          className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingProdi(null)}
                          className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary text-primary flex items-center justify-center font-black text-xs shrink-0">
                            {item.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-foreground">{item}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEditProdi(item)}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteItem({ type: "prodi", value: item })}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ---- ANGKATAN TAB ---- */}
          {activeTab === "angkatan" && (
            <div className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8">
              {/* Add Form */}
              <form onSubmit={handleAddAngkatan} className="mb-6 pb-6 border-b-2 border-border space-y-3">
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex flex-col gap-1 w-36 shrink-0">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Angkatan Ke-*</label>
                    <input type="number" min="1" value={newAngkatanNum} onChange={(e) => setNewAngkatanNum(e.target.value)}
                      placeholder="1, 2, 3..." disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-secondary transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wide">Tahun (Opsional)</label>
                    <input type="text" value={newAngkatanYear} onChange={(e) => setNewAngkatanYear(e.target.value)}
                      placeholder="mis: 2024, 2025..." disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-secondary transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 justify-end">
                    <button type="submit" disabled={!newAngkatanNum.trim() || isSubmitting}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary text-secondary-foreground font-black text-sm border-3 border-border shadow-[3px_3px_0px_0px_var(--color-border)] hover:translate-y-0.5 transition-all disabled:opacity-50">
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
                {composedLabel && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 border-2 border-secondary/30">
                    <span className="text-xs font-black text-muted-foreground uppercase">Preview:</span>
                    <span className="text-sm font-black text-secondary">{composedLabel}</span>
                  </div>
                )}
              </form>

              {/* List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredAngkatan.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground font-bold text-sm">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada Angkatan"}
                  </div>
                ) : filteredAngkatan.map((item, idx) => (
                  <motion.div key={item.value} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="p-4 rounded-2xl bg-muted border-2 border-border group hover:border-secondary transition-all"
                  >
                    {editingAngkatan === item.value ? (
                      // Inline Edit Mode
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex flex-col gap-1 w-24 shrink-0">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">Angkatan</label>
                            <input type="number" value={editAngkatanNum} onChange={(e) => setEditAngkatanNum(e.target.value)}
                              autoFocus
                              className="w-full px-2 py-1.5 rounded-lg border-2 border-secondary bg-background font-bold text-sm outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[9px] font-black uppercase text-muted-foreground">Tahun</label>
                            <input type="text" value={editAngkatanYear} onChange={(e) => setEditAngkatanYear(e.target.value)}
                              placeholder="2024"
                              onKeyDown={(e) => { if (e.key === "Enter") handleSaveEditAngkatan(item.value); if (e.key === "Escape") setEditingAngkatan(null); }}
                              className="w-full px-2 py-1.5 rounded-lg border-2 border-secondary bg-background font-bold text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEditAngkatan(item.value)} disabled={isSubmitting}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-black text-xs transition-colors disabled:opacity-50">
                            <Check className="w-3.5 h-3.5" /> Simpan
                          </button>
                          <button onClick={() => setEditingAngkatan(null)}
                            className="px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground font-black text-xs hover:bg-muted/80 transition-colors">
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display Mode
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-secondary/10 border-2 border-secondary text-secondary flex items-center justify-center font-black text-base shrink-0">
                          #{item.value}
                        </div>
                        <span className="font-bold text-sm text-foreground flex-1 leading-tight">{item.label}</span>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button onClick={() => startEditAngkatan(item)}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteItem({ type: "angkatan", item })}
                            className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setDeleteItem(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-card border-4 border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_var(--color-border)] z-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 border-4 border-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2 uppercase">Hapus Data?</h3>
              <p className="text-xs sm:text-sm font-bold text-muted-foreground mb-6 leading-relaxed">
                Apakah kamu yakin ingin menghapus{" "}
                <span className="text-foreground underline decoration-red-500">
                  {deleteItem.type === "angkatan" ? deleteItem.item.label : deleteItem.value}
                </span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteItem(null)} disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase bg-muted border-2 border-border hover:bg-muted/80 disabled:opacity-50">
                  Batal
                </button>
                <button onClick={handleConfirmDelete} disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase text-white bg-red-500 border-2 border-red-700 shadow-[3px_3px_0px_0px_#991b1b] hover:bg-red-600 disabled:opacity-50">
                  {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
