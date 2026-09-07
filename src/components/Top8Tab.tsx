import React, { useState } from 'react';
import { Trophy, Zap, Edit3 } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import type { LeagueData } from '../services/leagueSchema';
import { emptyPlayoffs } from '../services/leagueSchema';
import { EditMatchModal } from './EditMatchModal';

type Playoffs = LeagueData['playoffs'];
type Stage = 'semi1' | 'semi2' | 'final';
interface Top8TabProps {
  stats: PlayerStats[];
  players: Player[];
  matches: Match[];
  playoffs: Playoffs;
  canEdit: boolean;
  onChange: (playoffs: Playoffs) => void;
}

export function Top8Tab({ stats, players, matches, playoffs, canEdit, onChange }: Top8TabProps) {
  const [editing, setEditing] = useState<Stage | null>(null);
  const [picks, setPicks] = useState<number[]>([0, 0, 0, 0]);
  const [error, setError] = useState('');
  const finished = matches.every(m => m.status === 'completed');
  const captains = stats.slice(0, 4);
  const pool = stats.slice(4, 8);
  const name = (id: number) => players.find(p => p.id === id)?.name ?? 'Por decidir';
  const pairName = (pair?: [number, number]) => pair ? pair.map(name).join(' / ') : 'Pendiente de semifinales';
  const { pairs, semi1, semi2, final } = playoffs;
  const finalTeam1 = semi1.winnerTeam ? pairs[semi1.winnerTeam === 1 ? 0 : 3] : undefined;
  const finalTeam2 = semi2.winnerTeam ? pairs[semi2.winnerTeam === 1 ? 1 : 2] : undefined;
  const rounds: { id: Stage; title: string; team1?: [number, number]; team2?: [number, number] }[] = [
    { id: 'semi1', title: 'Semifinal 1 · 1º vs 4º', team1: pairs[0], team2: pairs[3] },
    { id: 'semi2', title: 'Semifinal 2 · 2º vs 3º', team1: pairs[1], team2: pairs[2] },
    { id: 'final', title: 'Gran final · 80 € / 40 €', team1: finalTeam1, team2: finalTeam2 },
  ];
  const current = rounds.find(r => r.id === editing);
  const savePairs = () => {
    if (!finished || picks.some(id => !pool.some(p => p.playerId === id)) || new Set(picks).size !== 4) {
      setError('Selecciona un compañero diferente para cada capitán.'); return;
    }
    onChange({ ...emptyPlayoffs(), pairs: captains.map((p, i) => [p.playerId, picks[i]]) });
    setError('');
  };
  return <div className="space-y-6 sm:space-y-8 pb-12">
    <section className="bg-[#0a0c12] border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_0px_#ff5500]">
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        <div>
          <div className="flex flex-wrap gap-2 mb-3 font-grotesk font-black text-xs uppercase">
            <span className="bg-[#ff5500] px-2 py-1">Fase final</span>
            <span className="bg-[#ccff00] text-black px-2 py-1">Draft de capitanes</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-none">FASE FINAL TOP 8 // <span className="text-[#ccff00]">DRAFT BOARD</span></h1>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl">Los cuatro primeros eligen compañero entre los puestos 5º y 8º. Semifinales y gran final para decidir los campeones de la liga.</p>
        </div>
        <div className="bg-[#12151e] border-2 border-[#ccff00] p-4 lg:w-72 shrink-0">
          <div className="flex justify-between text-[#ccff00] font-grotesk text-xs font-bold">PREMIOS EN METÁLICO <Zap size={16} /></div>
          <div className="font-display text-4xl">120€ TOTAL</div>
          <p className="text-xs text-slate-300 mt-2">🥇 Campeones: 80 € (40 € cada uno)<br />🥈 Subcampeones: 40 € (20 € cada uno)</p>
        </div>
      </div>
    </section>
    {!finished && <p className="border border-[#ff5500] bg-[#1e1008] p-4 text-sm text-orange-200">Clasificación provisional. Completa los 33 partidos de la liga para fijar las parejas. No hay campeones hasta que se juegue la final.</p>}
    <section className="space-y-4">
      <h2 className="font-display text-2xl border-2 border-[#262c3a] p-3">TABLÓN DE ELECCIÓN // LOS 4 CAPITANES</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {captains.map((captain, i) => <article key={captain.playerId} className="bg-[#0a0c12] border-2 border-[#262c3a] p-4 shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[#ccff00] text-xs font-mono-code">CAPITÁN {i + 1} // {captain.points} PTS</span>
          <h3 className="font-display text-2xl mt-2">{name(pairs[i]?.[0] ?? captain.playerId)}</h3>
          {pairs.length ? <p className="mt-3 text-sm text-slate-300">Compañero: <strong>{name(pairs[i][1])}</strong></p> : <>
            <label htmlFor={`pick-${i}`} className="block text-xs text-slate-400 mt-3 mb-2">Compañero</label>
            <select id={`pick-${i}`} disabled={!canEdit || !finished} value={picks[i]} onChange={e => setPicks(prev => prev.map((id, index) => index === i ? Number(e.target.value) : id))} className="w-full bg-black border border-[#343b4c] p-2 text-sm disabled:opacity-50">
              <option value={0}>Por elegir</option>
              {pool.map(p => <option key={p.playerId} value={p.playerId} disabled={picks.includes(p.playerId) && picks[i] !== p.playerId}>{p.player.name}</option>)}
            </select>
          </>}
        </article>)}
      </div>
      {error && <p role="alert" className="text-rose-300 text-sm">{error}</p>}
      {canEdit && finished && (!pairs.length ? <button onClick={savePairs} className="bg-[#ccff00] text-black font-bold px-4 py-2 text-xs uppercase">Fijar parejas</button> : <button className="border border-[#ff5500] text-orange-200 px-4 py-2 text-xs" onClick={() => { if (window.confirm('¿Reiniciar parejas y resultados de la fase final?')) onChange(emptyPlayoffs()); }}>Reiniciar fase final</button>)}
    </section>
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {rounds.map(r => <article key={r.id} className="bg-[#0a0c12] border-2 border-[#262c3a] p-5 space-y-4">
        <h2 className="font-display text-2xl text-[#ccff00]">{r.title}</h2>
        <p className={playoffs[r.id].winnerTeam === 1 ? 'font-bold text-[#ccff00]' : 'font-bold'}>{pairName(r.team1)}</p>
        <span className="font-display text-xl text-slate-500">VS</span>
        <p className={playoffs[r.id].winnerTeam === 2 ? 'font-bold text-[#ccff00]' : 'font-bold'}>{pairName(r.team2)}</p>
        <p className="font-mono-code text-sm">{playoffs[r.id].sets.length ? playoffs[r.id].sets.map(s => `${s.games1}–${s.games2}`).join(' / ') : playoffs[r.id].status === 'postponed' ? 'Aplazado' : 'Pendiente de disputar'}</p>
        <p className="text-xs text-slate-400">{[playoffs[r.id].court, playoffs[r.id].playedDate, playoffs[r.id].postponedNote].filter(Boolean).join(' · ')}</p>
        {canEdit && r.team1 && r.team2 && <button className="flex items-center gap-2 bg-[#ccff00] text-black text-xs font-bold px-3 py-2" onClick={() => setEditing(r.id)}><Edit3 size={14} />Registrar resultado</button>}
      </article>)}
    </section>
    {final.winnerTeam && <section className="border-2 border-[#ccff00] bg-[#0a0c12] p-6 text-center shadow-[5px_5px_0px_0px_#ccff00]">
      <Trophy className="mx-auto text-[#ccff00]" size={36} />
      <h2 className="font-display text-4xl mt-3">CAMPEONES // 80 €</h2>
      <p className="text-xl text-[#ccff00] font-bold">{pairName(final.winnerTeam === 1 ? finalTeam1 : finalTeam2)}</p>
      <p className="text-sm text-slate-300 mt-4">Subcampeones · 40 €: {pairName(final.winnerTeam === 1 ? finalTeam2 : finalTeam1)}</p>
    </section>}
    {current?.team1 && current.team2 && editing && <EditMatchModal players={players} onClose={() => setEditing(null)} match={{ ...playoffs[editing], id: editing, roundNumber: 12, matchNumberInRound: 1, team1: current.team1, team2: current.team2, status: playoffs[editing].status ?? (playoffs[editing].winnerTeam ? 'completed' : 'pending') }} onSaveMatch={match => {
      const next = { ...playoffs, [editing]: { sets: match.sets, winnerTeam: match.winnerTeam, status: match.status, court: match.court, playedDate: match.playedDate, postponedNote: match.postponedNote } };
      if (editing !== 'final') {
        if (playoffs.final.sets.length && !window.confirm('Cambiar la semifinal borrará el resultado de la final. ¿Continuar?')) return;
        next.final = { sets: [] };
      }
      onChange(next);
    }} />}
  </div>;
}
