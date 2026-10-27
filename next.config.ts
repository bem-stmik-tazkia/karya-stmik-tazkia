import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://pmrowiyvuqnxgzmlbfzx.supabase.co https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://cdn.simpleicons.org https://cdn.jsdelivr.net https://api.qrserver.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://pmrowiyvuqnxgzmlbfzx.supabase.co wss://pmrowiyvuqnxgzmlbfzx.supabase.co https://cdn.jsdelivr.net https://cdn.simpleicons.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  compress: true, // Mengaktifkan kompresi Gzip/Brotli untuk mempercepat loading
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pmrowiyvuqnxgzmlbfzx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/feed",
        destination: "/explore",
        permanent: true,
      },
      {
        source: "/inbox/:path*",
        destination: "/student",
        permanent: true,
      },
      {
        source: "/mahasiswa",
        destination: "/student",
        permanent: true,
      },
      {
        source: "/mahasiswa/:path*",
        destination: "/student/:path*",
        permanent: true,
      },
      {
        source: "/karya",
        destination: "/explore",
        permanent: true,
      },
      {
        source: "/karya/:path*",
        destination: "/project/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
