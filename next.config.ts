import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

import { legacyRedirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    localPatterns: [{ pathname: "/**" }],
    remotePatterns: [
      { protocol: "https", hostname: "static.wixstatic.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }
    ],
    formats: ["image/avif", "image/webp"]
  },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default withPayload(nextConfig);
