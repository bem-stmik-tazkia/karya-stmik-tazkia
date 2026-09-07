import Link from "next/link";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function Footer() {
  return (
    <footer className="relative border-t-4 border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
      {/* Tourist Car Strip - tampil di semua halaman */}
      <style>{`
        @keyframes driveCar {
          0%   { transform: translateX(-320px); }
          100% { transform: translateX(calc(100vw + 320px)); }
        }
      `}</style>
      <div className="absolute left-0 right-0 bottom-full pointer-events-none z-10" style={{ height: "160px", overflow: "hidden" }}>
        <div
          className="absolute bottom-[-4px] w-[240px] sm:w-[280px]"
          style={{ animation: "driveCar 14s linear infinite" }}
        >
          <DotLottieReact src="/animations/Tourists%20by%20car.lottie" loop autoplay />
        </div>
      </div>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight">
                Karya<span className="text-primary">Tazkia</span>
              </span>
            </Link>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              Galeri portofolio digital mahasiswa STMIK Tazkia. Tempat kreativitas, riset, dan inovasi bertemu.
            </p>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">Jelajahi</h3>
            <ul className="space-y-2 font-bold text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-primary transition-colors">Semua Karya</Link></li>
              <li><Link href="/explore?category=Technology" className="hover:text-primary transition-colors">Web &amp; Sistem</Link></li>
              <li><Link href="/explore?category=Programming" className="hover:text-primary transition-colors">Mobile Apps</Link></li>
              <li><Link href="/explore?category=Research" className="hover:text-primary transition-colors">Riset &amp; Jurnal</Link></li>
              <li><Link href="/explore?category=Multimedia" className="hover:text-primary transition-colors">Desain &amp; Multimedia</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">Komunitas</h3>
            <ul className="space-y-2 font-bold text-sm text-muted-foreground">
              <li><Link href="/feed" className="hover:text-primary transition-colors">Feed &amp; Koneksi</Link></li>
              <li><Link href="/student" className="hover:text-primary transition-colors">Mahasiswa</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">Bergabung</h3>
            <p className="text-sm font-bold text-muted-foreground mb-4 leading-relaxed">
              Kamu mahasiswa STMIK Tazkia? Pamerkan karya terbaikmu ke dunia.
            </p>
            <Link
              href="/submit"
              className="btn-3d btn-3d-secondary rounded-xl px-4 py-2 text-sm font-black inline-block"
            >
              KIRIM KARYA 🚀
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t-2 border-border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} STMIK Tazkia. Hak cipta dilindungi.
          </p>
          <div className="flex gap-4 font-bold text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Syarat &amp; Ketentuan</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
