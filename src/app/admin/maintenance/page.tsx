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
} from "lucide-react";
import toast from "react-hot-toast";
import { AnnouncementSettingsCard } from "@/components/admin/maintenance/AnnouncementSettingsCard";
import { MaintenanceInfoCard } from "@/components/admin/maintenance/MaintenanceInfoCard";

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
    announcementMessage: "Pembaruan Sistem: Seluruh layanan kembali normal. Selamat menjelajahi portofolio karya mahasiswa STMIK Tazkia.",
    appVersion: "v2.0.0",
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
      toast.error("Mohon maaf, pengaturan sistem belum berhasil dimuat.");
    } else if (data) {
      const settings: Record<string, string> = {};
      data.forEach((row) => { settings[row.key] = row.value; });

      setState({
        active: settings["maintenance_mode"] === "true",
        message: settings["maintenance_message"] || DEFAULT_MESSAGES[0],
        endTime: settings["maintenance_end_time"] || "",
        announcementActive: settings["announcement_active"] === "true",
        announcementMessage: settings["announcement_message"] || "Pembaruan Sistem: Seluruh layanan kembali normal. Selamat menjelajahi portofolio karya mahasiswa STMIK Tazkia.",
        appVersion: settings["app_version"] || "v2.0.0",
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
      toast.error("Mohon maaf, pengaturan belum berhasil disimpan. Silakan coba kembali.", { id: toastId });
    } else {
      toast.success("Pengaturan berhasil disimpan.", { id: toastId });
      setIsDirty(false);
    }
    setIsSaving(false);
  };

  const toggleMaintenance = async () => {
    setIsToggling(true);
    const newActive = !state.active;
    const toastId = toast.loading(
      newActive ? "Sedang mengaktifkan mode pemeliharaan..." : "Sedang menonaktifkan mode pemeliharaan..."
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
      toast.error("Mohon maaf, status pemeliharaan belum berhasil diubah. Silakan coba kembali.", { id: toastId });
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
        newActive ? "🔒 Mode pemeliharaan sistem berhasil DIAKTIFKAN." : "🟢 Mode pemeliharaan sistem berhasil DINONAKTIFKAN.",
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
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-muted-foreground text-sm">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Maintenance Mode
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Kelola mode pemeliharaan sistem Karya Tazkia.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card text-muted-foreground font-semibold text-xs border border-border hover:bg-muted hover:text-foreground transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state.active ? "active" : "inactive"}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3.5 ${
            state.active
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {state.active ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">
                  🔒 Maintenance Mode Sedang AKTIF
                </p>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5 font-normal">
                  Semua pengunjung akan dialihkan ke halaman pemeliharaan.
                </p>
              </div>
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-rose-500"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">
                  🟢 Situs Berjalan Normal
                </p>
                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-normal">
                  Pengunjung dapat mengakses semua fitur dan halaman website.
                </p>
              </div>
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Main Toggle Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                state.active
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}
            >
              {state.active ? <PowerOff className="w-6 h-6" /> : <Power className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Sakelar Maintenance
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Status saat ini:{" "}
                <span
                  className={`font-semibold ${
                    state.active ? "text-rose-500" : "text-emerald-500"
                  }`}
                >
                  {state.active ? "AKTIF" : "NONAKTIF"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={toggleMaintenance}
            disabled={isToggling}
            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
              state.active
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20"
            }`}
          >
            {isToggling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : state.active ? (
              <Power className="w-4 h-4" />
            ) : (
              <PowerOff className="w-4 h-4" />
            )}
            <span>
              {isToggling
                ? "Memproses..."
                : state.active
                ? "Nonaktifkan Maintenance"
                : "Aktifkan Maintenance"}
            </span>
          </button>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 mb-6 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Pengaturan Pesan</h2>
            <p className="text-xs text-muted-foreground">Pesan yang ditampilkan ke pengunjung.</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pesan Maintenance *
          </label>
          <textarea
            value={state.message}
            onChange={(e) => updateField("message", e.target.value)}
            rows={3}
            placeholder="Tulis pesan untuk pengunjung..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background font-medium text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-2xs"
          />
          {/* Quick templates */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[11px] font-medium text-muted-foreground">Template:</span>
            {DEFAULT_MESSAGES.map((msg, i) => (
              <button
                key={i}
                onClick={() => updateField("message", msg)}
                className="text-[11px] font-semibold text-primary hover:underline underline-offset-2"
              >
                Template {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* End Time */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
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
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
                  state.endTime === (hours < 24 ? `${hours} Jam` : `${hours / 24} Hari`)
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {hours < 24 ? `${hours} Jam` : `${hours / 24} Hari`}
              </button>
            ))}
          </div>

          {state.endTime && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-secondary/20 bg-secondary/5">
              <p className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Estimasi Waktu: <span className="font-bold">{state.endTime}</span>
              </p>
              <button
                onClick={() => updateField("endTime", "")}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold text-[11px] hover:bg-rose-500 hover:text-white transition-all"
              >
                Hapus
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Info className="w-3 h-3" />
            <p className="text-[11px] font-normal">
              Klik tombol di atas untuk mengatur durasi estimasi (misal: "Sekitar 2 Jam") agar pengunjung tahu perkiraan selesai.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={saveSettings}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-xs hover:bg-[#ea580c] hover:shadow-md hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>

          {isDirty && (
            <span className="text-xs font-medium text-amber-500 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Ada perubahan yang belum disimpan
            </span>
          )}
        </div>
      </div>

      {/* Announcement Settings Form */}
      <AnnouncementSettingsCard
        announcementActive={state.announcementActive}
        announcementMessage={state.announcementMessage}
        appVersion={state.appVersion}
        onUpdateField={updateField}
      />

      {/* Preview & Info Section */}
      <MaintenanceInfoCard />
    </div>
  );
}
