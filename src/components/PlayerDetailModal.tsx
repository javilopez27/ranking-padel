import { useModalFocus } from '../hooks/useModalFocus';
import React from 'react';
import { X } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerEvolution } from './PlayerEvolution';
import { PlayerRecords } from './PlayerRecords';
import { getPlayerPositionHistory, getPlayerRecords, getRankingMovement } from '../utils/rankingInsights';
import { formatSetScore } from '../utils/scoreFormat';

interface PlayerDetailModalProps {
  player: Player | null;
  stats: PlayerStats | undefined;
  players: Player[];
  matches: Match[];
  position: number;
  onClose: () => void;
  onOpenPhoto: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  stats,
  players,
  matches,
  position,
  onClose,
  onOpenPhoto,
}) => {
  const modalRef = useModalFocus(onClose);
  if (!player) return null;

  const playerMap = new Map<number, Player>(players.map((p) => [p.id, p]));

  // Find all matches where this player participates
  const playerMatches = matches
    .filter((m) => m.team1.includes(player.id) || m.team2.includes(player.id))
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const isTop8 = position <= 8;
  const isCaptain = position <= 4;
  const positionHistory = getPlayerPositionHistory(players, matches, player.id);
  const playerRecords = getPlayerRecords(players, matches, player.id, stats);
  const movement = getRankingMovement(players, matches).get(player.id)?.delta || 0;
  const movementLabel = movement > 0
    ? `\u2191${movement} esta jornada`
    : movement < 0
      ? `\u2193${Math.abs(movement)} esta jornada`
      : '= esta jornada';
  const movementClass = movement > 0 ? 'text-emerald-400' : movement < 0 ? 'text-rose-400' : 'text-slate-400';
  const rankStatus = isCaptain ? 'Capit\u00e1n provisional' : isTop8 ? 'Top 8 provisional' : 'Fase regular';

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] border-2 border-black w-full max-w-2xl shadow-[8px_8px_0px_0px_var(--accent)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Strip */}
        <div className="relative bg-black p-4 sm:p-5 border-b-2 border-[var(--line)]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(204,255,0,0.18),transparent_55%)] pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-20 shrink-0 p-1.5 bg-[var(--surface-raised)] hover:bg-[var(--copper)] hover:text-white text-slate-400 border border-[var(--line)] transition-colors"
            aria-label="Cerrar ficha"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative pr-9 sm:pr-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="border-2 border-[var(--accent)] bg-[var(--accent)] text-black shadow-[4px_4px_0px_0px_#ffffff] px-2.5 sm:px-3 py-2 text-center shrink-0">
                <span className="block font-display text-4xl sm:text-5xl font-black leading-none">
                  {position < 10 ? `0${position}` : position}
                </span>
              </div>

              <PlayerAvatar player={player} size="lg" onClick={() => onOpenPhoto(player)} />
            </div>

            <div className="mt-3 min-w-0">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-white leading-none uppercase truncate">
                {player.name}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className={`font-black text-[9px] min-[390px]:text-[10px] sm:text-xs px-2 py-1 font-grotesk uppercase border ${
                  isCaptain ? 'bg-[var(--copper)] text-white border-black' : isTop8 ? 'bg-[var(--accent)] text-black border-black' : 'bg-[var(--surface-raised)] text-slate-300 border-[var(--line)]'
                }`}>
                  {rankStatus}
                </span>
                <span className={`font-black text-[9px] min-[390px]:text-[10px] sm:text-xs px-2 py-1 font-grotesk uppercase border border-[var(--line)] bg-[var(--surface-raised)] ${movementClass}`}>
                  {movementLabel}
                </span>
              </div>

              <div className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl font-black text-[var(--accent)] leading-none">
                {stats?.matchesWon || 0}V <span className="text-slate-500">{'\u2014'}</span> <span className="text-white">{stats?.matchesLost || 0}D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 font-mono-code text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[var(--surface-raised)] border-2 border-[var(--accent)] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">VICTORIAS</span>
              <span className="font-display text-3xl font-black text-[var(--accent)] leading-none mt-1 block">
                {stats?.matchesWon || 0}
              </span>
            </div>
            <div className="bg-[var(--surface-raised)] border-2 border-[var(--line)] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">VICTORIAS / DERROTAS</span>
              <span className="font-display text-3xl font-black text-white leading-none mt-1 block">
                {stats?.matchesWon || 0}V - {stats?.matchesLost || 0}D
              </span>
            </div>
            <div className="bg-[var(--surface-raised)] border-2 border-[var(--line)] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">DIFERENCIA SETS</span>
              <span className={`font-display text-3xl font-black leading-none mt-1 block ${
                (stats?.setsDiff || 0) > 0 ? 'text-emerald-400' : 'text-slate-300'
              }`}>
                {(stats?.setsDiff || 0) > 0 ? `+${stats?.setsDiff}` : stats?.setsDiff || 0}
              </span>
            </div>
            <div className="bg-[var(--surface-raised)] border-2 border-[var(--copper)] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">DIFERENCIA JUEGOS</span>
              <span className={`font-display text-3xl font-black leading-none mt-1 block ${
                (stats?.gamesDiff || 0) > 0 ? 'text-[var(--copper)]' : 'text-slate-300'
              }`}>
                {(stats?.gamesDiff || 0) > 0 ? `+${stats?.gamesDiff}` : stats?.gamesDiff || 0}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <PlayerEvolution history={positionHistory.points} totalPlayers={players.length} />
            <PlayerRecords records={playerRecords} />
          </div>

          {/* 11 Matches Breakdown List */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[var(--line)] pb-2">
              <h3 className="font-display text-xl font-black text-white uppercase tracking-wider">
                SUS 11 PARTIDOS EN LA LIGA
              </h3>
              <span className="text-[11px] text-slate-400">
                {playerMatches.filter((m) => m.status === 'completed').length} de 11 jugados
              </span>
            </div>

            <div className="space-y-2">
              {playerMatches.map((m) => {
                const isTeam1 = m.team1.includes(player.id);
                const partnerId = isTeam1
                  ? m.team1.find((id) => id !== player.id)
                  : m.team2.find((id) => id !== player.id);
                const partner = playerMap.get(partnerId || 0);

                const opponentIds = isTeam1 ? m.team2 : m.team1;
                const opp1 = playerMap.get(opponentIds[0]);
                const opp2 = playerMap.get(opponentIds[1]);

                const isCompleted = m.status === 'completed';
                const playerWon = isCompleted && (
                  (isTeam1 && m.winnerTeam === 1) || (!isTeam1 && m.winnerTeam === 2)
                );

                return (
                  <div
                    key={m.id}
                    className={`bg-black border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isCompleted
                        ? playerWon
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-rose-500/30'
                        : 'border-[var(--line)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-[var(--surface-raised)] text-slate-300 font-bold px-1.5 py-0.5 border border-[var(--line)] text-[10px]">
                        J{m.roundNumber < 10 ? `0${m.roundNumber}` : m.roundNumber}
                      </span>
                      <div>
                        <div className="text-white font-bold font-grotesk text-xs">
                          Con <span className="text-[var(--accent)]">{partner?.name}</span> vs {opp1?.name} & {opp2?.name}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {m.court || 'Pista 1'} {m.playedDate ? `· ${m.playedDate}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {isCompleted ? (
                        <>
                          <div className="flex items-center gap-1 font-bold">
                            {m.sets.map((s, idx) => (
                              <span key={idx} className="bg-[var(--surface-raised)] px-1.5 py-0.5 border border-[var(--line)]">
                                {formatSetScore(s)}
                              </span>
                            ))}
                          </div>
                          <span className={`font-black font-grotesk text-[10px] px-2 py-0.5 uppercase ${
                            playerWon ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                          }`}>
                            {playerWon ? 'VICTORIA' : 'DERROTA'}
                          </span>
                        </>
                      ) : m.status === 'postponed' ? (
                        <span className="bg-[var(--copper)] text-white font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                          APLAZADO
                        </span>
                      ) : (
                        <span className="bg-[var(--surface-raised)] text-slate-400 font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                          POR JUGAR
                        </span>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-black border-t-2 border-[var(--line)] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--accent)] text-black font-black font-grotesk text-xs uppercase border-2 border-black"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
