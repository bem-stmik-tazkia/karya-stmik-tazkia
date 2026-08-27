"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const nextPath = searchParams.get("next") || "/dashboard";

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    const redirectUrl = new URL(window.location.origin + "/auth/callback");
    redirectUrl.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
        queryParams: {
          prompt: "consent select_account",
        },
      },
    });

    if (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-full max-w-md card-3d bg-card border-4 border-border p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="font-black text-2xl tracking-tight">
              Karya<span className="text-primary">Tazkia</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-2 uppercase" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
            Masuk Akun
          </h1>
          <p className="text-muted-foreground font-bold text-sm">
            Gabung untuk pamerkan karyamu ke dunia!
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-destructive/10 border-4 border-destructive rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-destructive leading-tight">{errorMsg}</p>
          </div>
        )}

        <div className="p-4 bg-primary/10 border-4 border-primary/20 rounded-xl mb-6">
          <h3 className="font-black text-primary text-sm mb-1 uppercase">Khusus Mahasiswa</h3>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed">
            Gunakan email resmi kampus untuk masuk.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-card border-4 border-border py-4 px-6 rounded-2xl font-black text-foreground shadow-[4px_4px_0px_0px_var(--color-border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--color-border)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
          )}
          <span>LANJUTKAN DENGAN GOOGLE</span>
        </button>

        <div className="mt-8 text-center border-t-4 border-border border-dashed pt-6">
          <p className="text-xs font-bold text-muted-foreground">
            Dengan masuk, kamu menyetujui{" "}
            <Link href="#" className="text-primary hover:underline">
              Syarat & Ketentuan
            </Link>{" "}
            serta{" "}
            <Link href="#" className="text-primary hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            KaryaTazkia.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
