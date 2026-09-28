import type { Match } from '../types';

export interface RivalMatch {
  match: Match;
  leftTeam: 1 | 2;
  rightTeam: 1 | 2;
  winnerId: number;
}

export function getRivalHistory(matches: Match[], leftId: number, rightId: number): RivalMatch[] {
  return matches
    .filter((match) => match.status === 'completed' && match.sets.length > 0 && match.winnerTeam)
    .flatMap((match) => {
      const leftTeam: 1 | 2 | undefined = match.team1.includes(leftId) ? 1 : match.team2.includes(leftId) ? 2 : undefined;
      const rightTeam: 1 | 2 | undefined = match.team1.includes(rightId) ? 1 : match.team2.includes(rightId) ? 2 : undefined;
      if (!leftTeam || !rightTeam || leftTeam === rightTeam) return [];
      return [{ match, leftTeam, rightTeam, winnerId: match.winnerTeam === leftTeam ? leftId : rightId }];
    })
    .sort((a, b) => b.match.roundNumber - a.match.roundNumber || b.match.matchNumberInRound - a.match.matchNumberInRound);
}
