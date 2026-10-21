"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";

export default function PrivacyPage() {
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
            Kebijakan Privasi
          </h1>
          <div className="w-12 h-1 bg-primary mb-8 rounded-full" />
          
          <div className="space-y-6 text-muted-foreground text-sm sm:text-base font-normal leading-relaxed">
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">1. Pengumpulan Data</h2>
              <p>Saat Anda masuk menggunakan akun Google Kampus, kami menyimpan informasi dasar berupa Nama Lengkap, Alamat Email, dan Foto Profil publik untuk keperluan pembuatan profil pengguna di platform KaryaTazkia.</p>
            </section>
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">2. Penggunaan Data</h2>
              <p>Data Anda hanya digunakan untuk menampilkan profil pembuat karya, memfasilitasi interaksi (seperti komentar dan kolaborasi tim), serta menjaga keamanan lingkungan kampus digital.</p>
            </section>
            
            <section>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">3. Keamanan Data</h2>
              <p>Kami tidak akan menjual atau membagikan data pribadi Anda kepada pihak ketiga tanpa izin eksplisit, kecuali diwajibkan oleh hukum atau keperluan administratif kampus.</p>
            </section>
          </div>
          
          <div className="mt-10 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-xs sm:text-sm font-medium text-foreground">
              Catatan: Privasi dan kerahasiaan data mahasiswa STMIK Tazkia dijaga sesuai standar etika dan keamanan data kampus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
