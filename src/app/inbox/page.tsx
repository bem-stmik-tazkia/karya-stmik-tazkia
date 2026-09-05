"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useE2EE } from "@/components/providers/E2EEProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { decryptMessage } from "@/utils/crypto";
import Link from "next/link";
import { MessageSquare, ChevronLeft, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

type ConversationInfo = {
  id: string;
  updated_at: string;
  otherUser: {
    user_id: string;
    full_name: string;
    avatar_url: string;
  };
  lastMessage?: string;
  lastSenderId?: string;
  unreadCount: number;
};

function InboxAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-14 h-14 rounded-xl border-2 border-border object-cover shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-xl bg-secondary text-white border-2 border-border flex items-center justify-center text-xl font-black shrink-0">
      {initial}
    </div>
  );
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { keyPair, isLoadingKeys } = useE2EE();
  const { onlineUsers } = useAuth();

  useEffect(() => {
    async function fetchInbox() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const myId = session.user.id;
      setCurrentUserId(myId);

      // 1. Get all conversations I'm part of
      const { data: myConversations, error: convError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("student_id", myId);

      if (convError || !myConversations?.length) { setLoading(false); return; }

      const conversationIds = myConversations.map((c) => c.conversation_id);

      // 2. Fetch participants first (needed to determine otherUserIds)
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, student_id")
        .in("conversation_id", conversationIds);

      const otherUserIds = participants?.filter((p) => p.student_id !== myId).map((p) => p.student_id) || [];

      // 3. Fetch conversations, messages, public keys and profiles in parallel
      const [{ data: convDetails }, { data: messages }, { data: publicKeys }, { data: profiles }] = await Promise.all([
        supabase.from("conversations").select("id, updated_at").in("id", conversationIds),
        supabase.from("messages").select("*").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
        otherUserIds.length ? supabase.from("user_public_keys").select("user_id, public_key").in("user_id", otherUserIds) : Promise.resolve({ data: [] }),
        otherUserIds.length ? supabase.from("mahasiswa_profiles").select("user_id, full_name, avatar_url").in("user_id", otherUserIds) : Promise.resolve({ data: [] }),
      ]);

      // 3. Build conversation list, deduplicating by other user (keep most recent)
      const seenOtherUsers = new Set<string>();
      const formattedConversations: ConversationInfo[] = [];

      // Sort conversation IDs by updated_at descending first
      const sortedConvIds = [...conversationIds].sort((a, b) => {
        const aTime = convDetails?.find((c) => c.id === a)?.updated_at || "";
        const bTime = convDetails?.find((c) => c.id === b)?.updated_at || "";
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      sortedConvIds.forEach((cId) => {
        const otherParticipant = participants?.find((p) => p.conversation_id === cId && p.student_id !== myId);
        if (!otherParticipant) return;

        // Skip duplicate conversations with the same person
        if (seenOtherUsers.has(otherParticipant.student_id)) return;
        seenOtherUsers.add(otherParticipant.student_id);

        const profile = profiles?.find((p) => p.user_id === otherParticipant.student_id);
        const convDetail = convDetails?.find((c) => c.id === cId);
        const theirPubKey = publicKeys?.find((pk) => pk.user_id === otherParticipant.student_id)?.public_key;

        const convMessages = messages?.filter((m) => m.conversation_id === cId) || [];
        // Filter out messages deleted for this user
        const visibleMessages = convMessages.filter((m) => !m.deleted_for?.includes(myId));
        const lastMsg = visibleMessages[0];

        // Only show conversations that have at least one visible message
        if (!lastMsg) return;

        const unreadCount = visibleMessages.filter((m) => m.sender_id !== myId && !m.is_read).length;

        let decryptedLastMsg = lastMsg?.content;
        if (lastMsg?.is_deleted_for_everyone) {
          decryptedLastMsg = "🚫 Pesan telah dihapus";
        } else if (lastMsg?.nonce && keyPair?.privateKey && theirPubKey) {
          decryptedLastMsg = decryptMessage(lastMsg.content, lastMsg.nonce, keyPair.privateKey, theirPubKey) || undefined;
        }

        formattedConversations.push({
          id: cId,
          updated_at: convDetail?.updated_at || new Date().toISOString(),
          otherUser: {
            user_id: otherParticipant.student_id,
            full_name: profile?.full_name || "Pengguna",
            avatar_url: profile?.avatar_url || "",
          },
          lastMessage: decryptedLastMsg,
          lastSenderId: lastMsg?.sender_id,
          unreadCount,
        });
      });

      setConversations(formattedConversations);
      setLoading(false);
    }

    if (!isLoadingKeys) fetchInbox();

    const channel = supabase
      .channel("inbox_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchInbox())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoadingKeys, keyPair]);

  return (
    <div className="h-full overflow-y-auto bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b-4 border-border shadow-[0px_4px_0px_0px_var(--color-border)]">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-muted rounded-xl border-2 border-border hover:bg-muted/80 hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_var(--color-border)] shrink-0">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-black uppercase text-foreground">Pesan</h1>
          <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30">
            <Lock className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-black text-green-500">E2EE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {loading || isLoadingKeys ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-muted-foreground">Memuat pesan...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 border-4 border-border shadow-[4px_4px_0px_var(--color-border)]">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black uppercase mb-2">Belum ada pesan</h2>
            <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">
              Mulai ngobrol dengan mahasiswa lain lewat tombol "Pesan" di profil mereka.
            </p>
            <Link
              href="/student"
              className="inline-block mt-8 px-6 py-3 bg-primary text-primary-foreground font-black uppercase text-sm rounded-xl border-2 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-border)] transition-all"
            >
              Cari Mahasiswa
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conv, i) => {
              const isOnline = onlineUsers.includes(conv.otherUser.user_id);
              const isFromMe = conv.lastSenderId === currentUserId;
              const hasUnread = conv.unreadCount > 0;

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/inbox/${conv.id}`}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--color-border)] ${
                      hasUnread
                        ? "bg-primary/5 border-primary/30 shadow-[2px_2px_0px_var(--color-border)]"
                        : "bg-card border-border shadow-[2px_2px_0px_var(--color-border)]"
                    }`}
                  >
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <InboxAvatar name={conv.otherUser.full_name} avatarUrl={conv.otherUser.avatar_url} />
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className={`truncate ${hasUnread ? "font-black text-foreground" : "font-bold text-foreground"}`}>
                          {conv.otherUser.full_name}
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 ml-2">
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true, locale: id })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${hasUnread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                          {conv.lastMessage
                            ? (isFromMe ? `Kamu: ${conv.lastMessage}` : conv.lastMessage)
                            : <span className="italic">Belum ada pesan</span>
                          }
                        </p>
                        {hasUnread && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0">
                            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
