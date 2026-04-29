import { schedule } from "@/lib/site-data";

export function ScheduleBlock() {
  return (
    <div className="card">
      {schedule.map((row) => (
        <p key={row.day}>
          <strong>{row.day}</strong>: {row.hours}
        </p>
      ))}
    </div>
  );
}
