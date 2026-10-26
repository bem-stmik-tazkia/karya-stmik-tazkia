"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, GraduationCap } from "lucide-react";
import type { AngkatanItem } from "./types";

interface AngkatanTabProps {
  angkatanList: AngkatanItem[];
  searchQuery: string;
  isSubmitting: boolean;
  onAddAngkatan: (num: string, year: string) => Promise<void>;
  onSaveEditAngkatan: (oldValue: string, num: string, year: string) => Promise<void>;
  onDeleteClick: (item: AngkatanItem) => void;
}

export default function AngkatanTab({
  angkatanList,
  searchQuery,
  isSubmitting,
  onAddAngkatan,
  onSaveEditAngkatan,
  onDeleteClick,
}: AngkatanTabProps) {
  const [newAngkatanNum, setNewAngkatanNum] = useState("");
  const [newAngkatanYear, setNewAngkatanYear] = useState("");
  const [editingAngkatan, setEditingAngkatan] = useState<string | null>(null);
  const [editAngkatanNum, setEditAngkatanNum] = useState("");
  const [editAngkatanYear, setEditAngkatanYear] = useState("");

  const filteredAngkatan = angkatanList.filter(
    (a) =>
      a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.value.includes(searchQuery)
  );

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = newAngkatanNum.trim();
    if (!num) return;
    await onAddAngkatan(num, newAngkatanYear.trim());
    setNewAngkatanNum("");
    setNewAngkatanYear("");
  };

  const handleStartEdit = (item: AngkatanItem) => {
    setEditingAngkatan(item.value);
    setEditAngkatanNum(item.value);
    const yearMatch = item.label.match(/\((\d{4})\)/);
    setEditAngkatanYear(yearMatch ? yearMatch[1] : "");
  };

  const handleConfirmEdit = async (oldValue: string) => {
    const num = editAngkatanNum.trim();
    if (!num) {
      setEditingAngkatan(null);
      return;
    }
    await onSaveEditAngkatan(oldValue, num, editAngkatanYear.trim());
    setEditingAngkatan(null);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs">
      <form
        onSubmit={handleSubmitAdd}
        className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 pb-6 border-b border-border"
      >
        <div className="sm:col-span-4">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Nomor Angkatan *
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={newAngkatanNum}
            onChange={(e) => setNewAngkatanNum(e.target.value)}
            placeholder="mis: 3"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all shadow-2xs"
          />
        </div>
        <div className="sm:col-span-5">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Tahun Masuk (Opsional)
          </label>
          <input
            type="text"
            maxLength={4}
            value={newAngkatanYear}
            onChange={(e) => setNewAngkatanYear(e.target.value)}
            placeholder="mis: 2026"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-medium text-xs sm:text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all shadow-2xs"
          />
        </div>
        <div className="sm:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={isSubmitting || !newAngkatanNum.trim()}
            className="w-full flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs sm:text-sm shadow-xs hover:bg-[#1a365d] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>Tambah</span>
          </button>
        </div>
      </form>

      {filteredAngkatan.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-medium text-sm">
          {searchQuery ? "Tidak ada angkatan yang cocok dengan pencarian" : "Belum ada angkatan."}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filteredAngkatan.map((item, idx) => (
            <div
              key={item.value}
              className="flex items-center justify-between py-3.5 px-2 hover:bg-muted/40 rounded-xl transition-colors group"
            >
              {editingAngkatan === item.value ? (
                <div className="flex flex-wrap items-center gap-2 flex-1 mr-4">
                  <span className="text-xs font-semibold text-muted-foreground">Angkatan</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={editAngkatanNum}
                    onChange={(e) => setEditAngkatanNum(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-lg border border-secondary bg-background font-medium text-xs sm:text-sm outline-none shadow-2xs"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">Tahun</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={editAngkatanYear}
                    onChange={(e) => setEditAngkatanYear(e.target.value)}
                    placeholder="2026"
                    className="w-24 px-3 py-1.5 rounded-lg border border-secondary bg-background font-medium text-xs sm:text-sm outline-none shadow-2xs"
                  />
                  <button
                    onClick={() => handleConfirmEdit(item.value)}
                    disabled={isSubmitting}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingAngkatan(null)}
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
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-secondary/70" />
                    <span className="font-semibold text-xs sm:text-sm text-foreground">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      ID: {item.value}
                    </span>
                  </div>
                </div>
              )}
              {editingAngkatan !== item.value && (
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                    title="Ubah Angkatan"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(item)}
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

