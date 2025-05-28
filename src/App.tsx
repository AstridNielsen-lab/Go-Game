import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import GameControls from './components/GameControls';
import ScorePanel from './components/ScorePanel';
import AITeacher from './components/AITeacher';
<<<<<<< HEAD
=======
import Footer from './components/Footer';
>>>>>>> f1dc1d3 (Commit inicial do projeto Go Game)
import { BoardState, Position } from './types/gameTypes';
import { createInitialBoardState, playMove, passTurn, resignGame } from './utils/gameLogic';

function App() {
  const [boardState, setBoardState] = useState<BoardState>(createInitialBoardState(19));
  
  useEffect(() => {
    const handleResize = () => {
      setBoardState(prevState => ({ ...prevState }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handlePlaceStone = (position: Position) => {
    if (boardState.gameOver) return;
    
    const newBoardState = playMove(boardState, position);
    setBoardState(newBoardState);
  };
  
  const handlePass = () => {
    const newBoardState = passTurn(boardState);
    setBoardState(newBoardState);
  };
  
  const handleResign = () => {
    const newBoardState = resignGame(boardState);
    setBoardState(newBoardState);
  };
  
  const handleRestart = () => {
    setBoardState(createInitialBoardState(boardState.boardSize));
  };
  
  const handleChangeBoardSize = (size: number) => {
    if (boardState.stones.length > 0 && !boardState.gameOver) {
      if (!confirm('Mudar o tamanho do tabuleiro iniciará um novo jogo. Continuar?')) {
        return;
      }
    }
    
    setBoardState(createInitialBoardState(size));
  };
  
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-100 py-8 px-4">
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
            />
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <Board 
                boardState={boardState} 
                onPlaceStone={handlePlaceStone} 
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
            
            <AITeacher 
              boardState={boardState}
              onPlayMove={handlePlaceStone}
            />
            
            <ScorePanel boardState={boardState} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
=======
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
              />
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <Board 
                  boardState={boardState} 
                  onPlaceStone={handlePlaceStone} 
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
              
              <AITeacher 
                boardState={boardState}
                onPlayMove={handlePlaceStone}
              />
              
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
>>>>>>> f1dc1d3 (Commit inicial do projeto Go Game)
