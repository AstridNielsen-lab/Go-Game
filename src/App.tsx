import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import GameControls from './components/GameControls';
import ScorePanel from './components/ScorePanel';
import AITeacher from './components/AITeacher';
import Footer from './components/Footer';
import { BoardState, Position } from './types/gameTypes';
import { createInitialBoardState, playMove, passTurn, resignGame, isValidMove } from './utils/gameLogic';
import { generateBestMove } from './utils/aiLogic';

function App() {
  const [boardState, setBoardState] = useState<BoardState>(createInitialBoardState(19));
  const [playingWithAI, setPlayingWithAI] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setBoardState(prevState => ({ ...prevState }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (playingWithAI && boardState.currentPlayer === 'white' && !boardState.gameOver) {
      handleAIMove();
    }
  }, [boardState.currentPlayer, playingWithAI]);
  
  const handlePlaceStone = (position: Position) => {
    if (boardState.gameOver || isAIThinking) return;
    if (playingWithAI && boardState.currentPlayer === 'white') return;
    
    if (isValidMove(boardState, position)) {
      const newBoardState = playMove(boardState, position);
      setBoardState(newBoardState);
    }
  };

  const handleAIMove = async () => {
    setIsAIThinking(true);
    
    // AI will make its move after a short delay
    setTimeout(() => {
      if (boardState.currentPlayer === 'white' && !boardState.gameOver) {
        const aiMove = generateBestMove(boardState);
        
        if (aiMove) {
          const newBoardState = playMove(boardState, aiMove);
          setBoardState(newBoardState);
        } else {
          // If no good move is found, AI passes
          handlePass();
        }
      }
      setIsAIThinking(false);
    }, 1000);
  };
  
  const handlePass = () => {
    const newBoardState = passTurn(boardState);
    setBoardState(newBoardState);
  };
  
  const handleResign = () => {
    const newBoardState = resignGame(boardState);
    setBoardState(newBoardState);
    setPlayingWithAI(false);
  };
  
  const handleRestart = () => {
    setBoardState(createInitialBoardState(boardState.boardSize));
    setPlayingWithAI(false);
    setIsAIThinking(false);
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
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 game-title">Go (Baduk)</h1>
          
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
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <Board 
                  boardState={boardState} 
                  onPlaceStone={handlePlaceStone}
                  isAIThinking={isAIThinking}
                />
              </div>
            </div>
            
            <div className="order-first lg:order-last pb-4 lg:pb-0">
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-3 text-center game-title">Instruções</h2>
                <p className="text-gray-700 mb-2">
                  Go é um jogo de tabuleiro milenar que se originou na China há mais de 2.500 anos.
                  O objetivo é cercar mais território que seu oponente.
                </p>
                <p className="text-gray-700 mb-2">
                  Como jogar:
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  <li>Coloque pedras nas interseções do tabuleiro</li>
                  <li>Capture as pedras do oponente cercando-as completamente</li>
                  <li>Crie territórios cercando espaços vazios</li>
                  <li>Pretas jogam primeiro</li>
                  <li>Passe sua vez quando não houver bons movimentos</li>
                  <li>O jogo termina quando ambos os jogadores passarem consecutivamente</li>
                </ul>
              </div>
              
              <AITeacher boardState={boardState} />
              
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