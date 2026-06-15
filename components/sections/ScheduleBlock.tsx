import type { OpeningHoursRow } from "@/lib/cms-program";
import { schedule as fallbackSchedule } from "@/lib/site-data";

type ScheduleBlockProps = {
  openingHours?: OpeningHoursRow[];
};

export function ScheduleBlock({ openingHours }: ScheduleBlockProps) {
  const rows =
    openingHours && openingHours.length > 0
      ? openingHours
      : fallbackSchedule.map((row) => ({ day: row.day, hours: row.hours }));

  return (
    <ul className="schedule-list">
      {rows.map((row) => (
        <li key={row.day} className="schedule-list-row">
          <span className="schedule-list-day">{row.day}</span>
          <span className="schedule-list-hours">{row.hours}</span>
        </li>
      ))}
    </ul>
  );
}
