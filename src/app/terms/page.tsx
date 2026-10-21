"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center min-h-[80vh]">
      <div className="w-full max-w-3xl">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold mb-6 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="bg-card border border-border p-8 md:p-12 rounded-2xl shadow-xs">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Syarat &amp; Ketentuan
          </h1>
          <div className="w-12 h-1 bg-primary mb-8 rounded-full" />
          
          <div className="space-y-6 text-muted-foreground text-sm sm:text-base font-normal leading-relaxed">
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">1. Penggunaan Layanan</h2>
              <p>Platform KaryaTazkia khusus diperuntukkan bagi mahasiswa dan civitas akademika STMIK Tazkia. Anda wajib menggunakan email resmi kampus untuk dapat masuk dan mengunggah karya.</p>
            </section>
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">2. Hak Cipta Karya</h2>
              <p>Seluruh karya yang diunggah tetap menjadi hak milik intelektual kreator aslinya. KaryaTazkia hanya bertindak sebagai platform galeri (showcase) dan tidak mengklaim kepemilikan atas karya Anda.</p>
            </section>
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">3. Konten yang Dilarang</h2>
              <p>Dilarang keras mengunggah karya hasil plagiarisme, konten yang melanggar hukum, SARA, atau karya yang tidak sesuai dengan norma kesopanan dan etika akademik.</p>
            </section>
          </div>
          
          <div className="mt-10 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-xs sm:text-sm font-medium text-foreground">
              Catatan: Syarat dan ketentuan ini merupakan panduan resmi civitas akademika STMIK Tazkia dalam menggunakan ekosistem digital kampus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
