import React from 'react';
import { Swords, X } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerPositionHistory } from '../utils/rankingInsights';

interface PlayerComparePanelProps {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  selectedIds: number[];
  onClear: () => void;
}

const formatDiff = (value: number) => value > 0 ? `+${value}` : `${value}`;

export const PlayerComparePanel: React.FC<PlayerComparePanelProps> = ({
  players,
  matches,
  stats,
  selectedIds,
  onClear,
}) => {
  const statMap = new Map(stats.map((stat) => [stat.playerId, stat]));
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const selected = selectedIds.map((id) => statMap.get(id)).filter((stat): stat is PlayerStats => Boolean(stat));

  const bestPosition = (playerId: number) => {
    const history = getPlayerPositionHistory(players, matches, playerId).points;
    if (!history.length) return '—';
    return `#${Math.min(...history.map((point) => point.position))}`;
  };

  const form = (stat: PlayerStats) => stat.streak.length ? stat.streak.join('') : '—';

  if (selected.length < 2) {
    return (
      <section className="bg-[#0a0c12] border-2 border-[#ff5500] p-4 shadow-[4px_4px_0px_0px_#ff5500]">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-[#ff5500]" />
          <h2 className="font-display text-2xl font-black text-white uppercase">Comparar jugadores</h2>
        </div>
        <p className="text-xs text-slate-400 font-mono-code mt-1">
          Selecciona dos jugadores de la tabla. Van {selected.length}/2.
        </p>
      </section>
    );
  }

  const [left, right] = selected;
  const rows = [
    { label: 'Victorias', left: `${left.matchesWon}`, right: `${right.matchesWon}`, loud: true },
    { label: 'Sets', left: formatDiff(left.setsDiff), right: formatDiff(right.setsDiff) },
    { label: 'Juegos', left: formatDiff(left.gamesDiff), right: formatDiff(right.gamesDiff) },
    { label: 'Mejor posición', left: bestPosition(left.playerId), right: bestPosition(right.playerId) },
    { label: 'Forma', left: form(left), right: form(right) },
  ];

  return (
    <section className="bg-[#0a0c12] border-2 border-black p-4 sm:p-5 shadow-[6px_6px_0px_0px_#ff5500] relative overflow-hidden">
      <div className="absolute -right-8 -bottom-8 font-display text-[120px] text-white/5 font-black leading-none pointer-events-none">
        VS
      </div>

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-[#ccff00]" />
          <div>
            <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              Duelo Campecho
            </span>
            <h2 className="font-display text-3xl font-black text-white uppercase leading-none mt-1">
              Comparar
            </h2>
          </div>
        </div>
        <button
          onClick={onClear}
          className="bg-black hover:bg-[#12151e] border-2 border-[#262c3a] p-2 text-slate-300 hover:text-white"
          title="Limpiar comparación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        {[left, right].map((stat) => {
          const player = playerMap.get(stat.playerId) || stat.player;
          return (
            <div key={stat.playerId} className="bg-black border-2 border-[#262c3a] p-3 flex items-center gap-3">
              <PlayerAvatar player={player} size="md" />
              <div>
                <strong className="font-display text-2xl text-white font-black uppercase leading-none">
                  {player.name}
                </strong>
                <span className="block text-[10px] text-slate-400 font-mono-code mt-1">
                  {stat.matchesPlayed} partidos
                </span>
              </div>
            </div>
          );
        }).reduce<React.ReactNode[]>((nodes, card, index) => {
          if (index === 1) {
            nodes.push(
              <div key="vs" className="font-display text-3xl text-[#ccff00] font-black">
                VS
              </div>
            );
          }
          nodes.push(card);
          return nodes;
        }, [])}
      </div>

      <div className="relative z-10 space-y-2 font-mono-code">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-black border border-[#262c3a] px-3 py-2">
            <span className={`text-right font-black ${row.loud ? 'font-display text-3xl text-[#ccff00]' : 'text-white text-lg'}`}>
              {row.left}
            </span>
            <span className="bg-[#12151e] border border-[#262c3a] text-slate-400 px-2 py-1 text-[10px] font-black uppercase font-grotesk min-w-28 text-center">
              {row.label}
            </span>
            <span className={`font-black ${row.loud ? 'font-display text-3xl text-[#ff5500]' : 'text-white text-lg'}`}>
              {row.right}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
