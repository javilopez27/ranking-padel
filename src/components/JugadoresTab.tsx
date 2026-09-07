import React, { useState } from 'react';
import { Edit3, Search } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface JugadoresTabProps {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  onEditPlayer: (player: Player) => void;
}

export const JugadoresTab: React.FC<JugadoresTabProps> = ({ players, stats, onEditPlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const statsMap = new Map<number, PlayerStats>(stats.map((stat) => [stat.playerId, stat]));
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(normalizedSearch) ||
    (player.nickname && player.nickname.toLowerCase().includes(normalizedSearch))
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#ccff00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              Jugadores
            </span>
            <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 uppercase font-mono-code border border-black">
              12 amigos
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const playerStats = statsMap.get(player.id);

          return (
            <article
              key={player.id}
              className="bg-[#0a0c12] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between hover:border-[#ccff00] transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar player={player} size="lg" />
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-black text-white leading-none truncate">
                      {player.name}
                    </h3>
                    {player.nickname && (
                      <span className="text-[11px] font-mono-code text-slate-400 block mt-1 truncate">
                        {player.nickname}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onEditPlayer(player)}
                  className="p-1.5 bg-[#12151e] hover:bg-[#ccff00] hover:text-black text-slate-400 border border-[#262c3a] transition-colors shrink-0"
                  title="Editar jugador"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-black p-2.5 border border-[#262c3a] text-center font-mono-code">
                <div>
                  <span className="font-display text-xl font-black text-[#ccff00] block leading-none">
                    {playerStats?.matchesWon || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Victorias</span>
                </div>
                <div>
                  <span className="font-display text-xl font-black text-white block leading-none">
                    {playerStats?.matchesPlayed || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Partidos</span>
                </div>
                <div>
                  <span className={`font-display text-xl font-black block leading-none ${
                    (playerStats?.setsDiff || 0) > 0 ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {(playerStats?.setsDiff || 0) > 0 ? `+${playerStats?.setsDiff}` : playerStats?.setsDiff || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Dif sets</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
