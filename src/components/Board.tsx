import React, { useState, useLayoutEffect, useRef } from 'react';
import Stone from './Stone';
import { BoardState, Position } from '../types/gameTypes';
import { getStoneAt, isValidMove } from '../utils/gameLogic';

interface BoardProps {
  boardState: BoardState;
  onPlaceStone: (pos: Position) => void;
}

const Board: React.FC<BoardProps> = ({ boardState, onPlaceStone }) => {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [boardSizePixels, setBoardSizePixels] = useState<number>(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateBoardSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.95;
      setBoardSizePixels(size);
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  const cellSize = boardSizePixels / boardState.boardSize;

  const handleIntersectionClick = (x: number, y: number) => {
    if (isValidMove(boardState, { x, y })) {
      onPlaceStone({ x, y });
    }
  };

  const isLastPlayed = (x: number, y: number) => {
    return boardState.lastMove?.x === x && boardState.lastMove?.y === y;
  };

  const isHoshiPoint = (x: number, y: number, boardSize: number): boolean => {
    const hoshiPointsMap: { [key: number]: number[] } = {
      9: [2, 4, 6],
      13: [3, 6, 9],
      19: [3, 9, 15],
    };
    const hoshi = hoshiPointsMap[boardSize] || [];
    return hoshi.includes(x) && hoshi.includes(y);
  };

  const renderIntersection = (x: number, y: number) => {
    const stone = getStoneAt(boardState.stones, x, y);
    const isHovered = hoveredPosition?.x === x && hoveredPosition?.y === y && !stone;
    const stoneSize = cellSize * 0.9;
    const isStarPoint = isHoshiPoint(x, y, boardState.boardSize);

    return (
      <div
        key={`${x}-${y}`}
        className="intersection"
        style={{
          width: cellSize,
          height: cellSize,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={() => handleIntersectionClick(x, y)}
        onMouseEnter={() => setHoveredPosition({ x, y })}
        onMouseLeave={() => setHoveredPosition(null)}
      >
        {/* Linhas do tabuleiro */}
        <div
          style={{
            position: 'absolute',
            width: x === 0 ? '50%' : x === boardState.boardSize - 1 ? '50%' : '100%',
            height: '1px',
            backgroundColor: '#000',
            left: x === 0 ? '50%' : 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: y === 0 ? '50%' : y === boardState.boardSize - 1 ? '50%' : '100%',
            width: '1px',
            backgroundColor: '#000',
            top: y === 0 ? '50%' : 0,
          }}
        />

        {/* Hoshi (ponto estrela) */}
        {isStarPoint && (
          <div
            style={{
              position: 'absolute',
              width: cellSize * 0.15,
              height: cellSize * 0.15,
              borderRadius: '50%',
              backgroundColor: '#000',
              zIndex: 1,
            }}
          />
        )}

        {/* Pedra existente */}
        {stone && (
          <Stone
            color={stone.color}
            isLastPlayed={isLastPlayed(x, y)}
            size={stoneSize}
          />
        )}

        {/* Indicador de hover */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              width: stoneSize,
              height: stoneSize,
              borderRadius: '50%',
              backgroundColor: boardState.currentPlayer === 'black' ? '#000' : '#fff',
              opacity: 0.3,
              zIndex: 2,
            }}
          />
        )}
      </div>
    );
  };

  const renderBoard = () => {
    return [...Array(boardState.boardSize)].map((_, y) => (
      <div
        key={y}
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {[...Array(boardState.boardSize)].map((_, x) => renderIntersection(x, y))}
      </div>
    ));
  };

  return (
    <div
      className="board-wrapper"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#222', // fundo escuro elegante
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={boardRef}
        className="board"
        style={{
          width: boardSizePixels,
          height: boardSizePixels,
          backgroundColor: '#dcb35c',
          border: '12px solid #b58d4b',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {renderBoard()}
      </div>
    </div>
  );
};

export default Board;