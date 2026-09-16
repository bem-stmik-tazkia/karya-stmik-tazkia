import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center min-h-[80vh]">
      <div className="w-full max-w-3xl">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-black mb-6 uppercase"
        >
          <FiArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div className="card-3d bg-card border-4 border-border p-8 md:p-12 rounded-3xl">
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 uppercase tracking-tight" style={{ textShadow: "2px 2px 0px var(--color-border)" }}>
            Kebijakan Privasi
          </h1>
          <div className="w-20 h-2 bg-secondary mb-8 rounded-full"></div>
          
          <div className="space-y-6 text-muted-foreground font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">1. Pengumpulan Data</h2>
              <p>Saat Anda masuk menggunakan akun Google Kampus, kami menyimpan informasi dasar berupa Nama Lengkap, Alamat Email, dan Foto Profil publik untuk keperluan pembuatan profil pengguna di platform KaryaTazkia.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">2. Penggunaan Data</h2>
              <p>Data Anda hanya digunakan untuk menampilkan profil pembuat karya, memfasilitasi interaksi (seperti komentar dan kolaborasi tim), serta menjaga keamanan lingkungan kampus digital.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">3. Keamanan Data</h2>
              <p>Kami tidak akan menjual atau membagikan data pribadi Anda kepada pihak ketiga tanpa izin eksplisit, kecuali diwajibkan oleh hukum atau keperluan administratif kampus.</p>
            </section>
          </div>
          
          <div className="mt-12 p-4 bg-secondary/10 border-4 border-secondary/20 rounded-xl">
            <p className="text-sm font-bold text-secondary-shadow">
              Catatan: Kebijakan privasi ini bersifat sementara untuk keperluan uji coba sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
