"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Code, Globe, ExternalLink, Folder, GraduationCap, Eye, Heart, ArrowRight, Users, MessageSquare } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Student } from "@/lib/feedData";
import type { Karya } from "@/types/karya";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import FollowersListModal from "./FollowersListModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsFollowing, toggleFollow } from "@/lib/followService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface MahasiswaProfileDrawerProps {
  student: Student | null;
  projects: Karya[];
  onClose: () => void;
}

export default function MahasiswaProfileDrawer({
  student,
  projects,
  onClose,
}: MahasiswaProfileDrawerProps) {
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (student) {
      setFollowersCount(student.followersCount || 0);
      if (user && student.userId) {
        checkIsFollowing(student.userId, user.id).then(setIsFollowing);
      }
    }
  }, [student, user]);

  if (!student) return null;

  const isOwnProfile = user?.id === student.userId;

  const handleFollowToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!student.userId || followLoading) return;

    setFollowLoading(true);
    const currentlyFollowing = isFollowing;
    setIsFollowing(!currentlyFollowing);
    setFollowersCount(prev => currentlyFollowing ? prev - 1 : prev + 1);

    try {
      await toggleFollow(student.userId, user.id, currentlyFollowing);
    } catch (error) {
      console.error("Failed to toggle follow", error);
      setIsFollowing(currentlyFollowing);
      setFollowersCount(prev => currentlyFollowing ? prev + 1 : prev - 1);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!student?.userId || isMessaging) return;

    setIsMessaging(true);
    try {
      // 1. Check if conversation already exists
      const { data: myConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('student_id', user.id);

      if (myConvs && myConvs.length > 0) {
        const convIds = myConvs.map(c => c.conversation_id);
        const { data: sharedConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('student_id', student.userId);

        if (sharedConvs && sharedConvs.length > 0) {
          router.push(`/inbox/${sharedConvs[0].conversation_id}`);
          return;
        }
      }

      const newConvId = crypto.randomUUID();

      // 2. Create new conversation
      const { error: convError } = await supabase
        .from('conversations')
        .insert([{ id: newConvId, updated_at: new Date().toISOString() }]);

      if (convError) {
        console.error("Conversation insert error:", convError);
        toast.error("Gagal membuat percakapan. Akun mungkin belum ditautkan dengan benar.");
        setIsMessaging(false);
        return;
      }

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConvId, student_id: user.id },
          { conversation_id: newConvId, student_id: student.userId }
        ]);
      
      if (partError) {
        console.error("Participant insert error:", partError);
        toast.error("Gagal menambahkan peserta. Akun mahasiswa mungkin tidak valid.");
        setIsMessaging(false);
        return;
      }
      router.push(`/inbox/${newConvId}`);
    } catch (error) {
      console.error("Failed to start message", error);
      toast.error("Terjadi kesalahan sistem saat membuka pesan.");
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {student && (
          <div key="drawer-container" className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-card border-l-4 border-border h-full shadow-[ -8px_0px_0px_var(--color-border)] overflow-y-auto flex flex-col z-10"
            >
              {/* Header Banner */}
              <div className="relative h-36 sm:h-44 bg-primary p-4 border-b-4 border-border shrink-0 flex items-start justify-between overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle at center, #ffffff 2px, transparent 2px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="relative z-10 flex gap-2">
                  <StickerBadge variant="warning">Angkatan {student.angkatan}</StickerBadge>
                  {student.statusBadge && <StickerBadge variant="accent">{student.statusBadge}</StickerBadge>}
                </div>
                <button
                  onClick={onClose}
                  className="relative z-10 p-2 rounded-xl bg-card border-2 border-border text-foreground hover:bg-muted font-bold transition-all shadow-[2px_2px_0px_var(--color-border)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 pt-0 flex-1 space-y-6">
                {/* Avatar & Title Info */}
                <div className="relative -mt-14 mb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-card border-4 border-border shadow-[4px_4px_0px_var(--color-border)] overflow-hidden shrink-0">
                    {student.avatarUrl ? (
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-4xl font-black rounded-xl uppercase">
                        {student.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <Link href={`/student/${student.id}`} onClick={onClose} className="w-full sm:w-auto">
                    <BouncyButton variant="secondary" className="w-full text-xs px-4 py-2">
                      LIHAT PROFIL LENGKAP <ArrowRight className="w-4 h-4 ml-1" />
                    </BouncyButton>
                  </Link>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground">{student.name}</h2>
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mt-1">
                    <GraduationCap className="w-4 h-4 text-secondary shrink-0" />
                    <span>{student.prodi}</span>
                  </div>
                </div>

                {/* Followers / Following Stats */}
                <div className="flex items-center gap-6 py-2">
                  <div 
                    className="cursor-pointer group"
                    onClick={() => setModalType("followers")}
                  >
                    <p className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{followersCount}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase group-hover:text-foreground transition-colors">Pengikut</p>
                  </div>
                  <div className="w-0.5 h-6 bg-border" />
                  <div 
                    className="cursor-pointer group"
                    onClick={() => setModalType("following")}
                  >
                    <p className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{student.followingCount || 0}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase group-hover:text-foreground transition-colors">Mengikuti</p>
                  </div>
                </div>

                {/* Social Links Bar */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {!isOwnProfile && student.userId && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] ${
                        isFollowing
                          ? "bg-muted border-2 border-border text-foreground hover:bg-rose-500 hover:text-white hover:border-rose-500"
                          : "bg-primary border-2 border-primary text-white hover:bg-primary/80"
                      } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Users className="w-4 h-4" />
                      {isFollowing ? "Unfollow" : "Ikuti"}
                    </button>
                  )}
                  {!isOwnProfile && student.userId && (
                    <button
                      onClick={handleMessage}
                      disabled={isMessaging}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all shadow-[2px_2px_0px_var(--color-border)] bg-secondary border-2 border-border text-secondary-foreground hover:bg-secondary/80 ${isMessaging ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <MessageSquare className="w-4 h-4" /> Pesan
                    </button>
                  )}
                  <a
                    href={`mailto:${student.contactEmail}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted border-2 border-border hover:bg-primary hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </a>
                  {student.socials?.github && (
                    <a
                      href={student.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted border-2 border-border hover:bg-foreground hover:text-background transition-all shadow-[2px_2px_0px_var(--color-border)]"
                    >
                      <Code className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {student.socials?.linkedin && (
                    <a
                      href={student.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted border-2 border-border hover:bg-secondary hover:text-secondary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]"
                    >
                      <Globe className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                  {student.socials?.portfolio && (
                    <a
                      href={student.socials.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-muted border-2 border-border hover:bg-accent hover:text-accent-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]"
                    >
                      <Globe className="w-4 h-4" /> Portofolio
                    </a>
                  )}
                </div>

                {/* Bio Section */}
                <div className="card-3d bg-card p-4 rounded-2xl border-2 border-border">
                  <h3 className="text-xs font-black uppercase text-muted-foreground mb-2">Tentang Mahasiswa</h3>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{student.bio}</p>
                </div>

                {/* Skills Section */}
                {student.skills && student.skills.filter(s => PREDEFINED_SKILLS.includes(s)).length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase text-muted-foreground mb-2">Keahlian & Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.skills.filter(s => PREDEFINED_SKILLS.includes(s)).map((skill, i) => (
                        <span
                          key={`${skill}-${i}`}
                          className={`px-3 py-1 rounded-xl border-2 text-xs font-black ${getSkillColor(skill)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student's Projects Showcase */}
                <div className="space-y-4 pt-4 border-t-2 border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-foreground flex items-center gap-2 uppercase">
                      <Folder className="w-5 h-5 text-secondary" /> Projek Karya ({projects.length})
                    </h3>
                  </div>

                  {projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.map((proj) => (
                        <Link
                          href={`/project/${proj.id}`}
                          onClick={onClose}
                          key={proj.id}
                          className="block card-3d bg-card p-3 rounded-2xl border-2 border-border flex gap-3 group items-center"
                        >
                          {proj.image_url ? (
                            <img
                              src={proj.image_url}
                              alt={proj.title}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-border shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl border-2 border-border shrink-0 bg-muted flex items-center justify-center text-2xl">
                              📁
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <StickerBadge variant="warning" className="text-[9px] py-0 px-1.5">
                                {proj.category}
                              </StickerBadge>
                            </div>
                            <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                              {proj.title}
                            </h4>
                            <p className="text-xs font-medium text-muted-foreground line-clamp-1 mt-0.5">
                              {proj.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-primary" /> {proj.views ?? 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-secondary" /> {proj.likes ?? 0}
                              </span>
                              <span
                                className="ml-auto flex items-center gap-0.5 text-primary font-black uppercase group-hover:underline"
                              >
                                Detail <ExternalLink className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted rounded-2xl border-2 border-dashed border-border">
                      <p className="text-xs font-bold text-muted-foreground">Belum ada karya yang diunggah.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {modalType && student?.userId && (
        <FollowersListModal
          userId={student.userId}
          type={modalType}
          title={modalType === "followers" ? "Daftar Pengikut" : "Daftar Mengikuti"}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
}
