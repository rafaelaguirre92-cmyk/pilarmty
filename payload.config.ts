import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { es } from "@payloadcms/translations/languages/es";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Authors } from "@/cms/collections/Authors";
import { Media } from "@/cms/collections/Media";
import { Redirects } from "@/cms/collections/Redirects";
import { Resources } from "@/cms/collections/Resources";
import { Series } from "@/cms/collections/Series";
import { Teachings } from "@/cms/collections/Teachings";
import { Topics } from "@/cms/collections/Topics";
import { Users } from "@/cms/collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL;

const db = databaseUrl
  ? postgresAdapter({
      pool: { connectionString: databaseUrl },
      push: process.env.PAYLOAD_DB_PUSH === "true",
      migrationDir: path.resolve(dirname, "migrations")
    })
  : sqliteAdapter({
      client: { url: `file:${path.resolve(dirname, ".payload/pilar.db")}` },
      push: process.env.PAYLOAD_DB_PUSH === "true",
      migrationDir: path.resolve(dirname, "migrations-sqlite")
    });

export default buildConfig({
  admin: {
    user: Users.slug,
    timezones: { defaultTimezone: "America/Monterrey" },
    components: {
      beforeNavLinks: [
        {
          path: "./cms/components/AdminCreateLink",
          exportName: "AdminCreateLink"
        }
      ],
      graphics: {
        Icon: {
          path: "./cms/components/AdminBrand",
          exportName: "AdminIcon"
        },
        Logo: {
          path: "./cms/components/AdminBrand",
          exportName: "AdminLogo"
        }
      },
      views: {
        dashboard: {
          Component: {
            path: "./cms/components/CreatorDashboard",
            exportName: "CreatorDashboard"
          }
        },
        publications: {
          path: "/publicaciones",
          Component: {
            path: "./cms/components/CreatorPublicationsView",
            exportName: "CreatorPublicationsView"
          }
        },
        createContent: {
          path: "/crear",
          Component: {
            path: "./cms/components/CreateContentView",
            exportName: "CreateContentView"
          }
        }
      }
    },
    meta: {
      titleSuffix: "— Iglesia Pilar",
      description: "Administración editorial de Iglesia Pilar"
    },
    theme: "light",
    importMap: { baseDir: dirname }
  },
  collections: [Users, Media, Authors, Topics, Series, Teachings, Resources, Redirects],
  cors: [siteUrl],
  csrf: [siteUrl],
  db,
  editor: lexicalEditor(),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.PAYLOAD_FROM_EMAIL || "sitio@iglesiapilar.mx",
        defaultFromName: "Iglesia Pilar"
      })
    : undefined,
  i18n: { fallbackLanguage: "es", supportedLanguages: { es } },
  localization: {
    locales: [
      { code: "es", label: "Español" },
      { code: "en", label: "English" }
    ],
    defaultLocale: "es",
    fallback: true
  },
  jobs: {
    access: {
      run: ({ req }) => Boolean(req.user)
    }
  },
  plugins: [
    vercelBlobStorage({
      collections: { media: { prefix: "payload-media" } },
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true
    })
  ],
  secret:
    process.env.PAYLOAD_SECRET ||
    "development-only-pilar-payload-secret-change-before-production",
  serverURL: siteUrl,
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") }
});
