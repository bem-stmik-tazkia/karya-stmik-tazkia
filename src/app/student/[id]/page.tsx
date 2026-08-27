"use client";

import { use, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getMahasiswaById, getMahasiswaProjects, formatNumber, toggleKaryaLike } from "@/lib/data";
import { getDeviceId } from "@/utils/identity";
import { supabase } from "@/lib/supabase";
import type { MahasiswaProfile, MahasiswaProject, Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Code,
  Mail,
  Star,
  GraduationCap,
  Folder,
  Eye,
  Heart,
  Loader2,
  Share2,
} from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { getSkillColor } from "@/utils/skillColor";
import ShareProfileModal from "@/components/mahasiswa/ShareProfileModal";
import TechStackTags from "@/components/ui/TechStackTags";

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<MahasiswaProfile | null>(null);
  const [projects, setProjects] = useState<Karya[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [likedKarya, setLikedKarya] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const ITEMS_PER_PAGE = 6;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/student/${resolvedParams.id}`
      : "";

  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiking[id]) return;
    
    setIsLiking(prev => ({ ...prev, [id]: true }));
    const wasLiked = likedKarya[id];
    setLikedKarya((prev) => ({ ...prev, [id]: !wasLiked }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      const deviceId = getDeviceId();
      
      const isNowLiked = await toggleKaryaLike(id, deviceId, userId);
      setLikedKarya((prev) => ({ ...prev, [id]: isNowLiked }));
    } catch (err) {
      console.error(err);
      setLikedKarya((prev) => ({ ...prev, [id]: wasLiked }));
    } finally {
      setIsLiking(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  // Reset page when filter changes
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  // Only show categories that have at least 1 project
  const availableCategories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return KARYA_CATEGORIES.filter((c) => c.value === "All" || cats.has(c.value));
  }, [projects]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getMahasiswaById(resolvedParams.id);
      if (!data) {
        notFound();
        return;
      }
      setMahasiswa(data);
      // Use user_id (auth uid) or fall back to profile id to search karya
      const projs = await getMahasiswaProjects(data.user_id ?? data.id);
      setProjects(projs);
      setLoading(false);
    };
    fetchData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-bold text-muted-foreground">Memuat profil mahasiswa...</p>
      </div>
    );
  }

  if (!mahasiswa) return null;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group"
      >
        <div className="w-10 h-10 rounded-2xl border-2 border-border flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]">
          <ArrowLeft className="h-5 w-5" />
        </div>
        KEMBALI
      </button>

      {/* Student Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d bg-card border-4 border-border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-12 mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-border shadow-[4px_4px_0px_var(--color-border)] shrink-0 bg-muted">
            {mahasiswa.avatar_url ? (
              <img
                src={mahasiswa.avatar_url}
                alt={mahasiswa.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-5xl font-black">
                {mahasiswa.full_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase break-words">
                {mahasiswa.full_name}
              </h1>
              <StickerBadge
                variant="warning"
                className="text-xs sm:text-sm -rotate-3"
                icon={<Star className="w-4 h-4 fill-current" />}
              >
                Angkatan {mahasiswa.angkatan}
              </StickerBadge>
              {mahasiswa.status_badge && (
                <StickerBadge variant="default" className="text-xs sm:text-sm">
                  {mahasiswa.status_badge}
                </StickerBadge>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 text-base sm:text-xl text-primary font-black uppercase mb-4">
              <GraduationCap className="w-6 h-6 shrink-0" />
              <span>{mahasiswa.prodi}</span>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl mb-6 leading-relaxed">
              {mahasiswa.bio || "Mahasiswa kreatif STMIK Tazkia."}
            </p>

            {/* Skills */}
            {(mahasiswa.skills ?? []).length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {(mahasiswa.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1 rounded-xl border-2 text-xs font-black ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <a href={`mailto:${mahasiswa.email}`}>
                <BouncyButton>
                  <Mail className="w-5 h-5 mr-2" />
                  KIRIM EMAIL
                </BouncyButton>
              </a>

              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted border-4 border-border font-black text-sm uppercase text-foreground shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_6px_0px_var(--color-border)] active:translate-y-[2px] active:shadow-[2px_2px_0px_var(--color-border)] transition-all"
              >
                <Share2 className="w-5 h-5 text-secondary" />
                Share Profil
              </button>

              <div className="flex gap-2">
                {mahasiswa.website_url && (
                  <a
                    href={mahasiswa.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-muted border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform text-foreground"
                    aria-label="Portfolio / Website"
                    title="Website / Portfolio"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {mahasiswa.linkedin_url && (
                  <a
                    href={mahasiswa.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#0a66c2] text-white border-2 border-[#0a66c2] shadow-[2px_2px_0px_#084d94] rounded-2xl hover:-translate-y-1 transition-transform"
                    aria-label="LinkedIn"
                    title="LinkedIn"
                  >
                    {/* LinkedIn SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {mahasiswa.github_url && (
                  <a
                    href={mahasiswa.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#24292e] text-white border-2 border-[#24292e] shadow-[2px_2px_0px_#000] rounded-2xl hover:-translate-y-1 transition-transform"
                    aria-label="GitHub"
                    title="GitHub"
                  >
                    {/* GitHub SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                  </a>
                )}
                {mahasiswa.instagram_url && (
                  <a
                    href={mahasiswa.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 text-white border-2 border-[#E1306C] shadow-[2px_2px_0px_#a0154a] rounded-2xl hover:-translate-y-1 transition-transform"
                    style={{ background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    {/* Instagram SVG */}
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

      {/* Student Projects */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2 shrink-0">
            <Folder className="w-7 h-7 text-secondary" /> Proyek oleh{" "}
            {mahasiswa.full_name.split(" ")[0]}
            <span className="ml-2 text-base text-muted-foreground font-bold">({projects.length})</span>
          </h2>
          <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block" />
        </div>

        {/* Category Filter */}
        {availableCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {availableCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-1.5 rounded-full border-2 font-bold text-xs transition-all ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary shadow-[2px_2px_0px_var(--color-primary-shadow)]"
                    : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project, index) => {
              const catLabel = KARYA_CATEGORIES.find((c) => c.value === project.category)?.label ?? project.category;
              const isLiked = likedKarya[project.id] ?? false;
              const likesCount = (project.likes ?? 0) + (isLiked ? 1 : 0);
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
                >
                  <Link href={`/project/${project.id}`} className="block h-full">
                    <div className="card-3d overflow-hidden flex flex-col h-full bg-card group">
                      {/* Cover Image */}
                      <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border bg-muted">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-4xl">📁</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <StickerBadge variant="default" className="text-xs">
                            {catLabel}
                          </StickerBadge>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                            {project.description}
                          </p>
                          <TechStackTags techs={project.tech_stack ?? []} maxVisible={3} className="mb-4" />
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t-2 border-border flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground max-w-[60%]">
                            {project.team && project.team.length > 0 ? (
                              <>
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0 shadow-sm">
                                  {project.team[0].avatar ? (
                                    <img src={project.team[0].avatar} alt={project.team[0].name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-[11px] font-black uppercase">
                                      {project.team[0].name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <span className="truncate">{project.team[0].name}</span>
                                {project.team.length > 1 && (
                                  <span className="text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-md">+{project.team.length - 1}</span>
                                )}
                              </>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-black text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-primary" />
                              {formatNumber(project.views ?? 0)}
                            </span>
                            <button
                              onClick={(e) => toggleLike(e, project.id)}
                              className={`flex items-center gap-1 hover:text-red-400 transition-colors ${
                                isLiked ? "text-red-500 font-black" : ""
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-red-500" : ""}`} />
                              {formatNumber(likesCount)}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-xl border-2 font-black text-sm transition-all ${
                    currentPage === page
                      ? "bg-primary text-primary-foreground border-primary shadow-[2px_2px_0px_var(--color-primary-shadow)]"
                      : "bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-card border-2 border-border text-xs font-black uppercase disabled:opacity-40 hover:bg-muted transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-16 bg-muted border-4 border-border border-dashed rounded-3xl">
            <p className="text-lg font-bold text-muted-foreground uppercase">
              Belum ada karya yang diunggah oleh mahasiswa ini.
            </p>
          </div>
        )}
      </div>

      {/* Share Profile Modal */}
      {showShareModal && mahasiswa && (
        <ShareProfileModal
          studentName={mahasiswa.full_name}
          shareUrl={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
