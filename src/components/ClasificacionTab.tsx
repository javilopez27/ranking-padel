import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerComparePanel } from './PlayerComparePanel';
import { calculatePlayerStats } from '../utils/leagueCalculations';
import { getRankingMovement } from '../utils/rankingInsights';

interface ClasificacionTabProps {
  stats: PlayerStats[];
  matches: Match[];
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onOpenPhoto: (player: Player) => void;
}

const formatSigned = (value: number) => value > 0 ? `+${value}` : `${value}`;
type RankingView = 'current' | number;

const formatRound = (round: number) => `J${round.toString().padStart(2, '0')}`;

export const ClasificacionTab: React.FC<ClasificacionTabProps> = ({
  stats,
  matches,
  players,
  onSelectPlayer,
  onOpenPhoto,
}) => {
  const [showTiebreakExplainer, setShowTiebreakExplainer] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [rankingView, setRankingView] = useState<RankingView>('current');
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);

  const completedRounds = Array.from(
    new Set(
      matches
        .filter((match) => match.status === 'completed' && match.sets.length > 0)
        .map((match) => match.roundNumber)
    )
  ).sort((a, b) => a - b);

  const visibleMatches = rankingView === 'current'
    ? matches
    : matches.filter((match) => match.roundNumber <= rankingView);
  const visibleStats = rankingView === 'current' ? stats : calculatePlayerStats(players, visibleMatches);
  const movementMap = getRankingMovement(players, visibleMatches);
  const viewLabel = rankingView === 'current' ? 'Actual' : `Tras ${formatRound(rankingView)}`;
  const playedMatchesInView = visibleMatches.filter((match) => match.status === 'completed' && match.sets.length > 0).length;

  const toggleComparePlayer = (playerId: number) => {
    setCompareIds((current) => {
      if (current.includes(playerId)) return current.filter((id) => id !== playerId);
      if (current.length >= 2) return [current[1], playerId];
      return [...current, playerId];
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[var(--accent)] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-[var(--line)]">
              Ranking oficial
            </span>
            <span className="bg-[var(--copper)] text-[#fff8ef] font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-[var(--line)]">
              Victorias
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-wide uppercase leading-none">
            Clasificación
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-[var(--muted)] mt-1">
            {rankingView === 'current'
              ? 'Orden: victorias, diferencia de sets, diferencia de juegos, sets a favor y juegos a favor.'
              : `${viewLabel}: ${playedMatchesInView} partidos computados hasta ese corte.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              id="ranking-history-menu"
              onClick={() => setShowHistoryMenu((value) => !value)}
              className="min-w-36 flex items-center justify-between gap-3 px-3 py-2 bg-[var(--surface-soft)] text-[var(--accent-ink)] border-2 border-[var(--accent)] shadow-sm text-xs font-black font-grotesk uppercase transition-all hover:bg-[var(--accent)] hover:text-black"
              aria-expanded={showHistoryMenu}
              aria-haspopup="listbox"
            >
              <span>{viewLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistoryMenu ? 'rotate-180' : ''}`} />
            </button>

            {showHistoryMenu && (
              <div
                role="listbox"
                aria-label="Seleccionar clasificación histórica"
                className="absolute right-0 z-30 mt-2 w-44 bg-[var(--page)] border-2 border-[var(--accent)] shadow-sm p-1 font-grotesk uppercase"
              >
                <button
                  role="option"
                  aria-selected={rankingView === 'current'}
                  onClick={() => {
                    setRankingView('current');
                    setShowHistoryMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-black border transition-colors ${
                    rankingView === 'current'
                      ? 'bg-[var(--accent)] text-black border-[var(--line)]'
                      : 'bg-transparent text-[var(--ink)] border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-raised)]'
                  }`}
                >
                  Actual
                </button>

                {completedRounds.map((round) => (
                  <button
                    key={round}
                    role="option"
                    aria-selected={rankingView === round}
                    onClick={() => {
                      setRankingView(round);
                      setShowHistoryMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-black border transition-colors ${
                      rankingView === round
                        ? 'bg-[var(--accent)] text-black border-[var(--line)]'
                        : 'bg-transparent text-[var(--ink)] border-transparent hover:border-[var(--line)] hover:bg-[var(--surface-raised)]'
                    }`}
                  >
                    Tras {formatRound(round)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="btn-compare-players"
            onClick={() => {
              setCompareMode((value) => !value);
              setCompareIds([]);
            }}
            className={`px-3 py-2 border-2 text-xs font-black font-grotesk uppercase transition-all shrink-0 ${
              compareMode
                ? 'bg-[var(--accent)] text-black border-[var(--line)] shadow-sm'
                : 'bg-[var(--surface-raised)] hover:bg-[var(--surface-soft)] border-[var(--copper)] text-[var(--ink)]'
            }`}
          >
            Comparar
          </button>
          <button
            id="btn-tiebreak-info"
            onClick={() => setShowTiebreakExplainer((value) => !value)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface-raised)] hover:bg-[var(--surface-soft)] border-2 border-[var(--line)] text-[var(--ink)] text-xs font-bold font-grotesk uppercase transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
            <span>Desempates</span>
          </button>
        </div>
      </div>

      {showTiebreakExplainer && (
        <div className="bg-[var(--surface-raised)] border-2 border-[var(--accent)] p-4 sm:p-5 text-xs text-[var(--ink)] space-y-2 shadow-sm">
          <div className="text-[var(--accent-ink)] font-black text-sm font-grotesk uppercase">Desempate</div>
          <ol className="list-decimal list-inside space-y-1 font-mono-code text-[var(--ink)]">
            <li><strong className="text-[var(--ink)]">Victorias</strong>.</li>
            <li><strong className="text-[var(--ink)]">Mayor diferencia de sets</strong> (sets ganados - sets perdidos).</li>
            <li><strong className="text-[var(--ink)]">Mayor diferencia de juegos</strong> (juegos ganados - juegos perdidos).</li>
            <li><strong className="text-[var(--ink)]">Mayor numero de sets a favor</strong>.</li>
            <li><strong className="text-[var(--ink)]">Mayor numero de juegos a favor</strong>.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2 py-1 border border-[var(--accent)]">
            <span className="w-2.5 h-2.5 bg-[var(--accent)] inline-block" />
            <span className="text-[var(--ink)] font-bold">Puestos 1 al 8:</span>
            <span className="text-[var(--accent-ink)]">pasan al Top 8 Draft</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--surface)] px-2 py-1 border border-[var(--line)]">
            <span className="w-2.5 h-2.5 bg-slate-600 inline-block" />
            <span className="text-[var(--muted)]">Puestos 9 al 12: fase regular</span>
          </div>
        </div>

        <span className="text-[var(--muted)] text-[11px]">
          {compareMode
            ? `Modo comparar activo: selecciona dos jugadores (${compareIds.length}/2).`
            : 'Pulsa sobre cualquier jugador para abrir su ficha completa y resultados.'}
        </span>
      </div>

      {compareMode && (
        <PlayerComparePanel
          players={players}
          matches={visibleMatches}
          stats={visibleStats}
          selectedIds={compareIds}
          onClear={() => setCompareIds([])}
        />
      )}

      <div className="md:hidden space-y-3">
        {visibleStats.map((row, index) => {
          const pos = index + 1;
          const isTop8 = pos <= 8;
          const isCaptain = pos <= 4;
          const isCutoff = pos === 8;
          const isCompared = compareIds.includes(row.playerId);
          const movement = movementMap.get(row.playerId)?.delta || 0;
          const movementClass = movement > 0 ? 'text-[var(--positive)]' : movement < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]';
          const openOrCompare = () => compareMode ? toggleComparePlayer(row.playerId) : onSelectPlayer(row.player);

          return (
            <React.Fragment key={row.playerId}>
              <article
                role="button"
                tabIndex={0}
                onClick={openOrCompare}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openOrCompare();
                  }
                }}
                className={`border-2 p-3.5 transition-all cursor-pointer shadow-sm ${
                  isCompared
                    ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
                    : pos === 1
                      ? 'bg-[var(--accent)]/5 border-[var(--accent)]'
                      : isTop8
                        ? 'bg-[var(--surface)] border-[var(--line)]'
                        : 'bg-[var(--page)] border-[var(--line)] opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-2xl leading-none font-black ${pos <= 3 ? 'text-[var(--accent-ink)]' : isTop8 ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                        {pos < 10 ? `0${pos}` : pos}
                      </span>
                      <span className={`min-w-7 text-xs font-black font-grotesk ${movementClass}`}>
                        {movement > 0 ? `↑${movement}` : movement < 0 ? `↓${Math.abs(movement)}` : '='}
                      </span>
                      <h2 className="truncate font-display text-2xl font-black uppercase leading-none text-[var(--ink)]">
                        {row.player.name}
                      </h2>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-black font-mono-code text-[var(--ink)]">
                      <span className="text-[var(--accent-ink)]">{row.matchesWon}V</span>
                      <span className="text-[var(--muted)]">·</span>
                      <span className={row.setsDiff > 0 ? 'text-[var(--positive)]' : row.setsDiff < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]'}>
                        {formatSigned(row.setsDiff)} sets
                      </span>
                      <span className="text-[var(--muted)]">·</span>
                      <span className={row.gamesDiff > 0 ? 'text-[var(--positive)]' : row.gamesDiff < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]'}>
                        {formatSigned(row.gamesDiff)} juegos
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <PlayerAvatar player={row.player} size="sm" />
                    {compareMode && (
                      <span className={`border px-1.5 py-0.5 text-[9px] font-black uppercase font-grotesk ${
                        isCompared ? 'bg-[var(--accent)] text-black border-[var(--line)]' : 'bg-[var(--line)] text-[var(--ink)] border-[var(--line)]'
                      }`}>
                        {isCompared ? 'Elegido' : 'Elegir'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    {row.streak.length > 0 ? (
                      row.streak.map((result, sIdx) => (
                        <span
                          key={sIdx}
                          className={`w-6 h-6 text-[11px] font-black flex items-center justify-center border border-[var(--line)] ${
                            result === 'W' ? 'bg-[var(--positive-badge)] text-black' : 'bg-[var(--negative-badge)] text-[var(--ink)]'
                          }`}
                        >
                          {result}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-mono-code text-[var(--muted)]">Sin racha</span>
                    )}
                  </div>

                  {(isCaptain || (isTop8 && !isCaptain)) && (
                    <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-black uppercase font-grotesk border ${
                      isCaptain ? 'bg-[var(--accent)] text-black border-[var(--line)]' : 'bg-[var(--line)] text-[var(--ink)] border-[var(--line)]'
                    }`}>
                      {isCaptain ? 'Capitan' : 'Draft pool'}
                    </span>
                  )}
                </div>
              </article>

              {isCutoff && (
                <div className="border-2 border-[var(--line)] bg-[var(--accent)] px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider text-black font-grotesk shadow-sm">
                  Corte Top 8 · draft de diciembre
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="hidden md:block bg-[var(--surface)] border-2 border-[var(--line)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface-soft)] border-b-2 border-[var(--line)] font-grotesk font-black uppercase text-[var(--ink)] text-[11px] tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-14 text-center">Pos</th>
                <th className="py-3 px-3 sm:px-4">Jugador</th>
                <th className="py-3 px-3 sm:px-4 text-center bg-[var(--accent)]/10 text-[var(--accent-ink)] border-x border-[var(--line)]">Victorias</th>
                <th className="py-3 px-2 sm:px-3 text-center">PJ</th>
                <th className="py-3 px-2 sm:px-3 text-center text-[var(--negative)]">Derrotas</th>
                <th className="py-3 px-2 sm:px-3 text-center">Dif sets</th>
                <th className="py-3 px-2 sm:px-3 text-center">Dif juegos</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">SG/SP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">JG/JP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">Racha</th>
                <th className="py-3 px-3 sm:px-4 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] font-mono-code">
              {visibleStats.map((row, index) => {
                const pos = index + 1;
                const isTop8 = pos <= 8;
                const isCaptain = pos <= 4;
                const isCutoff = pos === 8;
                const isCompared = compareIds.includes(row.playerId);
                const movement = movementMap.get(row.playerId)?.delta || 0;

                return (
                  <React.Fragment key={row.playerId}>
                    <tr
                      onClick={() => compareMode ? toggleComparePlayer(row.playerId) : onSelectPlayer(row.player)}
                      className={`hover:bg-[var(--surface-raised)] cursor-pointer transition-colors ${
                        pos === 1
                          ? 'bg-[var(--accent)]/5 font-bold'
                          : isTop8
                          ? 'bg-[var(--surface)]'
                          : 'bg-[var(--page)] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-display text-lg font-black ${pos <= 3 ? 'text-[var(--accent-ink)]' : isTop8 ? 'text-[var(--ink)]' : 'text-[var(--muted)]'}`}>
                            {pos < 10 ? `0${pos}` : pos}
                          </span>
                          <span className={`text-[10px] font-black font-grotesk min-w-6 ${
                            movement > 0 ? 'text-[var(--positive)]' : movement < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]'
                          }`}>
                            {movement > 0 ? `↑${movement}` : movement < 0 ? `↓${Math.abs(movement)}` : '='}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <PlayerAvatar player={row.player} size="sm" onClick={() => onOpenPhoto(row.player)} />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[var(--ink)] font-grotesk text-sm">
                              {row.player.name}
                            </span>
                            {isCaptain && (
                              <span className="bg-[var(--accent)] text-black text-[9px] font-black px-1 font-grotesk uppercase">
                                Capitan
                              </span>
                            )}
                            {isTop8 && !isCaptain && (
                              <span className="bg-[var(--line)] text-[var(--ink)] text-[9px] font-black px-1 font-grotesk uppercase">
                                Draft pool
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center bg-[var(--accent)]/10 border-x border-[var(--line)]">
                        <span className="font-display text-2xl font-black text-[var(--accent-ink)]">{row.matchesWon}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-[var(--ink)] font-bold">{row.matchesPlayed}</td>
                      <td className="py-3 px-2 sm:px-3 text-center text-[var(--negative)] font-bold">{row.matchesLost}</td>
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.setsDiff > 0 ? 'text-[var(--positive)]' : row.setsDiff < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]'}>
                          {formatSigned(row.setsDiff)}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.gamesDiff > 0 ? 'text-[var(--positive)]' : row.gamesDiff < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]'}>
                          {formatSigned(row.gamesDiff)}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-[var(--muted)] hidden md:table-cell text-[11px]">
                        {row.setsWon}/{row.setsLost}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-[var(--muted)] hidden md:table-cell text-[11px]">
                        {row.gamesWon}/{row.gamesLost}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.streak.length > 0 ? (
                            row.streak.map((result, sIdx) => (
                              <span
                                key={sIdx}
                                className={`w-4 h-4 text-[9px] font-black flex items-center justify-center border border-[var(--line)] ${
                                  result === 'W' ? 'bg-[var(--positive-badge)] text-black' : 'bg-[var(--negative-badge)] text-[var(--ink)]'
                                }`}
                              >
                                {result}
                              </span>
                            ))
                          ) : (
                            <span className="text-[var(--muted)] text-[10px]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        {compareMode ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleComparePlayer(row.playerId);
                            }}
                            className={`px-2.5 py-1 text-[10px] font-black font-grotesk uppercase border transition-colors ${
                              isCompared
                                ? 'bg-[var(--accent)] text-black border-[var(--line)]'
                                : 'bg-[var(--line)] hover:bg-[var(--copper)] hover:text-[#fff8ef] text-[var(--ink)] border-[var(--line)]'
                            }`}
                          >
                            {isCompared ? 'Elegido' : 'Elegir'}
                          </button>
                        ) : (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectPlayer(row.player);
                            }}
                            className="px-2.5 py-1 bg-[var(--line)] hover:bg-[var(--accent)] hover:text-black text-[var(--ink)] text-[10px] font-black font-grotesk uppercase border border-[var(--line)] transition-colors"
                          >
                            Ver
                          </button>
                        )}
                      </td>
                    </tr>

                    {isCutoff && (
                      <tr className="bg-[var(--surface-soft)] border-y-2 border-[var(--accent)]">
                        <td colSpan={11} className="py-1 px-4 text-center font-grotesk font-black text-[11px] text-black bg-[var(--accent)] uppercase tracking-widest">
                          Linea de corte fase final: los 8 primeros disputan el draft de diciembre
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
