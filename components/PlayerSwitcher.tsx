import React, { useState, useRef, useEffect } from 'react';
import type { Player } from '../types';
import { ChevronDownIcon } from './icons';

interface PlayerSwitcherProps {
  players: Player[];
  currentPlayer: Player;
  onPlayerChange: (playerId: string) => void;
}

const PlayerSwitcher: React.FC<PlayerSwitcherProps> = ({ players, currentPlayer, onPlayerChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handlePlayerSelect = (playerId: string) => {
    onPlayerChange(playerId);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative max-w-xs mx-auto">
      <div className="text-center mb-2 text-sm font-medium text-gray-600">
        Editing availability for:
      </div>
      <button
        type="button"
        className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-mahjong-green focus:border-mahjong-green sm:text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          <img src={currentPlayer.avatarUrl} alt="" className="flex-shrink-0 h-8 w-8 rounded-full" />
          <span className="ml-3 block truncate text-lg font-medium">{currentPlayer.name}</span>
        </span>
        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-50">
          <ul className="max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {players.map((player) => (
              <li
                key={player.id}
                className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                onClick={() => handlePlayerSelect(player.id)}
              >
                <div className="flex items-center">
                  <img src={player.avatarUrl} alt="" className="flex-shrink-0 h-8 w-8 rounded-full" />
                  <span className={`ml-3 block truncate ${player.id === currentPlayer.id ? 'font-semibold' : 'font-normal'}`}>
                    {player.name}
                  </span>
                </div>
                {player.id === currentPlayer.id && (
                  <span className="text-mahjong-green absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// A check icon to be used internally
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);


export default PlayerSwitcher;
