import type { Match, RoundInfo } from '../types';

export type Tab = 'inicio' | 'clasificacion' | 'calendario' | 'jugadores' | 'top8';
export type Route = { tab: Tab; roundNumber?: number; matchId?: string; playerId?: number };

export function parseRoute(hash: string): Route {
  let decoded: string;
  try { decoded = decodeURIComponent(hash.replace(/^#\/?/, '')); }
  catch { return { tab: 'inicio' }; }
  const parts = decoded.split('/');
  const tab = parts[0];
  if (tab === 'calendario') {
    const roundNumber = parts[1] === 'jornada' ? Number(parts[2]) : undefined;
    if (!Number.isInteger(roundNumber) || !roundNumber || roundNumber < 1 || roundNumber > 11) return { tab: 'calendario' };
    return { tab: 'calendario', roundNumber, matchId: parts[3] === 'partido' ? parts[4] : undefined };
  }
  if (tab === 'jugadores') {
    const playerId = parts[1] === 'jugador' ? Number(parts[2]) : undefined;
    return { tab: 'jugadores', playerId: Number.isInteger(playerId) && playerId && playerId > 0 ? playerId : undefined };
  }
  if (tab === 'clasificacion' || tab === 'top8') return { tab };
  return { tab: 'inicio' };
}

export function routeHash(route: Route): string {
  if (route.tab === 'calendario' && route.roundNumber) {
    return `#/calendario/jornada/${route.roundNumber}${route.matchId ? `/partido/${encodeURIComponent(route.matchId)}` : ''}`;
  }
  if (route.tab === 'jugadores' && route.playerId) return `#/jugadores/jugador/${route.playerId}`;
  return `#/${route.tab}`;
}

export function linkTo(route: Route): string {
  return `${window.location.origin}${window.location.pathname}${window.location.search}${routeHash(route)}`;
}

export function whatsappLink(route: Route, title: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${linkTo(route)}`)}`;
}

export function currentRound(rounds: RoundInfo[], matches: Match[], now = new Date()): number {
  const months: Record<string, number> = { Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11 };
  const parseDate = (value: string) => {
    const [day, month, year] = value.split(' ');
    return new Date(Number(year), months[month], Number(day));
  };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const active = rounds.find(round => today >= parseDate(round.startDate) && today <= parseDate(round.endDate));
  if (active) return active.roundNumber;
  return rounds.find(round => matches.some(match => match.roundNumber === round.roundNumber && match.status === 'pending'))?.roundNumber
    ?? rounds.find(round => matches.some(match => match.roundNumber === round.roundNumber && match.status === 'postponed'))?.roundNumber
    ?? rounds.at(-1)?.roundNumber ?? 1;
}
