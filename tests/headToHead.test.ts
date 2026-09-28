import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Match } from '../src/types';
import { getRivalHistory } from '../src/utils/headToHead';

const match = (id: string, roundNumber: number, team1: [number, number], team2: [number, number], winnerTeam: 1 | 2, status: Match['status'] = 'completed'): Match => ({
  id, roundNumber, matchNumberInRound: 1, team1, team2, winnerTeam, status,
  sets: status === 'completed' ? [{ games1: 6, games2: 4 }, { games1: 6, games2: 3 }] : [],
});

test('historial: solo cruces terminados como rivales, con ganador y orden reciente primero', () => {
  const matches = [
    match('old', 1, [1, 3], [2, 4], 2),
    match('partners', 2, [1, 2], [3, 4], 1),
    match('pending', 3, [1, 3], [2, 4], 1, 'pending'),
    match('new', 4, [2, 3], [1, 4], 2),
  ];
  const history = getRivalHistory(matches, 1, 2);
  assert.deepEqual(history.map((item) => item.match.id), ['new', 'old']);
  assert.deepEqual(history.map((item) => item.winnerId), [1, 2]);
  assert.deepEqual(getRivalHistory(matches, 2, 1).map((item) => item.winnerId), [1, 2]);
});
