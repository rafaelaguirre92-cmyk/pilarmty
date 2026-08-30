import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/buscar?", "/en/search?"]
      }
    ],
    sitemap: [absoluteUrl("/sitemap-es.xml"), absoluteUrl("/sitemap-en.xml")],
    host: absoluteUrl("/")
  };
}
