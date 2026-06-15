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

/** Demo schedule shown when CMS has no sessions yet (replace via CMS → Program clase). */
export const TEMPLATE_PROGRAM_SESSIONS: ProgramSession[] = [
  {
    day: "luni",
    startTime: "09:00",
    endTime: "10:00",
    title: "Pilates Mat — Începători",
    instructor: "Elena Seremet",
    track: "saltea",
    level: "Începători",
    note: null
  },
  {
    day: "luni",
    startTime: "09:00",
    endTime: "10:00",
    title: "Pilates Reformer",
    instructor: "Gabriela Ostafe",
    track: "reformer",
    level: "Intermediar",
    note: "Clasă simultană cu Mat"
  },
  {
    day: "luni",
    startTime: "18:30",
    endTime: "19:30",
    title: "Tonifiere",
    instructor: "Adelina Csolti",
    track: "saltea",
    level: "Toate nivelurile",
    note: null
  },
  {
    day: "marti",
    startTime: "10:00",
    endTime: "11:00",
    title: "Yogalates & Stretching",
    instructor: "Elena Seremet",
    track: "saltea",
    level: null,
    note: null
  },
  {
    day: "marti",
    startTime: "19:00",
    endTime: "20:00",
    title: "Pilates Mat — Intermediar",
    instructor: "Gabriela Ostafe",
    track: "saltea",
    level: "Intermediar",
    note: null
  },
  {
    day: "marti",
    startTime: "19:00",
    endTime: "20:00",
    title: "Reformer Flow",
    instructor: "Adelina Csolti",
    track: "reformer",
    level: "Intermediar",
    note: "Clasă simultană cu Mat"
  },
  {
    day: "miercuri",
    startTime: "09:30",
    endTime: "10:30",
    title: "Postural Pilates",
    instructor: "Elena Seremet",
    track: "saltea",
    level: null,
    note: null
  },
  {
    day: "joi",
    startTime: "18:00",
    endTime: "19:00",
    title: "Pilates Mat",
    instructor: "Adelina Csolti",
    track: "saltea",
    level: "Toate nivelurile",
    note: null
  },
  {
    day: "joi",
    startTime: "18:00",
    endTime: "19:00",
    title: "Reformer — Avansat",
    instructor: "Gabriela Ostafe",
    track: "reformer",
    level: "Avansat",
    note: "Clasă simultană cu Mat"
  },
  {
    day: "vineri",
    startTime: "08:30",
    endTime: "09:30",
    title: "Pilates Mat — Dimineață",
    instructor: "Elena Seremet",
    track: "saltea",
    level: null,
    note: null
  },
  {
    day: "sambata",
    startTime: "10:00",
    endTime: "11:00",
    title: "Yoga",
    instructor: "Adelina Csolti",
    track: "saltea",
    level: null,
    note: null
  }
];

const EMPTY: ProgramData = {
  openingHours: fallbackSchedule.map((row) => ({ day: row.day, hours: row.hours })),
  gmaNote: DEFAULT_GMA_NOTE,
  sessions: TEMPLATE_PROGRAM_SESSIONS
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
      sessions: sessions.length > 0 ? sessions : TEMPLATE_PROGRAM_SESSIONS
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
