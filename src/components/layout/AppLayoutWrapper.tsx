"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isLogin = pathname?.startsWith("/login");
  const isSubmit = pathname?.startsWith("/submit");
  const isAdmin = pathname?.startsWith("/admin");
  const hidePublicLayout = isDashboard || isLogin || isSubmit || isAdmin;

  return (
    <>
      {!hidePublicLayout && <Navbar />}
      <main className={hidePublicLayout ? "flex-1 w-full max-w-full" : "flex-1 w-full max-w-full overflow-x-clip pt-16"}>
        {children}
      </main>
      {!hidePublicLayout && <Footer />}
    </>
  );
}
