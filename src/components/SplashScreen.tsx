import React, { useEffect, useState } from 'react';
import { useSound } from 'use-sound';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [play] = useSound('/sounds/gong.mp3');

  useEffect(() => {
    play();
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, play]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-black text-white
                 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <h1 className="text-6xl font-bold mb-8 font-serif tracking-wider">Go Game</h1>
      <p className="text-xl italic">por Julio Campos Machado</p>
    </div>
  );
};

export default SplashScreen;