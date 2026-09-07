import { Trophy, Euro } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import type { LeagueData } from '../services/leagueSchema';

type Playoffs = LeagueData['playoffs'];
type Stage = 'semi1' | 'semi2' | 'final';

interface Top8TabProps {
  stats: PlayerStats[];
  players: Player[];
  matches: Match[];
  playoffs: Playoffs;
}

export function Top8Tab({ stats, players, matches, playoffs }: Top8TabProps) {
  const finished = matches.every((match) => match.status === 'completed');
  const captains = stats.slice(0, 4);
  const name = (id: number) => players.find((player) => player.id === id)?.name ?? 'Por decidir';
  const pairName = (pair?: [number, number]) => pair ? pair.map(name).join(' / ') : 'Por decidir';
  const { pairs, semi1, semi2, final } = playoffs;
  const finalTeam1 = semi1.winnerTeam ? pairs[semi1.winnerTeam === 1 ? 0 : 3] : undefined;
  const finalTeam2 = semi2.winnerTeam ? pairs[semi2.winnerTeam === 1 ? 1 : 2] : undefined;
  const rounds: { id: Stage; title: string; team1?: [number, number]; team2?: [number, number] }[] = [
    { id: 'semi1', title: 'Semifinal 1', team1: pairs[0], team2: pairs[3] },
    { id: 'semi2', title: 'Semifinal 2', team1: pairs[1], team2: pairs[2] },
    { id: 'final', title: 'Gran final', team1: finalTeam1, team2: finalTeam2 },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <section className="bg-[#0a0c12] border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_0px_#ff5500]">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-3 font-grotesk font-black text-xs uppercase">
              <span className="bg-[#ff5500] px-2 py-1">Fase final</span>
              <span className="bg-[#ccff00] text-black px-2 py-1">Top 8</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-none">
              Fase final Top 8
            </h1>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl">
              Los ocho primeros del ranking entran en la fase final para decidir los campeones.
            </p>
          </div>
          <div className="bg-[#12151e] border-2 border-[#ccff00] p-4 lg:w-72 shrink-0">
            <div className="flex justify-between text-[#ccff00] font-grotesk text-xs font-bold">
              PREMIOS EN METALICO <Euro size={16} />
            </div>
            <div className="font-display text-4xl">120 € TOTAL</div>
            <p className="text-xs text-slate-300 mt-2">Campeones: 80 €<br />Subcampeones: 40 €</p>
          </div>
        </div>
      </section>

      {!finished && (
        <p className="border border-[#ff5500] bg-[#1e1008] p-4 text-sm text-orange-200">
          Ranking provisional.
        </p>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl border-2 border-[#262c3a] p-3">Top 4 provisional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {captains.map((captain, index) => (
            <article key={captain.playerId} className="bg-[#0a0c12] border-2 border-[#262c3a] p-4 shadow-[3px_3px_0px_0px_#000]">
              <span className="text-[#ccff00] text-xs font-mono-code">#{index + 1} // {captain.matchesWon} victorias</span>
              <h3 className="font-display text-2xl mt-2">{name(captain.playerId)}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {rounds.map((round) => (
          <article key={round.id} className="bg-[#0a0c12] border-2 border-[#262c3a] p-5 space-y-4">
            <h2 className="font-display text-2xl text-[#ccff00]">{round.title}</h2>
            <p className={playoffs[round.id].winnerTeam === 1 ? 'font-bold text-[#ccff00]' : 'font-bold'}>{pairName(round.team1)}</p>
            <span className="font-display text-xl text-slate-500">VS</span>
            <p className={playoffs[round.id].winnerTeam === 2 ? 'font-bold text-[#ccff00]' : 'font-bold'}>{pairName(round.team2)}</p>
            <p className="font-mono-code text-sm">
              {playoffs[round.id].sets.length
                ? playoffs[round.id].sets.map((set) => `${set.games1}-${set.games2}`).join(' / ')
                : playoffs[round.id].status === 'postponed'
                  ? 'Aplazado'
                  : 'Pendiente de disputar'}
            </p>
            <p className="text-xs text-slate-400">{[playoffs[round.id].court, playoffs[round.id].playedDate, playoffs[round.id].postponedNote].filter(Boolean).join(' · ')}</p>
          </article>
        ))}
      </section>

      {final.winnerTeam && (
        <section className="border-2 border-[#ccff00] bg-[#0a0c12] p-6 text-center shadow-[5px_5px_0px_0px_#ccff00]">
          <Trophy className="mx-auto text-[#ccff00]" size={36} />
          <h2 className="font-display text-4xl mt-3">Campeones // 80 €</h2>
          <p className="text-xl text-[#ccff00] font-bold">{pairName(final.winnerTeam === 1 ? finalTeam1 : finalTeam2)}</p>
          <p className="text-sm text-slate-300 mt-4">Subcampeones // 40 €: {pairName(final.winnerTeam === 1 ? finalTeam2 : finalTeam1)}</p>
        </section>
      )}
    </div>
  );
}
