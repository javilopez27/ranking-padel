import { useModalFocus } from '../hooks/useModalFocus';
import React from 'react';
import { X } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerEvolution } from './PlayerEvolution';
import { getPlayerPositionHistory } from '../utils/rankingInsights';

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

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0a0c12] border-2 border-black w-full max-w-2xl shadow-[8px_8px_0px_0px_#ccff00] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Strip */}
        <div className="bg-black p-4 sm:p-5 border-b-2 border-[#262c3a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={player} size="lg" onClick={() => onOpenPhoto(player)} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-none">
                  {player.name}
                </h2>
                <span className="bg-[#ccff00] text-black font-black text-xs px-2 py-0.5 font-grotesk uppercase border border-black">
                  POSICIÓN #{position}
                </span>
                {isCaptain && (
                  <span className="bg-[#ff5500] text-white font-black text-xs px-2 py-0.5 font-grotesk uppercase border border-black">
                    CAPITÁN DRAFT
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 font-mono-code text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#12151e] border-2 border-[#ccff00] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">VICTORIAS</span>
              <span className="font-display text-3xl font-black text-[#ccff00] leading-none mt-1 block">
                {stats?.matchesWon || 0}
              </span>
            </div>
            <div className="bg-[#12151e] border-2 border-[#262c3a] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">VICTORIAS / DERROTAS</span>
              <span className="font-display text-3xl font-black text-white leading-none mt-1 block">
                {stats?.matchesWon || 0}V - {stats?.matchesLost || 0}D
              </span>
            </div>
            <div className="bg-[#12151e] border-2 border-[#262c3a] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">DIFERENCIA SETS</span>
              <span className={`font-display text-3xl font-black leading-none mt-1 block ${
                (stats?.setsDiff || 0) > 0 ? 'text-emerald-400' : 'text-slate-300'
              }`}>
                {(stats?.setsDiff || 0) > 0 ? `+${stats?.setsDiff}` : stats?.setsDiff || 0}
              </span>
            </div>
            <div className="bg-[#12151e] border-2 border-[#ff5500] p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase block font-grotesk">DIFERENCIA JUEGOS</span>
              <span className={`font-display text-3xl font-black leading-none mt-1 block ${
                (stats?.gamesDiff || 0) > 0 ? 'text-[#ff5500]' : 'text-slate-300'
              }`}>
                {(stats?.gamesDiff || 0) > 0 ? `+${stats?.gamesDiff}` : stats?.gamesDiff || 0}
              </span>
            </div>
          </div>

          <PlayerEvolution history={positionHistory.points} totalPlayers={players.length} />

          {/* 11 Matches Breakdown List */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#262c3a] pb-2">
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
                        : 'border-[#262c3a]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-[#12151e] text-slate-300 font-bold px-1.5 py-0.5 border border-[#262c3a] text-[10px]">
                        J{m.roundNumber < 10 ? `0${m.roundNumber}` : m.roundNumber}
                      </span>
                      <div>
                        <div className="text-white font-bold font-grotesk text-xs">
                          Con <span className="text-[#ccff00]">{partner?.name}</span> vs {opp1?.name} & {opp2?.name}
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
                              <span key={idx} className="bg-[#12151e] px-1.5 py-0.5 border border-[#262c3a]">
                                {s.games1}-{s.games2}
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
                        <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
                          APLAZADO
                        </span>
                      ) : (
                        <span className="bg-[#12151e] text-slate-400 font-black text-[10px] px-2 py-0.5 font-grotesk uppercase">
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
        <div className="p-3.5 bg-black border-t-2 border-[#262c3a] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#ccff00] text-black font-black font-grotesk text-xs uppercase border-2 border-black"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
