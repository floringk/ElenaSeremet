import type { ProgramData, ProgramSession } from "@/lib/cms-program";
import { PROGRAM_DAYS, PROGRAM_DAY_LABELS } from "@/lib/cms-program";

type ProgramCalendarProps = {
  program: ProgramData;
};

const TRACK_LABELS: Record<string, string> = {
  saltea: "Saltea",
  reformer: "Reformer",
  alte: "Altele"
};

function parseTime(value: string): number {
  const [h, m] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

function sessionsOverlap(a: ProgramSession, b: ProgramSession): boolean {
  return parseTime(a.startTime) < parseTime(b.endTime) && parseTime(b.startTime) < parseTime(a.endTime);
}

function clusterConcurrentSessions(sessions: ProgramSession[]): ProgramSession[][] {
  const sorted = [...sessions].sort(
    (a, b) => parseTime(a.startTime) - parseTime(b.startTime) || parseTime(a.endTime) - parseTime(b.endTime)
  );
  const clusters: ProgramSession[][] = [];

  for (const session of sorted) {
    let merged = false;
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].some((other) => sessionsOverlap(other, session))) {
        clusters[i].push(session);
        merged = true;
        for (let j = clusters.length - 1; j > i; j--) {
          if (clusters[j].some((other) => clusters[i].some((ci) => sessionsOverlap(ci, other)))) {
            clusters[i].push(...clusters[j]);
            clusters.splice(j, 1);
          }
        }
        break;
      }
    }
    if (!merged) {
      clusters.push([session]);
    }
  }

  return clusters
    .map((cluster) =>
      [...cluster].sort(
        (a, b) =>
          parseTime(a.startTime) - parseTime(b.startTime) ||
          (TRACK_LABELS[a.track] ?? a.track).localeCompare(TRACK_LABELS[b.track] ?? b.track, "ro")
      )
    )
    .sort((a, b) => parseTime(a[0]?.startTime ?? "00:00") - parseTime(b[0]?.startTime ?? "00:00"));
}

export function ProgramCalendar({ program }: ProgramCalendarProps) {
  const sessionsByDay = new Map<string, ProgramSession[]>();
  for (const session of program.sessions) {
    const day = session.day.toLowerCase();
    const list = sessionsByDay.get(day) ?? [];
    list.push(session);
    sessionsByDay.set(day, list);
  }

  const hasSessions = program.sessions.length > 0;

  return (
    <div className="program-calendar-wrap">
      {program.gmaNote ? <p className="program-calendar-gma muted">{program.gmaNote}</p> : null}

      {hasSessions ? (
        <div className="program-calendar-grid" role="region" aria-label="Program săptămânal clase">
          {PROGRAM_DAYS.map(({ value, label }) => {
            const daySessions = sessionsByDay.get(value) ?? [];
            const rows = clusterConcurrentSessions(daySessions);

            return (
              <div key={value} className="program-calendar-day">
                <h3 className="program-calendar-day-title">{PROGRAM_DAY_LABELS[value] ?? label}</h3>
                {rows.length === 0 ? (
                  <p className="program-calendar-empty muted">Fără clase programate</p>
                ) : (
                  <ul className="program-calendar-rows">
                    {rows.map((row, rowIndex) => (
                      <li key={`${value}-${rowIndex}`} className="program-calendar-row">
                        {row.map((session) => (
                          <article
                            key={`${session.title}-${session.startTime}-${session.track}`}
                            className={`program-calendar-session program-calendar-session--${session.track}`}
                          >
                            <p className="program-calendar-time">
                              {session.startTime} – {session.endTime}
                            </p>
                            <h4 className="program-calendar-class-title">{session.title}</h4>
                            <p className="program-calendar-meta">
                              <span className="program-calendar-track">{TRACK_LABELS[session.track] ?? session.track}</span>
                              {session.instructor ? <span>{session.instructor}</span> : null}
                              {session.level ? <span>{session.level}</span> : null}
                            </p>
                            {session.note ? <p className="program-calendar-note muted">{session.note}</p> : null}
                          </article>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="program-calendar-empty-state surface-soft card">
          <p>
            Calendarul claselor va fi afișat aici după ce adaugi sesiuni în CMS → Program clase.
          </p>
        </div>
      )}
    </div>
  );
}
