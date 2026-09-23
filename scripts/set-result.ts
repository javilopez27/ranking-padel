import { readFileSync, writeFileSync } from 'node:fs';

const csvPath = new URL('../data/resultados.csv', import.meta.url);
const headers = ['id', 'status', 'winnerTeam', 'sets', 'playedDate', 'postponedNote', 'court'];
const validStatuses = new Set(['pending', 'completed', 'postponed']);

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

function stringifyCsvValue(value: string) {
  return value.includes(',') || value.includes('"') || value.includes(' ')
    ? `"${value.replace(/"/g, '""')}"`
    : value;
}

function normalizeSetToken(set: string) {
  const normal = set.match(/^(\d+)-(\d+)(?:\((\d+)-(\d+)\))?$/);
  if (normal) return set;

  const displayStyle = set.match(/^\((\d+)\)(\d+)-(\d+)\((\d+)\)$/);
  if (displayStyle) return `${displayStyle[2]}-${displayStyle[3]}(${displayStyle[1]}-${displayStyle[4]})`;

  return undefined;
}

function normalizeSets(value: string) {
  const sets = value.trim().replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ');
  if (!sets) return '';

  const normalized = sets.split(' ').map(normalizeSetToken);
  if (normalized.some((set) => !set)) {
    throw new Error('Escribe sets como "6-4 7-5" o, si hay tie-break, "6-7(5-7)".');
  }
  return normalized.join(' ');
}

function readInput(name: string, fallback = '') {
  const envName = `INPUT_${name.toUpperCase()}`;
  return (process.env[envName] || fallback).trim();
}

const [argMatchId, argStatus, argWinnerTeam, argSets, argPlayedDate, argPostponedNote, argCourt] = process.argv.slice(2);

const input = {
  id: readInput('match_id', argMatchId),
  status: readInput('status', argStatus || 'completed'),
  winnerTeam: readInput('winner_team', argWinnerTeam),
  sets: normalizeSets(readInput('sets', argSets)),
  playedDate: readInput('played_date', argPlayedDate),
  postponedNote: readInput('postponed_note', argPostponedNote),
  court: readInput('court', argCourt),
};

if (!/^m_(?:[1-9]|1[01])_[1-3]$/.test(input.id)) {
  throw new Error('match_id debe tener formato m_1_1, m_1_2 ... m_11_3.');
}

if (!validStatuses.has(input.status)) {
  throw new Error('status debe ser pending, completed o postponed.');
}

if (input.winnerTeam && !['1', '2'].includes(input.winnerTeam)) {
  throw new Error('winner_team debe estar vacio, 1 o 2.');
}

if (input.status === 'completed' && (!input.winnerTeam || !input.sets)) {
  throw new Error('Un partido completed necesita winner_team y sets.');
}

if (input.status !== 'completed' && (input.winnerTeam || input.sets)) {
  throw new Error('Un partido pending/postponed no puede tener winner_team ni sets.');
}

const lines = readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
const [headerLine, ...bodyLines] = lines;
const currentHeaders = parseCsvLine(headerLine);

if (headers.join(',') !== currentHeaders.join(',')) {
  throw new Error('La cabecera de data/resultados.csv no tiene el formato esperado.');
}

let found = false;
const nextRows = bodyLines.map((line) => {
  const values = parseCsvLine(line);
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));

  if (row.id !== input.id) return values.map(stringifyCsvValue).join(',');

  found = true;
  return headers.map((header) => stringifyCsvValue(input[header as keyof typeof input] || '')).join(',');
});

if (!found) throw new Error(`No existe el partido ${input.id} en data/resultados.csv.`);

writeFileSync(csvPath, `${headers.join(',')}\n${nextRows.join('\n')}\n`, 'utf8');
console.log(`Resultado actualizado en data/resultados.csv: ${input.id}`);
