"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects, students } from "@/lib/data";
import Link from "next/link";
import { Search, X, Check, Eye, Heart, Sparkles, Folder, ExternalLink, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { formatNumber } from "@/lib/utils";

const categories = ["Semua", "Tech", "Design", "Art", "Research"];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [likedProjects, setLikedProjects] = useState<Record<string, boolean>>({});

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        activeCategory === "Semua" ||
        project.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Pagination
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategory("Semua");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-7xl">
      {/* Page Title Header */}
      <div className="mb-12 text-center">
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase"
          style={{ textShadow: "3px 3px 0px var(--color-border)" }}
        >
          Eksplorasi <span className="text-primary">Portofolio Karya</span>
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl font-bold text-muted-foreground max-w-2xl mx-auto"
        >
          Temukan berbagai hasil karya inovatif, riset, dan proyek teknologi terbaik ciptaan mahasiswa STMIK Tazkia.
        </motion.p>
      </div>

      {/* Category Filter Nodes */}
      <div className="mb-10 max-w-4xl mx-auto relative px-2">
        <div className="absolute top-12 left-8 right-8 h-0 border-b-4 border-border/50 border-dashed hidden md:block" />
        <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 md:justify-between no-scrollbar scroll-smooth">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
                className="relative group flex flex-col items-center gap-2 outline-none shrink-0 py-2 px-1"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border-4 flex items-center justify-center font-black text-sm sm:text-lg transition-all duration-200 ${isActive
                      ? "bg-primary border-border text-primary-foreground scale-105 shadow-[4px_4px_0px_var(--color-border)] -translate-y-1"
                      : "bg-card border-border text-foreground shadow-[2px_2px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_var(--color-border)]"
                    }`}
                >
                  {isActive ? <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" /> : index + 1}
                </div>
                <span className={`font-black uppercase text-xs sm:text-sm tracking-wide ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground font-black pointer-events-none" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, deskripsi, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-14 w-full rounded-2xl border-4 border-border bg-card pl-12 pr-10 py-2 font-bold text-sm sm:text-base focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] shadow-[4px_4px_0px_var(--color-border)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted rounded-xl p-1 border-2 border-border"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        {filteredProjects.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {paginatedProjects.map((project, index) => {
                const author = students.find((s) => s.id === project.studentId);
                const isLiked = likedProjects[project.id];
                const likesNum = typeof project.likes === "number" ? project.likes : parseInt(project.likes) || 0;
                const likesCount = likesNum + (isLiked ? 1 : 0);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    key={project.id}
                    className="h-full"
                  >
                    <Link href={`/project/${project.id}`} className="block h-full">
                      <div className="card-3d overflow-hidden flex flex-col h-full bg-card group">
                        {/* Cover Image */}
                        <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border bg-muted">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap items-start gap-2">
                            {project.badge && (
                              <StickerBadge variant="warning" className="text-xs">
                                {project.badge}
                              </StickerBadge>
                            )}
                            <StickerBadge variant="default" className="text-xs">
                              {project.category}
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

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="inline-flex items-center rounded-lg bg-accent/20 border-2 border-border px-2.5 py-0.5 text-xs font-bold text-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Footer Info: Author & Stats */}
                          <div className="pt-4 border-t-2 border-border flex items-center justify-between mt-auto">
                            {(() => {
                              const isTeam = project.teamMembers && project.teamMembers.length > 1;
                              const teamMembers = isTeam 
                                ? project.teamMembers!.map(m => students.find(s => s.id === m.studentId)).filter(Boolean) 
                                : author ? [author] : [];
                              
                              if (teamMembers.length > 1) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className="flex -space-x-3">
                                      {teamMembers.slice(0, 3).map((member, i) => (
                                        <img
                                          key={member!.id}
                                          src={member!.avatarUrl}
                                          alt={member!.name}
                                          className="w-7 h-7 rounded-full object-cover border-2 border-card relative"
                                          style={{ zIndex: 3 - i }}
                                          title={member!.name}
                                        />
                                      ))}
                                      {teamMembers.length > 3 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold z-0 relative -ml-3">
                                          +{teamMembers.length - 3}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-xs font-bold text-foreground truncate max-w-[80px]" title={teamMembers.map(m => m!.name).join(', ')}>
                                      {teamMembers[0]!.name.split(' ')[0]} +{teamMembers.length - 1}
                                    </span>
                                  </div>
                                );
                              } else if (teamMembers.length === 1) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={teamMembers[0]!.avatarUrl}
                                      alt={teamMembers[0]!.name}
                                      className="w-7 h-7 rounded-xl object-cover border-2 border-border"
                                    />
                                    <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
                                      {teamMembers[0]!.name}
                                    </span>
                                  </div>
                                );
                              }
                              
                              return (
                                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                                  <Folder className="w-4 h-4 text-primary" /> Karya Tazkia
                                </div>
                              );
                            })()}

                            <div className="flex items-center gap-3 text-xs font-black text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4 text-primary" /> {formatNumber(project.views)}
                              </span>
                              <button
                                onClick={(e) => toggleLike(e, project.id)}
                                className={`flex items-center gap-1 hover:text-secondary transition-colors ${isLiked ? "text-secondary font-black" : ""
                                  }`}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-secondary" : ""}`} />
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
            </motion.div>

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
                    className={`w-10 h-10 rounded-xl border-2 border-border text-xs font-black transition-all ${currentPage === page
                        ? "bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--color-border)]"
                        : "bg-card text-foreground hover:bg-muted"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-3d bg-card border-4 border-border rounded-3xl p-10 text-center max-w-lg mx-auto my-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border-2 border-border">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase text-foreground mb-2">Projek Tidak Ditemukan</h3>
            <p className="text-muted-foreground font-medium text-sm mb-6">
              Tidak ada hasil yang sesuai dengan kata kunci pencarian atau kategori yang Anda pilih.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-black uppercase border-2 border-border shadow-[2px_2px_0px_var(--color-border)] hover:bg-secondary/90 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> RESET FILTERS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
