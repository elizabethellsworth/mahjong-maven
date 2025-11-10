export interface Player {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface DayAvailability {
  available: boolean;
  hosting: boolean;
}

export interface PlayerAvailability {
  [date: string]: DayAvailability;
}

export interface AllPlayersAvailability {
  [playerId: string]: PlayerAvailability;
}

export interface Game {
  date: string;
  host: Player;
  players: Player[];
  waitlist: Player[];
  status: 'proposed' | 'finalized';
}
