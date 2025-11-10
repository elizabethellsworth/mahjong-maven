import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface ApiKeyModalProps {
  onSetApiKey: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSetApiKey }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSetApiKey(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-mahjong-ivory z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="p-6 text-center">
          <SparklesIcon className="h-12 w-12 text-mahjong-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Mah Jong Maven</h2>
          <p className="text-gray-600 mt-2">
            To enable witty game announcements, please enter your Google AI API key.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Google AI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-mahjong-green focus:border-mahjong-green sm:text-sm"
              placeholder="Enter your API key"
              required
            />
             <p className="mt-2 text-xs text-gray-500">
              Your key is stored securely in your browser's local storage.
            </p>
          </div>
          <button
            type="submit"
            disabled={!key.trim()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-mahjong-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mahjong-green disabled:bg-gray-400"
          >
            Save & Start Scheduling
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
