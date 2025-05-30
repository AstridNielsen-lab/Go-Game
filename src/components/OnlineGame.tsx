import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, Server, Info, AlertCircle } from 'lucide-react';

interface OnlineGameProps {
  onBack: () => void;
  onJoinGame: (gameId: string, port: number) => void;
  playerName: string;
}

interface ServerInfo {
  status: 'online' | 'offline' | 'unknown';
  players: number;
  port: number;
}

const AVAILABLE_PORTS = [3002, 3003, 3004, 3005, 3001, 7777, 8080, 8081];
const GAME_ID = 'GO2025';

const OnlineGame: React.FC<OnlineGameProps> = ({ onBack, onJoinGame, playerName }) => {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinGameId, setJoinGameId] = useState(GAME_ID);
  const [selectedPort, setSelectedPort] = useState(AVAILABLE_PORTS[0]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const checkServers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate checking available servers
        const availableServers: ServerInfo[] = await Promise.all(
          AVAILABLE_PORTS.map(async (port) => {
            try {
              // In a real implementation, you would make an actual request to check server status
              // This is a simulation for demonstration purposes
              const isOnline = Math.random() > 0.3; // 70% chance server is online
              
              return {
                status: isOnline ? 'online' : 'offline',
                players: isOnline ? Math.floor(Math.random() * 5) : 0,
                port
              };
            } catch {
              return {
                status: 'unknown',
                players: 0,
                port
              };
            }
          })
        );
        
        setServers(availableServers.filter(server => server.status === 'online'));
      } catch (err) {
        setError('Não foi possível verificar os servidores disponíveis. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkServers();
    
    // Refresh server status every 30 seconds
    const interval = setInterval(checkServers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleJoinGame = (port: number) => {
    onJoinGame(joinGameId, port);
  };

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    onJoinGame(joinGameId, selectedPort);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 animate-universe-bg" />
      </div>
      
      <main className="relative flex-grow py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button 
              onClick={onBack}
              className="mr-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white font-serif tracking-wider">Jogo Online</h1>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="ml-auto bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            >
              <Info size={20} />
            </button>
          </div>
          
          {showInfo && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl mb-6">
              <h2 className="text-xl font-semibold mb-4 text-white font-serif">Como Jogar Online</h2>
              <div className="text-white/80 space-y-3">
                <p>
                  Para jogar Go online, você precisa se conectar a um servidor disponível:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Escolha um servidor da lista abaixo com jogadores online</li>
                  <li>Clique em "Conectar" para entrar na sala de espera</li>
                  <li>Aguarde outro jogador ou convide um amigo compartilhando o ID do jogo: <span className="font-semibold text-white">{GAME_ID}</span></li>
                  <li>Quando outro jogador se conectar, o jogo começará automaticamente</li>
                </ol>
              </div>
            </div>
          )}
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white font-serif">Servidores Disponíveis</h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-900/40 text-red-200 p-4 rounded-lg flex items-start gap-3 mb-4">
                <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                <p className="mb-4">Nenhum servidor online encontrado</p>
                <button 
                  onClick={() => setIsLoading(true)}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition-colors"
                >
                  Atualizar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {servers.map((server) => (
                  <div 
                    key={server.port}
                    className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <h3 className="text-white font-medium">Servidor {server.port}</h3>
                      </div>
                      <p className="text-white/60 text-sm mt-1">
                        {server.players} jogador{server.players !== 1 ? 'es' : ''} online
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinGame(server.port)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
                    >
                      <Users size={18} />
                      <span>Conectar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-white font-serif">Conexão Manual</h2>
            <form onSubmit={handleManualJoin} className="space-y-4">
              <div>
                <label htmlFor="game-id" className="block text-white/80 mb-2">ID do Jogo</label>
                <input
                  id="game-id"
                  type="text"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 rounded border border-white/30 focus:border-white/50 focus:outline-none text-white"
                />
              </div>
              
              <div>
                <label htmlFor="port" className="block text-white/80 mb-2">Porta do Servidor</label>
                <select
                  id="port"
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/20 rounded border border-white/30 focus:border-white/50 focus:outline-none text-white"
                >
                  {AVAILABLE_PORTS.map(port => (
                    <option key={port} value={port}>
                      {port}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded transition-colors"
              >
                Conectar Manualmente
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnlineGame;

