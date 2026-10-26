"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, Clock, Crown, RotateCcw, Search } from "lucide-react";
import type { ExclusiveBadgeGrant } from "@/lib/badgeService";
import type { GrantToRevokeState } from "./types";

interface CardSkinTableProps {
  skinGrants: ExclusiveBadgeGrant[];
  isSubmitting: boolean;
  onOpenRevokeModal: (grant: GrantToRevokeState) => void;
}

export const CardSkinTable: React.FC<CardSkinTableProps> = ({
  skinGrants,
  isSubmitting,
  onOpenRevokeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredGrants = skinGrants.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (g.recipientName && g.recipientName.toLowerCase().includes(q)) ||
      (g.badgeName && g.badgeName.toLowerCase().includes(q)) ||
      (g.note && g.note.toLowerCase().includes(q)) ||
      (g.recipientEmail && g.recipientEmail.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-foreground">
              Daftar Mahasiswa Pemegang Skin Kartu Eksklusif ({skinGrants.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar seluruh mahasiswa yang telah memiliki hak akses aktif tema Skin Kartu 3D.
          </p>
        </div>
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mahasiswa atau skin..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs outline-none focus:border-amber-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {filteredGrants.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-medium text-sm">
          <Crown className="w-12 h-12 mx-auto mb-2 opacity-30 text-amber-500" />
          {searchQuery
            ? "Tidak ada mahasiswa pemegang skin yang cocok dengan pencarian"
            : "Belum ada mahasiswa yang memegang Skin Kartu Eksklusif. Berikan hak akses pada formulir di atas!"}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Mahasiswa Penerima</th>
                <th className="py-2.5 px-3">Skin &amp; Lencana</th>
                <th className="py-2.5 px-3">Amanah / Catatan</th>
                <th className="py-2.5 px-3">Tanggal Diberikan</th>
                <th className="py-2.5 px-3 text-center">Status Klaim</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredGrants.map((grant) => {
                const isClaimed = Boolean(grant.claimedBy && grant.claimedBy.length > 0);
                const isBem = grant.badgeId === 15;
                const formattedDate = new Date(grant.grantedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={grant.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-2xs ${
                            isBem
                              ? "bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950"
                              : "bg-gradient-to-tr from-cyan-400 to-blue-600 text-white"
                          }`}
                        >
                          {grant.recipientName?.charAt(0) || "M"}
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-tight">
                            {grant.recipientName || "Mahasiswa"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {grant.recipientEmail || grant.recipientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                            isBem
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {isBem ? (
                            <Crown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <Award className="w-3 h-3 text-cyan-500" />
                          )}
                          <span>{grant.badgeName || "Skin Kartu Eksklusif"}</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground pl-0.5">
                          ID Lencana #{grant.badgeId}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-muted-foreground truncate italic">
                        {grant.note || "Amanah Hak Akses Skin Kartu"}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Diterima
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Menunggu Dibuka
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenRevokeModal({
                            id: grant.id,
                            badgeName: grant.badgeName,
                            recipientName: grant.recipientName || "Mahasiswa",
                          })
                        }
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Tarik hak akses skin kartu ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Tarik Skin</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
