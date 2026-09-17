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
};

export default nextConfig;
