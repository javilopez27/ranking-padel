import { useEffect, useMemo, useState } from 'react';
import { Check, Clipboard, Download, Lock, Save, X } from 'lucide-react';
import { getMatchWinner } from '../utils/scoreValidation';
import { useModalFocus } from '../hooks/useModalFocus';
import type { Match, MatchStatus, Player, SetScore } from '../types';

interface AdminResultsModalProps {
  matches: Match[];
  players: Player[];
  onClose: () => void;
  onSaveMatch: (match: Match) => void;
}

const ADMIN_PASSWORD = '0000';

const inputClass = 'w-full bg-black border-2 border-[#262c3a] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]';

function parseSets(rawSets: string): SetScore[] {
  if (!rawSets.trim()) return [];

  return rawSets.trim().split(/\s+/).map((set) => {
    const match = set.match(/^(\d+)-(\d+)$/);
    if (!match) throw new Error('Escribe los sets como 6-4 7-5 o 6-4 3-6 7-6.');

    return { games1: Number(match[1]), games2: Number(match[2]) };
  });
}

function formatSets(sets: SetScore[]) {
  return sets.map((set) => `${set.games1}-${set.games2}`).join(' ');
}

function csvValue(value: string) {
  return value.includes(',') || value.includes('"') || value.includes(' ')
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

function buildResultsCsv(matches: Match[]) {
  const header = 'id,status,winnerTeam,sets,playedDate,postponedNote,court';
  const rows = matches.map((match) => [
    match.id,
    match.status,
    match.winnerTeam ? String(match.winnerTeam) : '',
    csvValue(formatSets(match.sets)),
    match.playedDate || '',
    csvValue(match.postponedNote || ''),
    csvValue(match.court || ''),
  ].join(','));

  return [header, ...rows].join('\n');
}

export function AdminResultsModal({ matches, players, onClose, onSaveMatch }: AdminResultsModalProps) {
  const modalRef = useModalFocus(onClose);
  const playerMap = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const firstEditableMatch = matches.find((match) => match.status !== 'completed') || matches[0];
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState(firstEditableMatch.id);
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) || firstEditableMatch;
  const [status, setStatus] = useState<MatchStatus>(selectedMatch.status);
  const [winnerTeam, setWinnerTeam] = useState<'' | '1' | '2'>(selectedMatch.winnerTeam ? String(selectedMatch.winnerTeam) as '1' | '2' : '');
  const [setsText, setSetsText] = useState(formatSets(selectedMatch.sets));
  const [playedDate, setPlayedDate] = useState(selectedMatch.playedDate || '');
  const [postponedNote, setPostponedNote] = useState(selectedMatch.postponedNote || '');
  const [court, setCourt] = useState(selectedMatch.court || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const csvText = useMemo(() => buildResultsCsv(matches), [matches]);

  useEffect(() => {
    setStatus(selectedMatch.status);
    setWinnerTeam(selectedMatch.winnerTeam ? String(selectedMatch.winnerTeam) as '1' | '2' : '');
    setSetsText(formatSets(selectedMatch.sets));
    setPlayedDate(selectedMatch.playedDate || '');
    setPostponedNote(selectedMatch.postponedNote || '');
    setCourt(selectedMatch.court || '');
    setMessage('');
    setError('');
  }, [selectedMatch]);

  const teamName = (team: [number, number]) => team.map((id) => playerMap.get(id)?.name || 'Jugador').join(' / ');
  const matchName = (match: Match) => `J${match.roundNumber} P${match.matchNumberInRound} - ${teamName(match.team1)} vs ${teamName(match.team2)}`;

  const unlock = () => {
    if (password === ADMIN_PASSWORD) {
      setUnlocked(true);
      setError('');
      return;
    }

    setError('Contraseña incorrecta.');
  };

  const saveMatch = () => {
    setMessage('');
    setError('');

    try {
      const sets = parseSets(setsText);
      const parsedWinner = winnerTeam ? Number(winnerTeam) as 1 | 2 : undefined;
      const setWinner = getMatchWinner(sets);

      if (status === 'completed') {
        if (sets.length === 0) throw new Error('Escribe el marcador.');
        if (!setWinner) throw new Error('El marcador no es valido.');
        if (parsedWinner && setWinner !== parsedWinner) throw new Error('El ganador no coincide con los sets.');
      }

      onSaveMatch({
        ...selectedMatch,
        status,
        sets: status === 'completed' ? sets : [],
        winnerTeam: status === 'completed' ? parsedWinner || setWinner : undefined,
        playedDate: playedDate || undefined,
        postponedNote: status === 'postponed' ? postponedNote || undefined : undefined,
        court: court || undefined,
      });
      setMessage('Resultado aplicado en esta vista. Copia el CSV para publicarlo.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se ha podido guardar el resultado.');
    }
  };

  const copyCsv = async () => {
    await navigator.clipboard.writeText(csvText);
    setMessage('CSV copiado.');
  };

  const downloadCsv = () => {
    const url = URL.createObjectURL(new Blob([csvText], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resultados.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={modalRef} className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xs">
      <div role="dialog" aria-modal="true" aria-label="Editar resultados" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0a0c12] border-2 border-black shadow-[8px_8px_0px_0px_#ff5500]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-black border-b-2 border-[#262c3a] p-4">
          <div>
            <span className="text-[10px] font-grotesk font-black uppercase text-[#ff5500]">Administracion</span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white uppercase leading-none">Resultados</h2>
          </div>
          <button
            aria-label="Cerrar editor"
            onClick={onClose}
            className="p-2 bg-[#12151e] hover:bg-[#ff5500] hover:text-white text-slate-400 border border-[#262c3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {!unlocked ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                unlock();
              }}
            >
              <div className="flex items-center gap-3 border-2 border-[#262c3a] bg-[#12151e] p-4">
                <Lock className="w-5 h-5 text-[#ccff00]" />
                <p className="text-sm text-slate-300">Introduce la contraseña para editar resultados.</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                autoFocus
                inputMode="numeric"
                aria-label="Contraseña"
              />
              <button type="submit" className="inline-flex items-center gap-2 bg-[#ccff00] text-black border-2 border-black px-4 py-2 font-grotesk font-black uppercase shadow-[3px_3px_0px_0px_#ffffff]">
                <Check className="w-4 h-4" />
                Entrar
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-xs font-grotesk font-black uppercase text-slate-400">Partido</span>
                <select value={selectedMatchId} onChange={(event) => setSelectedMatchId(event.target.value)} className={inputClass}>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id} className="bg-black text-white">
                      {matchName(match)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Estado</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value as MatchStatus)} className={inputClass}>
                    <option value="pending" className="bg-black text-white">Pendiente</option>
                    <option value="completed" className="bg-black text-white">Finalizado</option>
                    <option value="postponed" className="bg-black text-white">Aplazado</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Ganador</span>
                  <select value={winnerTeam} onChange={(event) => setWinnerTeam(event.target.value as '' | '1' | '2')} className={inputClass}>
                    <option value="" className="bg-black text-white">Sin ganador</option>
                    <option value="1" className="bg-black text-white">Pareja 1</option>
                    <option value="2" className="bg-black text-white">Pareja 2</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Sets</span>
                  <input value={setsText} onChange={(event) => setSetsText(event.target.value)} className={inputClass} placeholder="6-4 7-5" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Fecha</span>
                  <input value={playedDate} onChange={(event) => setPlayedDate(event.target.value)} className={inputClass} placeholder="15/09" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Nota</span>
                  <input value={postponedNote} onChange={(event) => setPostponedNote(event.target.value)} className={inputClass} placeholder="Solo si se aplaza" />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-grotesk font-black uppercase text-slate-400">Pista</span>
                  <input value={court} onChange={(event) => setCourt(event.target.value)} className={inputClass} placeholder="Pista 1" />
                </label>
              </div>

              {error && <p className="border-2 border-[#ff5500] bg-[#1e1008] p-3 text-sm text-orange-200">{error}</p>}
              {message && <p className="border-2 border-[#ccff00] bg-[#152008] p-3 text-sm text-[#ccff00]">{message}</p>}

              <div className="flex flex-wrap gap-2">
                <button onClick={saveMatch} className="inline-flex items-center gap-2 bg-[#ccff00] text-black border-2 border-black px-4 py-2 font-grotesk font-black uppercase shadow-[3px_3px_0px_0px_#ffffff]">
                  <Save className="w-4 h-4" />
                  Aplicar
                </button>
                <button onClick={copyCsv} className="inline-flex items-center gap-2 bg-[#12151e] text-white border-2 border-[#262c3a] px-4 py-2 font-grotesk font-black uppercase hover:border-[#ccff00]">
                  <Clipboard className="w-4 h-4" />
                  Copiar CSV
                </button>
                <button onClick={downloadCsv} className="inline-flex items-center gap-2 bg-[#12151e] text-white border-2 border-[#262c3a] px-4 py-2 font-grotesk font-black uppercase hover:border-[#ff5500]">
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
