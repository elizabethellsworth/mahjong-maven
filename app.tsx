import React, { useState, useCallback, useMemo } from 'react';
import { Player, AllPlayersAvailability, Game } from './types';
import Header from './components/Header';
import AvailabilitySelector from './components/AvailabilitySelector';
import ScheduledGames from './components/ScheduledGames';
import GameHistory from './components/GameHistory';
import PlayerSwitcher from './components/PlayerSwitcher';
import { scheduleGames } from './services/schedulingService';
import ApiKeyModal from './components/ApiKeyModal';

const initialPlayers: Player[] = [
  { id: '1', name: 'Eleanor', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
  { id: '2', name: 'Beatrice', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
  { id: '3', name: 'Susan', avatarUrl: 'https://picsum.photos/id/1012/100/100' },
  { id: '4', name: 'Linda', avatarUrl: 'https://picsum.photos/id/1013/100/100' },
  { id: '5', name: 'Judy', avatarUrl: 'https://picsum.photos/id/1014/100/100' },
  { id: '6', name: 'Carol', avatarUrl: 'https://picsum.photos/id/1025/100/100' },
];

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('googleApiKey') || process.env.API_KEY || null);
  const [players] = useState<Player[]>(initialPlayers);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(initialPlayers[0].id);
  const [availability, setAvailability] = useState<AllPlayersAvailability>({});
  const [scheduledGames, setScheduledGames] = useState<Game[]>([]);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schedulingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);
  
  const handleSetApiKey = (key: string) => {
    localStorage.setItem('googleApiKey', key);
    setApiKey(key);
  };

  const handleScheduleGames = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      setScheduledGames(currentScheduledGames => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastGames = currentScheduledGames.filter(g => new Date(g.date + 'T00:00:00') < today);
        
        setGameHistory(prevHistory => {
          const newHistory = [...prevHistory];
          pastGames.forEach(game => {
            if (!newHistory.some(h => h.date === game.date && h.host.id === game.host.id)) {
               newHistory.push(game);
            }
          });
          return newHistory.sort((a,b) => b.date.localeCompare(a.date));
        });
        
        return scheduleGames(players, availability, schedulingDates);
      });
    } catch (e) {
      setError("Failed to schedule games. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [players, availability, schedulingDates]);

  const handleCancelPlayer = useCallback((gameDate: string, playerId: string) => {
    setScheduledGames(prevGames => {
      const newGames = [...prevGames];
      const gameIndex = newGames.findIndex(g => g.date === gameDate);
      if (gameIndex === -1) return prevGames;

      const game = { ...newGames[gameIndex] };
       if (game.status === 'finalized') {
         // Maybe show a confirmation modal in a real app, for now just allow it.
       }

      const playerIndex = game.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return prevGames;
      
      game.players.splice(playerIndex, 1);
      
      if (game.waitlist.length > 0) {
        const [nextPlayer] = game.waitlist.splice(0, 1);
        game.players.push(nextPlayer);
        game.players.sort((a,b) => a.name.localeCompare(a.name));
      }
      
      newGames[gameIndex] = game;
      return newGames;
    });
  }, []);
  
  const handleFinalizeGame = useCallback((gameDate: string) => {
    setScheduledGames(prevGames => {
      const newGames = [...prevGames];
      const gameIndex = newGames.findIndex(g => g.date === gameDate);
      if (gameIndex === -1) return prevGames;
      
      const game = { ...newGames[gameIndex], status: 'finalized' as const };
      newGames[gameIndex] = game;
      
      return newGames;
    });
  }, []);

  const handleHostChange = useCallback((gameDate: string, newHostId: string) => {
    setScheduledGames(prevGames => {
      const newGames = [...prevGames];
      const gameIndex = newGames.findIndex(g => g.date === gameDate);
      if (gameIndex === -1) return prevGames;

      const game = { ...newGames[gameIndex] };
      
      const newHost = players.find(p => p.id === newHostId);
      if (!newHost) return prevGames;

      game.host = newHost;
      newGames[gameIndex] = game;
      return newGames;
    });
  }, [players]);

  const handleSetWinner = useCallback((gameDate: string, winnerId: string) => {
    setGameHistory(prevHistory => 
      prevHistory.map(game => 
        game.date === gameDate ? { ...game, winnerId } : game
      )
    );
  }, []);

  const currentPlayer = players.find(p => p.id === currentPlayerId) ?? players[0];

  if (!apiKey) {
    return <ApiKeyModal onSetApiKey={handleSetApiKey} />;
  }

  return (
    <div className="min-h-screen bg-mahjong-ivory text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-12">
          <PlayerSwitcher 
            players={players}
            currentPlayer={currentPlayer}
            onPlayerChange={setCurrentPlayerId}
          />
          <AvailabilitySelector
            player={currentPlayer}
            dates={schedulingDates}
            availability={availability[currentPlayerId] || {}}
            setPlayerAvailability={(playerAvail) => setAvailability(prev => ({...prev, [currentPlayerId]: playerAvail}))}
            onSchedule={handleScheduleGames}
            isLoading={isLoading}
          />
          {error && <div className="text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</div>}
          <ScheduledGames 
            games={scheduledGames} 
            onCancelPlayer={handleCancelPlayer}
            onFinalizeGame={handleFinalizeGame}
            onHostChange={handleHostChange}
            apiKey={apiKey}
          />
          <GameHistory games={gameHistory} players={players} onSetWinner={handleSetWinner} />
        </div>
      </main>
    </div>
  );
};

export default App;
