import Link from "next/link";
import { Globe, ArrowUpRight, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1E3A8A] dark:border-[#1E3E82] bg-[#0F224A] dark:bg-[#0B1F4A] text-[#F2F5FA] transition-colors selection:bg-[#FF8A2B] selection:text-[#0B1F4A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-32 sm:pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-1.5 h-6 bg-[#FF8A2B] rounded-full group-hover:scale-y-110 transition-transform duration-200" />
              <span className="font-extrabold text-xl tracking-tight">
                <span className="text-white">Karya</span>
                <span className="text-[#FF8A2B]"> Tazkia</span>
              </span>
            </Link>
            <p className="text-sm text-[#94A9C9] leading-relaxed max-w-sm">
              Galeri karya dan direktori portofolio mahasiswa STMIK Tazkia. Dikelola resmi oleh{" "}
              <span className="text-white font-medium">Departemen Riset dan Teknologi (RISTEK)</span> BEM STMIK Tazkia.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://bem.stmik.tazkia.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#163066] border border-[#204285] text-xs font-semibold text-[#F2F5FA] hover:border-[#FF8A2B]/60 hover:text-[#FF8A2B] transition-all duration-200 shadow-xs group"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF8A2B]" />
                <span>Portal Resmi BEM Tazkia</span>
                <ArrowUpRight className="w-3 h-3 text-[#94A9C9] group-hover:text-[#FF8A2B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FF8A2B]/10 border border-[#FF8A2B]/30 text-xs font-semibold text-[#FF8A2B]">
                Dept. RISTEK
              </span>
            </div>
          </div>

          {/* Nav: Galeri */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A9C9]">
              Galeri Karya
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/explore" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Semua Karya
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Technology" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Website
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Programming" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Mobile Apps
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Research" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Riset / Jurnal
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Multimedia" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Desain &amp; Lainnya
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav: Mahasiswa */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A9C9]">
              Direktori
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/student" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Profil Mahasiswa
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Tentang Platform
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#94A9C9] hover:text-[#FF8A2B] transition-colors">
                  Panduan Portofolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Callout / Submit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A9C9]">
              Kontribusi
            </h4>
            <p className="text-xs text-[#94A9C9] leading-relaxed">
              Mahasiswa aktif STMIK Tazkia dapat mempublikasikan karya secara langsung.
            </p>
            <div className="pt-1">
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF8A2B] text-[#0B1F4A] text-xs font-bold hover:bg-[#ea580c] shadow-xs hover:shadow-md hover:shadow-orange-500/15 hover:-translate-y-0.5 transition-all duration-200"
              >
                Upload Karya Sekarang →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1D3A73]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#94A9C9] text-center sm:text-left">
          <span>Karya Tazkia — STMIK Tazkia</span>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2.5 sm:gap-6">
            <span>
              Dikelola oleh <strong className="text-white font-semibold">Departemen RISTEK</strong> BEM STMIK Tazkia
            </span>
            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              <Link href="/terms" className="hover:text-[#FF8A2B] transition-colors">
                Syarat &amp; Ketentuan
              </Link>
              <span className="text-[#204285] hidden sm:inline">•</span>
              <Link href="/privacy" className="hover:text-[#FF8A2B] transition-colors">
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
