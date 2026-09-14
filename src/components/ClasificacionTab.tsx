import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Player, Match, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerComparePanel } from './PlayerComparePanel';
import { getRankingMovement } from '../utils/rankingInsights';

interface ClasificacionTabProps {
  stats: PlayerStats[];
  matches: Match[];
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  onOpenPhoto: (player: Player) => void;
}

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
  const movementMap = getRankingMovement(players, matches);

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
              Ranking oficial
            </span>
            <span className="bg-[#ff5500] text-white font-black text-[10px] px-2 py-0.5 uppercase font-grotesk border border-black">
              Victorias
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-wide uppercase leading-none">
            Ranking
          </h1>
          <p className="text-xs sm:text-sm font-mono-code text-slate-400 mt-1">
            Orden: victorias, diferencia de sets, diferencia de juegos, sets a favor y juegos a favor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-compare-players"
            onClick={() => {
              setCompareMode((value) => !value);
              setCompareIds([]);
            }}
            className={`px-3 py-2 border-2 text-xs font-black font-grotesk uppercase transition-all shrink-0 ${
              compareMode
                ? 'bg-[#ccff00] text-black border-black shadow-[3px_3px_0px_0px_#ffffff]'
                : 'bg-[#12151e] hover:bg-[#1a1f2c] border-[#ff5500] text-white'
            }`}
          >
            Comparar
          </button>
          <button
            id="btn-tiebreak-info"
            onClick={() => setShowTiebreakExplainer((value) => !value)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#12151e] hover:bg-[#1a1f2c] border-2 border-[#262c3a] text-white text-xs font-bold font-grotesk uppercase transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Desempates</span>
          </button>
        </div>
      </div>

      {showTiebreakExplainer && (
        <div className="bg-[#12151e] border-2 border-[#ccff00] p-4 sm:p-5 text-xs text-slate-300 space-y-2 shadow-[3px_3px_0px_0px_#ccff00]">
          <div className="text-[#ccff00] font-black text-sm font-grotesk uppercase">Desempate</div>
          <ol className="list-decimal list-inside space-y-1 font-mono-code text-slate-200">
            <li><strong className="text-white">Victorias</strong>.</li>
            <li><strong className="text-white">Mayor diferencia de sets</strong> (sets ganados - sets perdidos).</li>
            <li><strong className="text-white">Mayor diferencia de juegos</strong> (juegos ganados - juegos perdidos).</li>
            <li><strong className="text-white">Mayor numero de sets a favor</strong>.</li>
            <li><strong className="text-white">Mayor numero de juegos a favor</strong>.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0a0c12] px-2 py-1 border border-[#ccff00]">
            <span className="w-2.5 h-2.5 bg-[#ccff00] inline-block" />
            <span className="text-white font-bold">Puestos 1 al 8:</span>
            <span className="text-[#ccff00]">pasan al Top 8 Draft</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0a0c12] px-2 py-1 border border-[#262c3a]">
            <span className="w-2.5 h-2.5 bg-slate-600 inline-block" />
            <span className="text-slate-400">Puestos 9 al 12: fase regular</span>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          {compareMode
            ? `Modo comparar activo: selecciona dos jugadores (${compareIds.length}/2).`
            : 'Pulsa sobre cualquier jugador para abrir su ficha completa y resultados.'}
        </span>
      </div>

      {compareMode && (
        <PlayerComparePanel
          players={players}
          matches={matches}
          stats={stats}
          selectedIds={compareIds}
          onClear={() => setCompareIds([])}
        />
      )}

      <div className="bg-[#0a0c12] border-2 border-black overflow-hidden shadow-[6px_6px_0px_0px_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black border-b-2 border-[#262c3a] font-grotesk font-black uppercase text-slate-300 text-[11px] tracking-wider">
                <th className="py-3 px-3 sm:px-4 w-14 text-center">Pos</th>
                <th className="py-3 px-3 sm:px-4">Jugador</th>
                <th className="py-3 px-3 sm:px-4 text-center bg-[#ccff00]/10 text-[#ccff00] border-x border-[#262c3a]">Victorias</th>
                <th className="py-3 px-2 sm:px-3 text-center">PJ</th>
                <th className="py-3 px-2 sm:px-3 text-center text-rose-400">Derrotas</th>
                <th className="py-3 px-2 sm:px-3 text-center">Dif sets</th>
                <th className="py-3 px-2 sm:px-3 text-center">Dif juegos</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">SG/SP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">JG/JP</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">Racha</th>
                <th className="py-3 px-3 sm:px-4 text-right">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e222d] font-mono-code">
              {stats.map((row, index) => {
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
                      className={`hover:bg-[#151822] cursor-pointer transition-colors ${
                        pos === 1
                          ? 'bg-[#ccff00]/5 font-bold'
                          : isTop8
                          ? 'bg-[#0a0c12]'
                          : 'bg-[#060709] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-display text-lg font-black ${pos <= 3 ? 'text-[#ccff00]' : isTop8 ? 'text-slate-200' : 'text-slate-600'}`}>
                            {pos < 10 ? `0${pos}` : pos}
                          </span>
                          <span className={`text-[10px] font-black font-grotesk min-w-6 ${
                            movement > 0 ? 'text-emerald-400' : movement < 0 ? 'text-rose-400' : 'text-slate-500'
                          }`}>
                            {movement > 0 ? `↑${movement}` : movement < 0 ? `↓${Math.abs(movement)}` : '='}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex items-center gap-2.5">
                          <PlayerAvatar player={row.player} size="sm" onClick={() => onOpenPhoto(row.player)} />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white font-grotesk text-sm">
                              {row.player.name}
                            </span>
                            {isCaptain && (
                              <span className="bg-[#ccff00] text-black text-[9px] font-black px-1 font-grotesk uppercase">
                                Capitan
                              </span>
                            )}
                            {isTop8 && !isCaptain && (
                              <span className="bg-[#1e222d] text-slate-300 text-[9px] font-black px-1 font-grotesk uppercase">
                                Draft pool
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center bg-[#ccff00]/10 border-x border-[#262c3a]">
                        <span className="font-display text-2xl font-black text-[#ccff00]">{row.matchesWon}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-300 font-bold">{row.matchesPlayed}</td>
                      <td className="py-3 px-2 sm:px-3 text-center text-rose-400 font-bold">{row.matchesLost}</td>
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.setsDiff > 0 ? 'text-emerald-400' : row.setsDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.setsDiff > 0 ? `+${row.setsDiff}` : row.setsDiff}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-bold">
                        <span className={row.gamesDiff > 0 ? 'text-emerald-400' : row.gamesDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                          {row.gamesDiff > 0 ? `+${row.gamesDiff}` : row.gamesDiff}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-400 hidden md:table-cell text-[11px]">
                        {row.setsWon}/{row.setsLost}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center text-slate-400 hidden md:table-cell text-[11px]">
                        {row.gamesWon}/{row.gamesLost}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.streak.length > 0 ? (
                            row.streak.map((result, sIdx) => (
                              <span
                                key={sIdx}
                                className={`w-4 h-4 text-[9px] font-black flex items-center justify-center border border-black ${
                                  result === 'W' ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                                }`}
                              >
                                {result}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-600 text-[10px]">-</span>
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
                                ? 'bg-[#ccff00] text-black border-black'
                                : 'bg-[#1e222d] hover:bg-[#ff5500] hover:text-white text-slate-200 border-[#262c3a]'
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
                            className="px-2.5 py-1 bg-[#1e222d] hover:bg-[#ccff00] hover:text-black text-slate-200 text-[10px] font-black font-grotesk uppercase border border-[#262c3a] transition-colors"
                          >
                            Ver
                          </button>
                        )}
                      </td>
                    </tr>

                    {isCutoff && (
                      <tr className="bg-black border-y-2 border-[#ccff00]">
                        <td colSpan={11} className="py-1 px-4 text-center font-grotesk font-black text-[11px] text-black bg-[#ccff00] uppercase tracking-widest">
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
