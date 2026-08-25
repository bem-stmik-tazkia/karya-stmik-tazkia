"use client";

import { use } from "react";
import { projects, students } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Code, Mail, Star, Medal, Target, GraduationCap, Folder, Eye, Heart } from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const student = students.find((s) => s.id === resolvedParams.id);
  
  if (!student) {
    notFound();
  }

  const studentProjects = projects.filter((p) => p.studentId === student.id);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-6xl">
      <Link href="/student" className="inline-flex items-center font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <div className="w-10 h-10 rounded-2xl border-2 border-border flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-[2px_2px_0px_var(--color-border)]">
          <ArrowLeft className="h-5 w-5" />
        </div>
        KEMBALI KE KATALOG MAHASISWA
      </Link>

      {/* Student Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-3d bg-card border-4 border-border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-12 mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-border shadow-[4px_4px_0px_var(--color-border)] shrink-0 relative bg-muted">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center md:text-left flex-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase break-words">{student.name}</h1>
              <StickerBadge variant="warning" className="text-xs sm:text-sm -rotate-3" icon={<Star className="w-4 h-4 fill-current" />}>
                Angkatan {student.angkatan}
              </StickerBadge>
              {student.statusBadge && (
                <StickerBadge variant="default" className="text-xs sm:text-sm">
                  {student.statusBadge}
                </StickerBadge>
              )}
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-base sm:text-xl text-primary font-black uppercase mb-4">
              <GraduationCap className="w-6 h-6 shrink-0" />
              <span>{student.prodi}</span>
              <span className="text-muted-foreground text-sm font-bold">• NIM: {student.nim}</span>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl mb-6 leading-relaxed">
              {student.bio}
            </p>

            {/* Skills */}
            {student.skills && student.skills.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {student.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-xl bg-accent/20 border-2 border-border text-xs font-black text-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <a href={`mailto:${student.contactEmail}`}>
                <BouncyButton>
                  <Mail className="w-5 h-5 mr-2" />
                  KIRIM EMAIL
                </BouncyButton>
              </a>
              
              <div className="flex gap-2">
                {student.socials?.portfolio && (
                  <a href={student.socials.portfolio} target="_blank" rel="noreferrer" className="p-3 bg-muted border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform text-foreground" aria-label="Portfolio">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {student.socials?.linkedin && (
                  <a href={student.socials.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-[#0a66c2] text-white border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform" aria-label="LinkedIn">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {student.socials?.github && (
                  <a href={student.socials.github} target="_blank" rel="noreferrer" className="p-3 bg-card text-foreground border-2 border-border shadow-[2px_2px_0px_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform" aria-label="GitHub">
                    <Code className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Student Projects */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
            <Folder className="w-7 h-7 text-secondary" /> Karya oleh {student.name.split(' ')[0]}
          </h2>
          <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block"></div>
        </div>
        
        {studentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
              >
                <Link href={`/project/${project.id}`} className="block h-full">
                  <div className="card-3d overflow-hidden flex flex-col h-full bg-card group">
                    <div className="aspect-[4/3] w-full overflow-hidden relative border-b-4 border-border">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ease-in-out"
                      />
                      <div className="absolute top-4 left-4">
                        <StickerBadge variant="default" className="text-xs px-3 py-1">
                          {project.category}
                        </StickerBadge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-black group-hover:text-primary transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-xl bg-muted border-2 border-border px-2.5 py-0.5 text-xs font-bold text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 pt-3 border-t-2 border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-primary" /> {project.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-secondary" /> {project.likes}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted border-4 border-border border-dashed rounded-3xl">
            <p className="text-lg font-bold text-muted-foreground uppercase">Belum ada karya yang diunggah oleh mahasiswa ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
