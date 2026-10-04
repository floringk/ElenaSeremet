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

export const PROGRAM_TRACK_LABELS: Record<string, string> = {
  saltea: "Saltea",
  reformer: "Reformer",
  alte: "Altele"
};
