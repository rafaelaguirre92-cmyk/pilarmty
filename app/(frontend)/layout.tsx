import type { Metadata } from "next";
import Script from "next/script";

import { Analytics } from "@/components/analytics";
import { ThemeFavicon } from "@/components/theme-favicon";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Iglesia Pilar | Iglesia cristiana en Monterrey",
    template: `%s | ${SITE_NAME}`
  },
  description:
    "Una comunidad en la zona sur de Monterrey, construida sobre un solo fundamento: Cristo.",
  applicationName: SITE_NAME,
  category: "religion",
  icons: {
    icon: [
      { url: "/brand/iso-iglesia-pilar.png", type: "image/png", sizes: "1024x1024", media: "(prefers-color-scheme: light)" },
      { url: "/brand/iso-iglesia-pilar-white.png", type: "image/png", sizes: "1024x1024", media: "(prefers-color-scheme: dark)" }
    ],
    apple: [{ url: "/brand/iso-iglesia-pilar.png", type: "image/png", sizes: "1024x1024" }]
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "es_MX"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeFavicon />
        <Script id="pilar-theme" strategy="beforeInteractive">
          {`(function(){try{var saved=localStorage.getItem("pilar-theme");var theme=saved==="dark"||saved==="light"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme}catch(e){document.documentElement.dataset.theme="light"}})();`}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
