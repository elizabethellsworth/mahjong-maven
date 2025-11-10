import React, { useState, useMemo } from 'react';
import type { Game, Player } from '../types';
import { HistoryIcon, TrophyIcon } from './icons';

interface GameHistoryProps {
  games: Game[];
  players: Player[];
}

const GameHistory: React.FC<GameHistoryProps> = ({ games, players }) => {
  const [activeTab, setActiveTab] = useState('stats');

  const stats = useMemo(() => {
    const playerStats: { [id: string]: { gamesPlayed: number } } = {};
    players.forEach(p => {
      playerStats[p.id] = { gamesPlayed: 0 };
    });

    games.forEach(game => {
      game.players.forEach(player => {
        if (playerStats[player.id]) {
          playerStats[player.id].gamesPlayed++;
        }
      });
    });

    return players.map(p => ({
      ...p,
      gamesPlayed: playerStats[p.id].gamesPlayed
    })).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  }, [games, players]);

  if (games.length === 0) {
    return null; // Don't render anything if there's no history yet
  }

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-500 bg-yellow-100';
    if (rank === 1) return 'text-gray-500 bg-gray-200';
    if (rank === 2) return 'text-yellow-700 bg-yellow-200';
    return 'text-gray-400 bg-gray-100';
  }
  
  return (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex items-center mb-6">
        <HistoryIcon className="h-6 w-6 text-mahjong-green" />
        <h2 className="text-2xl font-bold ml-2 text-gray-800">Game History &amp; Stats</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('stats')}
            className={`${
              activeTab === 'stats'
                ? 'border-mahjong-green text-mahjong-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TrophyIcon className="h-5 w-5 mr-2"/>
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`${
              activeTab === 'log'
                ? 'border-mahjong-green text-mahjong-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <HistoryIcon className="h-5 w-5 mr-2" />
            Game Log
          </button>
        </nav>
      </div>

      <div className="py-6">
        {activeTab === 'stats' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Player Leaderboard</h3>
            <ul className="space-y-3">
              {stats.map((player, index) => (
                <li key={player.id} className="p-3 bg-stone-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 ${getRankColor(index)}`}>
                      {index + 1}
                    </span>
                    <img src={player.avatarUrl} alt={player.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-bold text-mahjong-green">{player.gamesPlayed}</span> games played
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeTab === 'log' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Past Games</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {games.map(game => {
                const d = new Date(game.date + 'T00:00:00');
                return (
                  <div key={game.date} className="p-4 border border-gray-200 rounded-lg">
                    <p className="font-bold text-mahjong-green">{d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-semibold">Host:</span> {game.host.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Players:</span> {game.players.map(p => p.name).join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GameHistory;
