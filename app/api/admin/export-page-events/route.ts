import { headers } from "next/headers";
import { NextResponse } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const MAX_ROWS = 5000;

type PageEventRow = {
  created_at?: string | null;
  page_path?: string | null;
  event_name?: string | null;
  referrer?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

async function isAuthorized(): Promise<boolean> {
  if (await isAdminAuthenticated()) {
    return true;
  }
  try {
    const payload = await getPayload({ config });
    const hdrs = await headers();
    const { user } = await payload.auth({ headers: hdrs });
    return Boolean(user);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthorized())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("page_events")
    .select("created_at,page_path,event_name,referrer,ip_address,user_agent")
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const rows = (data || []) as PageEventRow[];
  const header = ["created_at", "page_path", "event_name", "referrer", "ip_address", "user_agent"];
  const lines = [
    header.join(","),
    ...rows.map((r: PageEventRow) =>
      [
        csvEscape(String(r.created_at ?? "")),
        csvEscape(String(r.page_path ?? "")),
        csvEscape(String(r.event_name ?? "")),
        csvEscape(String(r.referrer ?? "")),
        csvEscape(String(r.ip_address ?? "")),
        csvEscape(String(r.user_agent ?? ""))
      ].join(",")
    )
  ];

  const body = lines.join("\r\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="page_events.csv"'
    }
  });
}
