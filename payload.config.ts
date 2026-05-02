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
    { name: "description", type: "textarea" },
    {
      name: "heroImagePath",
      type: "text",
      admin: {
        description: "Example: /content/images/NX6A7960-scaled.jpg"
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
    useAsTitle: "name"
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
        { label: "Failed", value: "failed" }
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

const Settings: GlobalConfig = {
  slug: "settings",
  label: "Site Settings",
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user)
  },
  fields: [
    { name: "siteTitle", type: "text" },
    { name: "defaultDescription", type: "textarea" }
  ]
};

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  routes: {
    admin: "/cms"
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || ""
    }
  }),
  editor: lexicalEditor(),
  collections: [Users, Pages, Submissions],
  globals: [Settings],
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts")
  }
});
