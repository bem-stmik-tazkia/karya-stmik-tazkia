import type { NextConfig } from "next";

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
        source: "/(.*)",
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
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://pmrowiyvuqnxgzmlbfzx.supabase.co https://avatars.githubusercontent.com https://lh3.googleusercontent.com; font-src 'self' data:; connect-src 'self' https://pmrowiyvuqnxgzmlbfzx.supabase.co wss://pmrowiyvuqnxgzmlbfzx.supabase.co https://cdn.jsdelivr.net;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
