import { serverEnv } from "@/lib/server-env";
import { createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (username !== serverEnv.adminUser || password !== serverEnv.adminPassword) {
    return Response.redirect(new URL("/admin/login?error=1", request.url), 302);
  }

  await createAdminSession();
  return Response.redirect(new URL("/admin", request.url), 302);
}
