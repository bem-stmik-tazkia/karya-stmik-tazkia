"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X, Clock, CheckCircle, XCircle, RefreshCw, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Notification {
  id: string;
  type: "karya_approved" | "karya_rejected" | "karya_pending" | "info";
  title: string;
  message: string;
  karya_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_ICON: Record<string, React.ReactNode> = {
  karya_approved: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
  karya_rejected: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  karya_pending: <RefreshCw className="w-5 h-5 text-yellow-500 shrink-0" />,
  info: <Bell className="w-5 h-5 text-blue-500 shrink-0" />,
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-" + user.id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Mark all as read
  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Mark single as read
  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  // Delete single notification
  const deleteNotif = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const clearAll = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded-lg border border-border bg-card shadow-xs hover:bg-muted hover:border-primary/30 transition-all"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-card animate-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div className="fixed left-4 right-4 sm:absolute sm:left-auto sm:right-0 top-18 sm:top-[calc(100%+8px)] w-auto sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-muted"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Baca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                  title="Bersihkan semua notifikasi"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Bersihkan Semua</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center gap-3 text-muted-foreground">
                <Bell className="w-7 h-7 animate-pulse text-primary" />
                <p className="text-xs font-medium">Memuat...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <Bell className="w-6 h-6 text-muted-foreground/60" />
                </div>
                <p className="text-xs font-semibold text-foreground">Belum ada notifikasi</p>
                <p className="text-[11px] text-center text-muted-foreground">Kamu akan mendapat notifikasi saat status karya berubah.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 p-4 transition-colors cursor-pointer ${
                      !notif.is_read
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/40"
                    }`}
                    onClick={() => {
                      if (!notif.is_read) markRead(notif.id);
                      if (notif.karya_id) {
                        setOpen(false);
                      }
                    }}
                  >
                    <div className="pt-0.5">{NOTIF_ICON[notif.type] ?? NOTIF_ICON.info}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-tight ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1" />
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                            className="flex items-center gap-1 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            title="Hapus notifikasi ini"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed font-normal">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: localeId,
                          })}
                        </span>
                        {notif.karya_id && (
                          <Link
                            href={`/dashboard/projects/${notif.karya_id}`}
                            onClick={() => setOpen(false)}
                            className="text-[10px] font-semibold text-primary hover:underline"
                          >
                            Lihat Karya →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
