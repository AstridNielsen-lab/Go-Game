import { BoardState, Position, Stone } from '../types/gameTypes';
import { isValidMove, getStoneAt, findGroup, countLiberties } from './gameLogic';

// Evaluate board position for a given color
const evaluatePosition = (boardState: BoardState, color: 'black' | 'white'): number => {
  let score = 0;
  const { boardSize } = boardState;
  
  // Value center positions more
  const center = Math.floor(boardSize / 2);
  
  // Evaluate each position
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const stone = getStoneAt(boardState.stones, x, y);
      if (stone?.color === color) {
        // Base score for having a stone
        score += 1;
        
        // Bonus for center control
        const distanceFromCenter = Math.abs(x - center) + Math.abs(y - center);
        score += (boardSize - distanceFromCenter) * 0.1;
        
        // Check liberties
        const group = findGroup(boardState.stones, stone);
        const liberties = countLiberties(boardState.stones, group);
        score += liberties.length * 0.5;
      }
    }
  }
  
  // Consider captures
  if (color === 'black') {
    score += boardState.capturedWhite * 2;
  } else {
    score += boardState.capturedBlack * 2;
  }
  
  return score;
};

// Find strategic moves
const findStrategicMoves = (boardState: BoardState): Position[] => {
  const moves: Position[] = [];
  const { boardSize } = boardState;
  
  // Consider all valid moves
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (isValidMove(boardState, { x, y })) {
        moves.push({ x, y });
      }
    }
  }
  
  return moves;
};

// Generate the best move for AI
export const generateBestMove = (boardState: BoardState): Position | null => {
  const moves = findStrategicMoves(boardState);
  if (moves.length === 0) return null;
  
  let bestMove = moves[0];
  let bestScore = -Infinity;
  
  // Evaluate each possible move
  for (const move of moves) {
    // Create a temporary board state with this move
    const tempBoardState: BoardState = {
      ...boardState,
      stones: [
        ...boardState.stones,
        { x: move.x, y: move.y, color: boardState.currentPlayer }
      ]
    };
    
    // Evaluate the position after the move
    const score = evaluatePosition(tempBoardState, boardState.currentPlayer as 'black' | 'white');
    
    // Update best move if this score is higher
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
};