import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerComparePanel } from './PlayerComparePanel';
import { getRankingMovement } from '../utils/rankingInsights';

interface JugadoresTabProps {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  onSelectPlayer: (player: Player) => void;
  onOpenPhoto: (player: Player) => void;
}

const formatSigned = (value: number) => value > 0 ? `+${value}` : `${value}`;

export const JugadoresTab: React.FC<JugadoresTabProps> = ({ players, matches, stats, onSelectPlayer, onOpenPhoto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const normalizedSearch = searchTerm.toLowerCase();
  const movementMap = getRankingMovement(players, matches);
  const filteredStats = stats.filter((row) =>
    row.player.name.toLowerCase().includes(normalizedSearch) ||
    (row.player.nickname && row.player.nickname.toLowerCase().includes(normalizedSearch))
  );

  const toggleComparePlayer = (playerId: number) => {
    setCompareIds((current) => {
      if (current.includes(playerId)) return current.filter((id) => id !== playerId);
      if (current.length >= 2) return [current[1], playerId];
      return [...current, playerId];
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#ccff00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              Jugadores
            </span>
            <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 uppercase font-mono-code border border-black">
              12 jugadores
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-none">
            Jugadores
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-slate-400 mt-1">
            Fichas, fotos y estado deportivo de cada jugador.
          </p>
        </div>

        <div className="flex items-center bg-[#0a0c12] border-2 border-[#262c3a] px-3 py-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono-code"
          />
        </div>
      </div>

      {compareIds.length > 0 && (
        <PlayerComparePanel
          players={players}
          matches={matches}
          stats={stats}
          selectedIds={compareIds}
          onClear={() => setCompareIds([])}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStats.map((playerStats) => {
          const player = playerStats.player;
          const position = stats.findIndex((row) => row.playerId === player.id) + 1;
          const movement = movementMap.get(player.id)?.delta || 0;
          const isCompared = compareIds.includes(player.id);
          const movementClass = movement > 0 ? 'text-emerald-400' : movement < 0 ? 'text-rose-400' : 'text-slate-500';
          const isTop8 = position <= 8;
          const isCaptain = position <= 4;

          return (
            <article
              key={player.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPlayer(player)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectPlayer(player);
                }
              }}
              className={`bg-[#0a0c12] border-2 p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between transition-all cursor-pointer ${
                isCompared ? 'border-[#ccff00]' : 'border-black hover:border-[#ccff00]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar player={player} size="lg" onClick={() => onOpenPhoto(player)} />
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-black text-white leading-none truncate">
                      {player.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono-code text-slate-400">
                        #{position}
                      </span>
                      <span className={`text-[11px] font-black font-grotesk ${movementClass}`}>
                        {movement > 0 ? `↑${movement}` : movement < 0 ? `↓${Math.abs(movement)}` : '='}
                      </span>
                      {isCaptain && (
                        <span className="bg-[#ccff00] text-black text-[9px] font-black px-1 font-grotesk uppercase">
                          Capitan
                        </span>
                      )}
                      {isTop8 && !isCaptain && (
                        <span className="bg-[#1e222d] text-slate-300 text-[9px] font-black px-1 font-grotesk uppercase">
                          Top 8
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-1.5">
                {playerStats.streak.length > 0 ? (
                  playerStats.streak.map((result, index) => (
                    <span
                      key={`${player.id}-streak-${index}`}
                      className={`w-6 h-6 text-[11px] font-black flex items-center justify-center border border-black ${
                        result === 'W' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                      }`}
                    >
                      {result}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-mono-code text-slate-600">Sin forma</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-black p-2.5 border border-[#262c3a] text-center font-mono-code">
                <div>
                  <span className="font-display text-xl font-black text-[#ccff00] block leading-none">
                    {playerStats.matchesWon}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Victorias</span>
                </div>
                <div>
                  <span className={`font-display text-xl font-black block leading-none ${
                    playerStats.setsDiff > 0 ? 'text-emerald-400' : playerStats.setsDiff < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {formatSigned(playerStats.setsDiff)}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Sets</span>
                </div>
                <div>
                  <span className={`font-display text-xl font-black block leading-none ${
                    playerStats.gamesDiff > 0 ? 'text-emerald-400' : playerStats.gamesDiff < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {formatSigned(playerStats.gamesDiff)}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Juegos</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectPlayer(player);
                  }}
                  className="flex-1 bg-[#ccff00] hover:bg-[#d8ff33] text-black border-2 border-black px-3 py-2 text-xs font-black font-grotesk uppercase shadow-[2px_2px_0px_0px_#ffffff] transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  Ver ficha
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleComparePlayer(player.id);
                  }}
                  className={`flex-1 border-2 px-3 py-2 text-xs font-black font-grotesk uppercase transition-all ${
                    isCompared
                      ? 'bg-[#ccff00] text-black border-black'
                      : 'bg-[#12151e] text-white border-[#ff5500] hover:bg-[#1a1f2c]'
                  }`}
                >
                  {isCompared ? 'Elegido' : 'Comparar'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredStats.length === 0 && (
        <div className="bg-[#0a0c12] border-2 border-[#262c3a] p-8 text-center text-xs font-mono-code text-slate-400">
          No hay jugadores para esa busqueda.
        </div>
      )}
    </div>
  );
};
