import React from 'react';
import type { PlayerRecordCard } from '../utils/rankingInsights';

interface PlayerRecordsProps {
  records: PlayerRecordCard[];
}

const accentClass = {
  lime: 'border-[var(--accent)] text-[var(--accent)] shadow-[2px_2px_0px_0px_var(--accent)]',
  orange: 'border-[var(--copper)] text-[var(--copper)] shadow-[2px_2px_0px_0px_var(--copper)]',
  white: 'border-white text-white shadow-[2px_2px_0px_0px_#ffffff]',
} satisfies Record<PlayerRecordCard['accent'], string>;

export const PlayerRecords: React.FC<PlayerRecordsProps> = ({ records }) => (
  <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
    {records.map((record) => (
      <article key={record.title} className={`bg-black border-2 p-3 ${accentClass[record.accent]}`}>
        <span className="text-[9px] text-slate-400 font-black uppercase font-grotesk tracking-wider block">
          {record.title}
        </span>
        <strong className="font-display text-2xl sm:text-3xl text-white font-black leading-none block mt-1">
          {record.value}
        </strong>
        <span className="text-[10px] text-slate-500 font-mono-code block mt-1 leading-tight">
          {record.detail}
        </span>
      </article>
    ))}
  </section>
);
