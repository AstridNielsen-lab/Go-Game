import React, { useState, useEffect } from 'react';
import { Share2, Users, Copy, ExternalLink, Loader } from 'lucide-react';

interface MultiplayerControlsProps {
  onJoinGame: (gameId: string, port: number) => void;
  onCreateGame: (port: number) => void;
  gameId?: string;
}

const AVAILABLE_PORTS = [3001, 3002, 3003, 3004, 3005];
const GAME_ID = 'GO2025';

const MultiplayerControls: React.FC<MultiplayerControlsProps> = ({
  onJoinGame,
  onCreateGame,
  gameId
}) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');
  const [copied, setCopied] = useState(false);
  const [serverStarted, setServerStarted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingPlayers, setWaitingPlayers] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState(() => {
    const savedPort = localStorage.getItem('selectedPort');
    return savedPort ? parseInt(savedPort) : 3001;
  });

  useEffect(() => {
    const savedGameId = localStorage.getItem('gameId');
    const savedPort = localStorage.getItem('selectedPort');
    if (savedGameId && savedPort) {
      onJoinGame(savedGameId, parseInt(savedPort));
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      localStorage.setItem('gameId', gameId);
    }
  }, [gameId]);

  const startServerAndCreateGame = async () => {
    try {
      localStorage.setItem('selectedPort', selectedPort.toString());
      await fetch(`http://localhost:3000/start-server?port=${selectedPort}`);
      setServerStarted(true);
      setIsWaiting(true);
      onCreateGame(selectedPort);
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameId === GAME_ID) {
      const randomPort = AVAILABLE_PORTS[Math.floor(Math.random() * AVAILABLE_PORTS.length)];
      setSelectedPort(randomPort);
      onJoinGame(GAME_ID, randomPort);
      setShowJoinInput(false);
      setJoinGameId('');
      setIsWaiting(true);
    } else {
      alert('ID do jogo inválido. Use GO2025 para entrar.');
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
      {isWaiting && (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Loader className="animate-spin text-blue-500\" size={20} />
            <h3 className="text-white">Aguardando jogadores...</h3>
          </div>
          {waitingPlayers.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-white/70">Jogadores na fila:</p>
              <ul className="list-disc list-inside">
                {waitingPlayers.map((player, index) => (
                  <li key={index} className="text-white/70">{player}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-white/50">ID do Jogo: {GAME_ID}</p>
        </div>
      )}

      {!gameId && !isWaiting && (
        <>
          <button
            onClick={startServerAndCreateGame}
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
            placeholder="Digite GO2025 para entrar"
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
          <p className="text-white mb-2">ID do Jogo: {GAME_ID}</p>
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