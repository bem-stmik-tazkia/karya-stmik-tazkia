"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface ProdiTabProps {
  prodiList: string[];
  searchQuery: string;
  isSubmitting: boolean;
  onAddProdi: (val: string) => Promise<void>;
  onSaveEditProdi: (oldVal: string, newVal: string) => Promise<void>;
  onDeleteClick: (prodi: string) => void;
}

export default function ProdiTab({
  prodiList,
  searchQuery,
  isSubmitting,
  onAddProdi,
  onSaveEditProdi,
  onDeleteClick,
}: ProdiTabProps) {
  const [newProdi, setNewProdi] = useState("");
  const [editingProdi, setEditingProdi] = useState<string | null>(null);
  const [editProdiValue, setEditProdiValue] = useState("");

  const filteredProdi = prodiList.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newProdi.trim();
    if (!val) return;
    await onAddProdi(val);
    setNewProdi("");
  };

  const handleStartEdit = (name: string) => {
    setEditingProdi(name);
    setEditProdiValue(name);
  };

  const handleConfirmEdit = async (oldValue: string) => {
    const val = editProdiValue.trim();
    if (!val || val === oldValue) {
      setEditingProdi(null);
      return;
    }
    await onSaveEditProdi(oldValue, val);
    setEditingProdi(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmitAdd} className="flex gap-3 mb-6 pb-6 border-b border-border">
        <input
          type="text"
          value={newProdi}
          onChange={(e) => setNewProdi(e.target.value)}
          placeholder="Tambah Program Studi baru, mis: Teknik Informatika..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newProdi.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> <span>Tambah</span>
        </button>
      </form>

      {filteredProdi.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-medium text-sm">
          {searchQuery ? "Tidak ada prodi yang cocok dengan pencarian" : "Belum ada program studi."}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredProdi.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3.5 px-2 hover:bg-muted/40 rounded-xl transition-colors group"
            >
              {editingProdi === p ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={editProdiValue}
                    onChange={(e) => setEditProdiValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmEdit(p);
                      if (e.key === "Escape") setEditingProdi(null);
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-primary bg-background font-medium text-xs sm:text-sm outline-none shadow-2xs"
                  />
                  <button
                    onClick={() => handleConfirmEdit(p)}
                    disabled={isSubmitting}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingProdi(null)}
                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono text-xs text-muted-foreground font-semibold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-xs sm:text-sm text-foreground">{p}</span>
                </div>
              )}
              {editingProdi !== p && (
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Ubah Nama"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(p)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

