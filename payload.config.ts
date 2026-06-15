import path from "node:path";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

import type { CollectionConfig, GlobalConfig } from "payload";

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

/** Kept for DB compatibility (prior media import). Hidden — images use heroImagePath text fields. */
const Media: CollectionConfig = {
  slug: "media",
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    adminThumbnail: "thumbnail"
  },
  admin: {
    hidden: true,
    useAsTitle: "alt"
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.role === "admin"
  },
  fields: [
    { name: "alt", type: "text", required: true },
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

const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title"
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
      admin: {
        description: "Meta description (max ~160 caractere recomandat)."
      }
    },
    {
      name: "metaTitle",
      type: "text",
      admin: {
        description: "Titlu SEO. Gol = titlul paginii + numele studioului."
      }
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      admin: { hidden: true }
    },
    {
      name: "ogImagePath",
      type: "text",
      admin: {
        description: "Imagine Open Graph (ex. /content/images/...). Gol = hero."
      }
    },
    {
      name: "noIndex",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Ascunde pagina din motoarele de căutare (noindex)."
      }
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      admin: { hidden: true }
    },
    {
      name: "heroImagePath",
      type: "text",
      admin: {
        description: "Cale publică (ex. /content/images/NX6A7960-scaled.jpg)."
      }
    },
    { name: "heroAlt", type: "text" },
    { name: "intro", type: "textarea" },
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
        description:
          "Rute din aplicație fără colecția Pages: /contact, /galerie, /inscriere, etc."
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
          admin: { hidden: true }
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
      connectionString: process.env.PAYLOAD_DATABASE_URL || ""
    }
  }),
  editor: lexicalEditor(),
  collections: [Users, Media, Pages, Submissions, MembershipSignups],
  globals: [Settings, Pricing, Program],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts")
  }
});
