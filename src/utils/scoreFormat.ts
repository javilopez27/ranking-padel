import type { SetScore } from '../types';

export function isTieBreakSet(set: SetScore) {
  return Math.max(set.games1, set.games2) === 7 && Math.min(set.games1, set.games2) === 6;
}

export function getSetWinner(set: SetScore): 1 | 2 | undefined {
  if (set.games1 === set.games2) return undefined;
  return set.games1 > set.games2 ? 1 : 2;
}

export function getSetsWon(sets: SetScore[]) {
  return sets.reduce(
    (acc, set) => {
      const winner = getSetWinner(set);
      if (winner === 1) acc.team1 += 1;
      if (winner === 2) acc.team2 += 1;
      return acc;
    },
    { team1: 0, team2: 0 }
  );
}

export function formatSetScore(set: SetScore) {
  const base = `${set.games1}-${set.games2}`;
  if (!isTieBreakSet(set) || set.tieBreak1 === undefined || set.tieBreak2 === undefined) return base;
  return `(${set.tieBreak1}) ${set.games1} - ${set.games2} (${set.tieBreak2})`;
}

export function formatMatchScore(sets: SetScore[], separator = ' / ') {
  return sets.map(formatSetScore).join(separator);
}
