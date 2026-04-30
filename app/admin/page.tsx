import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Submission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  submitted_at: string;
  deliveryStatus?: string | null;
  deliveryError?: string | null;
};

type PageEvent = {
  page_path: string;
  event_name: string;
};

type AdminSearchParams = {
  page?: string;
  per?: string;
};

const PER_OPTIONS = [10, 20, 50] as const;

function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value || "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parsePer(value: string | undefined): number {
  const n = Number.parseInt(value || "20", 10);
  if (PER_OPTIONS.includes(n as (typeof PER_OPTIONS)[number])) {
    return n;
  }
  return 20;
}

function isPayloadSubmissionsEnabled(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

async function loadSubmissions(
  page: number,
  perPage: number
): Promise<{ items: Submission[]; total: number; totalPages: number; source: "payload" | "supabase" }> {
  if (isPayloadSubmissionsEnabled()) {
    try {
      const payload = await getPayloadClient();
      const res = await payload.find({
        collection: "submissions",
        sort: "-submittedAt",
        limit: perPage,
        page,
        depth: 0,
        overrideAccess: true
      });
      const items: Submission[] = (res.docs as Record<string, unknown>[]).map((d) => {
        const submitted = d.submittedAt;
        const submittedAt =
          typeof submitted === "string"
            ? submitted
            : submitted instanceof Date
              ? submitted.toISOString()
              : new Date(String(submitted)).toISOString();
        return {
          id: String(d.id),
          name: String(d.name ?? ""),
          email: String(d.email ?? ""),
          phone: d.phone ? String(d.phone) : null,
          message: String(d.message ?? ""),
          submitted_at: submittedAt,
          deliveryStatus: d.deliveryStatus != null ? String(d.deliveryStatus) : null,
          deliveryError: d.deliveryError != null ? String(d.deliveryError) : null
        };
      });
      const totalPages = res.totalPages && res.totalPages > 0 ? res.totalPages : 1;
      return { items, total: res.totalDocs, totalPages, source: "payload" };
    } catch (error) {
      console.error("[admin] Payload submissions load failed, falling back to Supabase:", error);
    }
  }

  const supabase = getSupabaseServerClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const [listRes, countRes] = await Promise.all([
    supabase.from("form_submissions").select("*").order("submitted_at", { ascending: false }).range(from, to),
    supabase.from("form_submissions").select("*", { count: "exact", head: true })
  ]);

  const rows = (listRes.data || []) as Record<string, unknown>[];
  const items: Submission[] = rows.map((r) => ({
    id: String(r.id),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    phone: r.phone != null ? String(r.phone) : null,
    message: String(r.message ?? ""),
    submitted_at: String(r.submitted_at ?? "")
  }));

  const total = countRes.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return { items, total, totalPages, source: "supabase" };
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const page = parsePage(params.page);
  const perPage = parsePer(params.per);

  const supabase = getSupabaseServerClient();

  const [submissionsData, pageViewsRes] = await Promise.all([
    loadSubmissions(page, perPage),
    supabase.from("page_events").select("page_path,event_name").eq("event_name", "page_view").limit(500)
  ]);

  const { items: submissions, total, totalPages, source: submissionSource } = submissionsData;
  const recent = submissions.length;
  const pageEvents = (pageViewsRes.data || []) as PageEvent[];

  const pageCountMap = new Map<string, number>();
  for (const item of pageEvents) {
    pageCountMap.set(item.page_path, (pageCountMap.get(item.page_path) || 0) + 1);
  }
  const topPages = [...pageCountMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const queryBase = new URLSearchParams();
  queryBase.set("per", String(perPage));

  function hrefForPage(p: number): string {
    const q = new URLSearchParams(queryBase);
    q.set("page", String(p));
    return `/admin?${q.toString()}`;
  }

  return (
    <section className="page-section">
      <div className="container admin-dashboard">
        <div className="admin-header">
          <h1>Dashboard</h1>
          <div className="admin-header-actions">
            <Link className="btn btn-secondary" href="/cms">
              Payload CMS
            </Link>
            <Link className="btn btn-secondary" href="/api/admin/export-page-events">
              Export CSV (page_events)
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="btn btn-secondary">
                Logout
              </button>
            </form>
          </div>
        </div>

        <p className="muted">
          Mesaje contact: {submissionSource === "payload" ? "Payload (`submissions`)" : "Supabase (`form_submissions`)"} ·
          Analytics: Supabase (`page_events`). Pagina {page} din {totalPages} ({perPage} / pagina).
        </p>

        <div className="stats-grid">
          <article className="card">
            <h3>Form submissions total</h3>
            <p>{total}</p>
          </article>
          <article className="card">
            <h3>Form submissions (afisate)</h3>
            <p>{recent}</p>
          </article>
          <article className="card">
            <h3>Tracked page views (esantion)</h3>
            <p>{pageEvents.length}</p>
          </article>
        </div>

        <section className="card">
          <h2>Top pagini vizitate</h2>
          <ul>
            {topPages.map(([path, count]) => (
              <li key={path}>
                {path}: {count}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="admin-toolbar">
            <h2>Ultimele mesaje</h2>
            <form className="admin-per-form" method="get" action="/admin">
              <input type="hidden" name="page" value="1" />
              <label>
                Pe pagina
                <select name="per" defaultValue={String(perPage)}>
                  {PER_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-secondary btn-small">
                Aplica
              </button>
            </form>
          </div>

          <div className="submission-list">
            {submissions.map((item) => (
              <article key={item.id} className="submission-item">
                <p>
                  <strong>{item.name}</strong> ({item.email}) {item.phone ? `- ${item.phone}` : ""}
                  {item.deliveryStatus ? (
                    <span className="muted">
                      {" "}
                      · Email: {item.deliveryStatus}
                    </span>
                  ) : null}
                </p>
                <p>{item.message}</p>
                {item.deliveryError ? <p className="muted">SMTP: {item.deliveryError}</p> : null}
                <p className="muted">{new Date(item.submitted_at).toLocaleString("ro-RO")}</p>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav className="admin-pagination" aria-label="Paginare mesaje">
              {page > 1 ? (
                <Link className="btn btn-secondary btn-small" href={hrefForPage(page - 1)} rel="prev">
                  Inapoi
                </Link>
              ) : null}
              <span className="muted">
                Pagina {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link className="btn btn-secondary btn-small" href={hrefForPage(page + 1)} rel="next">
                  Inainte
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </div>
    </section>
  );
}
