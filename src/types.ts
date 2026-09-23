export type PlayerSide = 'drive' | 'reves' | 'ambos';

export interface Player {
  id: number;
  name: string;
  nickname?: string;
  side: PlayerSide;
  paidFee: boolean; // 10 € quota
  avatarColor?: string;
  imageUrl?: string;
}

export interface SetScore {
  games1: number;
  games2: number;
  tieBreak1?: number;
  tieBreak2?: number;
}

export type MatchStatus = 'pending' | 'completed' | 'postponed';

export interface Match {
  id: string;
  roundNumber: number; // 1..11
  matchNumberInRound: number; // 1..3
  team1: [number, number]; // Player IDs
  team2: [number, number]; // Player IDs
  sets: SetScore[];
  status: MatchStatus;
  postponedNote?: string;
  playedDate?: string;
  court?: string;
  winnerTeam?: 1 | 2;
}

export interface RoundInfo {
  roundNumber: number;
  title: string;
  startDate: string;
  endDate: string;
  isRegularSeason: boolean;
}

export interface PlayerStats {
  playerId: number;
  player: Player;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  setsWon: number;
  setsLost: number;
  setsDiff: number;
  gamesWon: number;
  gamesLost: number;
  gamesDiff: number;
  points: number; // legacy name used internally; equals victories
  winRate: number;
  streak: ('W' | 'L')[];
}

export type Top8Format = 'fixed-pairs' | 'draw' | 'groups-chilean' | 'captains';

export interface Top8FormatOption {
  id: Top8Format;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  pros: string;
}

export interface Vote {
  playerId: number;
  formatId: Top8Format;
  date: string;
}

export interface DraftPairing {
  captainRank: number; // 1, 2, 3, 4
  captainId: number;
  pickPlayerId: number | null; // Player chosen from ranks 5..8
}

export interface PlayoffMatch {
  id: string;
  round: 'semi1' | 'semi2' | 'final' | 'third_place';
  title: string;
  team1PlayerIds: [number, number];
  team2PlayerIds: [number, number];
  sets: SetScore[];
  status: MatchStatus;
  winnerTeam?: 1 | 2;
  prizeNote?: string;
}
