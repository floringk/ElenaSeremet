import { getCmsAnalyticsSummary } from "@/lib/cms-analytics";

export async function AdminDashboard() {
  const stats = await getCmsAnalyticsSummary();

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        padding: "1.25rem 1.5rem",
        borderRadius: "8px",
        border: "1px solid var(--theme-elevation-150, #e5e7eb)",
        background: "var(--theme-elevation-50, #f9fafb)"
      }}
    >
      <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.125rem" }}>Panou site — trafic</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "1rem",
          marginBottom: "1rem"
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.75 }}>Vizite (7 zile)</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1.5rem", fontWeight: 600 }}>{stats.views7d}</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.75 }}>Vizite (30 zile)</p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "1.5rem", fontWeight: 600 }}>{stats.views30d}</p>
        </div>
      </div>

      {stats.topPages.length > 0 ? (
        <>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
            Top pagini (30 zile)
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem" }}>
            {stats.topPages.map((row) => (
              <li key={row.page_path}>
                {row.page_path} — {row.count}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.75 }}>
          Nu există încă date de trafic. Vizitele apar după ce utilizatorii navighează site-ul public.
        </p>
      )}

      <p style={{ margin: "1rem 0 0", fontSize: "0.8125rem" }}>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- CSV API download, not a page route */}
        <a href="/api/admin/export-page-events" style={{ color: "var(--theme-success-500, #0f766e)" }}>
          Export CSV evenimente
        </a>
        {" · "}
        Formulare contact și înscrieri: colecțiile <strong>Submissions</strong> și{" "}
        <strong>Membership Signups</strong>.
      </p>
    </div>
  );
}
