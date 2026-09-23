import type { Match, Player } from '../types';
import { formatSetScore, getSetsWon } from '../utils/scoreFormat';
import { PlayerAvatar } from './PlayerAvatar';

interface MatchScoreboardProps {
  match: Match;
  players: Player[];
  compact?: boolean;
}

function TeamBlock({ team, winner, align = 'left' }: { team: Player[]; winner: boolean; align?: 'left' | 'right' }) {
  return (
    <div className={`match-team match-team--${align} ${winner ? 'match-team--winner' : ''}`}>
      <div className="match-team-avatars">
        {team.map((player) => (
          <div key={player.id} className="match-avatar">
            <PlayerAvatar player={player} size="md" />
          </div>
        ))}
      </div>
      <h3 className="match-team-names font-display">
        {team.map((player) => <span key={player.id}>{player.name}</span>)}
      </h3>
      {winner && <span className="match-winner">Victoria</span>}
    </div>
  );
}

export function MatchScoreboard({ match, players, compact = false }: MatchScoreboardProps) {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  const team1 = match.team1.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
  const team2 = match.team2.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
  const isCompleted = match.status === 'completed' && match.sets.length > 0;
  const isPostponed = match.status === 'postponed';
  const setsWon = getSetsWon(match.sets);

  return (
    <div className={`match-scoreboard ${compact ? 'match-scoreboard--compact' : ''}`}>
      <div className="match-score-layout">
        <TeamBlock team={team1} winner={isCompleted && match.winnerTeam === 1} />

        <div className="match-result">
          {isCompleted ? (
            <div className="match-result-numbers font-display" aria-label={`${team1.map(p => p.name).join(' y ')}: ${setsWon.team1} sets; ${team2.map(p => p.name).join(' y ')}: ${setsWon.team2} sets`}>
              <span className={match.winnerTeam === 1 ? 'match-result-winner' : ''}>{setsWon.team1}</span>
              <span className="match-result-separator" aria-hidden="true">:</span>
              <span className={match.winnerTeam === 2 ? 'match-result-winner' : ''}>{setsWon.team2}</span>
            </div>
          ) : (
            <div className="match-result-vs font-display" aria-label={isPostponed ? 'Partido aplazado' : 'Partido pendiente'}>VS</div>
          )}
        </div>

        <TeamBlock team={team2} winner={isCompleted && match.winnerTeam === 2} align="right" />
      </div>

      <div className="match-set-summary">
        {isCompleted ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 font-grotesk">Sets</span>
            <div className="flex flex-wrap justify-center gap-1.5 font-mono-code text-xs font-black">
              {match.sets.map((set, index) => (
                <span key={`${match.id}-${index}`} className="match-set">
                  {formatSetScore(set)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-xs font-mono-code text-slate-400">
            {isPostponed ? match.postponedNote || 'Partido aplazado.' : 'Resultado pendiente.'}
          </p>
        )}
      </div>
    </div>
  );
}
