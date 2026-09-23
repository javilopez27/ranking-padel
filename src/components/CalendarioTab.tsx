import React, { useState } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { Player, Match, RoundInfo } from '../types';
import { RoundSimulator } from './RoundSimulator';
import { MatchScoreboard } from './MatchScoreboard';

interface CalendarioTabProps {
  roundInfos: RoundInfo[];
  matches: Match[];
  players: Player[];
}

export const CalendarioTab: React.FC<CalendarioTabProps> = ({
  roundInfos,
  matches,
  players,
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [playerFilter, setPlayerFilter] = useState<number | 'all'>('all');
  const [showPostponedView, setShowPostponedView] = useState<boolean>(false);


  // Postponed matches across all rounds
  const postponedMatches = matches.filter((m) => m.status === 'postponed');

  // Filter matches based on selected round and optional player filter
  const currentRoundInfo = roundInfos.find((r) => r.roundNumber === selectedRound) || roundInfos[0];
  
  const displayedMatches = showPostponedView
    ? postponedMatches
    : matches.filter((m) => {
        if (m.roundNumber !== selectedRound) return false;
        if (playerFilter === 'all') return true;
        return m.team1.includes(playerFilter) || m.team2.includes(playerFilter);
      });

  const completedInCurrentRound = matches.filter(
    (m) => m.roundNumber === selectedRound && m.status === 'completed'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-[var(--accent)] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-[var(--line)]">
              FIXTURE OFICIAL
            </span>
            <span className="bg-[var(--copper)] text-[#fff8ef] font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-[var(--line)]">
              33 PARTIDOS REGULARES
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-wide uppercase leading-none">
            CALENDARIO DE JORNADAS
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-[var(--muted)] mt-1">
            11 jornadas // 3 partidos por jornada
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-[var(--surface-soft)] border-2 border-[var(--line)] px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-ink)] shrink-0" />
            <span className="text-xs font-grotesk font-black text-[var(--muted)] uppercase hidden sm:inline">FILTRO:</span>
            <select
              id="player-filter-select"
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-[var(--ink)] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--surface-soft)] text-[var(--ink)]">TODOS LOS JUGADORES</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-[var(--surface-soft)] text-[var(--ink)]">
                  Solo {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="bg-[var(--surface-raised)] border-2 border-[var(--line)] px-3.5 py-2 text-xs font-black font-grotesk uppercase text-[var(--ink)]">
            Edicion por archivo del organizador
          </span>
        </div>
      </div>

      {/* Round Selector Bar */}
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] p-2 sm:p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {roundInfos.map((r) => {
            const isSelected = selectedRound === r.roundNumber && !showPostponedView;
            const roundMatches = matches.filter((m) => m.roundNumber === r.roundNumber);
            const isRoundDone = roundMatches.every((m) => m.status === 'completed');

            return (
              <button
                key={r.roundNumber}
                onClick={() => {
                  setSelectedRound(r.roundNumber);
                  setShowPostponedView(false);
                }}
                className={`flex-shrink-0 px-3 py-2 font-grotesk text-xs uppercase font-black transition-all border-2 ${
                  isSelected
                    ? 'bg-[var(--accent)] text-black border-[var(--line)] shadow-sm'
                    : isRoundDone
                    ? 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)] hover:border-slate-500'
                    : 'bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>J{r.roundNumber < 10 ? `0${r.roundNumber}` : r.roundNumber}</span>
                  {isRoundDone && <span className="text-[10px] text-black bg-[var(--accent)] px-0.5">✓</span>}
                </div>
              </button>
            );
          })}

          {/* Postponed special tab */}
          <button
            onClick={() => setShowPostponedView(true)}
            className={`flex-shrink-0 px-3.5 py-2 font-grotesk text-xs uppercase font-black transition-all border-2 ml-auto ${
              showPostponedView
                ? 'bg-[var(--copper)] text-[#fff8ef] border-[var(--line)] shadow-sm'
                : 'bg-[var(--surface-soft)] text-[var(--copper-ink)] border-[var(--copper)] hover:bg-[var(--copper)]/10'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>APLAZADOS A DICIEMBRE ({postponedMatches.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Round Subheader Banner */}
      {!showPostponedView ? (
        <div className="bg-[var(--surface-raised)] border-2 border-[var(--line)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-[var(--ink)] uppercase">
              JORNADA {selectedRound} // {currentRoundInfo.startDate} - {currentRoundInfo.endDate}
            </span>
            <span className="bg-[var(--accent)] text-black text-[10px] font-black px-1.5 py-0.2 uppercase font-grotesk">
              3 PARTIDOS
            </span>
          </div>
          <span className="text-[var(--muted)] font-bold">
            {completedInCurrentRound} de 3 Partidos Completados
          </span>
        </div>
      ) : (
        <div className="bg-[var(--surface-raised)] border-2 border-[var(--copper)] p-4 text-xs font-mono-code text-[var(--ink)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-display text-xl font-black text-[var(--copper-ink)] uppercase block">
              ZONA DE PARTIDOS APLAZADOS A DICIEMBRE
            </span>
            <span>Partidos que no se pudieron jugar en su semana y se recuperan antes del Draft Top 8.</span>
          </div>
          <span className="bg-[var(--copper)] text-[#fff8ef] px-2 py-1 font-bold text-xs shrink-0">
            {postponedMatches.length} PENDIENTES
          </span>
        </div>
      )}

      {/* Match Cards List */}
      <div className="space-y-4">
        {displayedMatches.length === 0 ? (
          <div className="bg-[var(--surface)] border-2 border-[var(--line)] p-8 text-center font-mono-code text-[var(--muted)] text-xs">
            No hay partidos para los filtros seleccionados.
          </div>
        ) : (
          displayedMatches.map((match) => {
            const isCompleted = match.status === 'completed';
            const isPostponed = match.status === 'postponed';

            return (
              <div
                key={match.id}
                className={`bg-[var(--surface)] border-2 transition-all ${
                  isCompleted
                    ? 'border-[var(--line)] shadow-sm'
                    : isPostponed
                    ? 'border-[var(--copper)] shadow-sm'
                    : 'border-[var(--accent)] shadow-sm'
                }`}
              >
                {/* Header Ticket Strip */}
                <div className="bg-[var(--surface-soft)] px-4 py-2 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="bg-[var(--line)] text-[var(--ink)] font-black text-[10px] px-1.5 py-0.5 border border-[var(--line)]">
                      JORNADA {match.roundNumber} · PARTIDO 0{match.matchNumberInRound}
                    </span>
                    <span className="text-[var(--muted)]">
                      {match.court || 'Pista 1'}
                    </span>
                    {match.playedDate && (
                      <span className="text-[var(--accent-ink)]">({match.playedDate})</span>
                    )}
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="bg-[var(--accent)] text-black font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                        ✓ FINALIZADO
                      </span>
                    ) : isPostponed ? (
                      <span className="bg-[var(--copper)] text-[#fff8ef] font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                        ⚠️ APLAZADO A DICIEMBRE
                      </span>
                    ) : (
                      <span className="bg-[var(--neutral-badge)] text-black font-black text-[10px] px-2 py-0.5 font-grotesk uppercase animate-pulse">
                        ⏳ PENDIENTE DE JUEGO
                      </span>
                    )}
                  </div>
                </div>

                <MatchScoreboard match={match} players={players} />
              </div>
            );
          })
        )}
      </div>

      {!showPostponedView && (
        <RoundSimulator
          selectedRound={selectedRound}
          matches={matches}
          players={players}
        />
      )}
    </div>
  );
};
