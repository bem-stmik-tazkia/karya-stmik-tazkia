import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import { PerformancePatch } from "@/components/providers/PerformancePatch";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://karya.stmik.tazkia.ac.id"),
  title: {
    default: "Karya Tazkia - Galeri Portofolio & Rekayasa Digital Mahasiswa STMIK Tazkia",
    template: "%s | Karya Tazkia"
  },
  description: "Galeri kurasi karya teknologi, riset, dan portofolio resmi mahasiswa STMIK Tazkia. Menghubungkan inovasi kampus dengan industri modern.",
  keywords: ["Portofolio Mahasiswa", "STMIK Tazkia", "Karya Mahasiswa", "Tugas Akhir", "Inovasi Digital", "Kampus Bisnis Digital", "Developer Showcase"],
  authors: [{ name: "STMIK Tazkia" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://karya.stmik.tazkia.ac.id",
  },
  openGraph: {
    title: "Karya Tazkia - Galeri Portofolio & Rekayasa Digital",
    description: "Galeri kurasi karya teknologi, riset, dan portofolio resmi mahasiswa STMIK Tazkia.",
    url: "https://karya.stmik.tazkia.ac.id",
    siteName: "Karya STMIK Tazkia",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Karya Tazkia - Galeri Portofolio & Rekayasa Digital",
    description: "Galeri kurasi karya teknologi, riset, dan portofolio resmi mahasiswa STMIK Tazkia.",
  },
  verification: {
    google: "google88a80d49b5d89521",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Sengaja tidak membatasi zoom — aksesibilitas WCAG 1.4.4
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="font-sans antialiased max-w-full overflow-x-clip"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        />
        <link rel="preconnect" href="https://pmrowiyvuqnxgzmlbfzx.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pmrowiyvuqnxgzmlbfzx.supabase.co" />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col max-w-full overflow-x-clip relative" suppressHydrationWarning>
        <PerformancePatch />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster 
              position="top-center" 
              toastOptions={{ 
                style: { 
                  background: 'var(--card)', 
                  color: 'var(--foreground)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '1rem', 
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  maxWidth: '420px',
                  width: '100%',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
                } 
              }} 
            />
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
