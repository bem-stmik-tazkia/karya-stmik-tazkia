"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { Users, Lightbulb, Rocket } from "lucide-react";
import { BouncyButton } from "@/components/ui/BouncyButton";
import Link from "next/link";
import { StickerBadge } from "@/components/ui/StickerBadge";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then(mod => mod.DotLottieReact), { ssr: false });

export default function AboutPage() {
  const [totalMahasiswa, setTotalMahasiswa] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("mahasiswa_profiles")
      .select("user_id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count !== null) setTotalMahasiswa(count);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 sm:py-16 md:py-20 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 space-y-6 sm:space-y-8 w-full"
        >
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Menampilkan <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">Karya Inovatif</span> Mahasiswa
            </h1>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
            <p>
              Karya Tazkia adalah platform portofolio dan showcase riset digital resmi mahasiswa STMIK Tazkia yang diinisiasi dan dikelola oleh <strong className="text-foreground font-semibold">Departemen Riset dan Teknologi (RISTEK) BEM STMIK Tazkia</strong>. Tempat setiap baris kode, arsitektur sistem, riset ilmiah, dan karya desain kreatif didokumentasikan dan dipresentasikan secara profesional.
            </p>
            <p>
              Kami meyakini talenta masa depan lahir dari karya nyata. Platform ini menjembatani eksplorasi akademik di ruang kuliah dengan standar kebutuhan ekosistem teknologi industri.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
            <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Kolaborasi Terbuka</h3>
              <p className="text-xs text-muted-foreground font-normal mt-1 leading-relaxed">Mendorong sinergi dan pertukaran gagasan lintas program studi dan angkatan.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-3">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Inovasi Terkurasi</h3>
              <p className="text-xs text-muted-foreground font-normal mt-1 leading-relaxed">Menampilkan proyek-proyek siap pakai yang telah melalui proses validasi kampus.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-xs hover:bg-[#ea580c] hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Jelajahi Galeri Karya Mahasiswa
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Visuals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 relative w-full pt-6 sm:pt-0"
        >
          {/* Main Image Container */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-xl relative z-10 bg-card">
            <DotLottieReact
              src="/animations/best.lottie"
              loop
              autoplay
              renderConfig={{ autoResize: true }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Floating Stats Badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -bottom-4 left-4 sm:-bottom-6 sm:left-6 z-20"
          >
            <div className="bg-card/90 backdrop-blur-md border border-border shadow-lg px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">
                {totalMahasiswa !== null ? `${totalMahasiswa}+` : "250+"}
              </div>
              <div className="font-semibold text-xs text-muted-foreground leading-tight">
                Mahasiswa<br />Terkoneksi
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
