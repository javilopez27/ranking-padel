import React from 'react';
import { Crown, Flame, Medal, Swords } from 'lucide-react';
import type { FameRecord } from '../utils/rankingInsights';

interface HallOfFameProps {
  records: FameRecord[];
}

const icons = [Crown, Flame, Swords, Medal];

const accentClass = {
  lime: 'border-[var(--accent)] shadow-sm text-[var(--accent-ink)]',
  orange: 'border-[var(--copper)] shadow-sm text-[var(--copper-ink)]',
  white: 'border-[var(--line)] shadow-sm text-[var(--ink)]',
} satisfies Record<FameRecord['accent'], string>;

export const HallOfFame: React.FC<HallOfFameProps> = ({ records }) => (
  <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 sm:p-6 shadow-sm relative overflow-hidden">
    <div className="absolute -right-10 -top-8 font-display text-[120px] text-[var(--ink)]/5 font-black leading-none pointer-events-none">
      HOF
    </div>

    <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
      <div>
        <span className="bg-[var(--copper)] text-[#fff8ef] font-black text-[10px] px-2.5 py-0.5 uppercase tracking-wider font-grotesk border border-[var(--line)]">
          Records Campechos
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--ink)] uppercase tracking-wide leading-none mt-2">
          Hall of Fame
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-[var(--muted)] font-mono-code max-w-sm">
        La vitrina se actualiza sola con cada resultado publicado.
      </p>
    </div>

    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {records.map((record, index) => {
        const Icon = icons[index % icons.length];
        return (
          <article key={`${record.title}-${index}`} className={`bg-[var(--surface-soft)] border-2 p-4 ${accentClass[record.accent]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[var(--muted)] font-black uppercase font-grotesk tracking-wider">
                {record.title}
              </span>
              <Icon className={`w-4 h-4 ${accentClass[record.accent].split(' ').at(-1)}`} />
            </div>
            <strong className="font-display text-2xl text-[var(--ink)] font-black uppercase leading-none block">
              {record.value}
            </strong>
            <p className="text-[11px] text-[var(--muted)] font-mono-code mt-2 leading-snug">
              {record.detail}
            </p>
          </article>
        );
      })}
    </div>
  </section>
);
