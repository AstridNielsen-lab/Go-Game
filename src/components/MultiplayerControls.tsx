import React, { useState, useEffect } from 'react';
import { Share2, Users, Copy, ExternalLink } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

interface MultiplayerControlsProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: () => void;
  gameId?: string;
}

const MultiplayerControls: React.FC<MultiplayerControlsProps> = ({
  onJoinGame,
  onCreateGame,
  gameId
}) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverStarted, setServerStarted] = useState(false);

  const startServerAndCreateGame = async () => {
    try {
      // Start the server
      await fetch('http://localhost:3001/start-server');
      setServerStarted(true);
      // Create the game
      onCreateGame();
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  };

  const handleCreateGame = () => {
    if (!serverStarted) {
      startServerAndCreateGame();
    } else {
      onCreateGame();
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameId.trim()) {
      onJoinGame(joinGameId.trim());
      setShowJoinInput(false);
      setJoinGameId('');
    }
  };

  const copyGameLink = () => {
    if (gameId) {
      navigator.clipboard.writeText(`${window.location.origin}?game=${gameId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {!gameId && (
        <>
          <button
            onClick={handleCreateGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            <Share2 size={20} />
            <span>Criar Jogo Online</span>
          </button>

          <button
            onClick={() => setShowJoinInput(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            <Users size={20} />
            <span>Entrar em Jogo</span>
          </button>
        </>
      )}

      {showJoinInput && (
        <form
          onSubmit={handleJoinGame}
          className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl"
        >
          <input
            type="text"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
            placeholder="Digite o ID do jogo"
            className="w-full px-3 py-2 bg-white/20 rounded border border-white/30 text-white placeholder-white/50 mb-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex-1 transition-colors"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setShowJoinInput(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {gameId && (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
          <p className="text-white mb-2">ID do Jogo: {gameId}</p>
          <div className="flex gap-2">
            <button
              onClick={copyGameLink}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Copy size={20} />
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
            <a
              href={`${window.location.origin}?game=${gameId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <ExternalLink size={20} />
              <span>Abrir</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerControls;