import React, { useState, useCallback } from 'react';
import type { Game } from '../types';
import { generateAnnouncement } from '../services/geminiService';
import { generateIcsFile } from '../services/calendarService';
import { UsersIcon, HomeIcon, XCircleIcon, SparklesIcon, LoadingIcon, ClipboardIcon, CheckIcon, CalendarPlusIcon, CheckCircleIcon } from './icons';

interface ScheduledGamesProps {
  games: Game[];
  onCancelPlayer: (gameDate: string, playerId: string) => void;
  onFinalizeGame: (gameDate: string) => void;
}

const FinalizeGameModal: React.FC<{
  game: Game;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ game, isOpen, onClose, onConfirm }) => {
  const [announcement, setAnnouncement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerateAnnouncement = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    setAnnouncement('');
    try {
      const result = await generateAnnouncement(game);
      setAnnouncement(result);
    } catch (e) {
      setError('Could not generate announcement.');
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }, [game]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(announcement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIcs = () => {
    generateIcsFile(game);
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">Finalize Game</h3>
          <p className="text-gray-600">Review, announce, and confirm the game details.</p>
        </div>
        <div className="p-6 space-y-6">
            <button 
              onClick={handleGenerateAnnouncement}
              disabled={isGenerating}
              className="w-full flex items-center justify-center bg-mahjong-gold hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-semibold py-3 px-4 rounded-md shadow-sm transition-all text-base"
            >
              {isGenerating ? <LoadingIcon className="animate-spin mr-2 h-5 w-5" /> : <SparklesIcon className="mr-2 h-5 w-5" />}
              {isGenerating ? 'Generating...' : '1. Generate Witty Announcement'}
            </button>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          {announcement && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md relative animate-fade-in">
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{announcement}</p>
              <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-white rounded-md hover:bg-gray-100 text-gray-600">
                {copied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <ClipboardIcon className="h-5 w-5" />}
              </button>
            </div>
          )}

          <button
              onClick={handleDownloadIcs}
              className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md shadow-sm transition-all"
            >
             <CalendarPlusIcon className="mr-2 h-5 w-5" />
             2. Download Calendar Event (.ics)
            </button>
        </div>
        <div className="p-6 bg-gray-50 rounded-b-xl flex justify-end items-center space-x-4">
           <button onClick={onClose} className="text-gray-600 font-medium px-4 py-2 rounded-md hover:bg-gray-200">Cancel</button>
           <button 
             onClick={handleConfirm}
             className="bg-mahjong-green hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
           >
            Confirm & Finalize
           </button>
        </div>
      </div>
    </div>
  )
}

const GameCard: React.FC<{ 
  game: Game; 
  onCancelPlayer: (gameDate: string, playerId: string) => void; 
  onFinalizeGame: (gameDate: string) => void;
}> = ({ game, onCancelPlayer, onFinalizeGame }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const d = new Date(game.date + 'T00:00:00');
  const openSlots = 4 - game.players.length;

  const statusStyles = {
    proposed: {
      badge: "text-yellow-800 bg-yellow-100",
      border: "border-gray-200",
    },
    finalized: {
      badge: "text-green-800 bg-green-100",
      border: "border-mahjong-green",
    }
  }

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col border-2 ${statusStyles[game.status].border}`}>
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-mahjong-green">{d.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <p className="text-gray-600">{d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyles[game.status].badge}`}>
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </span>
        </div>
        <div className="p-5 space-y-4 flex-grow">
          <div className="flex items-center">
            <HomeIcon className="h-5 w-5 text-mahjong-gold mr-2" />
            <span className="font-semibold">Host:</span>
            <span className="ml-2">{game.host.name}</span>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <UsersIcon className="h-5 w-5 text-mahjong-green mr-2" />
              <span className="font-semibold">Players:</span>
            </div>
            <ul className="space-y-2 pl-7">
              {game.players.map(player => (
                <li key={player.id} className="flex items-center justify-between group">
                  <span>{player.name}</span>
                  <button 
                    onClick={() => onCancelPlayer(game.date, player.id)} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                    title={`Cancel for ${player.name}`}
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </li>
              ))}
              {openSlots > 0 && Array.from({length: openSlots}).map((_, i) => (
                 <li key={`open-${i}`} className="text-gray-400 italic">Open Spot</li>
              ))}
            </ul>
          </div>
          {game.waitlist.length > 0 && (
            <div>
              <p className="font-semibold text-sm text-gray-500">Waitlist:</p>
              <p className="text-sm text-gray-600 pl-2">{game.waitlist.map(p => p.name).join(', ')}</p>
            </div>
          )}
        </div>
        <div className="p-5 bg-gray-50 border-t border-gray-200 mt-auto">
          {game.status === 'proposed' ? (
             <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center bg-mahjong-green hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <CheckCircleIcon className="mr-2 h-5 w-5" />
              Finalize & Announce
            </button>
          ) : (
            <div className="text-center text-gray-600 font-medium">
              Game is confirmed. Have fun!
            </div>
          )}
        </div>
      </div>
      <FinalizeGameModal 
        game={game}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => onFinalizeGame(game.date)}
      />
    </>
  );
};

const ScheduledGames: React.FC<ScheduledGamesProps> = ({ games, onCancelPlayer, onFinalizeGame }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Games Scheduled Yet</h2>
        <p className="text-gray-500">Use the form above to set player availability and create a schedule.</p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">This Week's Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map(game => (
          <GameCard key={game.date} game={game} onCancelPlayer={onCancelPlayer} onFinalizeGame={onFinalizeGame} />
        ))}
      </div>
    </section>
  );
};

export default ScheduledGames;
