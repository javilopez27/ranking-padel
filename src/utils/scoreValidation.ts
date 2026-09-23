import type { SetScore } from '../types';

export function getMatchWinner(sets: SetScore[]): 1 | 2 | undefined {
  if (sets.length < 2 || sets.length > 3) return undefined;
  let wins1 = 0;
  let wins2 = 0;
  for (const { games1, games2, tieBreak1, tieBreak2 } of sets) {
    if (wins1 === 2 || wins2 === 2) return undefined;
    if (!Number.isInteger(games1) || !Number.isInteger(games2)) return undefined;
    const hasTieBreakPoints = tieBreak1 !== undefined || tieBreak2 !== undefined;
    if (hasTieBreakPoints) {
      if (tieBreak1 === undefined || tieBreak2 === undefined) return undefined;
      if (!Number.isInteger(tieBreak1) || !Number.isInteger(tieBreak2)) return undefined;
      if (tieBreak1 < 0 || tieBreak2 < 0 || tieBreak1 === tieBreak2) return undefined;
      const tieBreakHi = Math.max(tieBreak1, tieBreak2);
      const tieBreakLo = Math.min(tieBreak1, tieBreak2);
      if (tieBreakHi < 7 || tieBreakHi - tieBreakLo < 2) return undefined;
    }
    const hi = Math.max(games1, games2);
    const lo = Math.min(games1, games2);
    if (lo < 0 || !((hi === 6 && lo <= 4) || (hi === 7 && (lo === 5 || lo === 6)))) return undefined;
    if (hasTieBreakPoints && !(hi === 7 && lo === 6)) return undefined;
    if (hasTieBreakPoints && tieBreak1 !== undefined && tieBreak2 !== undefined) {
      const setWinner = games1 > games2 ? 1 : 2;
      const tieBreakWinner = tieBreak1 > tieBreak2 ? 1 : 2;
      if (setWinner !== tieBreakWinner) return undefined;
    }
    if (games1 > games2) wins1++; else wins2++;
  }
  return wins1 === 2 ? 1 : wins2 === 2 ? 2 : undefined;
}
