import type { Game } from '../types';

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateIcsFile(game: Game): void {
  // Assume a default game time, e.g., 7:00 PM in the user's local timezone.
  // A more robust implementation might allow setting a time.
  const gameDate = new Date(game.date + 'T19:00:00'); 
  const startTime = new Date(gameDate);
  // Assume a 3-hour duration
  const endTime = new Date(gameDate.getTime() + 3 * 60 * 60 * 1000);

  const formatPlayerList = (players: typeof game.players) => players.map(p => p.name).join(', ');
  
  let description = `Players: ${formatPlayerList(game.players)}.`;
  if (game.waitlist.length > 0) {
    description += `\\nWaitlist: ${formatPlayerList(game.waitlist)}.`;
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MahJongMaven//EN',
    'BEGIN:VEVENT',
    `UID:${game.date}-${game.host.id}@mahjongmaven.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startTime)}`,
    `DTEND:${formatIcsDate(endTime)}`,
    'SUMMARY:Mah Jong Game',
    `LOCATION:Hosted by ${game.host.name}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `mahjong-game-${game.date}.ics`);
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
