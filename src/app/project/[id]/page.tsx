"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { projects, students } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Code, Eye, Heart, Folder } from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { BouncyButton } from "@/components/ui/BouncyButton";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const project = projects.find((p) => p.id === resolvedParams.id);
  
  if (!project) {
    notFound();
  }

  useEffect(() => {
    // Trigger confetti on load
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f97316', '#1e3a8a', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f97316', '#1e3a8a', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const isTeamProject = project.teamMembers && project.teamMembers.length > 1;
  const teamMembersData = isTeamProject
    ? project.teamMembers!.map(m => {
        const s = students.find(s => s.id === m.studentId);
        return s ? { ...s, role: m.role } : null;
      }).filter(Boolean) as (typeof students[0] & { role: string })[]
    : [];
  const student = students.find((s) => s.id === project.studentId);
  const relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden border-4 border-border shadow-[4px_4px_0px_var(--color-border)] bg-card"
          >
            <div className="aspect-[16/9] relative">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>

          {/* Project Details Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-4 border-border shadow-[4px_4px_0px_var(--color-border)] rounded-[2rem] p-6 sm:p-10"
          >
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
              <StickerBadge variant="default" className="text-xs sm:text-sm">
                {project.category}
              </StickerBadge>
              {project.badge && (
                <StickerBadge variant="warning" className="text-xs sm:text-sm">
                  {project.badge}
                </StickerBadge>
              )}
              {project.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-xl bg-accent/20 border-2 border-border px-3 py-1 text-xs font-bold text-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 uppercase leading-tight">
              {project.title}
            </h1>

            {/* Action Buttons: Live Demo & GitHub */}
            <div className="flex flex-wrap gap-3 mb-8">
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noreferrer">
                  <BouncyButton className="text-sm px-5 py-3">
                    LIVE DEMO <ExternalLink className="w-4 h-4 ml-2" />
                  </BouncyButton>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer">
                  <BouncyButton variant="secondary" className="text-sm px-5 py-3">
                    REPOSITORI GITHUB <Code className="w-4 h-4 ml-2" />
                  </BouncyButton>
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 py-3 px-4 bg-muted border-2 border-border rounded-2xl mb-8 w-fit text-sm font-black">
              <span className="flex items-center gap-1.5 text-primary">
                <Eye className="w-5 h-5" /> {project.views} Views
              </span>
              <span className="flex items-center gap-1.5 text-secondary">
                <Heart className="w-5 h-5 fill-current" /> {project.likes} Likes
              </span>
            </div>
            
            <div className="space-y-4 text-foreground font-medium">
              <h3 className="text-xl font-black uppercase text-foreground">Deskripsi Projek</h3>
              <p className="leading-relaxed text-muted-foreground text-base sm:text-lg">
                {project.description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Creator / Team Profile Card */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] bg-card border-4 border-border p-8 shadow-[4px_4px_0px_var(--color-border)]"
          >
            <h3 className="text-xs font-black uppercase mb-6 text-muted-foreground text-center">
              {isTeamProject ? `Tim Pembuat (${teamMembersData.length} Orang)` : "Pembuat Karya"}
            </h3>

            {isTeamProject ? (
              /* Team View */
              <div className="flex flex-col gap-4">
                {teamMembersData.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Link href={`/student/${member.id}`} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-muted transition-colors border-2 border-transparent hover:border-border">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-border shadow-[2px_2px_0px_var(--color-border)] shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{member.name}</p>
                        <p className="text-xs font-bold text-primary truncate">{member.role}</p>
                        <p className="text-xs font-medium text-muted-foreground truncate">{member.prodi}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : student ? (
              /* Solo View */
              <div className="flex flex-col items-center">
                <Link href={`/student/${student.id}`} className="group relative mb-4">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-border shadow-[2px_2px_0px_var(--color-border)] group-hover:scale-105 transition-transform bg-muted">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                <Link href={`/student/${student.id}`} className="hover:text-primary transition-colors">
                  <h4 className="text-xl font-black uppercase text-foreground text-center">{student.name}</h4>
                </Link>
                <p className="text-sm font-bold text-primary mb-1">{student.prodi}</p>
                <span className="text-xs font-bold text-muted-foreground mb-4">Angkatan {student.angkatan}</span>

                <div className="flex gap-2 justify-center mb-6">
                  {student.socials?.portfolio && (
                    <a href={student.socials.portfolio} target="_blank" rel="noreferrer" className="p-2.5 bg-muted border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-xl hover:-translate-y-1 transition-transform text-foreground">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {student.socials?.linkedin && (
                    <a href={student.socials.linkedin} target="_blank" rel="noreferrer" className="p-2.5 bg-[#0a66c2] text-white border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-xl hover:-translate-y-1 transition-transform">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {student.socials?.github && (
                    <a href={student.socials.github} target="_blank" rel="noreferrer" className="p-2.5 bg-card text-foreground border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-xl hover:-translate-y-1 transition-transform">
                      <Code className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Link href={`/student/${student.id}`} className="w-full">
                  <BouncyButton variant="secondary" className="w-full text-xs px-4 py-2.5">
                    LIHAT PROFIL PEMBUAT
                  </BouncyButton>
                </Link>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
              <Folder className="w-6 h-6 text-primary" /> Karya Kategori {project.category} Lainnya
            </h2>
            <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((p) => (
              <div key={p.id}>
                <Link href={`/project/${p.id}`} className="block h-full">
                  <div className="card-3d overflow-hidden flex flex-col h-full group bg-card">
                    <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
