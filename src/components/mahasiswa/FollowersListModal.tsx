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
          className="relative w-full max-w-md bg-card border-4 border-border rounded-3xl shadow-[8px_8px_0px_var(--color-border)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b-4 border-border flex items-center justify-between bg-primary/10">
            <h3 className="font-black text-foreground text-lg uppercase">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-border bg-card hover:bg-muted transition-all text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-bold text-muted-foreground uppercase">Memuat data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted border-2 border-border flex items-center justify-center text-muted-foreground">
                  <UserX className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-muted-foreground uppercase">
                  Tidak ada {type === "followers" ? "pengikut" : "yang diikuti"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-colors group">
                    <img
                      src={u.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(u.full_name)}
                      alt={u.full_name}
                      className="w-12 h-12 rounded-xl border-2 border-border object-cover shrink-0 bg-background"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/student/${u.id}`} onClick={onClose} className="block">
                        <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {u.full_name}
                        </h4>
                        <p className="text-[11px] font-bold text-muted-foreground truncate">{u.prodi}</p>
                      </Link>
                    </div>
                    
                    {(!currentUser || currentUser.id !== u.user_id) && (
                      <button
                        onClick={() => handleToggleFollow(u.user_id)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                          followingStatus[u.user_id]
                            ? "bg-transparent border-border text-muted-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500"
                            : "bg-primary border-primary text-white hover:bg-primary/80"
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
