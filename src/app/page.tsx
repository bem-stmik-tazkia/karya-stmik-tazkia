"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects, students } from "@/lib/data";
import { ArrowRight, Flame, Sparkles, Star, Eye, Users, Heart, Folder } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function Home() {
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Playful Stats Bar */}
      <div className="w-full bg-accent text-accent-foreground py-3 overflow-hidden border-b-4 border-accent-shadow relative">
        <motion.div
          initial={{ x: "100vw" }}
          animate={{ x: ["100vw", "-100%"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="flex gap-8 items-center font-bold text-sm sm:text-lg whitespace-nowrap w-max px-4"
        >
          <span className="flex items-center"><Flame className="w-5 h-5 sm:w-6 sm:h-6 mr-2 fill-current" /> 120+ Postingan Baru Minggu Ini!</span>
          <span className="flex items-center"><Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 fill-current" /> 500+ Mahasiswa Aktif Berjejaring</span>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 flex justify-center text-center bg-background">
        <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="container mx-auto px-4 md:px-6 relative z-10">


          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto uppercase"
            style={{ textShadow: "3px 3px 0px var(--color-border)" }}
          >
            Showcase <span className="text-primary">STMIK Tazkia</span>
          </motion.h1>

          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground max-w-2xl mx-auto px-2"
          >
            Jejaring Sosial Eksklusif Mahasiswa STMIK Tazkia. Pamerkan karyamu, temukan tim, dan bangun koneksi.
          </motion.p>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
          >
            <Link href="/feed">
              <BouncyButton className="w-full sm:w-auto text-lg sm:text-xl px-6 sm:px-8 py-3.5 sm:py-4">
                BUKA FEED SEKARANG <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              </BouncyButton>
            </Link>
            <Link href="/explore">
              <BouncyButton variant="muted" className="w-full sm:w-auto text-lg sm:text-xl px-6 sm:px-8 py-3.5 sm:py-4">
                LIHAT GALERI KARYA
              </BouncyButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 sm:py-20 bg-muted border-t-4 border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
              Karya Unggulan
            </h2>
            <p className="text-base sm:text-lg font-bold text-muted-foreground mt-2">Pilihan karya terbaik dari mahasiswa bulan ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {featuredProjects.map((project, index) => {
              const author = students.find((s) => s.id === project.studentId);
              return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
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
                        {/* @ts-ignore */}
                        {project.badge && (
                          <StickerBadge variant="warning" className="text-xs">
                            {/* @ts-ignore */}
                            {project.badge}
                          </StickerBadge>
                        )}
                        <StickerBadge variant="default" className="text-xs">
                          {project.category}
                        </StickerBadge>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
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
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-secondary" /> {formatNumber(project.likes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )})}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/explore">
              <BouncyButton variant="secondary" className="px-8 py-3 text-lg">
                LIHAT SEMUA KARYA
              </BouncyButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
