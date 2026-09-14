import React from 'react';
import { Flame, Swords, X } from 'lucide-react';
import type { Match, Player, PlayerStats } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerPositionHistory, getPlayerRecords } from '../utils/rankingInsights';

interface PlayerComparePanelProps {
  players: Player[];
  matches: Match[];
  stats: PlayerStats[];
  selectedIds: number[];
  onClear: () => void;
}

const formatDiff = (value: number) => value > 0 ? `+${value}` : `${value}`;
const formatForm = (stat: PlayerStats) => stat.streak.length ? stat.streak.join('') : '—';

const bestPosition = (players: Player[], matches: Match[], playerId: number) => {
  const history = getPlayerPositionHistory(players, matches, playerId).points;
  if (!history.length) return '—';
  return `#${Math.min(...history.map((point) => point.position))}`;
};

const bestStreak = (players: Player[], matches: Match[], playerId: number, stats?: PlayerStats) => {
  const record = getPlayerRecords(players, matches, playerId, stats).find((item) => item.title === 'Mejor racha');
  return record?.value || '—';
};

const getHeadToHead = (matches: Match[], leftId: number, rightId: number) => {
  let rivalLeftWins = 0;
  let rivalRightWins = 0;
  let rivalMatches = 0;
  let partnerMatches = 0;
  let partnerWins = 0;

  matches
    .filter((match) => match.status === 'completed' && match.winnerTeam)
    .forEach((match) => {
      const leftTeam = match.team1.includes(leftId) ? 1 : match.team2.includes(leftId) ? 2 : undefined;
      const rightTeam = match.team1.includes(rightId) ? 1 : match.team2.includes(rightId) ? 2 : undefined;
      if (!leftTeam || !rightTeam) return;

      if (leftTeam === rightTeam) {
        partnerMatches += 1;
        if (match.winnerTeam === leftTeam) partnerWins += 1;
      } else {
        rivalMatches += 1;
        if (match.winnerTeam === leftTeam) rivalLeftWins += 1;
        if (match.winnerTeam === rightTeam) rivalRightWins += 1;
      }
    });

  return { rivalLeftWins, rivalRightWins, rivalMatches, partnerMatches, partnerWins };
};

const ComparisonEvolution: React.FC<{
  left: PlayerStats;
  right: PlayerStats;
  players: Player[];
  matches: Match[];
}> = ({ left, right, players, matches }) => {
  const leftHistory = getPlayerPositionHistory(players, matches, left.playerId).points;
  const rightHistory = getPlayerPositionHistory(players, matches, right.playerId).points;
  const rounds = Array.from(new Set([...leftHistory, ...rightHistory].map((point) => point.roundNumber))).sort((a, b) => a - b);
  const width = Math.max(260, rounds.length * 62);
  const height = 210;
  const topPad = 26;
  const bottomPad = 42;
  const chartHeight = height - topPad - bottomPad;
  const xStep = rounds.length > 1 ? (width - 72) / (rounds.length - 1) : 0;

  const makePoints = (history: typeof leftHistory) => {
    const byRound = new Map(history.map((point) => [point.roundNumber, point.position]));
    return rounds
      .map((round, index) => {
        const position = byRound.get(round);
        if (!position) return null;
        return {
          round,
          position,
          x: 42 + index * xStep,
          y: topPad + ((position - 1) / Math.max(players.length - 1, 1)) * chartHeight,
        };
      })
      .filter((point): point is { round: number; position: number; x: number; y: number } => point !== null);
  };

  const leftPoints = makePoints(leftHistory);
  const rightPoints = makePoints(rightHistory);
  const path = (points: typeof leftPoints) =>
    points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  if (!leftPoints.length && !rightPoints.length) {
    return (
      <div className="bg-black border-2 border-[#262c3a] p-4 text-xs text-slate-400 font-mono-code">
        La evolución comparada aparecerá cuando haya resultados publicados.
      </div>
    );
  }

  return (
    <div className="bg-black border-2 border-[#262c3a] p-3 overflow-x-auto">
      <svg width={width} height={height} role="img" aria-label="Evolución comparada de dos jugadores">
        {[1, Math.ceil(players.length / 2), players.length].map((rank) => {
          const y = topPad + ((rank - 1) / Math.max(players.length - 1, 1)) * chartHeight;
          return (
            <g key={rank}>
              <line x1="32" y1={y} x2={width - 20} y2={y} stroke="#262c3a" strokeDasharray="5 7" />
              <text x="0" y={y + 4} fill="#94a3b8" fontSize="11" fontWeight="900">#{rank}</text>
            </g>
          );
        })}

        <path d={path(leftPoints)} fill="none" stroke="#ccff00" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />
        <path d={path(rightPoints)} fill="none" stroke="#ff5500" strokeWidth="5" strokeLinecap="square" strokeLinejoin="round" />

        {leftPoints.map((point) => (
          <circle key={`left-${point.round}`} cx={point.x} cy={point.y} r="6" fill="#060709" stroke="#ccff00" strokeWidth="4" />
        ))}
        {rightPoints.map((point) => (
          <rect key={`right-${point.round}`} x={point.x - 6} y={point.y - 6} width="12" height="12" fill="#060709" stroke="#ff5500" strokeWidth="4" />
        ))}

        {rounds.map((round, index) => (
          <text key={round} x={42 + index * xStep} y={height - 12} fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">
            J{round}
          </text>
        ))}
      </svg>
    </div>
  );
};

export const PlayerComparePanel: React.FC<PlayerComparePanelProps> = ({
  players,
  matches,
  stats,
  selectedIds,
  onClear,
}) => {
  const statMap = new Map(stats.map((stat) => [stat.playerId, stat]));
  const selected = selectedIds.map((id) => statMap.get(id)).filter((stat): stat is PlayerStats => Boolean(stat));

  if (selected.length < 2) {
    return (
      <section className="bg-[#0a0c12] border-2 border-[#ff5500] p-4 shadow-[4px_4px_0px_0px_#ff5500]">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-[#ff5500]" />
          <h2 className="font-display text-2xl font-black text-white uppercase">Comparar jugadores</h2>
        </div>
        <p className="text-xs text-slate-400 font-mono-code mt-1">
          Selecciona dos jugadores de la tabla. Van {selected.length}/2.
        </p>
      </section>
    );
  }

  const [left, right] = selected;
  const h2h = getHeadToHead(matches, left.playerId, right.playerId);
  const rows = [
    { label: 'Victorias', left: `${left.matchesWon}`, right: `${right.matchesWon}`, loud: true },
    { label: 'Dif sets', left: formatDiff(left.setsDiff), right: formatDiff(right.setsDiff) },
    { label: 'Dif juegos', left: formatDiff(left.gamesDiff), right: formatDiff(right.gamesDiff) },
    { label: 'Mejor pos', left: bestPosition(players, matches, left.playerId), right: bestPosition(players, matches, right.playerId) },
    { label: 'Mejor racha', left: bestStreak(players, matches, left.playerId, left), right: bestStreak(players, matches, right.playerId, right) },
  ];

  return (
    <section className="bg-[#0a0c12] border-2 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_#ff5500] relative overflow-hidden">
      <div className="absolute -right-10 -top-8 font-display text-[150px] text-white/5 font-black leading-none pointer-events-none">VS</div>

      <div className="relative z-10 flex items-start justify-between gap-3 mb-5">
        <div>
          <span className="bg-[#ff5500] text-white font-black text-[10px] px-2.5 py-0.5 uppercase font-grotesk border border-black">
            Comparativa
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase leading-none mt-2">
            Cara a cara
          </h2>
        </div>
        <button
          onClick={onClear}
          className="bg-black hover:bg-[#12151e] border-2 border-[#262c3a] p-2 text-slate-300 hover:text-white"
          title="Limpiar comparación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-center mb-5">
        {[left, right].map((stat, index) => (
          <div key={stat.playerId} className={`bg-black border-2 p-3 sm:p-4 ${index === 0 ? 'border-[#ccff00]' : 'border-[#ff5500]'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <PlayerAvatar player={stat.player} size="lg" />
              <div>
                <strong className="font-display text-3xl sm:text-4xl text-white font-black uppercase leading-none block">
                  {stat.player.name}
                </strong>
                <span className={`font-display text-3xl font-black ${index === 0 ? 'text-[#ccff00]' : 'text-[#ff5500]'}`}>
                  #{stats.findIndex((row) => row.playerId === stat.playerId) + 1}
                </span>
              </div>
            </div>
          </div>
        )).reduce<React.ReactNode[]>((nodes, card, index) => {
          if (index === 1) {
            nodes.push(
              <div key="vs-badge" className="bg-[#ccff00] text-black border-2 border-black px-2 sm:px-4 py-2 font-display text-2xl sm:text-4xl font-black shadow-[3px_3px_0px_0px_#ffffff]">
                VS
              </div>
            );
          }
          nodes.push(card);
          return nodes;
        }, [])}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-2 font-mono-code">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-black border border-[#262c3a] px-3 py-2.5">
              <span className={`text-right font-black ${row.loud ? 'font-display text-4xl text-[#ccff00]' : 'text-white text-xl'}`}>
                {row.left}
              </span>
              <span className="bg-[#12151e] border border-[#262c3a] text-slate-400 px-2 py-1 text-[10px] font-black uppercase font-grotesk min-w-24 sm:min-w-28 text-center">
                {row.label}
              </span>
              <span className={`font-black ${row.loud ? 'font-display text-4xl text-[#ff5500]' : 'text-white text-xl'}`}>
                {row.right}
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-black border border-[#262c3a] px-3 py-2.5">
            <span className="text-right text-lg font-black text-white">{formatForm(left)}</span>
            <span className="bg-[#12151e] border border-[#262c3a] text-slate-400 px-2 py-1 text-[10px] font-black uppercase font-grotesk min-w-24 sm:min-w-28 text-center">
              Forma
            </span>
            <span className="text-lg font-black text-white">{formatForm(right)}</span>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-3xl font-black text-white uppercase">Evolución</h3>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase font-grotesk">
              <span className="inline-flex items-center gap-1 text-[#ccff00]"><span className="w-3 h-3 bg-[#ccff00] inline-block" /> {left.player.name}</span>
              <span className="inline-flex items-center gap-1 text-[#ff5500]"><span className="w-3 h-3 bg-[#ff5500] inline-block" /> {right.player.name}</span>
            </div>
          </div>
          <ComparisonEvolution left={left} right={right} players={players} matches={matches} />
        </div>
      </div>

      <div className="relative z-10 mt-5 bg-black border-2 border-[#262c3a] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-[#ff5500]" />
          <h3 className="font-display text-2xl font-black text-white uppercase">Entre ellos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
          <div className="bg-[#12151e] border border-[#262c3a] p-3">
            <span className="text-slate-400 uppercase font-black font-grotesk block">Como rivales</span>
            <strong className="text-white text-lg">
              {h2h.rivalMatches ? `${left.player.name} ${h2h.rivalLeftWins} — ${h2h.rivalRightWins} ${right.player.name}` : 'Aún no se han cruzado'}
            </strong>
          </div>
          <div className="bg-[#12151e] border border-[#262c3a] p-3">
            <span className="text-slate-400 uppercase font-black font-grotesk block">Como pareja</span>
            <strong className="text-white text-lg">
              {h2h.partnerMatches
                ? `${h2h.partnerMatches} partido${h2h.partnerMatches === 1 ? '' : 's'} · ${h2h.partnerWins} victoria${h2h.partnerWins === 1 ? '' : 's'}`
                : 'Sin partidos juntos'}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
};
