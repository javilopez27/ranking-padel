import { Player, Match, PlayerStats, SetScore } from '../types';

/**
 * Calculates individual statistics for each player based on completed matches.
 * Tiebreaker order as requested:
 * 1. Points / Victorias (3 pts per win, or direct wins)
 * 2. Diferencia de Sets (setsWon - setsLost)
 * 3. Diferencia de Juegos (gamesWon - gamesLost)
 * 4. Sets a favor (setsWon)
 * 5. Juegos a favor (gamesWon)
 */
export function calculatePlayerStats(players: Player[], matches: Match[]): PlayerStats[] {
  const statsMap = new Map<number, PlayerStats>();

  // Initialize stats for each of the 12 players
  players.forEach((player) => {
    statsMap.set(player.id, {
      playerId: player.id,
      player,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      setsWon: 0,
      setsLost: 0,
      setsDiff: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDiff: 0,
      points: 0,
      winRate: 0,
      streak: [],
    });
  });

  // Process all completed matches
  matches
    .filter((m) => m.status === 'completed' && m.sets.length > 0)
    .sort((a, b) => a.roundNumber - b.roundNumber)
    .forEach((match) => {
      const { team1, team2, sets, winnerTeam } = match;

      // Calculate sets and games won by team1 and team2
      let t1Sets = 0;
      let t2Sets = 0;
      let t1Games = 0;
      let t2Games = 0;

      sets.forEach((set) => {
        t1Games += set.games1;
        t2Games += set.games2;
        if (set.games1 > set.games2) {
          t1Sets++;
        } else if (set.games2 > set.games1) {
          t2Sets++;
        }
      });

      const team1Won = winnerTeam ? winnerTeam === 1 : t1Sets > t2Sets;

      // Update Team 1 players
      team1.forEach((pId) => {
        const stat = statsMap.get(pId);
        if (!stat) return;
        stat.matchesPlayed += 1;
        if (team1Won) {
          stat.matchesWon += 1;
          stat.points += 3; // 3 points per win
          stat.streak.push('W');
        } else {
          stat.matchesLost += 1;
          stat.streak.push('L');
        }
        stat.setsWon += t1Sets;
        stat.setsLost += t2Sets;
        stat.gamesWon += t1Games;
        stat.gamesLost += t2Games;
      });

      // Update Team 2 players
      team2.forEach((pId) => {
        const stat = statsMap.get(pId);
        if (!stat) return;
        stat.matchesPlayed += 1;
        if (!team1Won) {
          stat.matchesWon += 1;
          stat.points += 3;
          stat.streak.push('W');
        } else {
          stat.matchesLost += 1;
          stat.streak.push('L');
        }
        stat.setsWon += t2Sets;
        stat.setsLost += t1Sets;
        stat.gamesWon += t2Games;
        stat.gamesLost += t1Games;
      });
    });

  // Calculate derived values
  const statsList = Array.from(statsMap.values()).map((stat) => {
    stat.setsDiff = stat.setsWon - stat.setsLost;
    stat.gamesDiff = stat.gamesWon - stat.gamesLost;
    stat.winRate = stat.matchesPlayed > 0 ? Math.round((stat.matchesWon / stat.matchesPlayed) * 100) : 0;
    // Keep last 5 in streak
    stat.streak = stat.streak.slice(-5);
    return stat;
  });

  // Sort with explicit user tie-break rules:
  // 1. Points
  // 2. Sets Difference
  // 3. Games Difference
  // 4. Sets Won
  // 5. Games Won
  statsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.setsDiff !== a.setsDiff) return b.setsDiff - a.setsDiff;
    if (b.gamesDiff !== a.gamesDiff) return b.gamesDiff - a.gamesDiff;
    if (b.setsWon !== a.setsWon) return b.setsWon - a.setsWon;
    if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
    return a.player.name.localeCompare(b.player.name);
  });

  return statsList;
}

/**
 * Returns who has partnered with whom and who has opposed whom in the schedule.
 */
export function getPairingMatrix(players: Player[], matches: Match[]) {
  const partnerMatrix: Record<number, Record<number, { count: number; completed: number }>> = {};
  const opponentMatrix: Record<number, Record<number, { count: number; completed: number }>> = {};

  players.forEach((p1) => {
    partnerMatrix[p1.id] = {};
    opponentMatrix[p1.id] = {};
    players.forEach((p2) => {
      partnerMatrix[p1.id][p2.id] = { count: 0, completed: 0 };
      opponentMatrix[p1.id][p2.id] = { count: 0, completed: 0 };
    });
  });

  matches.forEach((m) => {
    const isCompleted = m.status === 'completed';
    const [p1, p2] = m.team1;
    const [p3, p4] = m.team2;

    // Team 1 partners
    partnerMatrix[p1][p2].count++;
    partnerMatrix[p2][p1].count++;
    if (isCompleted) {
      partnerMatrix[p1][p2].completed++;
      partnerMatrix[p2][p1].completed++;
    }

    // Team 2 partners
    partnerMatrix[p3][p4].count++;
    partnerMatrix[p4][p3].count++;
    if (isCompleted) {
      partnerMatrix[p3][p4].completed++;
      partnerMatrix[p4][p3].completed++;
    }

    // Opponents
    const t1 = [p1, p2];
    const t2 = [p3, p4];
    t1.forEach((a) => {
      t2.forEach((b) => {
        opponentMatrix[a][b].count++;
        opponentMatrix[b][a].count++;
        if (isCompleted) {
          opponentMatrix[a][b].completed++;
          opponentMatrix[b][a].completed++;
        }
      });
    });
  });

  return { partnerMatrix, opponentMatrix };
}

/**
 * Formats a clean WhatsApp message for sharing standings or round results.
 */
export function generateWhatsAppStandings(stats: PlayerStats[], currentRound: number): string {
  let msg = `🎾 *LIGA PÁDEL 12 - CLASIFICACIÓN (Jornada ${currentRound})*\n`;
  msg += `💰 *Bote Total:* 120 € (80 € Campeón / 40 € Subcampeón)\n`;
  msg += `─────────────────────────\n`;

  stats.forEach((s, idx) => {
    const pos = idx + 1;
    const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos <= 8 ? '🟢' : '⚪';
    const diffSign = s.setsDiff > 0 ? `+${s.setsDiff}` : `${s.setsDiff}`;
    msg += `${medal} *${pos}º* ${s.player.name} — *${s.points} pts* (${s.matchesWon}V-${s.matchesLost}D | Dif Sets: ${diffSign} | Dif Juegos: ${s.gamesDiff > 0 ? '+' : ''}${s.gamesDiff})\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `*Top 8:* Puestos 1º al 8º clasificarán a la fase final.\n`;
  msg += `*Desempate:* Dif. Sets > Dif. Juegos > Sets Favor > Juegos Favor.`;
  return msg;
}

export function generateWhatsAppRound(matches: Match[], roundNumber: number, players: Player[]): string {
  const pMap = new Map(players.map((p) => [p.id, p]));
  let msg = `🎾 *LIGA PÁDEL 12 - JORNADA ${roundNumber}*\n`;
  msg += `📅 *Semana de competición*\n`;
  msg += `─────────────────────────\n`;

  matches
    .filter((m) => m.roundNumber === roundNumber)
    .forEach((m, idx) => {
      const p1 = pMap.get(m.team1[0])?.name || `J${m.team1[0]}`;
      const p2 = pMap.get(m.team1[1])?.name || `J${m.team1[1]}`;
      const p3 = pMap.get(m.team2[0])?.name || `J${m.team2[0]}`;
      const p4 = pMap.get(m.team2[1])?.name || `J${m.team2[1]}`;

      msg += `*Partido ${idx + 1}:*\n`;
      msg += `🎾 ${p1} & ${p2}\n     🆚\n🎾 ${p3} & ${p4}\n`;

      if (m.status === 'completed' && m.sets.length > 0) {
        const scoreStr = m.sets.map((s) => `${s.games1}-${s.games2}`).join(' / ');
        msg += `🏆 *Resultado:* ${scoreStr}\n\n`;
      } else if (m.status === 'postponed') {
        msg += `⏳ *Aplazado para diciembre:* ${m.postponedNote || 'Sin fecha'}\n\n`;
      } else {
        msg += `⏳ *Estado:* Pendiente de disputar\n\n`;
      }
    });

  return msg;
}
