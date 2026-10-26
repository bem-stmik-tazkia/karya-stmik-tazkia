"use client";

import React from "react";
import { MessageSquare, Info } from "lucide-react";

interface AnnouncementSettingsCardProps {
  announcementActive: boolean;
  announcementMessage: string;
  appVersion: string;
  onUpdateField: (key: "announcementActive" | "announcementMessage" | "appVersion", value: any) => void;
}

export const AnnouncementSettingsCard: React.FC<AnnouncementSettingsCardProps> = ({
  announcementActive,
  announcementMessage,
  appVersion,
  onUpdateField,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 mb-6 shadow-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Pengumuman Setelah Maintenance</h2>
          <p className="text-xs text-muted-foreground">Banner pemberitahuan yang muncul di semua halaman.</p>
        </div>
      </div>

      {/* Toggle Announcement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-xl border border-border bg-muted/20">
        <div>
          <h3 className="font-semibold text-sm">Status Banner</h3>
          <p className="text-xs text-muted-foreground">Aktifkan untuk menampilkan banner pengumuman.</p>
        </div>
        <button
          onClick={() => onUpdateField("announcementActive", !announcementActive)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors duration-200 ease-in-out ${
            announcementActive ? "bg-primary" : "bg-muted"
          }`}
          role="switch"
          aria-checked={announcementActive}
        >
          <span className="sr-only">Toggle banner pengumuman</span>
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              announcementActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Announcement Message & Version */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Isi Pengumuman *
          </label>
          <textarea
            value={announcementMessage}
            onChange={(e) => onUpdateField("announcementMessage", e.target.value)}
            rows={2}
            placeholder="Tulis pengumuman baru..."
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-medium text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-2xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Versi *
          </label>
          <input
            type="text"
            value={appVersion}
            onChange={(e) => onUpdateField("appVersion", e.target.value)}
            placeholder="v1.2.0"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-medium text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Info className="w-3 h-3" />
        <p className="text-[11px] font-normal">
          Gunakan tombol &quot;Simpan Pengaturan&quot; di atas untuk menyimpan perubahan banner pengumuman.
        </p>
      </div>
    </div>
  );
};

