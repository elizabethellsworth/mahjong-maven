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

export async function generateAnnouncement(game: Game): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured. Please ensure it is set in the environment variables.");
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
        throw new Error("No text returned from API. The response may have been blocked due to safety settings.");
    }
    return text.trim();

  } catch (error) {
    console.error("Error generating announcement with Gemini API:", error);
    if (error instanceof Error) {
        // The Gemini API often returns helpful error messages. We'll pass them along.
        throw new Error(error.message);
    }
    // Fallback for non-Error objects being thrown.
    throw new Error("An unexpected error occurred while communicating with the API.");
  }
}
