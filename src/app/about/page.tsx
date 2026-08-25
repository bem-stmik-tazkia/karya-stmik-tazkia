"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, Lightbulb, Rocket } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import Link from "next/link";
import { StickerBadge } from "@/components/ui/StickerBadge";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 sm:py-16 md:py-24 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="flex-1 space-y-6 sm:space-y-8 w-full"
        >
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground uppercase break-words" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
              Menampilkan <span className="text-primary">Karya</span> Terbaik Mahasiswa
            </h1>
          </div>

          <div className="space-y-4 sm:space-y-6 text-base sm:text-xl font-medium text-muted-foreground leading-relaxed">
            <p>
              Karya Tazkia adalah platform portofolio digital resmi mahasiswa STMIK Tazkia — tempat setiap baris kode, desain antarmuka, riset inovatif, dan karya seni dihargai dan ditampilkan kepada dunia.
            </p>
            <p>
              Kami percaya bahwa setiap mahasiswa memiliki potensi luar biasa. Platform ini hadir sebagai jembatan antara kreasi akademik dan peluang nyata di industri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-4 border-border border-dashed">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary text-secondary-foreground rounded-2xl border-4 border-secondary-shadow shadow-[0_4px_0_0_var(--color-secondary-shadow)] flex items-center justify-center rotate-3">
                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-black text-xl sm:text-2xl uppercase mt-1">Komunitas</h3>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Mempererat kolaborasi antar mahasiswa dan kreator.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-2xl border-4 border-primary-shadow shadow-[0_4px_0_0_var(--color-primary-shadow)] flex items-center justify-center -rotate-3">
                <Rocket className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="font-black text-xl sm:text-2xl uppercase mt-1">Inovasi</h3>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Mendorong batas teknologi dan kreativitas kampus.</p>
            </div>
          </div>

          <div className="pt-4 sm:pt-6">
            <Link href="/explore">
              <BouncyButton className="w-full sm:w-auto text-base sm:text-lg py-3.5 sm:py-4">
                JELAJAHI KARYA MAHASISWA
              </BouncyButton>
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Visuals */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="flex-1 relative w-full pt-6 sm:pt-0"
        >
          {/* Main Image Container */}
          <div className="aspect-[4/3] rounded-3xl sm:rounded-[3rem] overflow-hidden border-4 sm:border-8 border-border shadow-[0_8px_0_0_var(--color-border)] sm:shadow-[0_12px_0_0_var(--color-border)] relative z-10 bg-card">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
              alt="Mahasiswa berkolaborasi"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Floating Sticker Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-3 right-0 sm:-top-8 sm:right-2 z-20"
          >
            <StickerBadge variant="warning" className="text-xs sm:text-lg px-3 py-1.5 sm:px-6 sm:py-3 rotate-6 shadow-md" icon={<Lightbulb className="w-4 h-4 sm:w-6 sm:h-6 fill-current" />}>
              KREATIVITAS
            </StickerBadge>
          </motion.div>

          {/* Floating Stats Badge */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -bottom-6 left-0 sm:-bottom-8 sm:left-2 z-20"
          >
            <div className="bg-card border-3 sm:border-4 border-border shadow-[0_4px_0_0_var(--color-border)] p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] flex items-center gap-3 -rotate-3">
              <div className="text-2xl sm:text-4xl font-black text-primary">50+</div>
              <div className="font-bold text-xs sm:text-sm text-muted-foreground leading-tight uppercase">
                Kreator<br />Aktif
              </div>
            </div>
          </motion.div>

          {/* Background Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </div>
  );
}
