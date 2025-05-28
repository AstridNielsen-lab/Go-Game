import React from 'react';
import { ScrollText } from 'lucide-react';

interface GameLog {
  player: string;
  move: string;
  timestamp: string;
}

interface GameLogsProps {
  logs: GameLog[];
}

const GameLogs: React.FC<GameLogsProps> = ({ logs }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={20} className="text-white/80" />
        <h3 className="text-lg font-medium text-white/80">Histórico de Jogadas</h3>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className="text-sm text-white/70 mb-2 pb-2 border-b border-white/10"
          >
            <span className="font-medium">{log.player}</span>
            <span className="mx-2">→</span>
            <span>{log.move}</span>
            <span className="float-right text-xs opacity-50">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameLogs;