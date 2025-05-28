import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface GameTimerProps {
  isRunning: boolean;
}

const GameTimer: React.FC<GameTimerProps> = ({ isRunning }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-white/80">
      <Clock size={20} />
      <span className="font-mono">{formatTime(seconds)}</span>
    </div>
  );
};

export default GameTimer;