import config from "@payload-config";
import "@payloadcms/next/css";
import {
  handleServerFunctions,
  metadata as payloadMetadata,
  RootLayout
} from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import type React from "react";
import type { Metadata } from "next";

import { ThemeFavicon } from "@/components/theme-favicon";
import { MobileBlocker } from "@/cms/components/MobileBlocker";
import { importMap } from "./admin/importMap.js";
import "./custom.css";

export const metadata: Metadata = {
  ...payloadMetadata,
  icons: {
    icon: [
      { url: "/brand/iso-iglesia-pilar.png", type: "image/png", sizes: "1024x1024", media: "(prefers-color-scheme: light)" },
      { url: "/brand/iso-iglesia-pilar-white.png", type: "image/png", sizes: "1024x1024", media: "(prefers-color-scheme: dark)" }
    ],
    apple: [{ url: "/brand/iso-iglesia-pilar.png", type: "image/png", sizes: "1024x1024" }]
  },
  robots: { index: false, follow: false }
};

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <ThemeFavicon />
      <MobileBlocker />
      {children}
    </RootLayout>
  );
}
