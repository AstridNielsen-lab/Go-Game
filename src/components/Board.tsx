import React, { useState, useEffect } from 'react';
import Stone from './Stone';
import { BoardState, Position } from '../types/gameTypes';
import { getStoneAt, isValidMove } from '../utils/gameLogic';

interface BoardProps {
  boardState: BoardState;
  onPlaceStone: (pos: Position) => void;
}

const Board: React.FC<BoardProps> = ({ boardState, onPlaceStone }) => {
  const [hoveredPosition, setHoveredPosition] = useState<Position | null>(null);
  const [boardWidth, setBoardWidth] = useState<number>(0);
  const boardRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const updateBoardWidth = () => {
      if (boardRef.current) {
        const width = Math.min(
          boardRef.current.offsetWidth,
          window.innerHeight * 0.8
        );
        setBoardWidth(width);
      }
    };
    
    updateBoardWidth();
    window.addEventListener('resize', updateBoardWidth);
    
    return () => {
      window.removeEventListener('resize', updateBoardWidth);
    };
  }, []);
  
  const getCellSize = () => {
    return boardWidth / boardState.boardSize;
  };
  
  const handleIntersectionClick = (x: number, y: number) => {
    onPlaceStone({ x, y });
  };
  
  const handleIntersectionHover = (x: number, y: number) => {
    setHoveredPosition({ x, y });
  };
  
  const isValidIntersection = (x: number, y: number) => {
    if (boardState.gameOver) return false;
    return isValidMove(boardState, { x, y });
  };
  
  const isLastPlayed = (x: number, y: number) => {
    return boardState.lastMove?.x === x && boardState.lastMove?.y === y;
  };
  
  const renderIntersection = (x: number, y: number) => {
    const stone = getStoneAt(boardState.stones, x, y);
    const isValid = !stone && isValidIntersection(x, y);
    const isHovered = hoveredPosition?.x === x && hoveredPosition?.y === y && isValid;
    const cellSize = getCellSize();
    const stoneSize = cellSize * 0.9;
    
    // Determine if this is a star point (hoshi)
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
        onMouseEnter={() => handleIntersectionHover(x, y)}
        onMouseLeave={() => setHoveredPosition(null)}
      >
        {/* Grid lines */}
        <div
          className="grid-lines"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: x === 0 ? '50%' : x === boardState.boardSize - 1 ? '50%' : '100%',
              height: '1px',
              backgroundColor: '#000',
              left: x === 0 ? '50%' : x === boardState.boardSize - 1 ? 0 : 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              height: y === 0 ? '50%' : y === boardState.boardSize - 1 ? '50%' : '100%',
              width: '1px',
              backgroundColor: '#000',
              top: y === 0 ? '50%' : y === boardState.boardSize - 1 ? 0 : 0,
            }}
          />
        </div>
        
        {/* Star point (hoshi) */}
        {isStarPoint && (
          <div
            style={{
              position: 'absolute',
              width: cellSize * 0.15,
              height: cellSize * 0.15,
              borderRadius: '50%',
              backgroundColor: '#000',
              zIndex: 5,
            }}
          />
        )}
        
        {/* Stone */}
        {stone && <Stone color={stone.color} isLastPlayed={isLastPlayed(x, y)} size={stoneSize} />}
        
        {/* Hover indicator */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              width: stoneSize,
              height: stoneSize,
              borderRadius: '50%',
              backgroundColor: boardState.currentPlayer === 'black' ? '#000' : '#fff',
              opacity: 0.3,
              zIndex: 5,
            }}
          />
        )}
      </div>
    );
  };
  
  const renderBoard = () => {
    const rows = [];
    
    for (let y = 0; y < boardState.boardSize; y++) {
      const intersections = [];
      
      for (let x = 0; x < boardState.boardSize; x++) {
        intersections.push(renderIntersection(x, y));
      }
      
      rows.push(
        <div
          key={y}
          className="board-row"
          style={{
            display: 'flex',
          }}
        >
          {intersections}
        </div>
      );
    }
    
    return rows;
  };
  
  // Helper for star points (hoshi)
  const isHoshiPoint = (x: number, y: number, boardSize: number): boolean => {
    if (boardSize === 19) {
      const hoshiPoints = [3, 9, 15];
      return hoshiPoints.includes(x) && hoshiPoints.includes(y);
    } else if (boardSize === 13) {
      const hoshiPoints = [3, 6, 9];
      return hoshiPoints.includes(x) && hoshiPoints.includes(y);
    } else if (boardSize === 9) {
      const hoshiPoints = [2, 4, 6];
      return hoshiPoints.includes(x) && hoshiPoints.includes(y);
    }
    return false;
  };
  
  return (
    <div 
      className="board-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div
        ref={boardRef}
        className="board"
        style={{
          display: 'inline-block',
          backgroundColor: '#dcb35c', // Traditional wooden board color
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          boxSizing: 'content-box',
          border: '10px solid #dcb35c',
          borderRadius: '4px',
        }}
      >
        {renderBoard()}
      </div>
    </div>
  );
};

export default Board;