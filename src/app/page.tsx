"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getKarya } from "@/lib/data";
import type { Karya } from "@/types/karya";
import { KARYA_CATEGORIES } from "@/types/karya";
import { ArrowRight, Flame, Users, Eye, Heart, Folder } from "lucide-react";
import { formatNumber } from "@/lib/data";
import { BouncyButton } from "@/components/ui/BouncyButton";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function Home() {
  const [featuredKarya, setFeaturedKarya] = useState<Karya[]>([]);

  useEffect(() => {
    getKarya().then((data) => setFeaturedKarya(data.slice(0, 3)));
  }, []);

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
            {featuredKarya.length === 0
              ? // Skeleton loading
                [1, 2, 3].map((n) => (
                  <div key={n} className="card-3d bg-card border-4 border-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-[16/10] bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-muted rounded-lg w-3/4" />
                      <div className="h-4 bg-muted rounded-lg w-full" />
                      <div className="h-4 bg-muted rounded-lg w-2/3" />
                    </div>
                  </div>
                ))
              : featuredKarya.map((item, index) => {
                  const categoryLabel =
                    KARYA_CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", bounce: 0.4, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <Link href={`/project/${item.id}`} className="block h-full">
                        <div className="card-3d overflow-hidden flex flex-col h-full bg-card group">
                          {/* Cover Image */}
                          <div className="aspect-[16/10] w-full overflow-hidden relative border-b-4 border-border bg-muted">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl">📁</span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3">
                              <StickerBadge variant="default" className="text-xs">
                                {categoryLabel}
                              </StickerBadge>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="p-5 flex flex-col flex-grow justify-between">
                            <div>
                              <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                                {item.title}
                              </h3>
                              <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                                {item.description}
                              </p>
                              {/* Tech Stack */}
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {(item.tech_stack ?? []).slice(0, 3).map((tech) => (
                                  <span key={tech} className="inline-flex items-center rounded-lg bg-accent/20 border-2 border-border px-2.5 py-0.5 text-xs font-bold text-foreground">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Footer: Stats */}
                            <div className="pt-4 border-t-2 border-border flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground max-w-[60%]">
                                {item.team && item.team.length > 0 ? (
                                  <>
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-muted border-2 border-border shrink-0 shadow-sm">
                                      {item.team[0].avatar ? (
                                        <img src={item.team[0].avatar} alt={item.team[0].name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-secondary text-white flex items-center justify-center text-[11px] font-black uppercase">
                                          {item.team[0].name.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <span className="truncate">{item.team[0].name}</span>
                                    {item.team.length > 1 && (
                                      <span className="text-[10px] bg-muted-foreground/20 px-1.5 py-0.5 rounded-md">+{item.team.length - 1}</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm">
                                      K
                                    </div>
                                    <span className="truncate">Karya Tazkia</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs font-black text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-primary" /> {formatNumber(item.views ?? 0)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4 text-secondary" /> {formatNumber(item.likes ?? 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
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
