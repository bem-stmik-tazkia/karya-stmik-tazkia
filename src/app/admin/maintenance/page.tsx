"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Power,
  PowerOff,
  Clock,
  MessageSquare,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Globe,
  Eye,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

interface MaintenanceState {
  active: boolean;
  message: string;
  endTime: string;
  announcementActive: boolean;
  announcementMessage: string;
  appVersion: string;
}

const DEFAULT_MESSAGES = [
  "Kami sedang melakukan pemeliharaan sistem untuk meningkatkan performa.",
  "Update sistem sedang berlangsung. Kami akan segera kembali.",
  "Sedang ada perbaikan infrastruktur. Mohon bersabar.",
];

export default function AdminMaintenancePage() {
  const [state, setState] = useState<MaintenanceState>({
    active: false,
    message: DEFAULT_MESSAGES[0],
    endTime: "",
    announcementActive: false,
    announcementMessage: "🚀 Update Baru! Kami telah menambahkan fitur-fitur baru setelah maintenance. Selamat menjelajahi Karya Tazkia!",
    appVersion: "v1.0.0",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", [
        "maintenance_mode", 
        "maintenance_message", 
        "maintenance_end_time",
        "announcement_active",
        "announcement_message",
        "app_version"
      ]);

    if (error) {
      toast.error("Gagal memuat pengaturan.");
    } else if (data) {
      const settings: Record<string, string> = {};
      data.forEach((row) => { settings[row.key] = row.value; });

      setState({
        active: settings["maintenance_mode"] === "true",
        message: settings["maintenance_message"] || DEFAULT_MESSAGES[0],
        endTime: settings["maintenance_end_time"] || "",
        announcementActive: settings["announcement_active"] === "true",
        announcementMessage: settings["announcement_message"] || "🚀 Update Baru! Kami telah menambahkan fitur-fitur baru setelah maintenance. Selamat menjelajahi Karya Tazkia!",
        appVersion: settings["app_version"] || "v1.0.0",
      });
    }
    setLoading(false);
    setIsDirty(false);
  };

  const updateField = <K extends keyof MaintenanceState>(
    key: K,
    value: MaintenanceState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Menyimpan pengaturan...");

    const upsertData = [
      { key: "maintenance_message", value: state.message },
      { key: "maintenance_end_time", value: state.endTime || "" },
      { key: "announcement_active", value: state.announcementActive.toString() },
      { key: "announcement_message", value: state.announcementMessage },
      { key: "app_version", value: state.appVersion },
    ];

    const { error } = await supabase
      .from("system_settings")
      .upsert(upsertData, { onConflict: "key" });

    if (error) {
      toast.error("Gagal menyimpan.", { id: toastId });
    } else {
      toast.success("Pengaturan tersimpan! ✅", { id: toastId });
      setIsDirty(false);
    }
    setIsSaving(false);
  };

  const toggleMaintenance = async () => {
    setIsToggling(true);
    const newActive = !state.active;
    const toastId = toast.loading(
      newActive ? "Mengaktifkan maintenance mode..." : "Menonaktifkan maintenance mode..."
    );

    // Save all settings including toggle
    const upsertData = [
      { key: "maintenance_mode", value: newActive.toString() },
      { key: "maintenance_message", value: state.message },
      { key: "maintenance_end_time", value: state.endTime || "" },
    ];

    const { error } = await supabase
      .from("system_settings")
      .upsert(upsertData, { onConflict: "key" });

    if (error) {
      toast.error("Gagal mengubah status.", { id: toastId });
    } else {
      setState((prev) => ({ ...prev, active: newActive }));
      setIsDirty(false);

      // Set/clear cookie via API action (we'll use a fetch call to update the cookie)
      try {
        await fetch("/api/maintenance/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newActive }),
        });
      } catch {
        // Cookie update optional, DB is source of truth
      }

      toast.success(
        newActive ? "🔒 Maintenance mode AKTIF!" : "🟢 Maintenance mode NONAKTIF!",
        { id: toastId }
      );
    }
    setIsToggling(false);
  };

  const minDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card-3d bg-card border-4 border-border rounded-3xl p-16 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-muted-foreground text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight">
              Maintenance Mode
            </h1>
            <p className="text-xs sm:text-sm font-bold text-muted-foreground">
              Kelola mode pemeliharaan sistem Karya Tazkia.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground font-black text-xs uppercase border-2 border-border hover:bg-muted/80 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Status Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.active ? "active" : "inactive"}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className={`mb-6 p-5 rounded-3xl border-4 flex items-center gap-4 ${
            state.active
              ? "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-600"
              : "bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-600"
          }`}
        >
          {state.active ? (
            <>
              <div className="w-10 h-10 rounded-2xl bg-red-500 text-white border-2 border-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-black text-red-700 dark:text-red-400 text-sm uppercase">
                  🔒 Maintenance Mode Sedang AKTIF
                </p>
                <p className="text-xs font-bold text-red-600/70 dark:text-red-400/60 mt-0.5">
                  Semua pengunjung akan diredirect ke halaman maintenance.
                </p>
              </div>
              <motion.div
                className="w-3 h-3 rounded-full bg-red-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-green-500 text-white border-2 border-green-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-black text-green-700 dark:text-green-400 text-sm uppercase">
                  🟢 Situs Berjalan Normal
                </p>
                <p className="text-xs font-bold text-green-600/70 dark:text-green-400/60 mt-0.5">
                  Pengunjung dapat mengakses semua halaman.
                </p>
              </div>
              <motion.div
                className="w-3 h-3 rounded-full bg-green-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Main Toggle Card */}
      <div className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] flex items-center justify-center transition-all ${
                state.active
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {state.active ? <PowerOff className="w-7 h-7" /> : <Power className="w-7 h-7" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase">
                Toggle Maintenance
              </h2>
              <p className="text-xs font-bold text-muted-foreground">
                Status saat ini:{" "}
                <span
                  className={`font-black uppercase ${
                    state.active ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {state.active ? "AKTIF" : "NONAKTIF"}
                </span>
              </p>
            </div>
          </div>

          <motion.button
            onClick={toggleMaintenance}
            disabled={isToggling}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
              state.active
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {isToggling ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : state.active ? (
              <Power className="w-5 h-5" />
            ) : (
              <PowerOff className="w-5 h-5" />
            )}
            {isToggling
              ? "Memproses..."
              : state.active
              ? "Nonaktifkan Maintenance"
              : "Aktifkan Maintenance"}
          </motion.button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b-2 border-border">
          <div className="w-9 h-9 rounded-xl bg-secondary text-secondary-foreground border-2 border-border flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground uppercase">Pengaturan Pesan</h2>
            <p className="text-xs font-bold text-muted-foreground">Pesan yang ditampilkan ke pengunjung.</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
            Pesan Maintenance *
          </label>
          <textarea
            value={state.message}
            onChange={(e) => updateField("message", e.target.value)}
            rows={3}
            placeholder="Tulis pesan untuk pengunjung..."
            className="w-full px-4 py-3 rounded-2xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-primary transition-all resize-none"
          />
          {/* Quick templates */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Template:</span>
            {DEFAULT_MESSAGES.map((msg, i) => (
              <button
                key={i}
                onClick={() => updateField("message", msg)}
                className="text-[10px] font-black text-primary hover:underline underline-offset-2 decoration-primary/40"
              >
                Template {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* End Time */}
        <div className="mb-6">
          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Estimasi Durasi (Opsional)
          </label>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {[1, 2, 3, 6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => {
                  const label = hours < 24 ? `${hours} Jam` : `${hours / 24} Hari`;
                  updateField("endTime", label);
                }}
                className={`px-4 py-2 rounded-xl border-3 border-border font-bold text-sm transition-all shadow-[2px_2px_0px_0px_var(--color-border)] active:translate-y-0 active:shadow-none ${
                  state.endTime === (hours < 24 ? `${hours} Jam` : `${hours / 24} Hari`)
                    ? "bg-primary text-primary-foreground translate-y-0 shadow-none"
                    : "bg-card hover:bg-muted hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-border)]"
                }`}
              >
                {hours < 24 ? `${hours} Jam` : `${hours / 24} Hari`}
              </button>
            ))}
          </div>

          {state.endTime && (
            <div className="flex items-center justify-between p-4 rounded-2xl border-3 border-secondary/30 bg-secondary/10">
              <p className="text-sm font-bold text-secondary-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Estimasi Waktu: <span className="font-black">{state.endTime}</span>
              </p>
              <button
                onClick={() => updateField("endTime", "")}
                className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground font-black text-[10px] uppercase hover:bg-destructive/90 shadow-[2px_2px_0px_var(--color-border)] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Hapus
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Info className="w-3 h-3" />
            <p className="text-[10px] font-bold">
              Klik tombol di atas untuk mengatur durasi. Ini hanya akan menampilkan teks estimasi (misal: "Sekitar 2 Jam") agar tim tidak terbebani timer hitung mundur.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            onClick={saveSettings}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-black uppercase text-sm border-4 border-border shadow-[4px_4px_0px_0px_var(--color-border)] hover:shadow-[2px_2px_0px_0px_var(--color-border)] hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </motion.button>

          {isDirty && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-bold text-accent flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3" />
              Ada perubahan yang belum disimpan
            </motion.span>
          )}
        </div>
      </div>

      {/* Announcement Settings Form */}
      <div className="card-3d bg-card border-4 border-border rounded-3xl p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b-2 border-border">
          <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground border-2 border-border flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground uppercase">Pengumuman Setelah Maintenance</h2>
            <p className="text-xs font-bold text-muted-foreground">Banner pemberitahuan yang muncul di semua halaman.</p>
          </div>
        </div>

        {/* Toggle Announcement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-2xl border-3 border-border bg-muted/30">
          <div>
            <h3 className="font-black text-sm uppercase">Status Banner</h3>
            <p className="text-xs font-bold text-muted-foreground">Aktifkan untuk menampilkan banner pengumuman.</p>
          </div>
          <button
            onClick={() => updateField("announcementActive", !state.announcementActive)}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-border transition-colors duration-200 ease-in-out ${
              state.announcementActive ? 'bg-green-500' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={state.announcementActive}
          >
            <span className="sr-only">Toggle banner pengumuman</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white border-2 border-border shadow-sm ring-0 transition duration-200 ease-in-out ${
                state.announcementActive ? 'translate-x-3' : '-translate-x-3'
              }`}
            />
          </button>
        </div>

        {/* Announcement Message & Version */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-3">
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
              Isi Pengumuman *
            </label>
            <textarea
              value={state.announcementMessage}
              onChange={(e) => updateField("announcementMessage", e.target.value)}
              rows={2}
              placeholder="Tulis pengumuman baru..."
              className="w-full px-4 py-3 rounded-2xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-accent transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
              Versi *
            </label>
            <input
              type="text"
              value={state.appVersion}
              onChange={(e) => updateField("appVersion", e.target.value)}
              placeholder="v1.2.0"
              className="w-full px-4 py-3 rounded-2xl border-3 border-border bg-background font-bold text-sm outline-none focus:border-secondary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Info className="w-3 h-3" />
          <p className="text-[10px] font-bold">
            Gunakan tombol "Simpan Pengaturan" di atas untuk menyimpan perubahan pengumuman.
          </p>
        </div>
      </div>

      {/* Preview & Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preview button */}
        <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent text-accent-foreground border-2 border-border flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase">Preview Halaman</h3>
          </div>
          <p className="text-xs font-bold text-muted-foreground mb-4">
            Lihat tampilan halaman maintenance yang akan dilihat pengunjung.
          </p>
          <a
            href="/maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-muted text-foreground font-black text-xs uppercase border-2 border-border hover:bg-muted/80 transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            Buka Halaman Maintenance
          </a>
        </div>

        {/* Info card */}
        <div className="card-3d bg-card border-4 border-border rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground border-2 border-border flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase">Cara Kerja</h3>
          </div>
          <ul className="space-y-2">
            {[
              { icon: "🔒", text: "Aktifkan untuk redirect semua pengunjung ke halaman maintenance" },
              { icon: "🛡️", text: "Admin dan halaman /admin tetap dapat diakses" },
              { icon: "⏱️", text: "Set estimasi waktu untuk tampilkan countdown timer" },
              { icon: "💾", text: "Simpan pengaturan sebelum mengaktifkan untuk memperbarui pesan" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs font-bold text-muted-foreground">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
