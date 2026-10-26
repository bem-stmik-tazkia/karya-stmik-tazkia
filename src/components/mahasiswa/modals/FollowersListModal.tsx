"use client";

import { useEffect, useState } from "react";
import { X, Loader2, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getFollowersList, getFollowingList, toggleFollow, checkIsFollowingBulk } from "@/lib/followService";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FollowersListModalProps {
  userId: string;
  type: "followers" | "following";
  title: string;
  onClose: () => void;
}

export default function FollowersListModal({ userId, type, title, onClose }: FollowersListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const data = type === "followers" ? await getFollowersList(userId) : await getFollowingList(userId);
      setUsers(data);

      if (currentUser && data.length > 0) {
        const ids = data.map((u) => u.user_id).filter(Boolean);
        const status = await checkIsFollowingBulk(ids, currentUser.id);
        setFollowingStatus(status);
      }
      setLoading(false);
    }
    loadUsers();
  }, [userId, type, currentUser]);

  const handleToggleFollow = async (targetId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const isCurrentlyFollowing = followingStatus[targetId] || false;
    
    // Optimistic UI
    setFollowingStatus(prev => ({ ...prev, [targetId]: !isCurrentlyFollowing }));

    try {
      await toggleFollow(targetId, currentUser.id, isCurrentlyFollowing);
    } catch (error) {
      console.error("Gagal toggle follow", error);
      // Revert
      setFollowingStatus(prev => ({ ...prev, [targetId]: isCurrentlyFollowing }));
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <h3 className="font-bold text-foreground text-sm tracking-wide">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Memuat data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
                  <UserX className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Tidak ada {type === "followers" ? "pengikut" : "yang diikuti"}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors group">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        className="w-10 h-10 rounded-full border border-border object-cover shrink-0 bg-background"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-bold rounded-full shrink-0 border border-border">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/student/${u.id}`} onClick={onClose} className="block">
                        <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {u.full_name}
                        </h4>
                        <p className="text-[11px] font-normal text-muted-foreground truncate">{u.prodi}</p>
                      </Link>
                    </div>
                    
                    {(!currentUser || currentUser.id !== u.user_id) && (
                      <button
                        onClick={() => handleToggleFollow(u.user_id)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          followingStatus[u.user_id]
                            ? "bg-muted border-border text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                            : "bg-primary border-primary text-white hover:bg-[#ea580c]"
                        }`}
                      >
                        {followingStatus[u.user_id] ? "Unfollow" : "Ikuti"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
