import React from 'react';
import type { Player, PlayerAvailability, DayAvailability } from '../types';
import { CalendarIcon, LoadingIcon } from './icons';

interface AvailabilitySelectorProps {
  player: Player;
  dates: string[];
  availability: PlayerAvailability;
  setPlayerAvailability: (playerAvailability: PlayerAvailability) => void;
  onSchedule: () => void;
  isLoading: boolean;
}

const DayCard: React.FC<{
  date: string;
  dayAvailability: DayAvailability;
  onAvailabilityChange: (date: string, newAvail: DayAvailability) => void;
}> = ({ date, dayAvailability, onAvailabilityChange }) => {
  const d = new Date(date + 'T00:00:00');

  const handleAvailableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAvailable = e.target.checked;
    onAvailabilityChange(date, { 
      available: isAvailable, 
      hosting: isAvailable ? dayAvailability.hosting : false 
    });
  };

  const handleHostingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAvailabilityChange(date, { 
      available: true, 
      hosting: e.target.checked 
    });
  };

  return (
    <div className="flex-shrink-0 w-48 bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center border-2 border-transparent has-[:checked]:border-mahjong-green transition-all">
      <div className="font-bold text-gray-800">{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
      <div className="text-sm text-gray-500 mb-4">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      <div className="space-y-3 flex flex-col items-start">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 rounded text-mahjong-green focus:ring-mahjong-gold"
            checked={dayAvailability.available}
            onChange={handleAvailableChange}
          />
          <span className="font-medium">Available</span>
        </label>
        <label className={`flex items-center space-x-2 transition-opacity ${dayAvailability.available ? 'cursor-pointer opacity-100' : 'opacity-50 cursor-not-allowed'}`}>
          <input
            type="checkbox"
            className="h-5 w-5 rounded text-mahjong-gold focus:ring-yellow-500"
            checked={dayAvailability.hosting}
            onChange={handleHostingChange}
            disabled={!dayAvailability.available}
          />
          <span className="font-medium">Willing to Host</span>
        </label>
      </div>
    </div>
  )
}

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  player,
  dates,
  availability,
  setPlayerAvailability,
  onSchedule,
  isLoading,
}) => {
  const handleAvailabilityChange = (date: string, newAvail: DayAvailability) => {
    setPlayerAvailability({
      ...availability,
      [date]: newAvail,
    });
  };

  return (
    <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="flex items-center mb-4">
        <CalendarIcon className="h-6 w-6 text-mahjong-green" />
        <h2 className="text-2xl font-bold ml-2 text-gray-800">Your Weekly Availability</h2>
      </div>
      <p className="text-gray-600 mb-6">Select the days you are available to play and if you're willing to host.</p>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {dates.map(date => (
          <DayCard 
            key={date}
            date={date}
            dayAvailability={availability?.[date] ?? { available: false, hosting: false }}
            onAvailabilityChange={handleAvailabilityChange}
          />
        ))}
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">Once everyone has set their availability, generate the schedule for the week.</p>
        <button
          onClick={onSchedule}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center bg-mahjong-green hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <LoadingIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Scheduling...
            </>
          ) : (
            'Create Schedule'
          )}
        </button>
      </div>
    </section>
  );
};

export default AvailabilitySelector;
