"use client";

import { use } from "react";
import { projects, students } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Code, Share2, Mail, Medal, Star, Target } from "lucide-react";
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
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Link href="/explore" className="inline-flex items-center font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center mr-3 group-hover:bg-primary group-hover:border-primary-shadow group-hover:text-white transition-colors shadow-[0_2px_0_0_var(--color-border)] group-hover:shadow-[0_2px_0_0_var(--color-primary-shadow)]">
          <ArrowLeft className="h-5 w-5" />
        </div>
        BACK TO EXPLORE
      </Link>

      {/* Student Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-4 border-border rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-12 mb-12 sm:mb-16 shadow-[0_8px_0_0_var(--color-border)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-2xl -z-10 -translate-x-1/4 translate-y-1/4" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10 z-10">
          <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 sm:border-8 border-background shadow-[0_4px_0_0_var(--color-border)] shrink-0 relative">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left flex-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase break-words">{student.name}</h1>
              <StickerBadge variant="success" className="text-xs sm:text-sm -rotate-3" icon={<Star className="w-4 h-4 fill-current" />}>
                TOP CREATOR
              </StickerBadge>
            </div>
            
            <p className="text-lg sm:text-2xl text-primary font-black uppercase mb-3 sm:mb-4">{student.major}</p>
            <p className="text-sm sm:text-lg text-muted-foreground font-medium max-w-2xl mb-6 sm:mb-8 leading-relaxed">
              {student.bio}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
              <BouncyButton>
                <Mail className="w-5 h-5 mr-2" />
                CONTACT ME
              </BouncyButton>
              
              <div className="flex gap-3">
                {student.socials.portfolio && (
                  <a href={student.socials.portfolio} className="p-3 bg-muted border-2 border-border shadow-[0_2px_0_0_var(--color-border)] rounded-2xl hover:-translate-y-1 transition-transform text-foreground" aria-label="Portfolio">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                {student.socials.linkedin && (
                  <a href={student.socials.linkedin} className="p-3 bg-[#0a66c2] text-white border-2 border-[#004182] shadow-[0_2px_0_0_#004182] rounded-2xl hover:-translate-y-1 transition-transform" aria-label="LinkedIn">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {student.socials.github && (
                  <a href={student.socials.github} className="p-3 bg-zinc-800 text-white border-2 border-zinc-950 shadow-[0_2px_0_0_#09090b] rounded-2xl hover:-translate-y-1 transition-transform" aria-label="GitHub">
                    <Code className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-8 pt-6 border-t-2 border-border border-dashed flex flex-wrap justify-center md:justify-start gap-4">
              <StickerBadge variant="warning" className="rotate-2" icon={<Medal className="w-4 h-4" />}>
                DESIGN EXCELLENCE
              </StickerBadge>
              <StickerBadge variant="default" className="-rotate-2" icon={<Target className="w-4 h-4" />}>
                PERFECT ATTENDANCE
              </StickerBadge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Student Projects */}
      <div>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight">Projects by {student.name.split(' ')[0]}</h2>
          <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block"></div>
        </div>
        
        {studentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
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
                        <StickerBadge variant="default" className="text-sm px-4 py-2 rotate-[-4deg]">
                          {project.category}
                        </StickerBadge>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-black group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="mt-4 text-base font-medium text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-xl bg-muted border-2 border-border px-3 py-1 text-sm font-bold text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted border-4 border-border border-dashed rounded-[2rem]">
            <p className="text-xl font-bold text-muted-foreground uppercase">No projects found for this student.</p>
          </div>
        )}
      </div>
    </div>
  );
}
