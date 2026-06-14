import { redirect } from "next/navigation";

/** Legacy admin login — Payload CMS login at /cms. */
export default function AdminLoginPage() {
  redirect("/cms/login");
}
