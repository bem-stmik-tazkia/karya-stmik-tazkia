"use client";

import React, { useEffect, useState, useRef, use } from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useE2EE } from "@/components/providers/E2EEProvider";
import { fetchPublicKey, encryptMessage, decryptMessage } from "@/utils/crypto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Lock, MessageSquare, Trash2, Ban } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import toast from "react-hot-toast";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  nonce?: string;
  is_read: boolean;
  created_at: string;
  is_deleted_for_everyone?: boolean;
  deleted_for?: string[];
};

type Profile = {
  user_id: string;
  full_name: string;
  avatar_url: string;
};

function Avatar({ name, avatarUrl, size = "md" }: { name: string; avatarUrl?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs rounded-lg",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-12 h-12 text-base rounded-2xl",
  };
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} object-cover border-2 border-border shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClasses[size]} bg-secondary text-white border-2 border-border flex items-center justify-center font-black shrink-0`}>
      {initial}
    </div>
  );
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "Hari ini";
  if (isYesterday(date)) return "Kemarin";
  return format(date, "dd MMMM yyyy", { locale: idLocale });
}

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const conversationId = unwrappedParams.id;
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [otherPublicKey, setOtherPublicKey] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isDeletingMsg, setIsDeletingMsg] = useState(false);
  const { keyPair, isLoadingKeys } = useE2EE();
  const { onlineUsers } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOnline = otherUser?.user_id ? onlineUsers.includes(otherUser.user_id) : false;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    let myId = "";

    async function fetchChat() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      myId = session.user.id;
      setCurrentUserId(myId);

      // 1. Mark existing unread messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", myId)
        .eq("is_read", false);

      // 2. Fetch my profile
      const { data: myProfileData } = await supabase
        .from("mahasiswa_profiles")
        .select("user_id, full_name, avatar_url")
        .eq("user_id", myId)
        .maybeSingle();
      if (myProfileData) setMyProfile(myProfileData);
      else {
        const meta = session.user.user_metadata;
        setMyProfile({ user_id: myId, full_name: meta?.full_name || meta?.name || session.user.email?.split("@")[0] || "Saya", avatar_url: meta?.avatar_url || "" });
      }

      // 3. Fetch the other participant
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("student_id")
        .eq("conversation_id", conversationId)
        .neq("student_id", myId);

      let recipientPub = null;
      if (participants && participants.length > 0) {
        const otherId = participants[0].student_id;

        const { data: profileData, error: profileErr } = await supabase
          .from("mahasiswa_profiles")
          .select("user_id, full_name, avatar_url")
          .eq("user_id", otherId)
          .maybeSingle();

        if (profileErr) console.error("[ChatRoom] Error fetching profile:", profileErr);

        if (profileData) {
          setOtherUser(profileData);
        } else {
          setOtherUser({ user_id: otherId, full_name: "Pengguna", avatar_url: "" });
        }

        recipientPub = await fetchPublicKey(otherId);
        setOtherPublicKey(recipientPub);
      }

      // 4. Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messagesData) {
        const decryptedMessages = messagesData.map((msg) => {
          if (msg.nonce && recipientPub && keyPair?.privateKey) {
            const dec = decryptMessage(msg.content, msg.nonce, keyPair.privateKey, recipientPub);
            return { ...msg, content: dec || "🔒 (Terenkripsi)" };
          }
          return msg;
        });
        setMessages(decryptedMessages as Message[]);
        setTimeout(() => scrollToBottom(false), 50);
      }

      setLoading(false);
    }

    if (!isLoadingKeys) fetchChat();

    // 5. Subscribe to new and deleted messages
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
          let newMessage = payload.new as Message;
          if (newMessage.nonce && otherPublicKey && keyPair?.privateKey) {
            const dec = decryptMessage(newMessage.content, newMessage.nonce, keyPair.privateKey, otherPublicKey);
            newMessage = { ...newMessage, content: dec || "🔒 (Terenkripsi)" };
          }
          setMessages((prev) => [...prev, newMessage]);
          if (newMessage.sender_id !== myId) {
            await supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id);
          }
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map(msg => msg.id === updated.id ? { 
            ...msg, 
            is_deleted_for_everyone: updated.is_deleted_for_everyone, 
            deleted_for: updated.deleted_for 
          } : msg));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, isLoadingKeys, keyPair, otherPublicKey]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUserId || isSending) return;

    const plainContent = inputText.trim();
    setInputText("");
    setIsSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let messagePayload: { conversation_id: string; sender_id: string; content: string; nonce?: string };

    // Try to encrypt if both keys are available
    if (otherPublicKey && keyPair?.privateKey) {
      const encrypted = encryptMessage(plainContent, keyPair.privateKey, otherPublicKey);
      if (encrypted) {
        messagePayload = {
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: encrypted.ciphertext,
          nonce: encrypted.nonce,
        };
      } else {
        // Encryption failed — send as plain text
        toast("Enkripsi gagal, pesan dikirim tanpa enkripsi.", { icon: "⚠️" });
        messagePayload = { conversation_id: conversationId, sender_id: currentUserId, content: plainContent };
      }
    } else {
      // Other user has no public key — send as plain text with a one-time notice
      toast("Pengguna ini belum aktif, pesan dikirim tanpa enkripsi.", { icon: "⚠️" });
      messagePayload = { conversation_id: conversationId, sender_id: currentUserId, content: plainContent };
    }

    const { error } = await supabase.from("messages").insert(messagePayload);
    if (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan.");
    }
    setIsSending(false);
  };

  const handleDeleteChat = async () => {
    setIsDeleting(true);
    
    // Get all currently visible messages
    const visibleMessages = messages.filter(msg => !msg.deleted_for?.includes(currentUserId || ""));
    
    if (visibleMessages.length === 0) {
      toast.success("Obrolan sudah bersih.");
      router.push("/inbox");
      return;
    }

    try {
      // Update each message to include my ID in deleted_for
      const promises = visibleMessages.map(msg => {
        const newDeletedFor = [...(msg.deleted_for || []), currentUserId];
        return supabase.from("messages").update({ deleted_for: newDeletedFor }).eq("id", msg.id);
      });
      
      await Promise.all(promises);
      
      toast.success("Obrolan dibersihkan.");
      router.push("/inbox");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Gagal membersihkan percakapan.");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteForMe = async () => {
    if (!selectedMessageId || !currentUserId) return;
    setIsDeletingMsg(true);

    const msg = messages.find(m => m.id === selectedMessageId);
    const newDeletedFor = [...(msg?.deleted_for || []), currentUserId];

    const { error } = await supabase
      .from("messages")
      .update({ deleted_for: newDeletedFor })
      .eq("id", selectedMessageId);

    if (error) {
      console.error("Error deleting message for me:", error);
      toast.error("Gagal menghapus pesan. Coba jalankan script SQL-nya.");
    } else {
      setMessages((prev) => prev.map((m) => m.id === selectedMessageId ? { ...m, deleted_for: newDeletedFor } : m));
    }

    setIsDeletingMsg(false);
    setSelectedMessageId(null);
  };

  const handleDeleteForEveryone = async () => {
    if (!selectedMessageId) return;
    setIsDeletingMsg(true);

    const { error } = await supabase
      .from("messages")
      .update({ is_deleted_for_everyone: true })
      .eq("id", selectedMessageId);

    if (error) {
      console.error("Error deleting message for everyone:", error);
      toast.error("Gagal menarik pesan. Coba jalankan script SQL-nya.");
    } else {
      setMessages((prev) => prev.map((m) => m.id === selectedMessageId ? { ...m, is_deleted_for_everyone: true } : m));
    }

    setIsDeletingMsg(false);
    setSelectedMessageId(null);
  };

  if (loading || isLoadingKeys) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-muted-foreground text-sm">Menyiapkan ruang obrolan...</p>
      </div>
    );
  }

  // Group messages: show avatar only on last consecutive message from same sender
  const showAvatar = (msgs: Message[], idx: number) => {
    if (idx === msgs.length - 1) return true;
    return msgs[idx].sender_id !== msgs[idx + 1].sender_id;
  };

  const showDateDivider = (msgs: Message[], idx: number) => {
    if (idx === 0) return true;
    return new Date(msgs[idx - 1].created_at).toDateString() !== new Date(msgs[idx].created_at).toDateString();
  };

  const otherName = otherUser?.full_name || "Pengguna";
  const myName = myProfile?.full_name || "Saya";

  const visibleMessages = messages.filter(msg => !msg.deleted_for?.includes(currentUserId || ""));

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b-4 border-border shadow-[0px_4px_0px_0px_var(--color-border)]">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center gap-3">
          <Link
            href="/inbox"
            className="p-2 bg-muted rounded-xl border-2 border-border hover:bg-muted/80 hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_var(--color-border)] shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar with online dot */}
            <div className="relative shrink-0">
              <Avatar name={otherName} avatarUrl={otherUser?.avatar_url} size="md" />
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <h2 className="font-black text-foreground truncate leading-tight text-base">{otherName}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isOnline ? "text-green-500 font-black" : "text-muted-foreground"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
              <Lock className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-black text-green-500 hidden sm:inline">E2EE</span>
            </div>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-500/30"
              title="Bersihkan Obrolan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="container mx-auto max-w-4xl px-4 py-4 pb-24 space-y-1">
          {visibleMessages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-border flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-black text-foreground text-lg">Mulai Percakapan</p>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Kirim pesan pertamamu ke <span className="font-black text-foreground">{otherName}</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30">
                <Lock className="w-3 h-3 text-green-500" />
                <span className="text-[11px] font-bold text-green-600 dark:text-green-400">Pesan dienkripsi end-to-end</span>
              </div>
            </div>
          ) : (
            visibleMessages.map((msg, idx) => {
              const isMine = msg.sender_id === currentUserId;
              const showAv = showAvatar(visibleMessages, idx);
              const showDate = showDateDivider(visibleMessages, idx);
              const isFirstInGroup = idx === 0 || visibleMessages[idx - 1].sender_id !== msg.sender_id;

              return (
                <React.Fragment key={msg.id}>
                  {/* Date Divider */}
                  {showDate && (
                    <div className="flex items-center justify-center my-6">
                      <div className="flex-1 h-px bg-border" />
                      <span className="mx-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background px-3 py-1 rounded-full border-2 border-border">
                        {formatDateLabel(msg.created_at)}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                    {/* Avatar space to align bubbles */}
                    <div className="w-7 shrink-0">
                      {showAv && !isMine && (
                        <Avatar name={otherName} avatarUrl={otherUser?.avatar_url} size="sm" />
                      )}
                      {showAv && isMine && (
                        <Avatar name={myName} avatarUrl={myProfile?.avatar_url} size="sm" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col max-w-[68%] ${isMine ? "items-end" : "items-start"}`}>
                      {isFirstInGroup && !isMine && (
                        <span className="text-[10px] font-black text-muted-foreground mb-1 px-1">
                          {otherName.split(" ")[0]}
                        </span>
                      )}
                      <div
                        onClick={() => {
                          if (isMine || !msg.is_deleted_for_everyone) setSelectedMessageId(msg.id);
                        }}
                        className={`px-3.5 py-2 text-sm font-medium break-words whitespace-pre-wrap border-2 shadow-[2px_2px_0px_0px_var(--color-border)] transition-transform ${isMine || !msg.is_deleted_for_everyone ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''} ${
                          isMine
                            ? "bg-primary text-primary-foreground border-primary/60 rounded-2xl rounded-br-none"
                            : "bg-card text-foreground border-border rounded-2xl rounded-bl-none"
                        } ${msg.is_deleted_for_everyone ? "opacity-75 !bg-muted !text-muted-foreground !border-border shadow-none" : ""}`}
                      >
                        {msg.is_deleted_for_everyone ? (
                          <span className="italic flex items-center gap-1.5 text-xs font-bold">
                            <Ban className="w-3.5 h-3.5" /> Pesan ini telah ditarik
                          </span>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 justify-end ${
                          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}>
                          <span className="text-[9px] font-bold tabular-nums">
                            {format(new Date(msg.created_at), "HH:mm")}
                          </span>
                          {isMine && (
                            <span className="text-[9px]">{msg.is_read ? "✓✓" : "✓"}</span>
                          )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-card/95 backdrop-blur-md border-t-4 border-border px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 container mx-auto max-w-4xl">
          {/* My Avatar */}
          <div className="shrink-0 mb-1">
            <Avatar name={myName} avatarUrl={myProfile?.avatar_url} size="sm" />
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
              placeholder={`Pesan ke ${otherName.split(" ")[0]}...`}
              className="w-full bg-muted border-2 border-border rounded-2xl px-4 py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background resize-none overflow-hidden min-h-[48px] max-h-36 transition-colors"
              rows={1}
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-12 h-12 shrink-0 bg-primary text-primary-foreground rounded-2xl border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-border)] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[2px_2px_0px_0px_var(--color-border)]"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground/50 font-bold mt-1.5 flex items-center justify-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Dienkripsi end-to-end
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm p-6 rounded-3xl border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)]">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-red-500/20">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-center mb-2">Bersihkan Obrolan?</h3>
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">
              Semua pesan akan dihapus dari layarmu saja. Lawan bicara tetap bisa melihat riwayat obrolan ini.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-muted text-foreground font-black uppercase text-sm rounded-xl border-2 border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:-translate-y-0.5 transition-transform disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteChat}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white font-black uppercase text-sm rounded-xl border-2 border-red-700 shadow-[2px_2px_0px_0px_#b91c1c] hover:-translate-y-0.5 transition-transform disabled:opacity-50"
              >
                {isDeleting ? 'Membersihkan...' : 'Ya, Bersihkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Message Modal */}
      {selectedMessageId && (() => {
        const msg = messages.find(m => m.id === selectedMessageId);
        if (!msg) return null;
        const isMine = msg.sender_id === currentUserId;
        const canDeleteForEveryone = isMine && !msg.is_deleted_for_everyone;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={() => !isDeletingMsg && setSelectedMessageId(null)}>
            <div className="bg-card w-full max-w-xs p-6 rounded-3xl border-4 border-border shadow-[8px_8px_0px_0px_var(--color-border)]" onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black text-center mb-2">Hapus Pesan?</h3>
              <p className="text-center text-sm font-medium text-muted-foreground mb-6">
                Pilih metode penghapusan pesan ini.
              </p>
              
              <div className="flex gap-2 flex-col">
                {canDeleteForEveryone && (
                  <button 
                    onClick={handleDeleteForEveryone}
                    disabled={isDeletingMsg}
                    className="w-full px-4 py-3 bg-red-500 text-white font-black uppercase text-sm rounded-xl border-2 border-red-700 shadow-[2px_2px_0px_0px_#b91c1c] hover:-translate-y-0.5 transition-transform disabled:opacity-50"
                  >
                    {isDeletingMsg ? 'Memproses...' : 'Hapus untuk Semua'}
                  </button>
                )}
                
                <button 
                  onClick={handleDeleteForMe}
                  disabled={isDeletingMsg}
                  className="w-full px-4 py-3 bg-card text-foreground font-black uppercase text-sm rounded-xl border-2 border-border shadow-[2px_2px_0px_0px_var(--color-border)] hover:-translate-y-0.5 transition-transform disabled:opacity-50"
                >
                  {isDeletingMsg ? 'Memproses...' : 'Hapus untuk Saya'}
                </button>

                <button 
                  onClick={() => setSelectedMessageId(null)}
                  disabled={isDeletingMsg}
                  className="w-full px-4 py-3 mt-2 bg-muted text-foreground font-black uppercase text-sm rounded-xl border-2 border-transparent hover:-translate-y-0.5 transition-transform disabled:opacity-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
