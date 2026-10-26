"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  CheckCheck,
  X,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash,
  Users,
  Check,
  Award,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import toast from "react-hot-toast";
import { respondCollabRequest } from "@/lib/collabService";
import {
  claimExclusiveBadge,
  getExclusiveBadgeGrants,
  getClaimableGrantsForUser,
  type ExclusiveBadgeGrant,
} from "@/lib/badgeService";

interface Notification {
  id: string;
  type:
    | "karya_approved"
    | "karya_rejected"
    | "karya_pending"
    | "info"
    | "collab_request"
    | "collab_accepted"
    | "collab_rejected"
    | "badge_granted"
    | "badge_revoked"
    | string;
  title: string;
  message: string;
  karya_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_ICON: Record<string, React.ReactNode> = {
  karya_approved: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
  karya_rejected: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  karya_pending: <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />,
  info: <Mail className="w-4 h-4 text-sky-500 shrink-0" />,
  collab_request: <Users className="w-4 h-4 text-blue-500 shrink-0" />,
  collab_accepted: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
  collab_rejected: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
  badge_granted: <Award className="w-4 h-4 text-amber-500 shrink-0" />,
  badge_revoked: <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />,
};

type FilterCategory = "all" | "campus" | "collab" | "karya";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [claimableGrants, setClaimableGrants] = useState<ExclusiveBadgeGrant[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [isRespondingCollab, setIsRespondingCollab] = useState<string | null>(null);
  const [isClaimingBadge, setIsClaimingBadge] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  // Fetch claimable grants
  const fetchClaimableGrants = async () => {
    if (!user) return;
    try {
      const allGrants = await getExclusiveBadgeGrants();
      const mine = getClaimableGrantsForUser(allGrants, {
        userId: user.id,
        email: user.email,
      });
      setClaimableGrants(mine);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchClaimableGrants();
    }
  }, [user]);

  // Listen for badge updates across tabs/windows
  useEffect(() => {
    const handleBadgesUpdated = () => {
      fetchClaimableGrants();
    };
    window.addEventListener("tazkia_badges_updated", handleBadgesUpdated);
    return () => {
      window.removeEventListener("tazkia_badges_updated", handleBadgesUpdated);
    };
  }, [user]);

  // Realtime subscription for incoming notifications
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

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const totalUnreadCount = unreadCount + claimableGrants.length;

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

  // Claim exclusive badge from notification
  const handleClaimBadgeFromNotif = async (notif: Notification) => {
    if (!user) return;
    setIsClaimingBadge(notif.id);
    const toastId = toast.loading("Mengklaim lencana & hak akses...");
    try {
      const badgeIdNum = notif.karya_id ? parseInt(notif.karya_id, 10) : 15;
      const validBadgeId = isNaN(badgeIdNum) ? 15 : badgeIdNum;

      const ok = await claimExclusiveBadge(validBadgeId, user.id);
      if (ok) {
        toast.dismiss(toastId);
        await markRead(notif.id);
        await fetchClaimableGrants();
        setOpen(false);
        window.dispatchEvent(
          new CustomEvent("tazkia_open_reward_modal", {
            detail: {
              badgeIds: [validBadgeId],
              skinId: validBadgeId === 15 ? "bem2026" : undefined,
              note: notif.message,
            },
          })
        );
      } else {
        toast.error("Gagal mengklaim penghargaan.", { id: toastId });
      }
    } catch {
      toast.error("Terjadi kendala saat klaim penghargaan.", { id: toastId });
    } finally {
      setIsClaimingBadge(null);
    }
  };

  // Claim grant directly from claimableGrants list
  const handleClaimGrantDirectly = async (grant: ExclusiveBadgeGrant) => {
    if (!user) return;
    setIsClaimingBadge(grant.id);
    const toastId = toast.loading("Mengklaim lencana & hak akses...");
    try {
      const ok = await claimExclusiveBadge(grant.badgeId, user.id, grant.id);
      if (ok) {
        toast.dismiss(toastId);
        await fetchClaimableGrants();
        setOpen(false);
        window.dispatchEvent(
          new CustomEvent("tazkia_open_reward_modal", {
            detail: {
              badgeIds: [grant.badgeId],
              grant,
              skinId: grant.badgeId === 15 ? "bem2026" : undefined,
              note: grant.note,
            },
          })
        );
      } else {
        toast.error("Gagal mengklaim penghargaan.", { id: toastId });
      }
    } catch {
      toast.error("Terjadi kendala saat klaim.", { id: toastId });
    } finally {
      setIsClaimingBadge(null);
    }
  };

  // Respond to collaboration request (accept / reject)
  const handleCollabAction = async (notif: Notification, action: "accept" | "reject") => {
    if (!user || !notif.karya_id) return;
    setIsRespondingCollab(notif.id);
    const toastId = toast.loading(action === "accept" ? "Menerima kolaborasi..." : "Menolak kolaborasi...");

    try {
      const res = await respondCollabRequest({
        karyaId: notif.karya_id,
        action,
        responderUserId: user.id,
        responderName: user.user_metadata?.full_name,
        notificationId: notif.id,
      });

      if (res.success) {
        if (action === "accept") {
          toast.success("Kolaborasi berhasil diterima! Karya telah resmi masuk ke portofolio Anda.", { id: toastId });
        } else {
          toast.success("Undangan kolaborasi ditolak.", { id: toastId });
        }
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id
              ? {
                  ...n,
                  is_read: true,
                  message: action === "accept" ? `${n.message} (Kolaborasi Diterima)` : `${n.message} (Kolaborasi Ditolak)`,
                  type: action === "accept" ? "collab_accepted" : "collab_rejected",
                }
              : n
          )
        );
      } else {
        toast.error("Respon kolaborasi belum berhasil dikirim. Silakan coba sesaat lagi.", { id: toastId });
      }
    } catch {
      toast.error("Terjadi kendala saat memproses permintaan. Silakan coba kembali.", { id: toastId });
    } finally {
      setIsRespondingCollab(null);
    }
  };

  // Filtered notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return notifications;
    if (activeCategory === "campus") {
      return notifications.filter((n) =>
        ["badge_granted", "badge_revoked", "info"].includes(n.type)
      );
    }
    if (activeCategory === "collab") {
      return notifications.filter((n) =>
        ["collab_request", "collab_accepted", "collab_rejected"].includes(n.type)
      );
    }
    if (activeCategory === "karya") {
      return notifications.filter((n) =>
        ["karya_approved", "karya_rejected", "karya_pending"].includes(n.type)
      );
    }
    return notifications;
  }, [notifications, activeCategory]);

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button: Pesan & Notifikasi */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            fetchNotifications();
            fetchClaimableGrants();
          }
        }}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-card shadow-2xs hover:bg-muted hover:border-primary/40 transition-all cursor-pointer"
        title="Kotak Pesan & Notifikasi"
        aria-label="Kotak Pesan & Notifikasi"
      >
        <Mail className="w-4 h-4 text-foreground" />
        <span className="hidden sm:inline text-xs font-semibold text-foreground">
          Pesan
        </span>
        {totalUnreadCount > 0 && (
          <span className="min-w-[17px] h-[17px] bg-primary text-white text-[9.5px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-card animate-in zoom-in duration-200">
            {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="fixed left-3 right-3 sm:absolute sm:left-auto sm:right-0 top-16 sm:top-[calc(100%+8px)] w-auto sm:w-[410px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">Kotak Pesan</span>
              {totalUnreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                  {totalUnreadCount} baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tandai Baca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                  title="Bersihkan riwayat notifikasi"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Tutup panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-background/50 overflow-x-auto text-[11px] font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-primary text-white font-bold shadow-2xs"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("campus")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "campus"
                  ? "bg-primary text-white font-bold shadow-2xs"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Pesan Kampus
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("collab")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "collab"
                  ? "bg-primary text-white font-bold shadow-2xs"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Kolaborasi
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("karya")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === "karya"
                  ? "bg-primary text-white font-bold shadow-2xs"
                  : "hover:bg-muted hover:text-foreground"
              }`}
            >
              Status Karya
            </button>
          </div>

          {/* Body List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-border/60">
            {/* Pinned: Unclaimed Awards / Grants from Pengelola */}
            {claimableGrants.length > 0 &&
              (activeCategory === "all" || activeCategory === "campus") && (
                <div className="bg-primary/5 p-3.5 space-y-3 border-b border-border">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-primary" />
                      <span>Penghargaan Siap Diklaim</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">
                      {claimableGrants.length} Tersedia
                    </span>
                  </div>

                  {claimableGrants.map((grant) => (
                    <div
                      key={grant.id}
                      className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs"
                    >
                      <div className="font-bold text-foreground text-xs sm:text-sm">
                        {grant.badgeName}
                      </div>
                      {grant.note && (
                        <p className="text-muted-foreground italic text-xs leading-relaxed">
                          &ldquo;{grant.note}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <button
                          type="button"
                          onClick={() => handleClaimGrantDirectly(grant)}
                          disabled={isClaimingBadge === grant.id}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isClaimingBadge === grant.id ? "Mengklaim..." : "Klaim Lencana"}
                          </span>
                        </button>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setOpen(false)}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Buka Profil →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Regular Notifications List */}
            {loading ? (
              <div className="p-8 flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span>Memuat pesan...</span>
              </div>
            ) : filteredNotifications.length === 0 && claimableGrants.length === 0 ? (
              <div className="p-8 flex flex-col items-center gap-2 text-muted-foreground text-center">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold text-foreground mt-1">Belum ada pesan</p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Semua pesan pengelola, undangan kolaborasi, dan review karya akan tampil di sini.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-3.5 transition-colors cursor-pointer ${
                    !notif.is_read
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/40"
                  }`}
                  onClick={() => {
                    if (!notif.is_read) markRead(notif.id);
                    if (notif.karya_id && notif.type.startsWith("karya_")) {
                      setOpen(false);
                    } else if (
                      notif.type === "badge_granted" ||
                      notif.type === "badge_revoked"
                    ) {
                      setOpen(false);
                      window.location.href = "/dashboard/profile";
                    }
                  }}
                >
                  <div className="pt-0.5">
                    {NOTIF_ICON[notif.type] ?? NOTIF_ICON.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-semibold leading-tight ${
                          !notif.is_read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotif(notif.id);
                          }}
                          className="p-1 text-muted-foreground hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Hapus pesan ini"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed font-normal whitespace-pre-line">
                      {notif.message}
                    </p>

                    {/* Action button for badge / skin grant */}
                    {notif.type === "badge_granted" && (
                      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimBadgeFromNotif(notif);
                          }}
                          disabled={isClaimingBadge === notif.id}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {isClaimingBadge === notif.id ? "Mengklaim..." : "Klaim Lencana"}
                          </span>
                        </button>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setOpen(false)}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          Buka Profil →
                        </Link>
                      </div>
                    )}

                    {/* Action buttons for collaboration request */}
                    {notif.type === "collab_request" && notif.karya_id && (
                      <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCollabAction(notif, "accept");
                          }}
                          disabled={isRespondingCollab === notif.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Terima Kolab</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCollabAction(notif, "reject");
                          }}
                          disabled={isRespondingCollab === notif.id}
                          className="px-3 py-1.5 rounded-lg bg-muted border border-border hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-600 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                      {notif.karya_id && notif.type.startsWith("karya_") && (
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
