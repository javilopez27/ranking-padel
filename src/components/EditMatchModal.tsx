import { useModalFocus } from '../hooks/useModalFocus';
import React, { useState } from 'react';
import { X, Check, Clock, AlertCircle, Trash2, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { Player, Match, SetScore } from '../types';
import { getMatchWinner } from '../utils/scoreValidation';

interface EditMatchModalProps {
  match: Match;
  players: Player[];
  onClose: () => void;
  onSaveMatch: (updatedMatch: Match) => void;
}

export const EditMatchModal: React.FC<EditMatchModalProps> = ({
  match,
  players,
  onClose,
  onSaveMatch,
}) => {
  const modalRef = useModalFocus(onClose);


  const playerMap = new Map<number, Player>(players.map((p) => [p.id, p]));

  const p1 = playerMap.get(match.team1[0]);
  const p2 = playerMap.get(match.team1[1]);
  const p3 = playerMap.get(match.team2[0]);
  const p4 = playerMap.get(match.team2[1]);

  const [status, setStatus] = useState<Match['status']>(match.status);
  const [postponedNote, setPostponedNote] = useState<string>(match.postponedNote || '');
  const [playedDate, setPlayedDate] = useState<string>(match.playedDate || '');
  const [court, setCourt] = useState<string>(match.court || 'Pista 1 Central');

  // Up to 3 sets
  const initialSets: SetScore[] = match.sets.length > 0 ? match.sets : [
    { games1: 6, games2: 4 },
    { games1: 6, games2: 3 }
  ];
  const [sets, setSets] = useState<SetScore[]>(initialSets);

  const [error, setError] = useState('');

  const updateSetGames = (setIndex: number, team: 1 | 2, val: number) => {
    const next = sets.map(set => ({ ...set }));
    if (!next[setIndex]) {
      next[setIndex] = { games1: 0, games2: 0 };
    }
    if (team === 1) {
      next[setIndex].games1 = Math.max(0, Math.min(7, val));
    } else {
      next[setIndex].games2 = Math.max(0, Math.min(7, val));
    }
    setSets(next);
  };

  const handleAddThirdSet = () => {
    if (sets.length === 2) {
      setSets([...sets, { games1: 6, games2: 4 }]);
    }
  };

  const handleRemoveThirdSet = () => {
    if (sets.length > 2) {
      setSets(sets.slice(0, 2));
    }
  };

  const handleSave = () => {
    const winnerTeam = status === 'completed' ? getMatchWinner(sets) : undefined;
    if (status === 'completed' && !winnerTeam) {
      setError('Resultado inválido: se necesitan dos sets ganados. Sets válidos: 6–0 a 6–4, 7–5 o 7–6; tercer set solo con 1–1.');
      return;
    }
    const updated: Match = {
      ...match,
      status,
      sets: status === 'completed' ? sets : [],
      winnerTeam: status === 'completed' ? winnerTeam : undefined,
      postponedNote: status === 'postponed' ? postponedNote : undefined,
      playedDate: playedDate || undefined,
      court: court || undefined,
    };

    onSaveMatch(updated);
    onClose();
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-label="Acta del partido" className="bg-[#0a0c12] border-2 border-black w-full max-w-xl shadow-[8px_8px_0px_0px_#ccff00] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header Ticket Bar */}
        <div className="bg-black p-4 border-b-2 border-[#262c3a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ccff00]"></span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              ACTA DEL PARTIDO // {match.roundNumber === 12 ? 'FASE FINAL' : `JORNADA ${match.roundNumber}`}
            </h2>
          </div>
          <button
            aria-label="Cerrar acta"
            onClick={onClose}
            className="p-1.5 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 font-mono-code text-xs">
          {/* Status Selector */}
          <div>
            <label className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk tracking-wider block mb-2">
              ESTADO DEL PARTIDO
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`py-2 px-2 text-center font-grotesk text-xs uppercase font-black border-2 transition-all ${
                  status === 'completed'
                    ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_0px_#ffffff]'
                    : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
                }`}
              >
                ✓ Finalizado
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-2 text-center font-grotesk text-xs uppercase font-black border-2 transition-all ${
                  status === 'pending'
                    ? 'bg-white text-black border-black shadow-[2px_2px_0px_0px_#ccff00]'
                    : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
                }`}
              >
                ⏳ Pendiente
              </button>
              <button
                type="button"
                onClick={() => setStatus('postponed')}
                className={`py-2 px-2 text-center font-grotesk text-xs uppercase font-black border-2 transition-all ${
                  status === 'postponed'
                    ? 'bg-[#ff5500] text-white border-black shadow-[2px_2px_0px_0px_#ffffff]'
                    : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
                }`}
              >
                ⚠️ Aplazado
              </button>
            </div>
          </div>

          {/* Postponed Warning Input */}
          {status === 'postponed' && (
            <div className="bg-[#1e1008] border-2 border-[#ff5500] p-3 space-y-2">
              <span className="font-bold text-[#ff5500] text-xs font-grotesk uppercase block">
                MOTIVO DEL APLAZAMIENTO A DICIEMBRE:
              </span>
              <input
                type="text"
                value={postponedNote}
                onChange={(e) => setPostponedNote(e.target.value)}
                placeholder="Ej. Lesión de muñeca / lluvia / aplazado al 5 de diciembre"
                className="w-full bg-black border border-[#262c3a] px-3 py-2 text-white text-xs font-mono-code focus:outline-none focus:border-[#ff5500]"
              />
            </div>
          )}

          {/* Teams Header Display */}
          <div className="grid grid-cols-11 items-center gap-2 bg-[#12151e] p-3 border border-[#262c3a]">
            <div className="col-span-5">
              <span className="text-[10px] font-black uppercase text-[#ccff00] font-grotesk block">PAREJA 1</span>
              <p className="font-bold text-white font-grotesk text-xs truncate">{p1?.name}</p>
              <p className="font-bold text-white font-grotesk text-xs truncate">{p2?.name}</p>
            </div>
            <div className="col-span-1 text-center font-display text-lg font-black text-slate-500">VS</div>
            <div className="col-span-5 text-right">
              <span className="text-[10px] font-black uppercase text-blue-400 font-grotesk block">PAREJA 2</span>
              <p className="font-bold text-white font-grotesk text-xs truncate">{p3?.name}</p>
              <p className="font-bold text-white font-grotesk text-xs truncate">{p4?.name}</p>
            </div>
          </div>

          {/* Score Inputs (when completed) */}
          {status === 'completed' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-white font-grotesk">
                  JUEGOS POR SET (AL MEJOR DE 3)
                </label>
                {sets.length === 2 ? (
                  <button
                    type="button"
                    onClick={handleAddThirdSet}
                    className="text-[#ccff00] hover:underline font-bold text-[11px]"
                  >
                    + Añadir 3er Set (Desempate)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveThirdSet}
                    className="text-rose-400 hover:underline font-bold text-[11px]"
                  >
                    - Quitar 3er Set
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {sets.map((set, idx) => (
                  <div key={idx} className="bg-black p-3 border border-[#262c3a] flex items-center justify-between gap-4">
                    <span className="font-bold text-[#ccff00] w-16">SET {idx + 1}</span>

                    {/* Team 1 Games Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] uppercase">P1:</span>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        aria-label={`Set ${idx + 1}, pareja 1`}
                        value={set.games1}
                        onChange={(e) => updateSetGames(idx, 1, parseInt(e.target.value) || 0)}
                        className="w-14 bg-[#12151e] border border-[#262c3a] px-2 py-1 text-center font-display text-xl font-black text-white focus:border-[#ccff00] focus:outline-none"
                      />
                    </div>

                    <span className="font-bold text-slate-500">-</span>

                    {/* Team 2 Games Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] uppercase">P2:</span>
                      <input
                        type="number"
                        min="0"
                        max="7"
                        aria-label={`Set ${idx + 1}, pareja 2`}
                        value={set.games2}
                        onChange={(e) => updateSetGames(idx, 2, parseInt(e.target.value) || 0)}
                        className="w-14 bg-[#12151e] border border-[#262c3a] px-2 py-1 text-center font-display text-xl font-black text-white focus:border-[#ccff00] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match Location / Date Meta */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 font-grotesk block mb-1">
                PISTA / CLUB
              </label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="Pista 1 Central"
                className="w-full bg-black border border-[#262c3a] px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#ccff00]"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 font-grotesk block mb-1">
                FECHA DE DISPUTA
              </label>
              <input
                type="text"
                value={playedDate}
                onChange={(e) => setPlayedDate(e.target.value)}
                placeholder="Ej. 17 Sep, 20:00h"
                className="w-full bg-black border border-[#262c3a] px-3 py-2 text-white font-mono-code focus:outline-none focus:border-[#ccff00]"
              />
            </div>
          </div>
        </div>

        {error && <p role="alert" className="px-4 py-2 text-sm text-rose-300">{error}</p>}
        {/* Footer Actions */}
        <div className="p-4 bg-black border-t-2 border-[#262c3a] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#12151e] hover:bg-[#1a1f2c] text-white font-grotesk font-black text-xs uppercase border border-[#262c3a]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-[#ccff00] hover:bg-[#d8ff33] text-black font-grotesk font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#ffffff]"
          >
            Guardar Acta Oficial
          </button>
        </div>
      </div>
    </div>
  );
};
