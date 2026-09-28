import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUND_INFOS } from '../src/data/initialData';
import { currentRound, parseRoute, routeHash } from '../src/utils/navigation';
import type { Match } from '../src/types';

test('la semana actual abre su jornada aunque haya partidos pendientes anteriores', () => {
  const overdue = [{ roundNumber: 2, status: 'pending' }] as Match[];
  assert.equal(currentRound(ROUND_INFOS, overdue, new Date(2026, 8, 28)), 3);
  assert.equal(currentRound(ROUND_INFOS, overdue, new Date(2026, 11, 1)), 2);
});

test('un enlace conserva el partido o jugador y rechaza rutas inválidas', () => {
  const match = { tab: 'calendario' as const, roundNumber: 3, matchId: 'm_3_2' };
  assert.deepEqual(parseRoute(routeHash(match)), match);
  assert.deepEqual(parseRoute(routeHash({ tab: 'jugadores', playerId: 7 })), { tab: 'jugadores', playerId: 7 });
  assert.deepEqual(parseRoute('#/calendario/jornada/99'), { tab: 'calendario' });
  assert.deepEqual(parseRoute('#/%ZZ'), { tab: 'inicio' });
});
