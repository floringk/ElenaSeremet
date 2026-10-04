import path from "node:path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";

import type { CollectionConfig, GlobalConfig, Plugin } from "payload";

import {
  getS3Bucket,
  getS3Endpoint,
  isS3StorageConfigured
} from "./lib/media-url";
import { resolvePayloadDatabaseUrl } from "./lib/payload-database-url";

const payloadDatabaseUrl = resolvePayloadDatabaseUrl();
if (payloadDatabaseUrl && !process.env.PAYLOAD_DATABASE_URL?.trim()) {
  process.env.PAYLOAD_DATABASE_URL = payloadDatabaseUrl;
}

const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" }
      ]
    }
  ]
};

const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media", plural: "Media" },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    adminThumbnail: "thumbnail",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "inside" },
      { name: "card", width: 800, height: 600, position: "inside" }
    ]
  },
  admin: {
    useAsTitle: "alt",
    defaultColumns: ["filename", "alt", "category", "updatedAt"],
    description: "Bibliotecă de imagini — upload pentru hero, galerie, echipă, OG."
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "alt", type: "text", required: true, admin: { description: "Text alternativ (accesibilitate / SEO)." } },
    {
      name: "category",
      type: "select",
      defaultValue: "hero",
      options: [
        { label: "Hero", value: "hero" },
        { label: "Inline", value: "inline" },
        { label: "Team", value: "team" },
        { label: "Open Graph", value: "og" },
        { label: "Gallery", value: "gallery" }
      ]
    }
  ]
};

const PAGE_TYPE_OPTIONS = [
  { label: "Pagină generală", value: "page" },
  { label: "Acasă (index)", value: "home" },
  { label: "Despre noi", value: "despre" },
  { label: "Servicii (hub/detaliu)", value: "servicii" },
  { label: "Prețuri", value: "preturi" },
  { label: "Program", value: "program" },
  { label: "Instructor", value: "instructor" },
  { label: "Rich / legacy", value: "rich" }
];

const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Pagină", plural: "Pagini" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "status", "updatedAt"]
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "pageType",
      type: "select",
      defaultValue: "page",
      options: PAGE_TYPE_OPTIONS,
      admin: {
        description: "Alege șablonul de afișare pe site (home, despre, servicii, etc.)."
      }
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "published",
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" }
      ]
    },
    {
      name: "description",
      type: "textarea",
      admin: { description: "Meta description (max ~160 caractere recomandat)." }
    },
    {
      name: "metaTitle",
      type: "text",
      admin: { description: "Titlu SEO. Gol = titlul paginii + numele studioului." }
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Imagine hero (upload). Are prioritate față de calea text." }
    },
    {
      name: "heroImagePath",
      type: "text",
      admin: {
        description: "Fallback cale publică (ex. /content/images/…). Folosit dacă nu ai upload."
      }
    },
    { name: "heroAlt", type: "text" },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Imagine Open Graph (upload). Gol = hero." }
    },
    {
      name: "ogImagePath",
      type: "text",
      admin: { description: "Fallback OG path. Gol = hero." }
    },
    {
      name: "noIndex",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Ascunde pagina din motoarele de căutare (noindex)." }
    },
    { name: "intro", type: "textarea" },
    {
      name: "contentImages",
      type: "array",
      label: "Imagini în pagină",
      admin: {
        description: "Galerie inline (Despre noi, servicii etc.). Ordinea = ordinea pe site."
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true
        },
        {
          name: "alt",
          type: "text",
          admin: { description: "Opțional — altfel se folosește alt-ul din Media." }
        }
      ]
    },
    {
      name: "blocks",
      type: "array",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
            { label: "Paragraph", value: "p" },
            { label: "List", value: "ul" }
          ]
        },
        { name: "text", type: "textarea" },
        {
          name: "items",
          type: "array",
          fields: [{ name: "value", type: "text", required: true }]
        }
      ]
    }
  ]
};

const GalleryAlbums: CollectionConfig = {
  slug: "gallery-albums",
  labels: { singular: "Album galerie", plural: "Albume galerie" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "published", "updatedAt"],
    description: "Albume pentru /galerie — înlocuiește folderele din mockups când există date."
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "Ex: studio-interior (URL: /galerie/studio-interior)" }
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: true
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Copertă album. Gol = prima imagine." }
    },
    {
      name: "images",
      type: "array",
      label: "Fotografii",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true
        },
        { name: "alt", type: "text" }
      ]
    }
  ]
};

const Submissions: CollectionConfig = {
  slug: "submissions",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "sourcePage", "submittedAt", "deliveryStatus"]
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "sourcePage", type: "text", required: true, defaultValue: "/contact" },
    {
      name: "deliveryStatus",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
        { label: "Skipped (no SMTP)", value: "skipped" }
      ]
    },
    { name: "deliveryError", type: "textarea" },
    { name: "ipAddress", type: "text" },
    {
      name: "submittedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString()
    }
  ]
};

const MembershipSignups: CollectionConfig = {
  slug: "membership-signups",
  labels: {
    singular: "Membership Signup",
    plural: "Membership Signups"
  },
  admin: {
    useAsTitle: "sourcePage",
    defaultColumns: ["wantGoal", "subscriptionType", "memberKind", "sourcePage", "submittedAt"]
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "wantGoal", type: "text", required: true },
    { name: "subscriptionType", type: "text", required: true },
    { name: "memberKind", type: "text", required: true },
    { name: "sourcePage", type: "text", required: true, defaultValue: "/inscriere" },
    { name: "ipAddress", type: "text" },
    {
      name: "submittedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString()
    }
  ]
};

const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "siteTitle",
      type: "text",
      admin: { description: "Nume site (folosit în șabloane SEO)." }
    },
    {
      name: "siteUrl",
      type: "text",
      admin: {
        description: "URL public (ex. https://elenaseremet.ro). Fallback: NEXT_PUBLIC_SITE_URL."
      }
    },
    {
      name: "defaultDescription",
      type: "textarea",
      admin: { description: "Descriere implicită când o pagină nu are meta description." }
    },
    {
      name: "staticRoutes",
      type: "array",
      label: "SEO — rute fixe",
      admin: {
        description: "Rute din aplicație fără colecția Pages: /contact, /galerie, /inscriere, etc."
      },
      fields: [
        {
          name: "path",
          type: "text",
          required: true,
          admin: { description: "Ex: /contact" }
        },
        { name: "metaTitle", type: "text" },
        { name: "metaDescription", type: "textarea" },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          admin: { description: "OG upload pentru rută." }
        },
        {
          name: "ogImagePath",
          type: "text",
          admin: { description: "Ex: /og-default.jpg sau /content/images/..." }
        },
        { name: "noIndex", type: "checkbox", defaultValue: false }
      ]
    }
  ]
};

const Studio: GlobalConfig = {
  slug: "studio",
  label: "Studio (contact & home)",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "studioName",
      type: "text",
      admin: { description: "Ex: Pilates Studio Elena Șeremet" }
    },
    {
      name: "addressLine1",
      type: "text",
      admin: { description: "Ex: Bd. 1 Decembrie 1918, nr. 58" }
    },
    {
      name: "addressLine2",
      type: "text",
      admin: { description: "Ex: București, Sector 3" }
    },
    {
      name: "phone",
      type: "text",
      admin: { description: "Ex: +40 755 247 412 (afișat) / tel:+40755247412" }
    },
    {
      name: "phoneHref",
      type: "text",
      admin: { description: "Link tel: (ex: +40755247412). Gol = din phone." }
    },
    {
      name: "sameAs",
      type: "textarea",
      admin: {
        description: "URL-uri social, câte unul pe linie (Instagram, Facebook…). Suplimentar la SITE_SAME_AS."
      }
    },
    {
      name: "services",
      type: "array",
      label: "Carduri servicii (home)",
      admin: { description: "Înlocuiește lista hardcodată de pe homepage." },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea", required: true },
        { name: "href", type: "text", required: true, admin: { description: "Ex: /pilates-mat" } },
        {
          name: "icon",
          type: "upload",
          relationTo: "media"
        },
        {
          name: "iconPath",
          type: "text",
          admin: { description: "Fallback path icon (ex. /content/images/Classes.svg)" }
        }
      ]
    },
    {
      name: "team",
      type: "array",
      label: "Echipă",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "href", type: "text", required: true, admin: { description: "Ex: /elena-seremet" } },
        {
          name: "photo",
          type: "upload",
          relationTo: "media"
        },
        {
          name: "imagePath",
          type: "text",
          admin: { description: "Fallback path foto" }
        }
      ]
    }
  ]
};

const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigare",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "links",
      type: "array",
      label: "Linkuri meniu",
      admin: {
        description: "Ordinea = ordinea în header/footer. Lasă gol pentru meniul implicit din cod."
      },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true, admin: { description: "Ex: /contact" } }
      ]
    }
  ]
};

const PROGRAM_DAY_OPTIONS = [
  { label: "Luni", value: "luni" },
  { label: "Marți", value: "marti" },
  { label: "Miercuri", value: "miercuri" },
  { label: "Joi", value: "joi" },
  { label: "Vineri", value: "vineri" },
  { label: "Sâmbătă", value: "sambata" },
  { label: "Duminică", value: "duminica" }
];

const Pricing: GlobalConfig = {
  slug: "pricing",
  label: "Prețuri",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "plans",
      type: "array",
      label: "Abonamente",
      admin: {
        description: "Planurile afișate pe /preturi și în formularul de înscriere."
      },
      fields: [
        { name: "name", type: "text", required: true, admin: { description: "Ex: 8 sedinte" } },
        {
          name: "price",
          type: "text",
          required: true,
          admin: { description: "Ex: 520 RON" }
        },
        { name: "note", type: "textarea" },
        {
          name: "featured",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Afișează badge „Recomandat”" }
        }
      ]
    }
  ]
};

const Program: GlobalConfig = {
  slug: "program",
  label: "Program clase",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    {
      name: "openingHours",
      type: "array",
      label: "Program studio (recepție)",
      admin: {
        description: "Afișat în footer și pe pagina Contact (nu doar pe /schedules)."
      },
      fields: [
        { name: "day", type: "text", required: true, admin: { description: "Ex: Luni - Vineri" } },
        { name: "hours", type: "text", required: true, admin: { description: "Ex: 08:30 - 21:00" } }
      ]
    },
    {
      name: "gmaNote",
      type: "textarea",
      admin: { description: "Notă despre rezervări în aplicația GMA." }
    },
    {
      name: "sessions",
      type: "array",
      label: "Clase săptămânale",
      admin: {
        description:
          "Adaugă clase per zi. Clase cu ore suprapuse (ex. Saltea + Reformer) apar simultan în calendar."
      },
      fields: [
        {
          name: "day",
          type: "select",
          required: true,
          options: PROGRAM_DAY_OPTIONS
        },
        {
          name: "startTime",
          type: "text",
          required: true,
          admin: { description: "Ex: 09:00" }
        },
        {
          name: "endTime",
          type: "text",
          required: true,
          admin: { description: "Ex: 10:00" }
        },
        { name: "title", type: "text", required: true },
        { name: "instructor", type: "text" },
        {
          name: "track",
          type: "select",
          required: true,
          defaultValue: "saltea",
          options: [
            { label: "Saltea", value: "saltea" },
            { label: "Reformer", value: "reformer" },
            { label: "Altele", value: "alte" }
          ]
        },
        { name: "level", type: "text", admin: { description: "Ex: Începători, Intermediar" } },
        { name: "note", type: "textarea" }
      ]
    }
  ]
};

const plugins: Plugin[] = [];

if (isS3StorageConfigured()) {
  const endpoint = getS3Endpoint();
  plugins.push(
    s3Storage({
      collections: {
        media: {
          prefix: "media"
        }
      },
      bucket: getS3Bucket(),
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string
        },
        region: process.env.S3_REGION?.trim() || "eu-central-1",
        ...(endpoint ? { endpoint, forcePathStyle: true } : {})
      }
    })
  );
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    suppressHydrationWarning: true,
    components: {
      beforeDashboard: ["@/components/cms/AdminDashboard#AdminDashboard"]
    }
  },
  routes: {
    admin: "/cms"
  },
  db: postgresAdapter({
    /** Keeps CMS tables out of `public` so they never collide with `form_submissions` / `page_events`. */
    schemaName: "payload",
    pool: {
      connectionString: payloadDatabaseUrl || process.env.PAYLOAD_DATABASE_URL || ""
    }
  }),
  editor: lexicalEditor(),
  collections: [Users, Media, Pages, GalleryAlbums, Submissions, MembershipSignups],
  globals: [Settings, Studio, Navigation, Pricing, Program],
  plugins,
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts")
  }
});
