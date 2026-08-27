"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  Sun,
  Moon,
} from "lucide-react";
import { downloadTransparentQr, getQrPreviewUrl, type QrDownloadTheme } from "@/utils/qrDownload";

interface ShareProfileModalProps {
  /** nama lengkap mahasiswa untuk label file download & pesan share */
  studentName: string;
  /** URL lengkap halaman profil yang akan di-encode di QR */
  shareUrl: string;
  onClose: () => void;
}

export default function ShareProfileModal({
  studentName,
  shareUrl,
  onClose,
}: ShareProfileModalProps) {
  const [qrTheme, setQrTheme] = useState<QrDownloadTheme>("dark");
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadedQR, setDownloadedQR] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const qrSrc = getQrPreviewUrl(shareUrl, qrTheme, 200);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    setIsDownloading(true);
    try {
      await downloadTransparentQr(
        shareUrl,
        qrTheme,
        `QR_Profile_${studentName.replace(/\s+/g, "_")}.png`
      );
      setDownloadedQR(true);
      setTimeout(() => setDownloadedQR(false), 3000);
    } catch (err) {
      console.error("Gagal download QR:", err);
      alert("Gagal mengunduh QR Code. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  const encodedMessage = encodeURIComponent(
    `Lihat portofolio ${studentName} di Karya STMIK Tazkia: ${shareUrl}`
  );

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 16 }}
          transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
          className="relative w-full max-w-sm bg-card border-4 border-border rounded-3xl shadow-[6px_6px_0px_var(--color-border)] flex flex-col items-center p-6 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-muted border-2 border-border flex items-center justify-center hover:bg-destructive hover:text-white transition-all shadow-[2px_2px_0px_var(--color-border)]"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-1 mt-2">
            <div className="p-2 rounded-xl bg-primary/10 border-2 border-border">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
              Share Profil
            </h3>
          </div>
          <p className="text-xs text-muted-foreground text-center mb-5 font-medium">
            Bagikan link atau scan QR Code di bawah ini
          </p>

          {/* QR Preview Area */}
          <div
            className={`w-full rounded-2xl border-4 border-border shadow-[3px_3px_0px_var(--color-border)] mb-4 overflow-hidden transition-colors duration-300 ${qrTheme === "dark" ? "bg-[#111]" : "bg-white"
              }`}
          >
            {/* Theme Toggle */}
            <div className="flex gap-1 p-2 bg-muted border-b-2 border-border">
              <button
                onClick={() => setQrTheme("dark")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${qrTheme === "dark"
                  ? "bg-foreground text-background shadow-[2px_2px_0px_var(--color-border)]"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Moon className="w-3 h-3" />
                Dark
              </button>
              <button
                onClick={() => setQrTheme("light")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all ${qrTheme === "light"
                  ? "bg-white text-black border-2 border-border shadow-[2px_2px_0px_var(--color-border)]"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Sun className="w-3 h-3" />
                Light
              </button>
            </div>

            {/* QR Image */}
            <div className="flex items-center justify-center p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt={`QR Code profil ${studentName}`}
                className="w-44 h-44 rounded-lg"
                key={qrSrc}
              />
            </div>

            {/* Download Button */}
            <div className="px-4 pb-4">
              <button
                onClick={handleDownloadQR}
                disabled={isDownloading}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-border text-xs font-black uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-none disabled:opacity-60 ${downloadedQR
                  ? "bg-secondary text-white border-secondary"
                  : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  }`}
              >
                {downloadedQR ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Berhasil Diunduh!
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    {isDownloading ? "Mengunduh..." : "Unduh QR (PNG Transparan)"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex gap-2 w-full mb-4">
            {/* WhatsApp */}
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodedMessage}`,
                  "_blank"
                )
              }
              title="Bagikan ke WhatsApp"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-border bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white font-black text-xs uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-none"
            >
              {/* WhatsApp SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WA
            </button>

            {/* Telegram */}
            <button
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Lihat portofolio ${studentName}`)}`,
                  "_blank"
                )
              }
              title="Bagikan ke Telegram"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-border bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white font-black text-xs uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-none"
            >
              {/* Telegram SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              TG
            </button>

            {/* X (Twitter) */}
            <button
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Lihat portofolio ${studentName} di Karya STMIK Tazkia`)}`,
                  "_blank"
                )
              }
              title="Bagikan ke X (Twitter)"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-border bg-muted text-foreground hover:bg-foreground hover:text-background font-black text-xs uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-none"
            >
              {/* X (Twitter) SVG */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X
            </button>
          </div>

          {/* Copy Link */}
          <div className="w-full flex items-center bg-muted border-2 border-border rounded-xl overflow-hidden shadow-[2px_2px_0px_var(--color-border)] gap-0">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 py-2.5 text-xs text-muted-foreground outline-none font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase border-l-2 border-border transition-all ${copiedLink
                ? "bg-secondary text-white"
                : "bg-primary text-primary-foreground hover:brightness-110"
                }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
