import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    // Allow images from all these external sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        // Supabase Storage images
        protocol: "https",
        hostname: "njpygzwlsndskquelgbk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Configure specific qualities used in the app
    qualities: [70, 75, 85],
    // Auto-serve WebP format for supported browsers (huge speed boost)
    formats: ["image/webp", "image/avif"],
    // Image cache: 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Allowed device widths for responsive images
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Enable AVIF + WebP conversion
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      {
        // Security headers for all pages
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Aggressive cache for static public assets (images, fonts, etc.)
        source: "/(.*)\\.(png|jpg|jpeg|webp|avif|svg|gif|ico|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
