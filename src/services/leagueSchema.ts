import { z } from 'zod';
import { getMatchWinner } from '../utils/scoreValidation';
import { calculatePlayerStats } from '../utils/leagueCalculations';

const id = z.number().int().min(1).max(12);
const text = z.string().max(200);
const player = z.object({
  id, name: text.trim().min(1), nickname: text.optional(),
  side: z.enum(['drive', 'reves', 'ambos']), paidFee: z.boolean(), avatarColor: text.optional(), imageUrl: text.optional(),
});
const score = z.object({ games1: z.number().int().min(0).max(7), games2: z.number().int().min(0).max(7) });
const result = z.object({
  sets: z.array(score).max(3), winnerTeam: z.union([z.literal(1), z.literal(2)]).optional(),
  status: z.enum(['pending', 'completed', 'postponed']).optional(),
  court: text.optional(), playedDate: text.optional(), postponedNote: text.optional(),
});
const match = result.extend({
  id: text.min(1), roundNumber: z.number().int().min(1).max(11),
  matchNumberInRound: z.number().int().min(1).max(3),
  team1: z.tuple([id, id]), team2: z.tuple([id, id]),
  status: z.enum(['pending', 'completed', 'postponed']),
  postponedNote: text.optional(), playedDate: text.optional(), court: text.optional(),
});

export const leagueSchema = z.object({
  version: z.literal(2), updatedAt: z.string().datetime(),
  players: z.array(player).length(12), matches: z.array(match).length(33),
  votes: z.array(z.object({ playerId: id, formatId: z.enum(['fixed-pairs', 'draw', 'groups-chilean', 'captains']), date: text })).max(12),
  playoffs: z.object({
    pairs: z.array(z.tuple([id, id])).refine(p => p.length === 0 || p.length === 4),
    semi1: result, semi2: result, final: result,
  }),
}).superRefine((data, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  if (new Set(data.players.map(p => p.id)).size !== 12) fail('Los jugadores deben tener identificadores únicos del 1 al 12.');
  if (new Set(data.matches.map(m => m.id)).size !== 33) fail('Hay partidos duplicados.');
  if (new Set(data.votes.map(v => v.playerId)).size !== data.votes.length) fail('Solo se admite un voto por jugador.');
  const partners = new Map<string, number>();
  const opponents = new Map<string, number>();
  const count = (map: Map<string, number>, a: number, b: number) => {
    const key = [a,b].sort((x,y) => x-y).join('-');
    map.set(key, (map.get(key) ?? 0) + 1);
  };
  for (let round = 1; round <= 11; round++) {
    const matches = data.matches.filter(m => m.roundNumber === round);
    if (matches.length !== 3 || new Set(matches.flatMap(m => [...m.team1, ...m.team2])).size !== 12 || new Set(matches.map(m => m.matchNumberInRound)).size !== 3) fail(`Jornada ${round}: deben jugar los 12, una sola vez cada uno.`);
  }
  for (const m of data.matches) {
    if (m.status === 'completed') {
      if (!getMatchWinner(m.sets) || getMatchWinner(m.sets) !== m.winnerTeam) fail(`Resultado inválido: ${m.id}. Usa sets a 6 juegos con desempate a 7.`);
    } else if (m.sets.length || m.winnerTeam) fail(`El partido ${m.id} no ha terminado y no puede tener resultado.`);
    count(partners, m.team1[0], m.team1[1]); count(partners, m.team2[0], m.team2[1]);
    m.team1.forEach(a => m.team2.forEach(b => count(opponents, a, b)));
  }
  if (partners.size !== 66 || [...partners.values()].some(n => n !== 1) || opponents.size !== 66 || [...opponents.values()].some(n => n !== 2)) fail('El calendario debe conservar el equilibrio Whist: cada pareja una vez y cada rival dos veces.');
  const p = data.playoffs;
  if (p.pairs.length && new Set(p.pairs.flat()).size !== 8) fail('Las cuatro parejas finales deben tener ocho jugadores distintos.');
  if (p.pairs.length) {
    if (data.matches.some(m => m.status !== 'completed')) fail('Completa la liga regular antes de fijar las parejas finales.');
    const ranking = calculatePlayerStats(data.players, data.matches);
    const pool = ranking.slice(4, 8).map(s => s.playerId);
    if (p.pairs.some((pair, i) => pair[0] !== ranking[i].playerId || !pool.includes(pair[1]))) fail('Las parejas deben respetar los cuatro capitanes y los puestos 5º al 8º.');
  }
  for (const r of [p.semi1, p.semi2, p.final]) {
    if (r.status === 'completed' && !r.winnerTeam) fail('Un partido finalizado debe tener resultado.');
    if (r.status && r.status !== 'completed' && (r.sets.length || r.winnerTeam)) fail('Un partido pendiente o aplazado no puede tener resultado.');
    if (r.sets.length || r.winnerTeam) {
      if (!getMatchWinner(r.sets) || getMatchWinner(r.sets) !== r.winnerTeam || p.pairs.length !== 4) fail('Resultado de fase final inválido.');
    }
  }
  if (p.final.sets.length && (!p.semi1.winnerTeam || !p.semi2.winnerTeam)) fail('Completa ambas semifinales antes de la final.');
});

export type LeagueData = z.infer<typeof leagueSchema>;
export const emptyPlayoffs = (): LeagueData['playoffs'] => ({ pairs: [], semi1: { sets: [] }, semi2: { sets: [] }, final: { sets: [] } });
export function parseLeagueData(value: unknown): LeagueData { return leagueSchema.parse(value); }
