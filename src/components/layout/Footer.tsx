import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-4 border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl border-2 border-primary-shadow shadow-[0_2px_0_0_var(--color-primary-shadow)] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">
                Karya<span className="text-primary">Tazkia</span>
              </span>
            </Link>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">
              A vibrant gallery showcasing creativity, research, and innovation from STMIK Tazkia students.
            </p>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2 font-bold text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-primary transition-colors">All Portfolios</Link></li>
              <li><Link href="/explore" className="hover:text-primary transition-colors">Design Works</Link></li>
              <li><Link href="/explore" className="hover:text-primary transition-colors">Tech & Code</Link></li>
              <li><Link href="/explore" className="hover:text-primary transition-colors">Research Projects</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">About</h3>
            <ul className="space-y-2 font-bold text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Mission</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-black text-lg uppercase mb-4 text-foreground">Join Us</h3>
            <p className="text-sm font-bold text-muted-foreground mb-4 leading-relaxed">
              Are you a student? Showcase your best work to the world.
            </p>
            <Link
              href="/auth"
              className="btn-3d btn-3d-secondary rounded-xl px-4 py-2 text-sm font-black inline-block"
            >
              SUBMIT WORK 🚀
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t-2 border-border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} STMIK Tazkia. All rights reserved.
          </p>
          <div className="flex gap-4 font-bold text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
