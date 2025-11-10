import { GoogleGenAI } from "@google/genai";
import type { Game } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

export async function generateAnnouncement(game: Game): Promise<string> {
    if (!API_KEY) {
        return "The Mah Jong game is on! Get ready for a fun time with your friends.";
    }
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
    throw new Error("Failed to generate announcement.");
  }
}
