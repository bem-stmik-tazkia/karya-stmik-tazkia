import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">
                Karya<span className="text-primary">Tazkia</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A vibrant gallery showcasing creativity, research, and innovation from STMIK Tazkia students.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore?category=Design" className="hover:text-primary">Design</Link></li>
              <li><Link href="/explore?category=Tech" className="hover:text-primary">Tech & Code</Link></li>
              <li><Link href="/explore?category=Research" className="hover:text-primary">Research</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">Our Mission</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Join Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you a student? Showcase your best work to the world.
            </p>
            <Link
              href="/submit"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Submit Portfolio
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} STMIK Tazkia. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
