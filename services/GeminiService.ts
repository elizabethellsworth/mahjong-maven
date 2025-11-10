import { GoogleGenAI } from "@google/genai";
import type { Game } from '../types';

function createPrompt(game: Game): string {
  const playerNames = game.players.map(p => p.name).join(', ');
  const date = new Date(game.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    You are a fun and witty social coordinator for a group of ladies who play Mah Jong. 
    Your task is to write a short, exciting, and friendly announcement for an upcoming game.
    
    Here are the details for the game:
    - Date: ${date}
    - Host: ${game.host.name}
    - Players: ${playerNames}
    
    Make the announcement sound fun and personal. Mention the host and the players. 
    Do not use emojis. Keep it to 2-3 short sentences.
  `;
}

export async function generateAnnouncement(game: Game, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error("API key is missing.");
  }
  // Create a new instance for each call with the provided key.
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createPrompt(game),
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("No text returned from API.");
    }
    return text.trim();

  } catch (error) {
    console.error("Error generating announcement with Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The provided API key is not valid. Please check and re-enter it.");
    }
    throw new Error("Failed to generate announcement due to a network or API error.");
  }
}
