import React from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function TermsPage() {
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
            Syarat & Ketentuan
          </h1>
          <div className="w-20 h-2 bg-primary mb-8 rounded-full"></div>
          
          <div className="space-y-6 text-muted-foreground font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">1. Penggunaan Layanan</h2>
              <p>Platform KaryaTazkia khusus diperuntukkan bagi mahasiswa dan civitas akademika STMIK Tazkia. Anda wajib menggunakan email resmi kampus untuk dapat masuk dan mengunggah karya.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">2. Hak Cipta Karya</h2>
              <p>Seluruh karya yang diunggah tetap menjadi hak milik intelektual kreator aslinya. KaryaTazkia hanya bertindak sebagai platform galeri (showcase) dan tidak mengklaim kepemilikan atas karya Anda.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-black text-foreground mb-2 uppercase">3. Konten yang Dilarang</h2>
              <p>Dilarang keras mengunggah karya hasil plagiarisme, konten yang melanggar hukum, SARA, atau karya yang tidak sesuai dengan norma kesopanan dan etika akademik.</p>
            </section>
          </div>
          
          <div className="mt-12 p-4 bg-accent/10 border-4 border-accent/20 rounded-xl">
            <p className="text-sm font-bold text-accent-shadow">
              Catatan: Halaman ini masih dalam tahap penyusunan dan merupakan draf sementara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
