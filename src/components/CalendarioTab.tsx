import React, { useState } from 'react';
import { AlertTriangle, Filter } from 'lucide-react';
import { Player, Match, RoundInfo } from '../types';

interface CalendarioTabProps {
  roundInfos: RoundInfo[];
  matches: Match[];
  players: Player[];
  onEditMatch: (match: Match) => void;
}

export const CalendarioTab: React.FC<CalendarioTabProps> = ({
  roundInfos,
  matches,
  players,
  onEditMatch,
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [playerFilter, setPlayerFilter] = useState<number | 'all'>('all');
  const [showPostponedView, setShowPostponedView] = useState<boolean>(false);

  const playerMap = new Map<number, Player>(players.map((p) => [p.id, p]));

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
      <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#ccff00] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              FIXTURE OFICIAL
            </span>
            <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              33 PARTIDOS REGULARES
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-none">
            CALENDARIO DE JORNADAS
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-slate-400 mt-1">
            SISTEMA WHIST: 11 JORNADAS // 3 PISTAS SIMULTÁNEAS SEMANALES
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-black border-2 border-[#262c3a] px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
            <span className="text-xs font-grotesk font-black text-slate-400 uppercase hidden sm:inline">FILTRO:</span>
            <select
              id="player-filter-select"
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-black text-white">TODOS LOS AMIGOS</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-black text-white">
                  Solo {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="bg-[#12151e] border-2 border-[#262c3a] px-3.5 py-2 text-xs font-black font-grotesk uppercase text-slate-300">
            Edicion por archivo del organizador
          </span>
        </div>
      </div>

      {/* Round Selector Bar */}
      <div className="bg-[#0a0c12] border-2 border-black p-2 sm:p-3 shadow-[4px_4px_0px_0px_#000]">
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
                    ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#ffffff]'
                    : isRoundDone
                    ? 'bg-[#12151e] text-slate-300 border-[#262c3a] hover:border-slate-500'
                    : 'bg-black text-slate-400 border-[#1e222d] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>J{r.roundNumber < 10 ? `0${r.roundNumber}` : r.roundNumber}</span>
                  {isRoundDone && <span className="text-[10px] text-black bg-[#ccff00] px-0.5">✓</span>}
                </div>
              </button>
            );
          })}

          {/* Postponed special tab */}
          <button
            onClick={() => setShowPostponedView(true)}
            className={`flex-shrink-0 px-3.5 py-2 font-grotesk text-xs uppercase font-black transition-all border-2 ml-auto ${
              showPostponedView
                ? 'bg-[#ff5500] text-white border-black shadow-[2px_2px_0px_0px_#ffffff]'
                : 'bg-black text-[#ff5500] border-[#ff5500] hover:bg-[#ff5500]/10'
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
        <div className="bg-[#12151e] border-2 border-[#262c3a] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-black text-white uppercase">
              JORNADA {selectedRound} // {currentRoundInfo.startDate} - {currentRoundInfo.endDate}
            </span>
            <span className="bg-[#ccff00] text-black text-[10px] font-black px-1.5 py-0.2 uppercase font-grotesk">
              3 PARTIDOS
            </span>
          </div>
          <span className="text-slate-400 font-bold">
            {completedInCurrentRound} de 3 Partidos Completados
          </span>
        </div>
      ) : (
        <div className="bg-[#1e1008] border-2 border-[#ff5500] p-4 text-xs font-mono-code text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-display text-xl font-black text-[#ff5500] uppercase block">
              ZONA DE PARTIDOS APLAZADOS A DICIEMBRE
            </span>
            <span>Partidos que no se pudieron jugar en su semana y se recuperan antes del Draft Top 8.</span>
          </div>
          <span className="bg-[#ff5500] text-white px-2 py-1 font-bold text-xs shrink-0">
            {postponedMatches.length} PENDIENTES
          </span>
        </div>
      )}

      {/* Match Cards List */}
      <div className="space-y-4">
        {displayedMatches.length === 0 ? (
          <div className="bg-[#0a0c12] border-2 border-[#262c3a] p-8 text-center font-mono-code text-slate-400 text-xs">
            No hay partidos para los filtros seleccionados.
          </div>
        ) : (
          displayedMatches.map((match) => {
            const p1 = playerMap.get(match.team1[0]);
            const p2 = playerMap.get(match.team1[1]);
            const p3 = playerMap.get(match.team2[0]);
            const p4 = playerMap.get(match.team2[1]);

            const isCompleted = match.status === 'completed';
            const isPostponed = match.status === 'postponed';

            return (
              <div
                key={match.id}
                className={`bg-[#0a0c12] border-2 transition-all ${
                  isCompleted
                    ? 'border-[#262c3a] shadow-[4px_4px_0px_0px_#000]'
                    : isPostponed
                    ? 'border-[#ff5500] shadow-[4px_4px_0px_0px_#ff5500]'
                    : 'border-[#ccff00] shadow-[4px_4px_0px_0px_#ccff00]'
                }`}
              >
                {/* Header Ticket Strip */}
                <div className="bg-black px-4 py-2 border-b border-[#262c3a] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#1e222d] text-white font-black text-[10px] px-1.5 py-0.5 border border-[#262c3a]">
                      JORNADA {match.roundNumber} · PARTIDO 0{match.matchNumberInRound}
                    </span>
                    <span className="text-slate-400">
                      {match.court || 'Pista 1 Central'}
                    </span>
                    {match.playedDate && (
                      <span className="text-[#ccff00]">({match.playedDate})</span>
                    )}
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                        ✓ FINALIZADO
                      </span>
                    ) : isPostponed ? (
                      <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                        ⚠️ APLAZADO A DICIEMBRE
                      </span>
                    ) : (
                      <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 font-grotesk uppercase animate-pulse">
                        ⏳ PENDIENTE DE JUEGO
                      </span>
                    )}
                  </div>
                </div>

                {/* Teams Faceoff Grid */}
                <div className="p-4 sm:p-5 grid grid-cols-11 items-center gap-3">
                  {/* Pareja 1 */}
                  <div className={`col-span-5 p-3.5 border-2 ${
                    isCompleted && match.winnerTeam === 1
                      ? 'bg-[#ccff00]/10 border-[#ccff00]'
                      : 'bg-[#12151e] border-[#262c3a]'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk tracking-wider">
                        PAREJA 1
                      </span>
                      {isCompleted && match.winnerTeam === 1 && (
                        <span className="text-[9px] font-black bg-[#ccff00] text-black px-1.5 py-0.2 uppercase">
                          VICTORIA
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-white">{p1?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-white">{p2?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center VS */}
                  <div className="col-span-1 text-center">
                    <span className="font-display text-xl sm:text-2xl font-black text-slate-500">
                      VS
                    </span>
                  </div>

                  {/* Pareja 2 */}
                  <div className={`col-span-5 p-3.5 border-2 ${
                    isCompleted && match.winnerTeam === 2
                      ? 'bg-[#ccff00]/10 border-[#ccff00]'
                      : 'bg-[#12151e] border-[#262c3a]'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-400 font-grotesk tracking-wider">
                        PAREJA 2
                      </span>
                      {isCompleted && match.winnerTeam === 2 && (
                        <span className="text-[9px] font-black bg-[#ccff00] text-black px-1.5 py-0.2 uppercase">
                          VICTORIA
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-white">{p3?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-white">{p4?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score & Postponed Info Bar */}
                {isPostponed && match.postponedNote && (
                  <div className="px-4 py-2 bg-[#ff5500]/10 border-t border-[#ff5500]/30 text-xs font-mono-code text-[#ff5500]">
                    <strong>Motivo de aplazamiento:</strong> {match.postponedNote}
                  </div>
                )}

                {/* Action Footer */}
                <div className="px-4 py-3 bg-[#0a0c12] border-t border-[#262c3a] flex flex-wrap items-center justify-between gap-3">
                  {isCompleted && match.sets.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs font-mono-code">
                      <span className="text-slate-400 font-bold uppercase">SCORE:</span>
                      <div className="flex items-center gap-1.5">
                        {match.sets.map((s, idx) => (
                          <span key={idx} className="bg-black px-2.5 py-1 border border-[#262c3a] font-bold text-white">
                            SET {idx + 1}: [{s.games1} - {s.games2}]
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-mono-code text-slate-400">
                      {isPostponed ? 'Aplazado a Diciembre' : 'Marcador aún no registrado'}
                    </span>
                  )}

                  <button
                    onClick={() => onEditMatch(match)}
                    className="bg-[#ccff00] hover:bg-[#d8ff33] text-black font-black font-grotesk text-xs uppercase px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    {isCompleted ? 'MODIFICAR MARCADOR' : 'ANOTAR RESULTADO'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
