import { cache } from "react";

import { schedule as fallbackSchedule } from "@/lib/site-data";

export type ProgramTrack = "saltea" | "reformer" | "alte";

export type ProgramSession = {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  instructor: string | null;
  track: ProgramTrack;
  level: string | null;
  note: string | null;
};

export type OpeningHoursRow = {
  day: string;
  hours: string;
};

export type ProgramData = {
  openingHours: OpeningHoursRow[];
  gmaNote: string | null;
  sessions: ProgramSession[];
};

const DEFAULT_GMA_NOTE =
  "Rezervările se fac în aplicația GMA (cod sală: elenaseremet). Programul afișează clasele disponibile pentru o săptămână.";

const EMPTY: ProgramData = {
  openingHours: fallbackSchedule.map((row) => ({ day: row.day, hours: row.hours })),
  gmaNote: DEFAULT_GMA_NOTE,
  sessions: []
};

function isPayloadConfigured(): boolean {
  return Boolean(process.env.PAYLOAD_SECRET?.trim() && process.env.PAYLOAD_DATABASE_URL?.trim());
}

function normalizeTrack(value: unknown): ProgramTrack {
  const v = String(value ?? "").toLowerCase();
  if (v === "reformer") return "reformer";
  if (v === "alte" || v === "altele") return "alte";
  return "saltea";
}

async function fetchProgram(): Promise<ProgramData> {
  if (!isPayloadConfigured()) {
    return EMPTY;
  }

  try {
    const { getPayloadClient } = await import("./payload");
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({ slug: "program", depth: 0 });

    if (!doc || typeof doc !== "object") {
      return EMPTY;
    }

    const d = doc as {
      openingHours?: Array<{ day?: string; hours?: string }>;
      gmaNote?: string;
      sessions?: Array<{
        day?: string;
        startTime?: string;
        endTime?: string;
        title?: string;
        instructor?: string;
        track?: string;
        level?: string;
        note?: string;
      }>;
    };

    const openingHours: OpeningHoursRow[] = [];
    if (Array.isArray(d.openingHours) && d.openingHours.length > 0) {
      for (const row of d.openingHours) {
        const day = row.day?.trim();
        const hours = row.hours?.trim();
        if (day && hours) {
          openingHours.push({ day, hours });
        }
      }
    }

    const sessions: ProgramSession[] = [];
    if (Array.isArray(d.sessions)) {
      for (const row of d.sessions) {
        const day = row.day?.trim();
        const startTime = row.startTime?.trim();
        const endTime = row.endTime?.trim();
        const title = row.title?.trim();
        if (!day || !startTime || !endTime || !title) continue;
        sessions.push({
          day,
          startTime,
          endTime,
          title,
          instructor: row.instructor?.trim() || null,
          track: normalizeTrack(row.track),
          level: row.level?.trim() || null,
          note: row.note?.trim() || null
        });
      }
    }

    return {
      openingHours: openingHours.length > 0 ? openingHours : EMPTY.openingHours,
      gmaNote: d.gmaNote?.trim() || DEFAULT_GMA_NOTE,
      sessions
    };
  } catch (error) {
    console.error("[cms-program] Failed to load program global:", error);
    return EMPTY;
  }
}

export const getProgram = cache(fetchProgram);

export const PROGRAM_DAYS = [
  { value: "luni", label: "Luni" },
  { value: "marti", label: "Marți" },
  { value: "miercuri", label: "Miercuri" },
  { value: "joi", label: "Joi" },
  { value: "vineri", label: "Vineri" },
  { value: "sambata", label: "Sâmbătă" },
  { value: "duminica", label: "Duminică" }
] as const;

export const PROGRAM_DAY_LABELS: Record<string, string> = Object.fromEntries(
  PROGRAM_DAYS.map((d) => [d.value, d.label])
);
