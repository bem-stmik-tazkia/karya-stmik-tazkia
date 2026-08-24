import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-primary tracking-tight">
              Karya<span className="text-secondary dark:text-foreground">Tazkia</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/explore" className="text-sm font-medium hover:text-primary transition-colors">
              Explore
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-muted transition-colors md:hidden">
            <Search className="h-5 w-5" />
          </button>
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search projects..."
              className="h-10 w-full rounded-full border border-border bg-background px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 md:w-[200px] lg:w-[300px]"
            />
          </div>
          <ThemeToggle />
          <Link
            href="/submit"
            className="hidden md:inline-flex h-10 items-center justify-center rounded-full bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90"
          >
            Submit Work
          </Link>
        </div>
      </div>
    </header>
  );
}
