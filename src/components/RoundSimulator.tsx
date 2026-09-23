import React, { useMemo, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import type { Match, Player } from '../types';
import { calculatePlayerStats } from '../utils/leagueCalculations';
import { simulateMatchWinner } from '../utils/rankingInsights';

interface RoundSimulatorProps {
  selectedRound: number;
  matches: Match[];
  players: Player[];
}

export const RoundSimulator: React.FC<RoundSimulatorProps> = ({ selectedRound, matches, players }) => {
  const [winners, setWinners] = useState<Record<string, 1 | 2>>({});
  const playerMap = new Map<number, Player>(players.map((player) => [player.id, player]));
  const roundMatches = matches.filter((match) => match.roundNumber === selectedRound);
  const pendingRoundMatches = roundMatches.filter((match) => match.status !== 'completed');

  const simulatedStats = useMemo(() => {
    const simulatedMatches = matches.map((match) => {
      const winner = winners[match.id];
      if (!winner || match.status === 'completed') return match;
      return simulateMatchWinner(match, winner);
    });
    return calculatePlayerStats(players, simulatedMatches);
  }, [matches, players, winners]);

  const hasSimulation = Object.keys(winners).length > 0;

  if (!pendingRoundMatches.length) {
    return (
      <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-4 text-xs font-mono-code text-[var(--muted)]">
        <span className="font-display text-xl text-[var(--ink)] uppercase block">Simular jornada</span>
        Jornada cerrada: no quedan partidos pendientes para simular aquí.
      </section>
    );
  }

  return (
    <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <span className="bg-[var(--accent)] text-black text-[10px] font-black px-2.5 py-0.5 uppercase font-grotesk border border-[var(--line)]">
            Calculadora Campecha
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] uppercase tracking-wide mt-1">
            Simular Jornada {selectedRound}
          </h2>
        </div>
        <button
          onClick={() => setWinners({})}
          className="inline-flex items-center justify-center gap-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-raised)] text-[var(--ink)] border-2 border-[var(--line)] px-3 py-2 text-xs font-black uppercase font-grotesk"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--copper-ink)]" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 space-y-3">
          {pendingRoundMatches.map((match) => {
            const team1 = match.team1.map((id) => playerMap.get(id)?.name).join(' / ');
            const team2 = match.team2.map((id) => playerMap.get(id)?.name).join(' / ');

            return (
              <article key={match.id} className="bg-[var(--surface-soft)] border-2 border-[var(--line)] p-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono-code text-[10px] text-[var(--muted)] font-black uppercase">
                    Partido {match.matchNumberInRound}
                  </span>
                  <span className="bg-[var(--surface-raised)] border border-[var(--line)] text-[10px] px-2 py-0.5 text-[var(--ink)] font-black uppercase font-grotesk">
                    Marcador simulado 6-4 / 6-4
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-11 gap-2 sm:items-stretch">
                  {[
                    { team: 1 as const, label: 'Equipo A', names: team1 },
                    { team: 2 as const, label: 'Equipo B', names: team2 },
                  ].map((option, index) => {
                    const selected = winners[match.id] === option.team;
                    return (
                      <React.Fragment key={option.team}>
                        {index === 1 && (
                          <div className="hidden sm:flex sm:col-span-1 items-center justify-center font-display text-xl text-[var(--muted)] font-black">
                            VS
                          </div>
                        )}
                        <button
                          onClick={() => setWinners((current) => ({ ...current, [match.id]: option.team }))}
                          className={`sm:col-span-5 text-left border-2 p-3 transition-all ${
                            selected
                              ? 'bg-[var(--accent)] text-black border-[var(--line)] shadow-sm'
                              : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase font-grotesk block opacity-70">
                            Ganador: {option.label}
                          </span>
                          <strong className="font-display text-xl font-black uppercase leading-none block mt-1">
                            {option.names}
                          </strong>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="lg:col-span-5 bg-[var(--surface-soft)] border-2 border-[var(--copper)] p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-[var(--copper-ink)]" />
            <h3 className="font-display text-2xl font-black text-[var(--ink)] uppercase">
              Tabla simulada
            </h3>
          </div>
          {!hasSimulation && (
            <p className="text-xs text-[var(--muted)] font-mono-code mb-3">
              Elige ganadores y verás cómo se movería el ranking.
            </p>
          )}
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {simulatedStats.map((stat, index) => (
              <div key={stat.playerId} className={`grid grid-cols-[38px_1fr_48px] items-center gap-2 px-2.5 py-2 border ${
                index < 8 ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5' : 'border-[var(--line)] bg-[var(--surface-raised)]'
              }`}>
                <span className="font-display text-xl font-black text-[var(--accent-ink)]">#{index + 1}</span>
                <span className="text-sm font-bold text-[var(--ink)] truncate">{stat.player.name}</span>
                <span className="text-right font-display text-xl font-black text-[var(--ink)]">{stat.matchesWon}V</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};
