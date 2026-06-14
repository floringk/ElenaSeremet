"use client";

import type { ContentBlock } from "@/lib/content";
import { PageBlocks } from "@/components/sections/PageBlocks";

type ScheduleRegulationsProps = {
  sections: { heading: string; blocks: ContentBlock[] }[];
};

function isRegulamentHeading(heading: string): boolean {
  const n = heading
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return n.includes("regulament");
}

function isNumberedRuleHeading(heading: string): boolean {
  return /^\d+\.\s/.test(heading.trim());
}

export function ScheduleRegulations({ sections }: ScheduleRegulationsProps) {
  const regulamentIndex = sections.findIndex((s) => isRegulamentHeading(s.heading));

  if (regulamentIndex === -1) {
    return (
      <>
        {sections.map((sec, idx) => (
          <section key={`${sec.heading}-${idx}`} className="rich-section surface-soft">
            {sec.heading !== "Introducere" ? (
              <h2 className="rich-section-heading">{sec.heading}</h2>
            ) : null}
            <PageBlocks blocks={sec.blocks} />
          </section>
        ))}
      </>
    );
  }

  const before = sections.slice(0, regulamentIndex);
  const regulamentIntro = sections[regulamentIndex];
  const rules = sections.slice(regulamentIndex + 1);

  return (
    <>
      {before.map((sec, idx) => (
        <section key={`${sec.heading}-${idx}`} className="rich-section surface-soft">
          {sec.heading !== "Introducere" ? (
            <h2 className="rich-section-heading">{sec.heading}</h2>
          ) : null}
          <PageBlocks blocks={sec.blocks} />
        </section>
      ))}

      <section className="schedule-regulations surface-soft card">
        <h2 className="rich-section-heading">{regulamentIntro.heading}</h2>
        <PageBlocks blocks={regulamentIntro.blocks} />

        <div className="schedule-regulations-list">
          {rules.map((sec, idx) => {
            const numbered = isNumberedRuleHeading(sec.heading);
            if (numbered) {
              return (
                <details key={`${sec.heading}-${idx}`} className="schedule-regulation-item">
                  <summary className="schedule-regulation-summary">{sec.heading}</summary>
                  <div className="schedule-regulation-body">
                    <PageBlocks blocks={sec.blocks} />
                  </div>
                </details>
              );
            }
            return (
              <div key={`${sec.heading}-${idx}`} className="schedule-regulation-block">
                <h3 className="schedule-regulation-subheading">{sec.heading}</h3>
                <PageBlocks blocks={sec.blocks} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
