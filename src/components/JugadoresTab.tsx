import React, { useState } from 'react';
import { Edit3, ShieldCheck, Search } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { getPairingMatrix } from '../utils/leagueCalculations';

interface JugadoresTabProps {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  onEditPlayer: (player: Player) => void;
}

export const JugadoresTab: React.FC<JugadoresTabProps> = ({
  players,
  matches,
  stats,
  onEditPlayer,
}) => {
  const [activeSubView, setActiveSubView] = useState<'cards' | 'matrix'>('cards');
  const [selectedPlayerForMatrix, setSelectedPlayerForMatrix] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const statsMap = new Map<number, PlayerStats>(stats.map((s) => [s.playerId, s]));

  const { partnerMatrix, opponentMatrix } = getPairingMatrix(players, matches);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Sub-view Switcher */}
      <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#ccff00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              JUGADORES
            </span>
            <span className="bg-white text-black font-black text-[10px] px-2 py-0.5 uppercase font-mono-code border border-black">
              12 AMIGOS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-none">
            JUGADORES & EQUIDAD
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-slate-400 mt-1">
            FICHAS DE JUGADORES // COMPROBADOR WHIST
          </p>
        </div>

        {/* View Switcher: Fichas vs Matriz de Equidad */}
        <div className="flex items-center gap-2 bg-black border-2 border-[#262c3a] p-1 shrink-0">
          <button
            id="btn-view-cards"
            onClick={() => setActiveSubView('cards')}
            className={`px-3.5 py-2 text-xs font-black uppercase font-grotesk transition-all ${
              activeSubView === 'cards'
                ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_0px_#ffffff]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fichas ({players.length})
          </button>
          <button
            id="btn-view-matrix"
            onClick={() => setActiveSubView('matrix')}
            className={`px-3.5 py-2 text-xs font-black uppercase font-grotesk flex items-center gap-1.5 transition-all ${
              activeSubView === 'matrix'
                ? 'bg-[#ccff00] text-black shadow-[2px_2px_0px_0px_#ffffff]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Matriz de Equidad
          </button>
        </div>
      </div>

      {/* Subview 1: Player Cards */}
      {activeSubView === 'cards' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex items-center bg-[#0a0c12] border-2 border-[#262c3a] px-3 py-2 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar amigo por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-mono-code"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => {
              const pStats = statsMap.get(player.id);
              return (
                <div
                  key={player.id}
                  className="bg-[#0a0c12] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between hover:border-[#ccff00] transition-all"
                >
                  <div>
                    {/* Top Row: Avatar Initials & Edit */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 ${player.avatarColor || 'bg-[#ccff00]'} text-black font-display text-xl font-black flex items-center justify-center border-2 border-black`}>
                          {player.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-display text-xl font-black text-white leading-none">
                            {player.name}
                          </h3>
                          <span className="text-[11px] font-mono-code text-slate-400 block mt-0.5">
                            {player.nickname ? `"${player.nickname}" · ` : ''}Lado {player.side}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onEditPlayer(player)}
                        className="p-1.5 bg-[#12151e] hover:bg-[#ccff00] hover:text-black text-slate-400 border border-[#262c3a] transition-colors"
                        title="Editar datos del jugador"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stats Mini Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-black p-2.5 border border-[#262c3a] mb-3 text-center font-mono-code">
                      <div>
                        <span className="font-display text-xl font-black text-[#ccff00] block leading-none">
                          {pStats?.points || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase">PUNTOS</span>
                      </div>
                      <div>
                        <span className="font-display text-xl font-black text-white block leading-none">
                          {pStats?.matchesWon || 0}V-{pStats?.matchesLost || 0}D
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase">PJ ({pStats?.matchesPlayed || 0})</span>
                      </div>
                      <div>
                        <span className={`font-display text-xl font-black block leading-none ${
                          (pStats?.setsDiff || 0) > 0 ? 'text-emerald-400' : 'text-slate-300'
                        }`}>
                          {(pStats?.setsDiff || 0) > 0 ? `+${pStats?.setsDiff}` : pStats?.setsDiff || 0}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase">DIF SETS</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subview 2: Whist Equity Matrix */}
      {activeSubView === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-[#0a0c12] border-2 border-[#ccff00] p-5 shadow-[4px_4px_0px_0px_#ccff00]">
            <div className="flex items-center gap-2 text-[#ccff00] font-black font-grotesk text-sm uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              Verificador Matemático de Rotación Whist
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Selecciona a cualquiera de los 12 amigos para auditar su calendario completo: se demuestra matemáticamente que cada uno juega exactamente <strong>1 vez como compañero</strong> y <strong>2 veces como rival</strong> frente a cada amigo en las 11 semanas.
            </p>

            {/* Select player pill bar */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1">
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerForMatrix(p.id)}
                  className={`flex-shrink-0 px-3 py-1.5 text-xs font-black uppercase font-grotesk transition-all border ${
                    selectedPlayerForMatrix === p.id
                      ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#ffffff]'
                      : 'bg-[#12151e] text-slate-300 border-[#262c3a] hover:border-slate-500'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Result Grid for the selected player */}
          {(() => {
            const target = players.find((p) => p.id === selectedPlayerForMatrix) || players[0];
            const otherPlayers = players.filter((p) => p.id !== target.id);

            return (
              <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262c3a] pb-3 mb-4">
                  <h3 className="font-display text-2xl font-black text-white uppercase">
                    REGISTRO DE EQUIDAD PARA: <span className="text-[#ccff00]">{target.name}</span>
                  </h3>
                  <span className="text-xs font-mono-code text-slate-400">
                    11 Compañeros Diferentes // 22 Rivales Equitativos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {otherPlayers.map((other) => {
                    const timesPartner = partnerMatrix[target.id]?.[other.id]?.count ?? 0;
                    const timesOpponent = opponentMatrix[target.id]?.[other.id]?.count ?? 0;

                    return (
                      <div
                        key={other.id}
                        className="bg-[#12151e] border-2 border-[#262c3a] p-3 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-white font-grotesk">{other.name}</h4>
                          <span className="text-[10px] font-mono-code text-slate-400 capitalize">Lado {other.side}</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono-code text-xs">
                          <span className={`px-2 py-0.5 font-bold border ${
                            timesPartner === 1 ? 'bg-[#ccff00] text-black border-black' : 'bg-black text-slate-400 border-[#262c3a]'
                          }`} title="Veces como compañero en las 11 jornadas">
                            {timesPartner}x Comp.
                          </span>
                          <span className={`px-2 py-0.5 font-bold border ${
                            timesOpponent === 2 ? 'bg-[#ff5500] text-white border-black' : 'bg-black text-slate-400 border-[#262c3a]'
                          }`} title="Veces como rival en las 11 jornadas">
                            {timesOpponent}x Rival
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
