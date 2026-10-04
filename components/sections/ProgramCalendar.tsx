"use client";

import { useEffect, useMemo, useState } from "react";

import type { ProgramData, ProgramSession } from "@/lib/program-shared";
import { PROGRAM_DAY_LABELS, PROGRAM_DAYS, PROGRAM_TRACK_LABELS } from "@/lib/program-shared";

type ProgramCalendarProps = {
  program: ProgramData;
};

const DAY_SHORT: Record<string, string> = {
  luni: "Lun",
  marti: "Mar",
  miercuri: "Mie",
  joi: "Joi",
  vineri: "Vin",
  sambata: "Sâm",
  duminica: "Dum"
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
          (PROGRAM_TRACK_LABELS[a.track] ?? a.track).localeCompare(
            PROGRAM_TRACK_LABELS[b.track] ?? b.track,
            "ro"
          )
      )
    )
    .sort((a, b) => parseTime(a[0]?.startTime ?? "00:00") - parseTime(b[0]?.startTime ?? "00:00"));
}

function getDefaultDay(sessionsByDay: Map<string, ProgramSession[]>): string {
  const jsDay = new Date().getDay();
  const map = ["duminica", "luni", "marti", "miercuri", "joi", "vineri", "sambata"] as const;
  const today = map[jsDay] ?? "luni";
  if (today === "duminica") {
    return "luni";
  }
  if ((sessionsByDay.get(today)?.length ?? 0) > 0) {
    return today;
  }
  const nextWithClasses = PROGRAM_DAYS.find((d) => (sessionsByDay.get(d.value)?.length ?? 0) > 0);
  return nextWithClasses?.value ?? "luni";
}

function DaySessions({
  dayValue,
  dayLabel,
  sessions,
  showTitle
}: {
  dayValue: string;
  dayLabel: string;
  sessions: ProgramSession[];
  showTitle: boolean;
}) {
  const rows = clusterConcurrentSessions(sessions);

  return (
    <div className={`program-calendar-day ${showTitle ? "" : "program-calendar-day--solo"}`}>
      {showTitle ? <h3 className="program-calendar-day-title">{dayLabel}</h3> : null}
      {rows.length === 0 ? (
        <p className="program-calendar-empty muted">Fără clase programate</p>
      ) : (
        <ul className="program-calendar-rows">
          {rows.map((row, rowIndex) => (
            <li key={`${dayValue}-${rowIndex}`} className="program-calendar-row">
              {row.map((session) => (
                <article
                  key={`${session.title}-${session.startTime}-${session.track}`}
                  className={`program-calendar-session program-calendar-session--${session.track}`}
                >
                  <p className="program-calendar-time">
                    <span className="program-calendar-time-start">{session.startTime}</span>
                    <span className="program-calendar-time-sep" aria-hidden>
                      –
                    </span>
                    <span className="program-calendar-time-end">{session.endTime}</span>
                  </p>
                  <h4 className="program-calendar-class-title">{session.title}</h4>
                  <p className="program-calendar-meta">
                    <span className="program-calendar-track">
                      {PROGRAM_TRACK_LABELS[session.track] ?? session.track}
                    </span>
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
}

export function ProgramCalendar({ program }: ProgramCalendarProps) {
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, ProgramSession[]>();
    for (const session of program.sessions) {
      const day = session.day.toLowerCase();
      const list = map.get(day) ?? [];
      list.push(session);
      map.set(day, list);
    }
    return map;
  }, [program.sessions]);

  const [activeDay, setActiveDay] = useState(() => getDefaultDay(sessionsByDay));
  const [isDesktop, setIsDesktop] = useState(false);
  const hasSessions = program.sessions.length > 0;
  const activeLabel = PROGRAM_DAY_LABELS[activeDay] ?? activeDay;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="program-calendar-wrap">
      {program.gmaNote ? <p className="program-calendar-gma muted">{program.gmaNote}</p> : null}

      {hasSessions ? (
        <>
          {!isDesktop ? (
            <>
              <div className="program-day-switcher" role="tablist" aria-label="Alege ziua">
                {PROGRAM_DAYS.map(({ value, label }) => {
                  const count = sessionsByDay.get(value)?.length ?? 0;
                  const selected = activeDay === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={`program-day-tab focus-ring ${selected ? "is-active" : ""} ${count === 0 ? "is-empty" : ""}`}
                      onClick={() => setActiveDay(value)}
                    >
                      <span className="program-day-tab-short">{DAY_SHORT[value] ?? label.slice(0, 3)}</span>
                      <span className="program-day-tab-full">{label}</span>
                      {count > 0 ? <span className="program-day-tab-count">{count}</span> : null}
                    </button>
                  );
                })}
              </div>

              <div className="program-calendar-mobile" aria-live="polite">
                <h3 className="program-calendar-mobile-heading">{activeLabel}</h3>
                <DaySessions
                  dayValue={activeDay}
                  dayLabel={activeLabel}
                  sessions={sessionsByDay.get(activeDay) ?? []}
                  showTitle={false}
                />
              </div>
            </>
          ) : (
            <div className="program-calendar-grid" role="region" aria-label="Program săptămânal clase">
              {PROGRAM_DAYS.map(({ value, label }) => (
                <div key={value} className="program-calendar-day-col">
                  <DaySessions
                    dayValue={value}
                    dayLabel={PROGRAM_DAY_LABELS[value] ?? label}
                    sessions={sessionsByDay.get(value) ?? []}
                    showTitle
                  />
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="program-calendar-empty-state surface-soft card">
          <p>Calendarul claselor va fi afișat aici după ce adaugi sesiuni în CMS → Program clase.</p>
        </div>
      )}
    </div>
  );
}
