"use client";

import { use, useEffect } from "react";
import { projects, students } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, Code, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { BouncyButton } from "@/components/ui/BouncyButton";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const project = projects.find((p) => p.id === resolvedParams.id);
  
  if (!project) {
    notFound();
  }

  useEffect(() => {
    // Trigger confetti on load
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f97316', '#1e3a8a', '#f59e0b']
      });
      confetti({
        particleCount: 4,
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

  const student = students.find((s) => s.id === project.studentId);
  const relatedProjects = projects
    .filter((p) => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <Link href="/explore" className="inline-flex items-center font-bold text-muted-foreground hover:text-primary mb-8 transition-colors group">
        <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center mr-3 group-hover:bg-primary group-hover:border-primary-shadow group-hover:text-white transition-colors shadow-[0_2px_0_0_var(--color-border)] group-hover:shadow-[0_2px_0_0_var(--color-primary-shadow)]">
          <ArrowLeft className="h-5 w-5" />
        </div>
        BACK TO EXPLORE
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] overflow-hidden border-4 border-border shadow-[0_8px_0_0_var(--color-border)] bg-card"
          >
            <div className="aspect-[16/9] relative">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="object-cover w-full h-full"
              />
            </div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border-4 border-border shadow-[0_8px_0_0_var(--color-border)] rounded-[2rem] p-8 md:p-10"
          >
            <div className="flex flex-wrap gap-3 mb-6">
              <StickerBadge variant="default" className="text-base px-4 py-2">
                {project.category}
              </StickerBadge>
              {project.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center rounded-xl bg-muted border-2 border-border px-3 py-1.5 text-sm font-bold text-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-6 uppercase">
              {project.title}
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none prose-p:font-medium prose-p:text-muted-foreground prose-headings:font-black prose-headings:uppercase">
              <h3 className="text-2xl mb-4">About the Project</h3>
              <p className="leading-relaxed">
                {project.description}
              </p>
              <p className="leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar: Student Info */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] bg-card border-4 border-border p-8 shadow-[0_8px_0_0_var(--color-border)]"
          >
            <h3 className="text-xl font-black uppercase mb-6 text-center text-muted-foreground">Creator</h3>
            {student && (
              <div className="flex flex-col items-center text-center">
                <Link href={`/student/${student.id}`} className="group relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-border shadow-[0_4px_0_0_var(--color-border)] group-hover:scale-105 transition-transform">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <StickerBadge variant="warning" className="text-xs -rotate-12">
                      PRO
                    </StickerBadge>
                  </div>
                </Link>
                <Link href={`/student/${student.id}`} className="hover:text-primary transition-colors">
                  <h4 className="text-2xl font-black uppercase">{student.name}</h4>
                </Link>
                <p className="text-base text-primary font-bold mb-4">{student.major}</p>
                
                <div className="flex gap-3 justify-center mb-8">
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

                <Link href={`/student/${student.id}`} className="w-full">
                  <BouncyButton variant="secondary" className="w-full text-base">
                    VIEW PROFILE
                  </BouncyButton>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">More {project.category}</h2>
            <div className="h-2 flex-grow bg-border rounded-full border-b-2 border-border/50 border-dashed hidden md:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((p) => (
              <div
                key={p.id}
              >
                <Link href={`/project/${p.id}`} className="block h-full">
                  <div className="card-3d overflow-hidden flex flex-col h-full group bg-card">
                    <div className="aspect-[4/3] w-full overflow-hidden relative border-b-4 border-border">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-black group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
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
