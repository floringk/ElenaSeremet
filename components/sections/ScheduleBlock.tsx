import { schedule } from "@/lib/site-data";

export function ScheduleBlock() {
  return (
    <ul className="schedule-list">
      {schedule.map((row) => (
        <li key={row.day} className="schedule-list-row">
          <span className="schedule-list-day">{row.day}</span>
          <span className="schedule-list-hours">{row.hours}</span>
        </li>
      ))}
    </ul>
  );
}
