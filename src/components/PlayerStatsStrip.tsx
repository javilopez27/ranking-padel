import type { PlayerStats } from '../types';

const signed = (value: number) => value > 0 ? `+${value}` : String(value);

export function PlayerStatsStrip({ stats, className = '' }: { stats?: PlayerStats; className?: string }) {
  const values = [
    ['Victorias', String(stats?.matchesWon ?? 0)],
    ['Dif. sets', signed(stats?.setsDiff ?? 0)],
    ['Dif. juegos', signed(stats?.gamesDiff ?? 0)],
  ];

  return (
    <div className={`player-stats font-mono-code ${className}`}>
      {values.map(([label, value]) => (
        <div className="player-stat" key={label}>
          <span className="player-stat-label">{label}</span>
          <strong className="player-stat-value font-display">{value}</strong>
        </div>
      ))}
    </div>
  );
}
