import "server-only";

import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/site-status";

export type CmsAnalyticsSummary = {
  views7d: number;
  views30d: number;
  topPages: { page_path: string; count: number }[];
};

const EMPTY: CmsAnalyticsSummary = {
  views7d: 0,
  views30d: 0,
  topPages: []
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getSupabaseForAnalytics() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getCmsAnalyticsSummary(): Promise<CmsAnalyticsSummary> {
  if (!isSupabaseConfigured()) {
    return EMPTY;
  }

  const supabase = getSupabaseForAnalytics();
  if (!supabase) {
    return EMPTY;
  }

  try {
    const since7 = daysAgoIso(7);
    const since30 = daysAgoIso(30);

    const [views7, views30, topRes] = await Promise.all([
      supabase
        .from("page_events")
        .select("id", { count: "exact", head: true })
        .eq("event_name", "page_view")
        .gte("created_at", since7),
      supabase
        .from("page_events")
        .select("id", { count: "exact", head: true })
        .eq("event_name", "page_view")
        .gte("created_at", since30),
      supabase
        .from("page_events")
        .select("page_path")
        .eq("event_name", "page_view")
        .gte("created_at", since30)
        .limit(5000)
    ]);

    const pathCounts = new Map<string, number>();
    for (const row of topRes.data ?? []) {
      const p = String(row.page_path || "/");
      pathCounts.set(p, (pathCounts.get(p) ?? 0) + 1);
    }

    const topPages = [...pathCounts.entries()]
      .map(([page_path, count]) => ({ page_path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      views7d: views7.count ?? 0,
      views30d: views30.count ?? 0,
      topPages
    };
  } catch (error) {
    console.error("[cms-analytics] Failed to load summary:", error);
    return EMPTY;
  }
}
