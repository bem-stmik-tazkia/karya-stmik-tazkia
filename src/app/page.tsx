"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";
import { ArrowRight, Flame, Sparkles, Star, Eye } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function Home() {
  const featuredProjects = projects.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Playful Stats Bar */}
      <div className="w-full bg-accent text-accent-foreground py-3 overflow-hidden border-b-4 border-accent-shadow">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="whitespace-nowrap font-bold flex items-center gap-8 text-lg"
        >
          <span className="flex items-center"><Flame className="w-6 h-6 mr-2 fill-current" /> 120 Projects Uploaded This Semester!</span>
          <span className="flex items-center"><Star className="w-6 h-6 mr-2 fill-current" /> 50+ Active Student Creators</span>
          <span className="flex items-center"><Sparkles className="w-6 h-6 mr-2 fill-current" /> Top Design Winner: Alex Rivera</span>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 flex justify-center text-center bg-background">
        <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex justify-center mb-8"
          >
            <StickerBadge variant="warning" icon={<Sparkles className="w-4 h-4" />}>
              NEW SEMESTER
            </StickerBadge>
          </motion.div>
          
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto uppercase"
            style={{ textShadow: "4px 4px 0px var(--color-border)" }}
          >
            Showcasing <span className="text-primary">Creativity</span> &{" "}
            <span className="text-secondary">Innovation</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="mt-8 text-xl md:text-2xl font-bold text-muted-foreground max-w-2xl mx-auto"
          >
            Explore a vibrant digital gallery featuring cutting-edge projects from STMIK Tazkia.
          </motion.p>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/explore">
              <BouncyButton className="w-full sm:w-auto text-xl px-8 py-4">
                EXPLORE PORTFOLIO <ArrowRight className="ml-2 h-6 w-6" />
              </BouncyButton>
            </Link>
            <Link href="/about">
              <BouncyButton variant="muted" className="w-full sm:w-auto text-xl px-8 py-4">
                LEARN MORE
              </BouncyButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-muted border-t-4 border-border">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-4xl font-black tracking-tight uppercase" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
                Featured Projects
              </h2>
              <p className="text-lg font-bold text-muted-foreground mt-2">A handpicked selection of outstanding works.</p>
            </div>
            <Link href="/explore">
              <BouncyButton variant="secondary">
                VIEW ALL PROJECTS
              </BouncyButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {featuredProjects.map((project, index) => (
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
                      <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                        {/* Dummy Badge Display */}
                        {/* @ts-ignore */}
                        {project.badge && (
                          <StickerBadge variant="warning" className="rotate-3 group-hover:rotate-0 shadow-lg">
                            {/* @ts-ignore */}
                            {project.badge}
                          </StickerBadge>
                        )}
                        <StickerBadge variant="default" className="-rotate-2 group-hover:rotate-0">
                          {project.category}
                        </StickerBadge>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-3xl font-black group-hover:text-primary transition-colors pr-2">
                          {project.title}
                        </h3>
                        {/* @ts-ignore */}
                        {project.views && (
                          <div className="flex items-center text-muted-foreground font-bold shrink-0 mt-1">
                            <Eye className="w-5 h-5 mr-1" />
                            {/* @ts-ignore */}
                            {project.views}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-lg font-medium text-muted-foreground line-clamp-2">
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
        </div>
      </section>
    </div>
  );
}
