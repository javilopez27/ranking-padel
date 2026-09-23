import { readFileSync, writeFileSync } from 'node:fs';
import { parseLeagueData } from '../src/services/leagueSchema';
import type { LeagueData } from '../src/services/leagueSchema';
import type { MatchStatus, SetScore } from '../src/types';

const csvPath = new URL('../data/resultados.csv', import.meta.url);
const leaguePath = new URL('../public/league.json', import.meta.url);

type ResultRow = {
  id: string;
  status: MatchStatus;
  winnerTeam?: 1 | 2;
  sets: SetScore[];
  playedDate?: string;
  postponedNote?: string;
  court?: string;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const [headerLine, ...rows] = lines;
  const headers = parseCsvLine(headerLine);

  return rows.map((line, rowIndex) => {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Fila ${rowIndex + 2}: se esperaban ${headers.length} columnas y hay ${values.length}.`);
    }

    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

function parseSets(rawSets: string, id: string): SetScore[] {
  if (!rawSets) return [];

  return rawSets.split(/\s+/).map((set) => {
    const match = set.match(/^(\d+)-(\d+)(?:\((\d+)-(\d+)\))?$/);
    if (!match) throw new Error(`${id}: escribe los sets como "6-4 7-5" o, si hay tie-break, "6-7(5-7)".`);

    const score: SetScore = { games1: Number(match[1]), games2: Number(match[2]) };
    if (match[3] !== undefined && match[4] !== undefined) {
      score.tieBreak1 = Number(match[3]);
      score.tieBreak2 = Number(match[4]);
    }
    return score;
  });
}

function parseResultRow(row: Record<string, string>): ResultRow {
  const status = row.status as MatchStatus;
  if (!['pending', 'completed', 'postponed'].includes(status)) {
    throw new Error(`${row.id}: status debe ser pending, completed o postponed.`);
  }

  const sets = parseSets(row.sets, row.id);
  const winnerTeam = row.winnerTeam ? Number(row.winnerTeam) : undefined;
  if (winnerTeam !== undefined && winnerTeam !== 1 && winnerTeam !== 2) {
    throw new Error(`${row.id}: winnerTeam debe ser 1, 2 o estar vacio.`);
  }

  if (status === 'completed' && (!winnerTeam || sets.length === 0)) {
    throw new Error(`${row.id}: un partido completed necesita winnerTeam y sets.`);
  }

  if (status !== 'completed' && (winnerTeam || sets.length > 0)) {
    throw new Error(`${row.id}: solo los partidos completed pueden tener winnerTeam y sets.`);
  }

  return {
    id: row.id,
    status,
    winnerTeam,
    sets,
    playedDate: row.playedDate || undefined,
    postponedNote: row.postponedNote || undefined,
    court: row.court || undefined,
  };
}

function applyResults(league: LeagueData, results: ResultRow[]): LeagueData {
  const resultById = new Map(results.map((result) => [result.id, result]));

  for (const match of league.matches) {
    if (!resultById.has(match.id)) throw new Error(`Falta el partido ${match.id} en data/resultados.csv.`);
  }

  if (resultById.size !== league.matches.length) {
    throw new Error(`data/resultados.csv debe tener exactamente ${league.matches.length} partidos.`);
  }

  return {
    ...league,
    matches: league.matches.map((match) => {
      const result = resultById.get(match.id);
      if (!result) return match;

      return {
        ...match,
        sets: result.sets,
        status: result.status,
        winnerTeam: result.winnerTeam,
        playedDate: result.playedDate,
        postponedNote: result.postponedNote,
        court: result.court,
      };
    }),
  };
}

function withoutUpdatedAt(league: LeagueData) {
  const { updatedAt: _updatedAt, ...rest } = league;
  return rest;
}

const league = JSON.parse(readFileSync(leaguePath, 'utf8').replace(/^\uFEFF/, '')) as LeagueData;
parseLeagueData(league);
const rows = parseCsv(readFileSync(csvPath, 'utf8')).map(parseResultRow);
const generatedLeague = applyResults(league, rows);
const nextLeague = {
  ...generatedLeague,
  updatedAt:
    JSON.stringify(withoutUpdatedAt(league)) === JSON.stringify(withoutUpdatedAt(generatedLeague))
      ? league.updatedAt
      : new Date().toISOString(),
};

parseLeagueData(nextLeague);
writeFileSync(leaguePath, `${JSON.stringify(nextLeague, null, 2)}\n`, 'utf8');
console.log('league.json actualizado desde data/resultados.csv.');
