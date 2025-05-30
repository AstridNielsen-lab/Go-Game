import React, { useState, useEffect } from 'react';
import { Share2, Users, Copy, ExternalLink } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

interface MultiplayerControlsProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: () => void;
  gameId?: string;
}

const AVAILABLE_PORTS = [3001, 3002, 3003, 3004, 3005];

const MultiplayerControls: React.FC<MultiplayerControlsProps> = ({
  onJoinGame,
  onCreateGame,
  gameId
}) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverStarted, setServerStarted] = useState(false);
  const [selectedPort, setSelectedPort] = useState(() => {
    const savedPort = localStorage.getItem('selectedPort');
    return savedPort ? parseInt(savedPort) : 3001;
  });
  const [showPortSelection, setShowPortSelection] = useState(false);

  useEffect(() => {
    // Load saved game data
    const savedGameId = localStorage.getItem('gameId');
    if (savedGameId) {
      onJoinGame(savedGameId);
    }
  }, []);

  useEffect(() => {
    // Save game ID when it changes
    if (gameId) {
      localStorage.setItem('gameId', gameId);
    }
  }, [gameId]);

  const startServerAndCreateGame = async () => {
    try {
      localStorage.setItem('selectedPort', selectedPort.toString());
      await fetch(`http://localhost:${selectedPort}/start-server`);
      setServerStarted(true);
      onCreateGame();
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  };

  const handleCreateGame = () => {
    if (!serverStarted) {
      setShowPortSelection(true);
    } else {
      onCreateGame();
    }
  };

  const handlePortSelection = (port: number) => {
    setSelectedPort(port);
    setShowPortSelection(false);
    startServerAndCreateGame();
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
      const gameUrl = `${window.location.origin}?game=${gameId}&port=${selectedPort}`;
      navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {showPortSelection && (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
          <h3 className="text-white mb-3">Selecione uma porta para o servidor:</h3>
          <div className="grid grid-cols-3 gap-2">
            {AVAILABLE_PORTS.map(port => (
              <button
                key={port}
                onClick={() => handlePortSelection(port)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition-colors"
              >
                Porta {port}
              </button>
            ))}
          </div>
        </div>
      )}

      {!gameId && !showPortSelection && (
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
          <p className="text-white/70 text-sm mb-2">Porta: {selectedPort}</p>
          <div className="flex gap-2">
            <button
              onClick={copyGameLink}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <Copy size={20} />
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
            <a
              href={`${window.location.origin}?game=${gameId}&port=${selectedPort}`}
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