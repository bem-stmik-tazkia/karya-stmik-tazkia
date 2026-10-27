"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { GoogleIcon } from "@/components/cards/SocialIcons";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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
      toast.error("Mohon maaf, proses masuk akun belum berhasil. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <span className="font-bold text-xl tracking-tight">
              Karya<span className="text-primary">Tazkia</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-1.5">
            Masuk ke Akun
          </h1>
          <p className="text-muted-foreground text-sm">
            Gabung untuk pamerkan karyamu ke dunia!
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400 leading-tight">{errorMsg}</p>
          </div>
        )}

        <div className="p-3.5 bg-primary/5 border border-primary/15 rounded-xl mb-5">
          <h3 className="font-semibold text-primary text-xs mb-1 uppercase tracking-wide">Khusus Mahasiswa</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Gunakan email resmi kampus untuk masuk.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-card border border-border py-3.5 px-6 rounded-xl font-semibold text-foreground shadow-sm hover:bg-muted hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : (
            <GoogleIcon className="w-5 h-5" />
          )}
          <span>Lanjutkan dengan Google</span>
        </button>

        <div className="mt-6 text-center border-t border-border pt-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dengan masuk, kamu menyetujui{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Syarat &amp; Ketentuan
            </Link>{" "}
            serta{" "}
            <Link href="/privacy" className="text-primary hover:underline">
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
    <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

