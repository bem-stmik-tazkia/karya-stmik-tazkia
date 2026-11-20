"use client";

import React, { useState } from "react";
import { Send, Key, CheckCircle2, RotateCcw } from "lucide-react";

interface TelegramTabProps {
  telegramToken: string;
  telegramChatId: string;
  setTelegramToken: (val: string) => void;
  setTelegramChatId: (val: string) => void;
  isSubmitting: boolean;
  onSave: (e: React.FormEvent, overrideToken?: string) => Promise<void>;
}

export default function TelegramTab({
  telegramToken,
  telegramChatId,
  setTelegramToken,
  setTelegramChatId,
  isSubmitting,
  onSave,
}: TelegramTabProps) {
  const [isChangingToken, setIsChangingToken] = useState(false);
  const [newTokenInput, setNewTokenInput] = useState("");

  const hasConfiguredToken = Boolean(telegramToken && telegramToken.trim().length > 0);

  // Masking format: ••••1a2b (4 dot + 4 karakter terakhir)
  const getMaskedToken = (token: string): string => {
    const trimmed = token.trim();
    if (!trimmed) return "";
    if (trimmed.length <= 4) return "••••";
    return `••••${trimmed.slice(-4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingToken) {
      const finalToken = newTokenInput.trim() || telegramToken;
      await onSave(e, finalToken);
      setIsChangingToken(false);
      setNewTokenInput("");
    } else {
      await onSave(e);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-xs max-w-2xl">
      <div className="mb-6 pb-6 border-b border-border">
        <h2 className="text-base font-bold text-foreground mb-1">
          Pengaturan Notifikasi Telegram
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Konfigurasikan bot Telegram agar grup atau admin menerima notifikasi otomatis ketika ada
          karya baru yang disubmit. Token disimpan secara dinamis di database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
            Telegram Bot Token *
          </label>

          {hasConfiguredToken && !isChangingToken ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-muted/50 font-mono text-xs sm:text-sm">
                <span className="text-foreground tracking-wider font-semibold">
                  {getMaskedToken(telegramToken)}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terkonfigurasi</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsChangingToken(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:border-primary/40 hover:bg-muted transition-all shadow-2xs shrink-0 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-primary" />
                <span>Ganti Token</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={isChangingToken ? newTokenInput : telegramToken}
                  onChange={(e) => {
                    if (isChangingToken) {
                      setNewTokenInput(e.target.value);
                    } else {
                      setTelegramToken(e.target.value);
                    }
                  }}
                  placeholder={
                    isChangingToken
                      ? "Masukkan Bot Token baru..."
                      : "mis: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background font-mono text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-2xs"
                  autoFocus={isChangingToken}
                />
                {isChangingToken && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingToken(false);
                      setNewTokenInput("");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-muted transition-all shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Batal</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mt-1.5">
            Dapatkan token dari{" "}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @BotFather
            </a>{" "}
            di Telegram. Nilai token tidak pernah ditampilkan dalam teks terbuka demi keamanan.
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
