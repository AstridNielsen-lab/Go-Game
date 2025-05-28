import React, { useState } from 'react';

interface PlayerNameScreenProps {
  onSubmit: (name: string) => void;
}

const PlayerNameScreen: React.FC<PlayerNameScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
      <form 
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl text-white"
      >
        <h2 className="text-3xl font-serif mb-6 text-center">Bem-vindo ao Go</h2>
        <div className="mb-6">
          <label htmlFor="playerName" className="block mb-2 text-sm font-medium">
            Digite seu nome:
          </label>
          <input
            type="text"
            id="playerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 rounded border border-white/30 focus:border-white/50 focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Começar
        </button>
      </form>
    </div>
  );
};

export default PlayerNameScreen;