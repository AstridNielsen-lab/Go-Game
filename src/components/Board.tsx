import React, { useState, useLayoutEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import Stone from './Stone';
import { BoardState, Position } from '../types/gameTypes';
import { getStoneAt, isValidMove } from '../utils/gameLogic';

interface BoardProps {
  boardState: BoardState;
  onPlaceStone: (pos: Position) => void;
  isAIThinking?: boolean;
}

const Board: React.FC<BoardProps> = ({ boardState, onPlaceStone, isAIThinking }) => {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [boardSizePixels, setBoardSizePixels] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateBoardSize = () => {
      if (isFullscreen && containerRef.current) {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.95;
        setBoardSizePixels(size);
      } else {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.95;
        setBoardSizePixels(size);
      }
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useLayoutEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const cellSize = boardSizePixels / boardState.boardSize;

  const handleIntersectionClick = (x: number, y: number) => {
    if (!isAIThinking && isValidMove(boardState, { x, y })) {
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
    const isHovered = hoveredPosition?.x === x && hoveredPosition?.y === y && !stone && !isAIThinking;
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
          cursor: isAIThinking ? 'not-allowed' : 'pointer',
        }}
        onClick={() => handleIntersectionClick(x, y)}
        onMouseEnter={() => !isAIThinking && setHoveredPosition({ x, y })}
        onMouseLeave={() => setHoveredPosition(null)}
      >
        {/* Grid lines */}
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

        {/* Star point */}
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

        {/* Stone */}
        {stone && (
          <Stone
            color={stone.color}
            isLastPlayed={isLastPlayed(x, y)}
            size={stoneSize}
          />
        )}

        {/* Hover indicator */}
        {isHovered && isValidMove(boardState, { x, y }) && (
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
      ref={containerRef}
      className="board-wrapper relative"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: isFullscreen ? '100vh' : '100vh',
        backgroundColor: '#222',
        padding: '1rem',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-colors"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={24} className="text-white" /> : <Maximize2 size={24} className="text-white" />}
      </button>
      
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
          opacity: isAIThinking ? 0.8 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {renderBoard()}
      </div>
      
      {isAIThinking && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg z-50"
        >
          IA pensando...
        </div>
      )}
    </div>
  );
};

export default Board;