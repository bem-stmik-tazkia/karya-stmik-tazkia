"use client";

import React from "react";
import { Globe, Info, Eye } from "lucide-react";

export const MaintenanceInfoCard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Preview button */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Pratinjau Halaman</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Lihat tampilan halaman maintenance yang akan dilihat pengunjung.
        </p>
        <a
          href="/maintenance"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:bg-muted/70 hover:border-primary/40 transition-all shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>Buka Halaman Maintenance</span>
        </a>
      </div>

      {/* Info card */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Informasi Sistem</h3>
        </div>
        <ul className="space-y-2">
          {[
            { icon: "🔒", text: "Aktifkan sakelar untuk redirect semua pengunjung ke halaman maintenance" },
            { icon: "🛡️", text: "Admin dan rute /admin tetap dapat diakses tanpa hambatan" },
            { icon: "⏱️", text: "Tentukan estimasi waktu agar pengunjung mendapat kejelasan durasi" },
            { icon: "💾", text: "Simpan pengaturan sebelum mengaktifkan untuk memperbarui data" },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

