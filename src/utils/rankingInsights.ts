import { Match, Player, PlayerStats } from '../types';
import { calculatePlayerStats } from './leagueCalculations';

export interface PositionPoint {
  roundNumber: number;
  position: number;
  delta: number;
}

export interface PlayerPositionHistory {
  playerId: number;
  points: PositionPoint[];
}

export interface FameRecord {
  title: string;
  value: string;
  detail: string;
  accent: 'lime' | 'orange' | 'white';
}

const completedMatches = (matches: Match[]) =>
  matches
    .filter((match) => match.status === 'completed' && match.sets.length > 0 && match.winnerTeam)
    .sort((a, b) => a.roundNumber - b.roundNumber || a.matchNumberInRound - b.matchNumberInRound);

const formatScore = (match: Match) => match.sets.map((set) => `${set.games1}-${set.games2}`).join(' / ');

const rankMap = (stats: PlayerStats[]) =>
  new Map<number, number>(stats.map((stat, index) => [stat.playerId, index + 1]));

export function getPlayerPositionHistory(players: Player[], matches: Match[], playerId: number): PlayerPositionHistory {
  const rounds = Array.from(new Set(matches.map((match) => match.roundNumber))).sort((a, b) => a - b);
  let previousPosition: number | undefined;

  const points = rounds
    .map((roundNumber) => {
      const matchesUntilRound = matches.filter(
        (match) => match.roundNumber <= roundNumber && match.status === 'completed' && match.sets.length > 0
      );
      if (matchesUntilRound.length === 0) return null;

      const ranking = calculatePlayerStats(players, matchesUntilRound);
      const position = rankMap(ranking).get(playerId) || players.length;
      const delta = previousPosition ? previousPosition - position : 0;
      previousPosition = position;

      return { roundNumber, position, delta };
    })
    .filter((point): point is PositionPoint => point !== null);

  return { playerId, points };
}

export function simulateMatchWinner(match: Match, winnerTeam: 1 | 2): Match {
  return {
    ...match,
    status: 'completed',
    winnerTeam,
    sets: winnerTeam === 1
      ? [{ games1: 6, games2: 4 }, { games1: 6, games2: 4 }]
      : [{ games1: 4, games2: 6 }, { games1: 4, games2: 6 }],
  };
}

export function getHallOfFame(players: Player[], matches: Match[]): FameRecord[] {
  const played = completedMatches(matches);

  if (!played.length) {
    return [
      {
        title: 'Hall esperando fuego',
        value: 'Sin records todavía',
        detail: 'Cuando publiques resultados aparecerán rachas, palizas, tie breaks y terceros sets.',
        accent: 'lime',
      },
    ];
  }

  const playerMap = new Map<number, Player>(players.map((player) => [player.id, player]));
  const stats = calculatePlayerStats(players, matches);
  const byPlayer = new Map(stats.map((stat) => [stat.playerId, stat]));
  const streaks = new Map<number, { current: number; best: number }>();
  const thirdSets = new Map<number, { won: number; played: number }>();
  const tieBreaks = new Map<number, number>();

  players.forEach((player) => {
    streaks.set(player.id, { current: 0, best: 0 });
    thirdSets.set(player.id, { won: 0, played: 0 });
    tieBreaks.set(player.id, 0);
  });

  let biggestWin: { match: Match; diff: number } | undefined;
  let longestMatch: { match: Match; games: number } | undefined;
  let comeback: { match: Match; winnerTeam: 1 | 2 } | undefined;

  played.forEach((match) => {
    const winnerTeam = match.winnerTeam;
    if (!winnerTeam) return;
    const teamIds = winnerTeam === 1 ? match.team1 : match.team2;
    const loserIds = winnerTeam === 1 ? match.team2 : match.team1;

    teamIds.forEach((id) => {
      const row = streaks.get(id);
      if (!row) return;
      row.current += 1;
      row.best = Math.max(row.best, row.current);
    });
    loserIds.forEach((id) => {
      const row = streaks.get(id);
      if (row) row.current = 0;
    });

    const games1 = match.sets.reduce((sum, set) => sum + set.games1, 0);
    const games2 = match.sets.reduce((sum, set) => sum + set.games2, 0);
    const diff = Math.abs(games1 - games2);
    const totalGames = games1 + games2;

    if (!biggestWin || diff > biggestWin.diff) biggestWin = { match, diff };
    if (!longestMatch || totalGames > longestMatch.games) longestMatch = { match, games: totalGames };

    if (match.sets.length === 3) {
      const ids = [...match.team1, ...match.team2];
      ids.forEach((id) => {
        const row = thirdSets.get(id);
        if (!row) return;
        row.played += 1;
        if (teamIds.includes(id)) row.won += 1;
      });

      const firstSetWinner = match.sets[0].games1 > match.sets[0].games2 ? 1 : 2;
      if (firstSetWinner !== winnerTeam) comeback = { match, winnerTeam };
    }

    match.sets.forEach((set) => {
      if (set.games1 !== 7 && set.games2 !== 7) return;
      const setWinnerTeam = set.games1 > set.games2 ? 1 : 2;
      const winners = setWinnerTeam === 1 ? match.team1 : match.team2;
      winners.forEach((id) => tieBreaks.set(id, (tieBreaks.get(id) || 0) + 1));
    });
  });

  const bestStreak = Array.from(streaks.entries())
    .sort((a, b) => b[1].best - a[1].best || (playerMap.get(a[0])?.name || '').localeCompare(playerMap.get(b[0])?.name || ''))[0];
  const gamesLeader = stats.slice().sort((a, b) => b.gamesWon - a.gamesWon)[0];
  const setsLeader = stats.slice().sort((a, b) => b.setsWon - a.setsWon)[0];
  const thirdSetKing = Array.from(thirdSets.entries())
    .sort((a, b) => b[1].won - a[1].won || b[1].played - a[1].played)[0];
  const tieBreakKing = Array.from(tieBreaks.entries()).sort((a, b) => b[1] - a[1])[0];

  return [
    {
      title: 'Mayor racha',
      value: bestStreak && bestStreak[1].best > 0 ? `${playerMap.get(bestStreak[0])?.name} · ${bestStreak[1].best} victorias` : 'Por estrenar',
      detail: 'Racha seguida más bestia.',
      accent: 'lime',
    },
    {
      title: 'Mayor paliza',
      value: biggestWin ? formatScore(biggestWin.match) : 'Por estrenar',
      detail: biggestWin ? `${playerMap.get(biggestWin.match.team1[0])?.name} / ${playerMap.get(biggestWin.match.team1[1])?.name} vs ${playerMap.get(biggestWin.match.team2[0])?.name} / ${playerMap.get(biggestWin.match.team2[1])?.name}` : 'Necesita resultados.',
      accent: 'orange',
    },
    {
      title: 'Partido más largo',
      value: longestMatch ? formatScore(longestMatch.match) : 'Por estrenar',
      detail: longestMatch ? `${longestMatch.games} juegos totales` : 'Esperando batalla larga.',
      accent: 'white',
    },
    {
      title: 'Mayor remontada',
      value: comeback ? formatScore(comeback.match) : 'Por estrenar',
      detail: comeback ? `Perdieron el primer set y acabaron rugiendo.` : 'Aún no hay remontada a tres sets.',
      accent: 'lime',
    },
    {
      title: 'Más juegos ganados',
      value: gamesLeader ? `${gamesLeader.player.name} · ${gamesLeader.gamesWon}` : 'Por estrenar',
      detail: 'Volumen puro de juegos a favor.',
      accent: 'orange',
    },
    {
      title: 'Más sets ganados',
      value: setsLeader ? `${setsLeader.player.name} · ${setsLeader.setsWon}` : 'Por estrenar',
      detail: 'El que más sets se ha llevado.',
      accent: 'white',
    },
    {
      title: 'Rey del tercer set',
      value: thirdSetKing && thirdSetKing[1].played > 0 ? `${playerMap.get(thirdSetKing[0])?.name} · ${thirdSetKing[1].won}/${thirdSetKing[1].played}` : 'Por estrenar',
      detail: 'Sangre fría cuando el partido se alarga.',
      accent: 'lime',
    },
    {
      title: 'Mr. Tie Break',
      value: tieBreakKing && tieBreakKing[1] > 0 ? `${playerMap.get(tieBreakKing[0])?.name} · ${tieBreakKing[1]} ganados` : 'Por estrenar',
      detail: 'El que mejor vive en el alambre.',
      accent: 'orange',
    },
  ];
}
