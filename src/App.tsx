import React, { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import Board from './components/Board';
import GameControls from './components/GameControls';
import ScorePanel from './components/ScorePanel';
import AITeacher from './components/AITeacher';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import PlayerNameScreen from './components/PlayerNameScreen';
import GameTimer from './components/GameTimer';
import GameLogs from './components/GameLogs';
import { BoardState, Position } from './types/gameTypes';
import { createInitialBoardState, playMove, passTurn, resignGame, isValidMove } from './utils/gameLogic';
import { generateBestMove } from './utils/aiLogic';
import { saveGameState, loadGameState, GameState } from './utils/storage';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showNameScreen, setShowNameScreen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [boardState, setBoardState] = useState<BoardState>(createInitialBoardState(19));
  const [playingWithAI, setPlayingWithAI] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameLogs, setGameLogs] = useState<{ player: string; move: string; timestamp: string; }[]>([]);
  const [play] = useSound('/sounds/stone.mp3');
  
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      setPlayerName(savedState.playerName);
      setBoardState(prevState => ({
        ...prevState,
        stones: savedState.stones,
        currentPlayer: savedState.currentPlayer,
      }));
      setGameLogs(savedState.logs);
    }
  }, []);

  useEffect(() => {
    if (playerName && boardState.stones.length > 0) {
      const gameState: GameState = {
        playerName,
        stones: boardState.stones,
        currentPlayer: boardState.currentPlayer,
        logs: gameLogs,
      };
      saveGameState(gameState);
    }
  }, [boardState, playerName, gameLogs]);

  useEffect(() => {
    if (playingWithAI && boardState.currentPlayer === 'white' && !boardState.gameOver) {
      handleAIMove();
    }
  }, [boardState.currentPlayer, playingWithAI]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowNameScreen(true);
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setShowNameScreen(false);
  };

  const addGameLog = (move: string) => {
    const newLog = {
      player: boardState.currentPlayer === 'black' ? playerName : 'AI',
      move,
      timestamp: new Date().toLocaleTimeString(),
    };
    setGameLogs(prev => [...prev, newLog]);
  };
  
  const handlePlaceStone = (position: Position) => {
    if (boardState.gameOver || isAIThinking) return;
    if (playingWithAI && boardState.currentPlayer === 'white') return;
    
    if (isValidMove(boardState, position)) {
      play();
      const newBoardState = playMove(boardState, position);
      setBoardState(newBoardState);
      addGameLog(`(${position.x}, ${position.y})`);
    }
  };

  const handleAIMove = async () => {
    setIsAIThinking(true);
    
    setTimeout(() => {
      if (boardState.currentPlayer === 'white' && !boardState.gameOver) {
        const aiMove = generateBestMove(boardState);
        
        if (aiMove) {
          play();
          const newBoardState = playMove(boardState, aiMove);
          setBoardState(newBoardState);
          addGameLog(`(${aiMove.x}, ${aiMove.y})`);
        } else {
          handlePass();
        }
      }
      setIsAIThinking(false);
    }, 1000);
  };
  
  const handlePass = () => {
    const newBoardState = passTurn(boardState);
    setBoardState(newBoardState);
    addGameLog('PASS');
  };
  
  const handleResign = () => {
    const newBoardState = resignGame(boardState);
    setBoardState(newBoardState);
    setPlayingWithAI(false);
    addGameLog('RESIGN');
  };
  
  const handleRestart = () => {
    setBoardState(createInitialBoardState(boardState.boardSize));
    setPlayingWithAI(false);
    setIsAIThinking(false);
    setGameLogs([]);
  };
  
  const handleChangeBoardSize = (size: number) => {
    if (boardState.stones.length > 0 && !boardState.gameOver) {
      if (!confirm('Mudar o tamanho do tabuleiro iniciará um novo jogo. Continuar?')) {
        return;
      }
    }
    
    setBoardState(createInitialBoardState(size));
    setPlayingWithAI(false);
    setIsAIThinking(false);
    setGameLogs([]);
  };

  const toggleAIPlay = () => {
    if (!playingWithAI && boardState.stones.length > 0) {
      if (!confirm('Iniciar um novo jogo com a IA?')) {
        return;
      }
      handleRestart();
    }
    setPlayingWithAI(!playingWithAI);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showNameScreen) {
    return <PlayerNameScreen onSubmit={handleNameSubmit} />;
  }

  const renderSpaceParticles = () => {
    return Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="space-particle"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
        }}
      />
    ));
  };
  
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 animate-universe-bg" />
        {renderSpaceParticles()}
      </div>
      
      <main className="relative flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-center text-white font-serif tracking-wider">Go (Baduk)</h1>
            <GameTimer isRunning={!boardState.gameOver} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GameControls 
                onPass={handlePass}
                onResign={handleResign}
                onRestart={handleRestart}
                onChangeSize={handleChangeBoardSize}
                currentBoardSize={boardState.boardSize}
                currentPlayer={boardState.currentPlayer}
                gameOver={boardState.gameOver}
                playingWithAI={playingWithAI}
                onToggleAI={toggleAIPlay}
                isAIThinking={isAIThinking}
              />
              
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-xl">
                <Board 
                  boardState={boardState} 
                  onPlaceStone={handlePlaceStone}
                  isAIThinking={isAIThinking}
                />
              </div>
            </div>
            
            <div className="order-first lg:order-last space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-md p-4 rounded-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-3 text-center text-white font-serif">Instruções</h2>
                <div className="text-white/80">
                  <p className="mb-2">
                    Go é um jogo de tabuleiro milenar que se originou na China há mais de 2.500 anos.
                    O objetivo é cercar mais território que seu oponente.
                  </p>
                  <p className="mb-2">Como jogar:</p>
                  <ul className="list-disc pl-5">
                    <li>Coloque pedras nas interseções do tabuleiro</li>
                    <li>Capture as pedras do oponente cercando-as completamente</li>
                    <li>Crie territórios cercando espaços vazios</li>
                    <li>Pretas jogam primeiro</li>
                    <li>Passe sua vez quando não houver bons movimentos</li>
                    <li>O jogo termina quando ambos os jogadores passarem consecutivamente</li>
                  </ul>
                </div>
              </div>
              
              <AITeacher boardState={boardState} />
              <GameLogs logs={gameLogs} />
              <ScorePanel boardState={boardState} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;