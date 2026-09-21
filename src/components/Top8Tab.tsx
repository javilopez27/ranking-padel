import { Trophy } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import type { LeagueData } from '../services/leagueSchema';
import { PlayerAvatar } from './PlayerAvatar';
import { getRankingMovement } from '../utils/rankingInsights';

type Playoffs = LeagueData['playoffs'];
type Stage = 'semi1' | 'semi2' | 'final';

interface Top8TabProps {
  stats: PlayerStats[];
  players: Player[];
  matches: Match[];
  playoffs: Playoffs;
}

const formatSigned = (value: number) => value > 0 ? `+${value}` : `${value}`;
const formatPosition = (position: number) => `#${position}`;
const pluralVictory = (value: number) => Math.abs(value) === 1 ? 'victoria' : 'victorias';

const movementLabel = (movement: number) => {
  if (movement > 0) return `↑${movement}`;
  if (movement < 0) return `↓${Math.abs(movement)}`;
  return '=';
};

function cutlineReason(cutoff?: PlayerStats, hunter?: PlayerStats) {
  if (!cutoff || !hunter) return 'El Top 8 se fijará cuando avance la liga regular.';

  if (cutoff.matchesWon !== hunter.matchesWon) {
    const diff = cutoff.matchesWon - hunter.matchesWon;
    return `${cutoff.player.name} mantendría el Top 8 por ${diff} ${pluralVictory(diff)}.`;
  }

  if (cutoff.setsDiff !== hunter.setsDiff) {
    return `${cutoff.player.name} mantendría el Top 8 por diferencia de sets.`;
  }

  if (cutoff.gamesDiff !== hunter.gamesDiff) {
    return `${cutoff.player.name} mantendría el Top 8 por diferencia de juegos.`;
  }

  if (cutoff.setsWon !== hunter.setsWon) {
    return `${cutoff.player.name} mantendría el Top 8 por sets a favor.`;
  }

  return `${cutoff.player.name} mantendría el Top 8 por juegos a favor.`;
}

interface RankCardProps {
  row: PlayerStats;
  position: number;
  movement: number;
  variant: 'captain' | 'pool';
}

function RankCard({ row, position, movement, variant }: RankCardProps) {
  const isCaptain = variant === 'captain';
  const movementClass = movement > 0 ? 'text-emerald-400' : movement < 0 ? 'text-rose-400' : 'text-slate-400';

  return (
    <article className={`relative overflow-hidden border-2 p-4 shadow-[4px_4px_0px_0px_#000] ${
      isCaptain
        ? 'bg-[#ccff00]/10 border-[#ccff00]'
        : 'bg-[#0a0c12] border-[#262c3a]'
    }`}>
      {isCaptain && <div className="absolute -right-6 -top-8 font-display text-[96px] leading-none text-[#ccff00]/10 font-black">C</div>}

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <PlayerAvatar player={row.player} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-display text-4xl font-black leading-none ${isCaptain ? 'text-[#ccff00]' : 'text-white'}`}>
                {formatPosition(position)}
              </span>
              <span className={`text-xs font-black font-grotesk ${movementClass}`}>{movementLabel(movement)}</span>
            </div>
            <h3 className="font-display text-2xl text-white font-black uppercase leading-none truncate">
              {row.player.name}
            </h3>
          </div>
        </div>

        <span className={`shrink-0 px-2 py-1 text-[10px] font-black uppercase font-grotesk border ${
          isCaptain ? 'bg-[#ccff00] text-black border-black' : 'bg-[#12151e] text-slate-300 border-[#262c3a]'
        }`}>
          {isCaptain ? 'Capitán' : 'Elegible'}
        </span>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 font-mono-code text-[11px]">
        <div className="bg-black/70 border border-[#262c3a] p-2">
          <span className="block text-slate-500 font-black uppercase font-grotesk">Victorias</span>
          <strong className={`font-display text-2xl ${isCaptain ? 'text-[#ccff00]' : 'text-white'}`}>{row.matchesWon}</strong>
        </div>
        <div className="bg-black/70 border border-[#262c3a] p-2">
          <span className="block text-slate-500 font-black uppercase font-grotesk">Sets</span>
          <strong className={row.setsDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSigned(row.setsDiff)}</strong>
        </div>
        <div className="bg-black/70 border border-[#262c3a] p-2">
          <span className="block text-slate-500 font-black uppercase font-grotesk">Juegos</span>
          <strong className={row.gamesDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formatSigned(row.gamesDiff)}</strong>
        </div>
      </div>
    </article>
  );
}

export function Top8Tab({ stats, players, matches, playoffs }: Top8TabProps) {
  const captains = stats.slice(0, 4);
  const draftPool = stats.slice(4, 8);
  const cutoff = stats[7];
  const hunter = stats[8];
  const movementMap = getRankingMovement(players, matches);
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
  const flow = [
    'Los 4 primeros son capitanes',
    'Los puestos #5–#8 entran en el draft',
    'Se forman 4 parejas',
    'Semifinales',
    'Final',
  ];
  const cutlineRows = stats.slice(7, 12);
  const top7 = stats[6];
  const top10 = stats[9];
  const top7to10Gap = top7 && top10 ? top7.matchesWon - top10.matchesWon : undefined;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <section className="bg-[#0a0c12] border-2 border-black p-5 sm:p-7 shadow-[5px_5px_0px_0px_#ff5500]">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-3 font-grotesk font-black text-xs uppercase">
              <span className="bg-[#ff5500] px-2 py-1">Fase final</span>
              <span className="bg-[#ccff00] text-black px-2 py-1">Draft Top 8</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-none">
              Draft de capitanes
            </h1>
            <p className="mt-3 text-sm text-slate-300 max-w-2xl font-mono-code">
              Los 4 primeros mandan. Los puestos #5–#8 entran en el pool y la pelea real está en la línea de corte.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-display text-4xl text-[#ccff00] font-black uppercase leading-none">Capitanes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {captains.map((captain, index) => (
                <RankCard
                  key={captain.playerId}
                  row={captain}
                  position={index + 1}
                  movement={movementMap.get(captain.playerId)?.delta || 0}
                  variant="captain"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-display text-4xl text-white font-black uppercase leading-none">Draft pool</h2>
              <span className="bg-[#12151e] text-slate-300 border border-[#262c3a] px-2 py-1 text-[10px] font-black uppercase font-grotesk">Puestos #5–#8</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftPool.map((row, index) => (
                <RankCard
                  key={row.playerId}
                  row={row}
                  position={index + 5}
                  movement={movementMap.get(row.playerId)?.delta || 0}
                  variant="pool"
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <section className="bg-black border-2 border-[#ccff00] p-4 sm:p-5 shadow-[5px_5px_0px_0px_#ccff00]">
            <span className="font-grotesk text-[10px] font-black uppercase text-[#ccff00] tracking-[0.3em]">Batalla por el Top 8</span>
            <h2 className="font-display text-3xl sm:text-4xl text-white font-black uppercase leading-none mt-2">Línea de corte</h2>

            {cutoff && hunter && (
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                {[cutoff, hunter].map((row, index) => (
                  <article key={row.playerId} className={`border-2 p-3 ${index === 0 ? 'border-[#ccff00] bg-[#ccff00]/10' : 'border-[#ff5500] bg-[#ff5500]/10'}`}>
                    <span className={`font-display text-3xl font-black ${index === 0 ? 'text-[#ccff00]' : 'text-[#ff5500]'}`}>#{index === 0 ? 8 : 9}</span>
                    <h3 className="font-display text-2xl text-white uppercase leading-none truncate">{row.player.name}</h3>
                    <p className="mt-2 text-xs font-mono-code text-slate-300">
                      <strong className="text-white">{row.matchesWon}V</strong> · {formatSigned(row.setsDiff)} sets · {formatSigned(row.gamesDiff)} juegos
                    </p>
                  </article>
                ))}
                <span className="font-display text-3xl text-slate-500 font-black">VS</span>
              </div>
            )}

            <p className="mt-4 bg-[#12151e] border border-[#262c3a] p-3 text-sm font-mono-code text-white">
              {cutlineReason(cutoff, hunter)}
            </p>
            {top7to10Gap !== undefined && (
              <p className="mt-3 text-xs text-slate-400 font-mono-code">
                Solo {top7to10Gap} {pluralVictory(top7to10Gap)} separa el puesto #7 del #10.
              </p>
            )}
          </section>

          <section className="bg-[#0a0c12] border-2 border-[#262c3a] p-4 sm:p-5">
            <h2 className="font-display text-3xl text-white font-black uppercase leading-none mb-4">Distancia al corte</h2>
            <div className="space-y-2 font-mono-code text-xs">
              {cutlineRows.map((row, index) => {
                const position = index + 8;
                const isInside = position <= 8;
                const diff = cutoff ? row.matchesWon - cutoff.matchesWon : 0;
                const label = isInside
                  ? 'dentro'
                  : diff === 0
                    ? '-0'
                    : `${diff} ${pluralVictory(diff)}`;

                return (
                  <div key={row.playerId} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-black border border-[#262c3a] px-3 py-2">
                    <span className={isInside ? 'text-[#ccff00] font-black' : 'text-slate-500 font-black'}>#{position}</span>
                    <span className="text-white font-bold truncate">{row.player.name}</span>
                    <span className={isInside ? 'text-[#ccff00]' : diff === 0 ? 'text-[#ff5500]' : 'text-slate-400'}>{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>

      <section className="bg-[#0a0c12] border-2 border-black p-5 shadow-[5px_5px_0px_0px_#000]">
        <h2 className="font-display text-4xl text-white font-black uppercase leading-none mb-5">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {flow.map((step, index) => (
            <article key={step} className="bg-black border-2 border-[#262c3a] p-4 min-h-32 flex flex-col justify-between">
              <span className="font-display text-5xl text-[#ccff00] font-black leading-none">{index + 1}</span>
              <p className="mt-4 text-sm text-white font-black font-grotesk uppercase leading-tight">{step}</p>
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
