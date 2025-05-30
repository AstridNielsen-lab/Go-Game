import React, { useState, useEffect } from 'react';
import { Share2, Users, Copy, ExternalLink, Loader, Info, Power, PowerOff, AlertCircle, CheckCircle2, Server } from 'lucide-react';

interface MultiplayerControlsProps {
  onJoinGame: (gameId: string, port: number) => void;
  onCreateGame: (port: number) => void;
  gameId?: string;
}

interface ConnectionLog {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
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
  const [showInfo, setShowInfo] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [serverStatus, setServerStatus] = useState<'offline' | 'starting' | 'online' | 'error'>('offline');
  const [selectedPort, setSelectedPort] = useState(() => {
    const savedPort = localStorage.getItem('selectedPort');
    return savedPort ? parseInt(savedPort) : 3001;
  });

  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setConnectionLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  useEffect(() => {
    const savedGameId = localStorage.getItem('gameId');
    const savedPort = localStorage.getItem('selectedPort');
    if (savedGameId && savedPort) {
      onJoinGame(savedGameId, parseInt(savedPort));
      addLog(`Reconnecting to previous session (Port: ${savedPort})`, 'info');
    }

    // Set up socket connection for waiting room updates
    if (isWaiting) {
      addLog('Connecting to waiting room...', 'info');
      const socket = new WebSocket(`ws://localhost:${selectedPort}`);
      
      socket.onopen = () => {
        addLog('Connected to waiting room successfully', 'success');
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'waiting_players_updated') {
          setWaitingPlayers(data.players);
          addLog(`Players in waiting room updated: ${data.players.join(', ')}`, 'info');
        } else if (data.type === 'game_ready') {
          setIsWaiting(false);
          onJoinGame(GAME_ID, selectedPort);
          addLog('Game is ready to start!', 'success');
        }
      };

      socket.onerror = (error) => {
        addLog(`WebSocket error: ${error.type}`, 'error');
        setServerStatus('error');
      };

      socket.onclose = () => {
        addLog('Disconnected from waiting room', 'info');
      };

      return () => socket.close();
    }
  }, [isWaiting, selectedPort]);

  const startServerAndCreateGame = async () => {
    try {
      setServerStatus('starting');
      addLog('Starting game server...', 'info');
      localStorage.setItem('selectedPort', selectedPort.toString());
      const response = await fetch(`http://localhost:3000/start-server?port=${selectedPort}`);
      const data = await response.json();
      
      if (data.status === 'Server started') {
        setServerStarted(true);
        setIsWaiting(true);
        setServerStatus('online');
        addLog('Game server started successfully', 'success');
        onCreateGame(selectedPort);
      }
    } catch (error) {
      setServerStatus('error');
      addLog(`Failed to start server: ${error}`, 'error');
      console.error('Failed to start server:', error);
    }
  };

  const stopServer = async () => {
    try {
      addLog('Stopping game server...', 'info');
      const response = await fetch(`http://localhost:3000/stop-server?port=${selectedPort}`);
      const data = await response.json();
      
      if (data.status === 'Server stopped') {
        setServerStarted(false);
        setIsWaiting(false);
        setWaitingPlayers([]);
        setServerStatus('offline');
        addLog('Game server stopped successfully', 'success');
      }
    } catch (error) {
      addLog(`Failed to stop server: ${error}`, 'error');
      console.error('Failed to stop server:', error);
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinGameId === GAME_ID) {
      const randomPort = AVAILABLE_PORTS[Math.floor(Math.random() * AVAILABLE_PORTS.length)];
      setSelectedPort(randomPort);
      setIsWaiting(true);
      addLog(`Joining game with ID: ${GAME_ID}`, 'info');
      onJoinGame(GAME_ID, randomPort);
      setShowJoinInput(false);
      setJoinGameId('');
    } else {
      addLog('Invalid game ID. Please use GO2025', 'error');
      alert('ID do jogo inválido. Use GO2025 para entrar.');
    }
  };

  const copyGameLink = () => {
    if (gameId) {
      const gameUrl = `${window.location.origin}?game=${gameId}&port=${selectedPort}`;
      navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      addLog('Game link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {/* Server Status Card */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Server className={`${
            serverStatus === 'online' ? 'text-green-500' :
            serverStatus === 'starting' ? 'text-yellow-500' :
            serverStatus === 'error' ? 'text-red-500' :
            'text-gray-500'
          }`} />
          <h3 className="text-white font-semibold">Server Status</h3>
        </div>
        <div className="text-sm text-white/70">
          <p>Status: {serverStatus.charAt(0).toUpperCase() + serverStatus.slice(1)}</p>
          <p>Port: {selectedPort}</p>
          <p>Players Online: {waitingPlayers.length}</p>
        </div>
      </div>

      {/* Connection Logs */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl max-h-48 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <Info className="text-blue-500" />
          <h3 className="text-white font-semibold">Connection Logs</h3>
        </div>
        <div className="space-y-2">
          {connectionLogs.map((log, index) => (
            <div key={index} className={`text-sm flex items-start gap-2 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              'text-white/70'
            }`}>
              <span className="text-xs opacity-50">{log.timestamp}</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {showInfo && (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl max-w-md">
          <h3 className="text-white font-semibold mb-2">Como Jogar Online</h3>
          <ul className="text-white/80 text-sm space-y-2">
            <li>1. O primeiro jogador deve clicar em "Criar Jogo Online"</li>
            <li>2. O segundo jogador clica em "Entrar em Jogo"</li>
            <li>3. Digite o ID do jogo: GO2025</li>
            <li>4. Aguarde na sala de espera</li>
            <li>5. Selecione um jogador para iniciar a partida</li>
          </ul>
          <button 
            onClick={() => setShowInfo(false)}
            className="mt-3 text-sm text-white/60 hover:text-white"
          >
            Fechar
          </button>
        </div>
      )}

      {isWaiting && (
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Loader className="animate-spin text-blue-500" size={20} />
            <h3 className="text-white">Sala de Espera</h3>
          </div>
          {waitingPlayers.length > 0 ? (
            <div className="mb-3">
              <p className="text-sm text-white/70 mb-2">Jogadores disponíveis:</p>
              <div className="space-y-2">
                {waitingPlayers.map((player, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-white/5 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-blue-400" />
                      <span className="text-white/70">{player}</span>
                    </div>
                    <button
                      onClick={() => onJoinGame(GAME_ID, selectedPort)}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Jogar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/50 mb-3">Aguardando jogadores...</p>
          )}
          <p className="text-sm text-white/50">ID do Jogo: {GAME_ID}</p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={stopServer}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors"
            >
              <PowerOff size={16} />
              Parar Servidor
            </button>
          </div>
        </div>
      )}

      {!gameId && !isWaiting && (
        <>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            <Info size={20} />
            <span>Como Jogar Online</span>
          </button>

          <button
            onClick={startServerAndCreateGame}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
            disabled={serverStarted}
          >
            <Share2 size={20} />
            <span>{serverStarted ? 'Servidor Ativo' : 'Criar Jogo Online'}</span>
          </button>

          <button
            onClick={() => setShowJoinInput(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
          >
            <Users size={20} />
            <span>Entrar em Jogo</span>
          </button>

          {serverStarted && (
            <button
              onClick={stopServer}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
            >
              <PowerOff size={20} />
              <span>Parar Servidor</span>
            </button>
          )}
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
            <button
              onClick={stopServer}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
            >
              <PowerOff size={20} />
              <span>Parar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerControls;