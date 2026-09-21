import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLeagueData } from '../src/services/leagueSchema';
import { calculatePlayerStats, getPairingMatrix } from '../src/utils/leagueCalculations';
import { getMatchWinner } from '../src/utils/scoreValidation';
import { getHallOfFame, getPlayerRecords } from '../src/utils/rankingInsights';

const fixture = () => parseLeagueData(JSON.parse(readFileSync(new URL('../public/league.json', import.meta.url), 'utf8')));

test('33 partidos: cada compañero una vez, cada rival dos y 11 partidos por jugador', () => {
  const data = fixture();
  const { partnerMatrix, opponentMatrix } = getPairingMatrix(data.players, data.matches);
  for (const p of data.players) {
    assert.equal(data.matches.filter(m => [...m.team1, ...m.team2].includes(p.id)).length, 11);
    for (const other of data.players.filter(o => o.id !== p.id)) {
      assert.equal(partnerMatrix[p.id][other.id].count, 1);
      assert.equal(opponentMatrix[p.id][other.id].count, 2);
    }
  }
});

test('marcadores: rechaza empates, decimales, sets incompletos y un tercer set después de 2–0', () => {
  const score = (a: number, b: number) => ({ games1: a, games2: b });
  assert.equal(getMatchWinner([score(6,4), score(7,6)]), 1);
  assert.equal(getMatchWinner([score(6,4), score(4,6), score(5,7)]), 2);
  for (const sets of [[score(6,6),score(6,4)], [score(6,4),score(4,6)], [score(6,5),score(6,0)], [score(6,4),score(6,4),score(0,6)], [score(6.5,4),score(6,4)], [score(0,0)]]) assert.equal(getMatchWinner(sets), undefined);
});

test('guardar y deshacer un resultado actualiza clasificación y victorias de los cuatro jugadores', () => {
  const data = fixture();
  data.matches = data.matches.map(m => ({ ...m, status: 'pending', sets: [], winnerTeam: undefined }));
  const m = data.matches[0];
  m.status = 'completed'; m.sets = [{games1:6,games2:4},{games1:6,games2:2}]; m.winnerTeam = 1;
  const stats = calculatePlayerStats(data.players, data.matches);
  for (const id of m.team1) {
    const s = stats.find(s => s.playerId === id)!;
    assert.equal(s.points, 1); assert.equal(s.matchesWon, 1); assert.equal(s.setsDiff, 2); assert.equal(s.gamesDiff, 6);
  }
  assert.equal(stats.reduce((sum,s) => sum+s.matchesPlayed,0),4);
  assert.equal(stats.find(s => s.playerId === m.team2[0])!.matchesLost,1);
  m.status = 'pending'; m.sets = []; m.winnerTeam = undefined;
  assert.ok(calculatePlayerStats(data.players,data.matches).every(s => s.points === 0 && s.matchesPlayed === 0));
});

test('importación rechaza jugadores duplicados, calendarios rotos y ganadores incompatibles', () => {
  const duplicate = fixture(); duplicate.players[1].id = duplicate.players[0].id;
  assert.throws(() => parseLeagueData(duplicate));
  const broken = fixture(); broken.matches[0].team1[0] = broken.matches[0].team1[1];
  assert.throws(() => parseLeagueData(broken));
  const wrong = fixture(); Object.assign(wrong.matches[0], {status:'completed',sets:[{games1:6,games2:0},{games1:6,games2:0}],winnerTeam:2});
  assert.throws(() => parseLeagueData(wrong));
  assert.throws(() => parseLeagueData({version: 99}));
});

test('no permite final sin semifinales ni jugadores duplicados en parejas', () => {
  const data = fixture();
  data.playoffs.pairs = [[1,8],[2,7],[3,6],[4,5]];
  data.playoffs.final = {sets:[{games1:6,games2:0},{games1:6,games2:0}],winnerTeam:1};
  assert.throws(() => parseLeagueData(data));
  data.playoffs.final = {sets:[]}; data.playoffs.pairs[1][0] = 1;
  assert.throws(() => parseLeagueData(data));
});

test('hall of fame: Mr. Tie Break solo cuenta sets 7-6 o 6-7', () => {
  const data = fixture();
  const base = data.matches[0];
  const sevenFive = {
    ...base,
    id: 'test_7_5',
    sets: [{ games1: 7, games2: 5 }, { games1: 6, games2: 4 }],
    status: 'completed' as const,
    winnerTeam: 1 as const,
  };
  const sevenSix = {
    ...base,
    id: 'test_7_6',
    sets: [{ games1: 7, games2: 6 }, { games1: 6, games2: 4 }],
    status: 'completed' as const,
    winnerTeam: 1 as const,
  };

  const withoutTieBreak = getHallOfFame(data.players, [sevenFive]).find((record) => record.title === 'Mr. Tie Break');
  assert.equal(withoutTieBreak?.value, 'Por estrenar');

  const withTieBreak = getHallOfFame(data.players, [sevenSix]).find((record) => record.title === 'Mr. Tie Break');
  assert.match(withTieBreak?.value || '', /1 ganados$/);
});


test('ficha de jugador: calcula balance en terceros sets y tie-breaks', () => {
  const data = fixture();
  const base = data.matches[0];
  const playerId = base.team1[0];
  const match = {
    ...base,
    id: 'test_player_records',
    sets: [{ games1: 7, games2: 6 }, { games1: 4, games2: 6 }, { games1: 6, games2: 3 }],
    status: 'completed' as const,
    winnerTeam: 1 as const,
  };
  const stats = calculatePlayerStats(data.players, [match]);
  const records = getPlayerRecords(data.players, [match], playerId, stats.find((row) => row.playerId === playerId));

  assert.equal(records.find((record) => record.title === 'Terceros sets')?.value, '1-0');
  assert.equal(records.find((record) => record.title === 'Tie-breaks')?.value, '1-0');
});
