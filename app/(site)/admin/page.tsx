import { redirect } from "next/navigation";

/** Legacy admin URL — unified CMS lives at /cms. */
export default function AdminPage() {
  redirect("/cms");
}
