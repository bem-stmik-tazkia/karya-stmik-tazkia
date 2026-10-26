"use client";

import React from "react";
import { Send } from "lucide-react";

interface TelegramTabProps {
  telegramToken: string;
  telegramChatId: string;
  setTelegramToken: (val: string) => void;
  setTelegramChatId: (val: string) => void;
  isSubmitting: boolean;
  onSave: (e: React.FormEvent) => Promise<void>;
}

export default function TelegramTab({
  telegramToken,
  telegramChatId,
  setTelegramToken,
  setTelegramChatId,
  isSubmitting,
  onSave,
}: TelegramTabProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs max-w-2xl">
      <div className="mb-6 pb-6 border-b border-border">
        <h2 className="text-base font-bold text-foreground mb-1">
          Pengaturan Notifikasi Telegram
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Konfigurasikan bot Telegram agar grup atau admin menerima notifikasi otomatis ketika ada
          karya baru yang disubmit.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
            Telegram Bot Token *
          </label>
          <input
            type="password"
            value={telegramToken}
            onChange={(e) => setTelegramToken(e.target.value)}
            placeholder="mis: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-mono text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Dapatkan token dari{" "}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @BotFather
            </a>{" "}
            di Telegram.
          </p>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
            Telegram Chat ID / Group ID *
          </label>
          <input
            type="text"
            value={telegramChatId}
            onChange={(e) => setTelegramChatId(e.target.value)}
            placeholder="mis: -1001234567890 atau ID user Anda"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background font-mono text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            ID grup (biasanya diawali tanda minus) atau ID pengguna penerima notifikasi.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 flex justify-center items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Pengaturan Telegram"}</span>
        </button>
      </form>
    </div>
  );
}

