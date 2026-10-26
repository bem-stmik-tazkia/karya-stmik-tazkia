"use client";

import React from "react";
import { Users, Check, X } from "lucide-react";
import type { CollabRequest } from "@/lib/collabService";

interface DashboardCollabBannerProps {
  isOwnProfile: boolean;
  pendingCollabRequests: CollabRequest[];
  onAccept: (req: CollabRequest) => void;
  onReject: (req: CollabRequest) => void;
}

export function DashboardCollabBanner({
  isOwnProfile,
  pendingCollabRequests,
  onAccept,
  onReject,
}: DashboardCollabBannerProps) {
  if (!isOwnProfile || pendingCollabRequests.length === 0) return null;

  const currentReq = pendingCollabRequests[0];

  return (
    <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-primary/10 border-2 border-blue-500/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
          <Users className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-foreground">
              Undangan Kolaborasi Tim Projek!
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
              {pendingCollabRequests.length} Undangan Baru
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            <strong>{currentReq.inviterName}</strong> mengundang Anda bergabung ke projek{" "}
            <em>&ldquo;{currentReq.karyaTitle}&rdquo;</em> sebagai{" "}
            <strong>{currentReq.role || "Anggota Tim"}</strong>.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onAccept(currentReq)}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Terima Kolaborasi</span>
        </button>
        <button
          type="button"
          onClick={() => onReject(currentReq)}
          className="px-3.5 py-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-rose-500 hover:border-rose-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Tolak</span>
        </button>
      </div>
    </div>
  );
}

