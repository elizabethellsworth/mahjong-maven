import type { Player, AllPlayersAvailability, Game } from '../types';

const MAHJONG_PLAYERS_REQUIRED = 4;

export function scheduleGames(
  players: Player[],
  availability: AllPlayersAvailability,
  dates: string[]
): Game[] {
  const scheduledGames: Game[] = [];

  for (const date of dates) {
    const availablePlayers = players.filter(player => 
      availability[player.id]?.[date]?.available
    );

    const availableHosts = availablePlayers.filter(player => 
      availability[player.id]?.[date]?.hosting
    );

    if (availablePlayers.length >= MAHJONG_PLAYERS_REQUIRED && availableHosts.length > 0) {
      // Simple logic: first available host gets to host.
      const host = availableHosts[0];
      
      // Players for the game are the host plus the first 3 other available players.
      const otherPlayers = availablePlayers.filter(p => p.id !== host.id);
      
      const gamePlayers = [host, ...otherPlayers.slice(0, MAHJONG_PLAYERS_REQUIRED - 1)];
      
      // The rest of the available players go to the waitlist.
      const waitlist = otherPlayers.slice(MAHJONG_PLAYERS_REQUIRED - 1);
      
      scheduledGames.push({
        date,
        host,
        players: gamePlayers.sort((a,b) => a.name.localeCompare(a.name)),
        waitlist,
        status: 'proposed',
      });
    }
  }

  return scheduledGames;
}
