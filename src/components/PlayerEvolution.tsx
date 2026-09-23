import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { PositionPoint } from '../utils/rankingInsights';

interface PlayerEvolutionProps {
  history: PositionPoint[];
  totalPlayers: number;
}

export const PlayerEvolution: React.FC<PlayerEvolutionProps> = ({ history, totalPlayers }) => {
  const width = Math.max(220, history.length * 54);
  const height = 170;
  const topPad = 18;
  const bottomPad = 36;
  const chartHeight = height - topPad - bottomPad;
  const xStep = history.length > 1 ? (width - 54) / (history.length - 1) : 0;

  const points = history.map((point, index) => {
    const x = 28 + index * xStep;
    const y = topPad + ((point.position - 1) / Math.max(totalPlayers - 1, 1)) * chartHeight;
    return { ...point, x, y };
  });

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  if (!history.length) {
    return (
      <div className="bg-[var(--surface-soft)] border-2 border-[var(--line)] p-4 text-center text-[var(--muted)]">
        <span className="font-display text-xl text-[var(--ink)] block uppercase">Evolución histórica</span>
        <span className="text-[11px]">Aparecerá cuando haya jornadas con resultados publicados.</span>
      </div>
    );
  }

  return (
    <section className="bg-[var(--surface)] border-2 border-[var(--line)] shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="bg-[var(--accent)] text-black text-[10px] font-black px-2 py-0.5 uppercase font-grotesk border border-[var(--line)]">
            Evolución histórica
          </span>
          <h3 className="font-display text-2xl font-black text-[var(--ink)] uppercase mt-1">
            Posición jornada a jornada
          </h3>
        </div>
        <span className="text-[10px] text-[var(--muted)] font-mono-code uppercase">
          1 es arriba
        </span>
      </div>

      <div className="overflow-x-auto border-2 border-[var(--line)] bg-[var(--surface-soft)] p-3">
        <svg width={width} height={height} role="img" aria-label="Gráfica de evolución de posición">
          {[1, Math.ceil(totalPlayers / 2), totalPlayers].map((rank) => {
            const y = topPad + ((rank - 1) / Math.max(totalPlayers - 1, 1)) * chartHeight;
            return (
              <g key={rank}>
                <line x1="24" y1={y} x2={width - 18} y2={y} stroke="var(--line)" strokeDasharray="4 6" />
                <text x="0" y={y + 4} fill="var(--muted)" fontSize="10" fontWeight="800">
                  {rank}
                </text>
              </g>
            );
          })}
          <path d={path} fill="none" stroke="var(--accent-ink)" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round" />
          {points.map((point) => (
            <g key={point.roundNumber}>
              <circle cx={point.x} cy={point.y} r="7" fill="var(--surface)" stroke="var(--accent-ink)" strokeWidth="4" />
              <text x={point.x} y={height - 10} fill="var(--ink)" fontSize="10" fontWeight="900" textAnchor="middle">
                J{point.roundNumber}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {history.map((point) => (
          <div key={point.roundNumber} className="bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-2 flex items-center justify-between">
            <span className="text-[var(--muted)] font-bold">Tras J{point.roundNumber}</span>
            <span className="flex items-center gap-2">
              <strong className="font-display text-xl text-[var(--ink)]">#{point.position}</strong>
              {point.delta > 0 && (
                <span className="inline-flex items-center gap-1 text-[var(--positive)] font-black">
                  <TrendingUp className="w-3.5 h-3.5" />{point.delta}
                </span>
              )}
              {point.delta < 0 && (
                <span className="inline-flex items-center gap-1 text-[var(--negative)] font-black">
                  <TrendingDown className="w-3.5 h-3.5" />{Math.abs(point.delta)}
                </span>
              )}
              {point.delta === 0 && <span className="text-[var(--muted)] font-black">=</span>}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
