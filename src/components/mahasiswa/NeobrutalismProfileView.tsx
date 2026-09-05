"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Mail,
  Star,
  GraduationCap,
  Folder,
  Eye,
  Heart,
  Share2,
  Edit,
  ExternalLink,
} from "lucide-react";
import { FiGithub, FiLinkedin, FiInstagram } from "react-icons/fi";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";
import { PREDEFINED_SKILLS } from "@/utils/skillOptions";
import ShareProfileModal from "@/components/mahasiswa/ShareProfileModal";
import { NeobrutalismProjectCard, ProjectData } from "./NeobrutalismProjectCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { checkIsFollowing, toggleFollow } from "@/lib/followService";
import { useRouter } from "next/navigation";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { RealFeedPost } from "@/lib/feedService";
import { MessageSquare, PenSquare } from "lucide-react";

export interface ProfileViewData {
  id?: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  prodi?: string;
  angkatan?: number | string;
  avatar_url?: string;
  bio?: string;
  skills?: string[] | null;
  status_badge?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  website_url?: string;
  followers_count?: number;
  following_count?: number;
}

interface NeobrutalismProfileViewProps {
  profile: ProfileViewData;
  projects: ProjectData[];
  posts?: RealFeedPost[];
  isOwnProfile?: boolean;
}

export function NeobrutalismProfileView({
  profile,
  projects,
  posts = [],
  isOwnProfile = false,
}: NeobrutalismProfileViewProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followers_count || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  // Check if following on mount
  React.useEffect(() => {
    async function checkFollowStatus() {
      if (!isOwnProfile && user && profile.user_id) {
        const following = await checkIsFollowing(profile.user_id, user.id);
        setIsFollowing(following);
      }
    }
    checkFollowStatus();
  }, [isOwnProfile, user, profile.user_id]);

  const handleToggleFollow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile.user_id || isFollowLoading) return;

    setIsFollowLoading(true);
    const currentlyFollowing = isFollowing;
    
    // Optimistic UI
    setIsFollowing(!currentlyFollowing);
    setFollowersCount(prev => currentlyFollowing ? prev - 1 : prev + 1);

    try {
      await toggleFollow(profile.user_id, user.id, currentlyFollowing);
    } catch (error) {
      console.error("Failed to toggle follow", error);
      // Revert
      setIsFollowing(currentlyFollowing);
      setFollowersCount(prev => currentlyFollowing ? prev + 1 : prev - 1);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!profile.user_id || isMessaging) return;

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
          .eq('student_id', profile.user_id);

        if (sharedConvs && sharedConvs.length > 0) {
          router.push(`/inbox/${sharedConvs[0].conversation_id}`);
          return;
        }
      }

      // 2. Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (newConv && !convError) {
        await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: newConv.id, student_id: user.id },
            { conversation_id: newConv.id, student_id: profile.user_id }
          ]);
        router.push(`/inbox/${newConv.id}`);
      }
    } catch (error) {
      console.error("Failed to start message", error);
    } finally {
      setIsMessaging(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student/${profile.id || profile.user_id}`
      : "";

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["Semua", ...Array.from(cats)] as string[];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "Semua") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const validSkills = (profile.skills ?? []).filter(s => PREDEFINED_SKILLS.includes(s));

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">

      {/* ── STUDENT HEADER CARD (copied exactly from /student/[id]) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d bg-card border-4 border-border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-12 mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10">

          {/* Avatar */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-border shadow-[4px_4px_0px_var(--color-border)] shrink-0 bg-muted">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-5xl font-black">
                {profile.full_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1 w-full">

            {/* Name + Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase break-words">
                {profile.full_name}
              </h1>
              {profile.angkatan && (
                <StickerBadge
                  variant="warning"
                  className="text-xs sm:text-sm -rotate-3"
                  icon={<Star className="w-4 h-4 fill-current" />}
                >
                  Angkatan {profile.angkatan}
                </StickerBadge>
              )}
              {profile.status_badge && (
                <StickerBadge variant="accent" className="text-xs sm:text-sm">
                  {profile.status_badge}
                </StickerBadge>
              )}
            </div>

            {/* Prodi */}
            {profile.prodi && (
              <div className="flex items-center justify-center md:justify-start gap-2 text-base sm:text-xl text-primary font-black uppercase mb-4">
                <GraduationCap className="w-6 h-6 shrink-0" />
                <span>{profile.prodi}</span>
              </div>
            )}

            {/* Followers / Following Stats */}
            <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
              <div className="text-center md:text-left">
                <p className="text-2xl font-black text-foreground">{followersCount}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase">Pengikut</p>
              </div>
              <div className="w-1 h-8 bg-border rounded-full" />
              <div className="text-center md:text-left">
                <p className="text-2xl font-black text-foreground">{profile.following_count || 0}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase">Mengikuti</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl mb-6 leading-relaxed">
              {profile.bio || "Mahasiswa kreatif STMIK Tazkia."}
            </p>

            {/* Skills */}
            {validSkills.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {validSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1 rounded-xl border-2 text-xs font-black ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              {isOwnProfile ? (
                <Link href="/dashboard/profile">
                  <BouncyButton>
                    <Edit className="w-5 h-5 mr-2" />
                    EDIT PROFIL
                  </BouncyButton>
                </Link>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  disabled={isFollowLoading}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-4 font-black text-sm uppercase shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--color-border)] transition-all ${
                    isFollowing 
                      ? "bg-muted border-border text-foreground" 
                      : "bg-primary border-border text-primary-foreground"
                  } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isFollowing ? (
                    <>UNFOLLOW</>
                  ) : (
                    <>FOLLOW</>
                  )}
                </button>
              )}

              {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  disabled={isMessaging}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary border-4 border-border font-black text-sm uppercase text-secondary-foreground shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--color-border)] transition-all ${
                    isMessaging ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  Kirim Pesan
                </button>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted border-4 border-border font-black text-sm uppercase text-foreground shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--color-border)] transition-all"
              >
                <Share2 className="w-5 h-5 text-secondary" />
                Share Profil
              </button>

              {/* Social Icons */}
              <div className="flex gap-2">
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-muted border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform text-foreground"
                    title="Website / Portfolio"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#0a66c2] text-white border-2 border-[#0a66c2] shadow-[2px_2px_0px_#084d94] rounded-2xl hover:-translate-y-1 transition-transform"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#24292e] text-white border-2 border-[#24292e] shadow-[2px_2px_0px_#000] rounded-2xl hover:-translate-y-1 transition-transform"
                    title="GitHub"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 text-white border-2 border-[#E1306C] shadow-[2px_2px_0px_#a0154a] rounded-2xl hover:-translate-y-1 transition-transform"
                    style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
                    title="Instagram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── PROJECTS SECTION ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2 shrink-0">
            <Folder className="w-7 h-7 text-secondary" /> Karya Saya
            <span className="ml-2 text-base text-muted-foreground font-bold">({projects.length})</span>
          </h2>
          <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block" />
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full border-2 font-bold text-xs transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-[2px_2px_0px_var(--color-primary-shadow)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", bounce: 0.4, delay: index * 0.05 }}
                >
                  <NeobrutalismProjectCard project={project} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 bg-muted border-4 border-border border-dashed rounded-3xl">
            <p className="text-lg font-bold text-muted-foreground uppercase">
              {isOwnProfile ? "Belum ada karya. Yuk upload karya pertamamu!" : "Belum ada karya yang diunggah."}
            </p>
            {isOwnProfile && (
              <Link
                href="/submit"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm border-4 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] transition-all uppercase"
              >
                Upload Karya Pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── POSTS SECTION ── */}
      <div className="mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2 shrink-0">
            <MessageSquare className="w-7 h-7 text-primary" /> {isOwnProfile ? "Postingan Saya" : "Postingan"}
            <span className="ml-2 text-base text-muted-foreground font-bold">({posts.length})</span>
          </h2>
          <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block" />
          {isOwnProfile && (
            <Link
              href="/feed"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground font-black text-xs border-4 border-border shadow-[3px_3px_0px_var(--color-border)] hover:-translate-y-0.5 hover:shadow-[3px_5px_0px_var(--color-border)] transition-all uppercase"
            >
              <PenSquare className="w-4 h-4" />
              Buat Post
            </Link>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6 max-w-2xl mx-auto md:mx-0">
            {posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                author={post.author!}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted border-4 border-border border-dashed rounded-3xl">
            <p className="text-lg font-bold text-muted-foreground uppercase">
              {isOwnProfile ? "Belum ada postingan." : "Belum ada postingan dari mahasiswa ini."}
            </p>
            {isOwnProfile && (
              <Link
                href="/feed"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-black text-sm border-4 border-border shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] transition-all uppercase"
              >
                Buat Postingan
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareProfileModal
          studentName={profile.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
