"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import Link from "next/link";
import { Search, X, Check, Eye } from "lucide-react";
import { StickerBadge } from "@/components/ui/StickerBadge";

const categories = ["All", "Design", "Tech", "Art", "Research", "Major"];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === "All" || project.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 uppercase" style={{ textShadow: "3px 3px 0px var(--color-border)" }}>Explore Portfolios</h1>
        <p className="text-xl font-bold text-muted-foreground max-w-2xl mx-auto">
          Discover the amazing work created by our talented students.
        </p>
      </div>

      {/* Game Node Category Path */}
      <div className="mb-16 max-w-4xl mx-auto relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-2 bg-border -translate-y-1/2 rounded-full hidden md:block border-b-2 border-border/50 border-dashed" />
        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center gap-6 relative z-10">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="relative group flex flex-col items-center gap-3 outline-none"
              >
                <div 
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    isActive 
                      ? "bg-primary border-primary-shadow text-white scale-110 shadow-[0_4px_0_0_var(--color-primary-shadow)] -translate-y-2" 
                      : "bg-card border-border text-foreground shadow-[0_4px_0_0_var(--color-border)] hover:-translate-y-1 hover:shadow-[0_6px_0_0_var(--color-border)]"
                  }`}
                >
                  {isActive ? <Check className="w-8 h-8" /> : index + 1}
                </div>
                <span className={`font-black uppercase text-sm ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {category}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground font-black" />
          <input
            type="text"
            placeholder="Search by title, description, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-16 w-full rounded-2xl border-4 border-border bg-card px-12 py-2 font-bold text-lg focus:outline-none focus:border-primary focus:ring-0 shadow-[0_4px_0_0_var(--color-border)] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-muted rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {filteredProjects.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", bounce: 0.5 }}
                key={project.id}
                className="h-full"
              >
                <Link href={`/project/${project.id}`} className="block h-full">
                  <div className="card-3d overflow-hidden flex flex-col h-full group">
                    <div className="aspect-[4/3] w-full overflow-hidden relative border-b-4 border-border">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="object-cover w-full h-full group-hover:rotate-3 group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                        {/* Dummy Badge Display */}
                        {/* @ts-ignore - badge exists on data.ts now */}
                        {project.badge && (
                          <StickerBadge variant="warning" className="rotate-3 group-hover:rotate-0 shadow-lg">
                            {/* @ts-ignore */}
                            {project.badge}
                          </StickerBadge>
                        )}
                        <StickerBadge variant="accent" className="-rotate-2 group-hover:rotate-0">
                          {project.category}
                        </StickerBadge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-black group-hover:text-primary transition-colors pr-2">
                          {project.title}
                        </h3>
                        {/* @ts-ignore */}
                        {project.views && (
                          <div className="flex items-center text-muted-foreground font-bold shrink-0">
                            <Eye className="w-4 h-4 mr-1" />
                            {/* @ts-ignore */}
                            {project.views}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-muted-foreground font-medium line-clamp-2 text-sm">
                        {project.description}
                      </p>
                      <div className="mt-auto pt-4 flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-xl bg-muted border-2 border-border px-2 py-1 text-xs font-bold text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-muted border-4 border-border mb-6 rotate-12 shadow-[0_8px_0_0_var(--color-border)]">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-3xl font-black uppercase">No projects found</h3>
            <p className="text-muted-foreground mt-2 font-bold text-lg">
              Try adjusting your search query or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="mt-8 font-bold text-primary hover:underline"
            >
              CLEAR FILTERS
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
