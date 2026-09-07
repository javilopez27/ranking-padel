import React, { useState } from 'react';
import { Trophy, HelpCircle, Share2, Flame, ShieldCheck, Eye, Zap, AlertTriangle } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';

interface ClasificacionTabProps {
  stats: PlayerStats[];
  matches: Match[];
  players: Player[];
  onOpenShare: () => void;
  onSelectPlayer: (player: Player) => void;
}

export const ClasificacionTab: React.FC<ClasificacionTabProps> = ({
  stats,
  players,
  onOpenShare,
  onSelectPlayer,
}) => {
  const [showTiebreakExplainer, setShowTiebreakExplainer] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="bg-[#0a0c12] border-2 border-black p-5 shadow-[4px_4px_0px_0px_#ccff00] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#ccff00] text-black font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              LEADERBOARD OFICIAL
            </span>
            <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              3 PTS / VICTORIA
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-none">
            TABLA DE CLASIFICACIÓN
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-slate-400 mt-1">
            ORDENACIÓN: PUNTOS &gt; DIF. SETS &gt; DIF. JUEGOS &gt; SETS A FAVOR
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-tiebreak-info"
            onClick={() => setShowTiebreakExplainer(!showTiebreakExplainer)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#12151e] hover:bg-[#1a1f2c] border-2 border-[#262c3a] text-white text-xs font-bold font-grotesk uppercase transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Desempates</span>
          </button>

          <button
            id="btn-share-standings"
            onClick={onOpenShare}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#25d366] hover:bg-[#20bd5a] text-black text-xs font-black font-grotesk uppercase border-2 border-black shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tie-break Explanation Box (Collapsible) */}
      {showTiebreakExplainer && (
        <div className="bg-[#12151e] border-2 border-[#ccff00] p-4 sm:p-5 text-xs text-slate-300 space-y-2 shadow-[3px_3px_0px_0px_#ccff00]">
          <div className="flex items-center gap-2 text-[#ccff00] font-black text-sm font-grotesk uppercase">
            <ShieldCheck className="w-4 h-4" />
            Jerarquía Oficial de Desempate
          </div>
          <ol className="list-decimal list-inside space-y-1 font-mono-code text-slate-200">
            <li><strong className="text-white">Mayor Diferencia de Sets</strong> (Sets Ganados - Sets Perdidos).</li>
            <li><strong className="text-white">Mayor Diferencia de Juegos</strong> (Juegos Ganados - Juegos Perdidos).</li>
            <li><strong className="text-white">Mayor Número de Sets a Favor</strong> (SG).</li>
            <li><strong className="text-white">Mayor Número de Juegos a Favor</strong> (JG).</li>
            <li><strong className="text-white">Enfrentamiento directo</strong> entre los involucrados.</li>
          </ol>
        </div>
      )}

      {/* Legend Banners */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0a0c12] px-2 py-1 border border-[#ccff00]">
            <span className="w-2.5 h-2.5 bg-[#ccff00] inline-block" />
            <span className="text-white font-bold">PUESTOS 1º AL 8º:</span>
            <span className="text-[#ccff00]">PASAN AL TOP 8 DRAFT</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0a0c12] px-2 py-1 border border-[#262c3a]">
            <span className="w-2.5 h-2.5 bg-slate-600 inline-block" />
            <span className="text-slate-400">PUESTOS 9º AL 12º: FASE REGULAR</span>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          * Pulsa sobre cualquier jugador para abrir su ficha completa y resultados
        </span>
      </div>

      {/* Scoreboard Table Container */}
      <div className="bg-[#0a0c12] border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black border-b-2 border-[#262c3a] font-grotesk font-black uppercase text-slate-300 text-[11px] tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-14 text-center">POS</th>
                <th className="py-3 px-3 sm:px-4">JUGADOR</th>
                <th className="py-3 px-3 sm:px-4 text-center bg-[#ccff00]/10 text-[#ccff00] border-x border-[#262c3a]">PTS</th>
                <th className="py-3 px-2 sm:px-3 text-center">PJ</th>
                <th className="py-3 px-2 sm:px-3 text-center text-emerald-400">PG</th>
                <th className="py-3 px-2 sm:px-3 text-center text-rose-400">PP</th>
                <th className="py-3 px-2 sm:px-3 text-center">DIF S</th>
                <th className="py-3 px-2 sm:px-3 text-center">DIF J</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">SG/SP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">JG/JP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">RACHA</th>
                <th className="py-3 px-3 sm:px-4 text-right">FICHA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222d] font-mono-code">
              {stats.map((row, index) => {
                const pos = index + 1;
                const isTop8 = pos <= 8;
                const isCaptain = pos <= 4;
                const isCutoff = pos === 8;

                return (
                  <React.Fragment key={row.playerId}>
                    <tr
                      onClick={() => onSelectPlayer(row.player)}
                      className={`hover:bg-[#151822] cursor-pointer transition-colors ${
                        pos === 1
                          ? 'bg-[#ccff00]/5 font-bold'
                          : isTop8
                          ? 'bg-[#0a0c12]'
                          : 'bg-[#060709] opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Position */}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center">
                          {pos === 1 ? (
                            <span className="w-7 h-7 bg-[#ccff00] text-black font-display text-lg font-black flex items-center justify-center border border-black shadow-[1px_1px_0px_0px_#ffffff]">
                              01
                            </span>
                          ) : pos === 2 ? (
                            <span className="w-7 h-7 bg-white text-black font-display text-lg font-black flex items-center justify-center border border-black">
                              02
                            </span>
                          ) : pos === 3 ? (
                            <span className="w-7 h-7 bg-[#ff5500] text-white font-display text-lg font-black flex items-center justify-center border border-black">
                              03
                            </span>
                          ) : (
                            <span className={`font-display text-lg font-black ${isTop8 ? 'text-slate-200' : 'text-slate-600'}`}>
                              {pos < 10 ? `0${pos}` : pos}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Player Name & Badge */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 ${row.player.avatarColor || 'bg-[#ccff00]'} text-black font-black font-display text-sm flex items-center justify-center border border-black shrink-0`}>
                            {row.player.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-white font-grotesk text-sm">
                                {row.player.name}
                              </span>
                              {isCaptain && (
                                <span className="bg-[#ccff00] text-black text-[9px] font-black px-1 font-grotesk uppercase">
                                  CAPITÁN
                                </span>
                              )}
                              {isTop8 && !isCaptain && (
                                <span className="bg-[#1e222d] text-slate-300 text-[9px] font-black px-1 font-grotesk uppercase">
                                  DRAFT POOL
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              Lado: {row.player.side}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-3 sm:px-4 text-center bg-[#ccff00]/10 border-x border-[#262c3a]">
                        <span className="font-display text-2xl font-black text-[#ccff00]">
                          {row.points}
                        </span>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-300 font-bold">
                        {row.matchesPlayed}
                      </td>

                      {/* Matches Won */}
                      <td className="py-3 px-2 sm:px-3 text-center text-emerald-400 font-bold">
                        {row.matchesWon}
                      </td>

                      {/* Matches Lost */}
                      <td className="py-3 px-2 sm:px-3 text-center text-rose-400 font-bold">
                        {row.matchesLost}
                      </td>

                      {/* Sets Difference */}
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.setsDiff > 0 ? 'text-emerald-400' : row.setsDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.setsDiff > 0 ? `+${row.setsDiff}` : row.setsDiff}
                        </span>
                      </td>

                      {/* Games Difference */}
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.gamesDiff > 0 ? 'text-emerald-400' : row.gamesDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.gamesDiff > 0 ? `+${row.gamesDiff}` : row.gamesDiff}
                        </span>
                      </td>

                      {/* SG / SP */}
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-400 hidden md:table-cell text-[11px]">
                        {row.setsWon}/{row.setsLost}
                      </td>

                      {/* JG / JP */}
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-400 hidden md:table-cell text-[11px]">
                        {row.gamesWon}/{row.gamesLost}
                      </td>

                      {/* Streak */}
                      <td className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.streak.length > 0 ? (
                            row.streak.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className={`w-4 h-4 text-[9px] font-black flex items-center justify-center border border-black ${
                                  s === 'W' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                                }`}
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-[10px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPlayer(row.player);
                          }}
                          className="px-2.5 py-1 bg-[#1e222d] hover:bg-[#ccff00] hover:text-black text-slate-200 text-[10px] font-black font-grotesk uppercase border border-[#262c3a] transition-colors"
                        >
                          VER
                        </button>
                      </td>
                    </tr>

                    {/* Cutoff Divider after 8th position */}
                    {isCutoff && (
                      <tr className="bg-black border-y-2 border-[#ccff00]">
                        <td colSpan={12} className="py-1 px-4 text-center font-grotesk font-black text-[11px] text-black bg-[#ccff00] uppercase tracking-widest">
                          ⚡ LÍNEA DE CORTE FASE FINAL // LOS 8 PRIMEROS DISPUTAN EL DRAFT DE DICIEMBRE ⚡
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
