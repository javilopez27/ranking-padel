import { Trophy } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import type { LeagueData } from '../services/leagueSchema';
import { PlayerAvatar } from './PlayerAvatar';
import { getRankingMovement } from '../utils/rankingInsights';
import { formatMatchScore } from '../utils/scoreFormat';

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
  const movementClass = movement > 0 ? 'text-[var(--positive)]' : movement < 0 ? 'text-[var(--negative)]' : 'text-[var(--muted)]';

  return (
    <article className={`relative overflow-hidden border-2 p-4 shadow-sm ${
      isCaptain
        ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
        : 'bg-[var(--surface)] border-[var(--line)]'
    }`}>
      {isCaptain && <div className="absolute -right-6 -top-8 font-display text-[96px] leading-none text-[var(--accent-ink)]/10 font-black">C</div>}

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <PlayerAvatar player={row.player} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-display text-4xl font-black leading-none ${isCaptain ? 'text-[var(--accent-ink)]' : 'text-[var(--ink)]'}`}>
                {formatPosition(position)}
              </span>
              <span className={`text-xs font-black font-grotesk ${movementClass}`}>{movementLabel(movement)}</span>
            </div>
            <h3 className="font-display text-2xl text-[var(--ink)] font-black uppercase leading-none truncate">
              {row.player.name}
            </h3>
          </div>
        </div>

        <span className={`shrink-0 px-2 py-1 text-[10px] font-black uppercase font-grotesk border ${
          isCaptain ? 'bg-[var(--accent)] text-black border-[var(--line)]' : 'bg-[var(--surface-raised)] text-[var(--ink)] border-[var(--line)]'
        }`}>
          {isCaptain ? 'Capitán' : 'Elegible'}
        </span>
      </div>

      <div className="player-stats relative mt-4 font-mono-code">
        <div className="player-stat">
          <span className="player-stat-label">Victorias</span>
          <strong className="player-stat-value font-display">{row.matchesWon}</strong>
        </div>
        <div className="player-stat">
          <span className="player-stat-label">Dif. sets</span>
          <strong className="player-stat-value font-display">{formatSigned(row.setsDiff)}</strong>
        </div>
        <div className="player-stat">
          <span className="player-stat-label">Dif. juegos</span>
          <strong className="player-stat-value font-display">{formatSigned(row.gamesDiff)}</strong>
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
      <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between gap-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-3 font-grotesk font-black text-xs uppercase">
              <span className="bg-[var(--copper)] text-[#fff8ef] px-2 py-1">Fase final</span>
              <span className="bg-[var(--accent)] text-black px-2 py-1">Draft Top 8</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[var(--ink)] leading-none">
              Draft de capitanes
            </h1>
            <p className="mt-3 text-sm text-[var(--ink)] max-w-2xl font-mono-code">
              Los 4 primeros mandan. Los puestos #5–#8 entran en el pool y la pelea real está en la línea de corte.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="space-y-5">
          <div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3">
              <h2 className="font-display text-4xl text-[var(--accent-ink)] font-black uppercase leading-none">Capitanes</h2>
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
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3">
              <h2 className="font-display text-4xl text-[var(--ink)] font-black uppercase leading-none">Draft pool</h2>
              <span className="bg-[var(--surface-raised)] text-[var(--ink)] border border-[var(--line)] px-2 py-1 text-[10px] font-black uppercase font-grotesk">Puestos #5–#8</span>
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
          <section className="bg-[var(--surface-soft)] border-2 border-[var(--accent)] p-4 sm:p-5 shadow-sm">
            <span className="font-grotesk text-[10px] font-black uppercase text-[var(--accent-ink)] tracking-[0.3em]">Batalla por el Top 8</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)] font-black uppercase leading-none mt-2">Línea de corte</h2>

            {cutoff && hunter && (
              <div className="mt-5 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <article className="border-2 border-[var(--accent)] bg-[var(--accent)]/10 p-3">
                  <span className="font-display text-3xl font-black text-[var(--accent-ink)]">#8</span>
                  <h3 className="font-display text-2xl text-[var(--ink)] uppercase leading-none truncate">{cutoff.player.name}</h3>
                  <p className="mt-2 text-xs font-mono-code text-[var(--ink)]">
                    <strong className="text-[var(--ink)]">{cutoff.matchesWon}V</strong> · {formatSigned(cutoff.setsDiff)} sets · {formatSigned(cutoff.gamesDiff)} juegos
                  </p>
                </article>
                <span className="font-display text-3xl text-[var(--muted)] font-black text-center self-center">VS</span>
                <article className="border-2 border-[var(--copper)] bg-[var(--copper)]/10 p-3">
                  <span className="font-display text-3xl font-black text-[var(--copper-ink)]">#9</span>
                  <h3 className="font-display text-2xl text-[var(--ink)] uppercase leading-none truncate">{hunter.player.name}</h3>
                  <p className="mt-2 text-xs font-mono-code text-[var(--ink)]">
                    <strong className="text-[var(--ink)]">{hunter.matchesWon}V</strong> · {formatSigned(hunter.setsDiff)} sets · {formatSigned(hunter.gamesDiff)} juegos
                  </p>
                </article>
              </div>
            )}

            <p className="mt-4 bg-[var(--surface-raised)] border border-[var(--line)] p-3 text-sm font-mono-code text-[var(--ink)]">
              {cutlineReason(cutoff, hunter)}
            </p>
            {top7to10Gap !== undefined && (
              <p className="mt-3 text-xs text-[var(--muted)] font-mono-code">
                Solo {top7to10Gap} {pluralVictory(top7to10Gap)} separa el puesto #7 del #10.
              </p>
            )}
          </section>

          <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-4 sm:p-5">
            <h2 className="font-display text-3xl text-[var(--ink)] font-black uppercase leading-none mb-4">Distancia al corte</h2>
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
                  <div key={row.playerId} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-2">
                    <span className={isInside ? 'text-[var(--accent-ink)] font-black' : 'text-[var(--muted)] font-black'}>#{position}</span>
                    <span className="text-[var(--ink)] font-bold truncate">{row.player.name}</span>
                    <span className={isInside ? 'text-[var(--accent-ink)]' : diff === 0 ? 'text-[var(--copper-ink)]' : 'text-[var(--muted)]'}>{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>

      <section className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 shadow-sm">
        <h2 className="font-display text-4xl text-[var(--ink)] font-black uppercase leading-none mb-5">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {flow.map((step, index) => (
            <article key={step} className="bg-[var(--surface-soft)] border-2 border-[var(--line)] p-4 min-h-28 sm:min-h-32 flex flex-col justify-between">
              <span className="font-display text-5xl text-[var(--accent-ink)] font-black leading-none">{index + 1}</span>
              <p className="mt-4 text-sm text-[var(--ink)] font-black font-grotesk uppercase leading-tight">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {rounds.map((round) => (
          <article key={round.id} className="bg-[var(--surface)] border-2 border-[var(--line)] p-5 space-y-4">
            <h2 className="font-display text-2xl text-[var(--accent-ink)]">{round.title}</h2>
            <p className={playoffs[round.id].winnerTeam === 1 ? 'font-bold text-[var(--accent-ink)]' : 'font-bold'}>{pairName(round.team1)}</p>
            <span className="font-display text-xl text-[var(--muted)]">VS</span>
            <p className={playoffs[round.id].winnerTeam === 2 ? 'font-bold text-[var(--accent-ink)]' : 'font-bold'}>{pairName(round.team2)}</p>
            <p className="font-mono-code text-sm">
              {playoffs[round.id].sets.length
                ? formatMatchScore(playoffs[round.id].sets)
                : playoffs[round.id].status === 'postponed'
                  ? 'Aplazado'
                  : 'Pendiente de disputar'}
            </p>
            <p className="text-xs text-[var(--muted)]">{[playoffs[round.id].court, playoffs[round.id].playedDate, playoffs[round.id].postponedNote].filter(Boolean).join(' · ')}</p>
          </article>
        ))}
      </section>

      {final.winnerTeam && (
        <section className="border-2 border-[var(--accent)] bg-[var(--surface)] p-6 text-center shadow-sm">
          <Trophy className="mx-auto text-[var(--accent-ink)]" size={36} />
          <h2 className="font-display text-4xl mt-3">Campeones // 80 €</h2>
          <p className="text-xl text-[var(--accent-ink)] font-bold">{pairName(final.winnerTeam === 1 ? finalTeam1 : finalTeam2)}</p>
          <p className="text-sm text-[var(--ink)] mt-4">Subcampeones // 40 €: {pairName(final.winnerTeam === 1 ? finalTeam2 : finalTeam1)}</p>
        </section>
      )}
    </div>
  );
}
