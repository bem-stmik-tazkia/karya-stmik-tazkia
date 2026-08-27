"use client";

import Link from "next/link";
import { UploadCloud, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SubmitPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-xl card-3d bg-card border-4 border-border p-8 md:p-12 rounded-3xl text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-secondary/10 border-4 border-secondary flex items-center justify-center mx-auto mb-6 text-secondary shadow-[4px_4px_0px_var(--color-secondary)]">
          <UploadCloud className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-foreground mb-4 uppercase" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
          Form Upload Karya
        </h1>
        
        <p className="text-muted-foreground font-bold mb-8 leading-relaxed">
          Halo, <strong className="text-foreground">{user.email}</strong>! 👋<br/><br/>
          Fitur upload form yang komprehensif sedang dalam tahap pengembangan karena melibatkan banyak data (gambar, anggota tim, tech stack). Kami akan segera merilisnya!
        </p>
        
        <Link 
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground border-4 border-border rounded-xl font-black shadow-[4px_4px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--color-border)] active:translate-y-1 active:shadow-none transition-all uppercase"
        >
          <ArrowLeft className="w-5 h-5" />
          KEMBALI KE GALERI
        </Link>
      </motion.div>
    </div>
  );
}
