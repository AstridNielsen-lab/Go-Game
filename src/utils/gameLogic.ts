import { BoardState, Position, StoneColor, Stone, Group } from '../types/gameTypes';

export const createInitialBoardState = (size: number = 19): BoardState => {
  return {
    stones: [],
    currentPlayer: 'black',
    lastMove: null,
    previousBoards: [],
    capturedBlack: 0,
    capturedWhite: 0,
    gameOver: false,
    passes: 0,
    boardSize: size,
  };
};

export const getStoneAt = (stones: Stone[], x: number, y: number): Stone | undefined => {
  return stones.find(stone => stone.x === x && stone.y === y);
};

export const isValidMove = (
  boardState: BoardState,
  position: Position
): boolean => {
  const { x, y } = position;
  const { stones, boardSize } = boardState;
  
  // Check if position is out of bounds
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return false;
  }
  
  // Check if intersection is already occupied
  if (getStoneAt(stones, x, y)) {
    return false;
  }
  
  // Create a new stone for the current player
  const newStone: Stone = {
    x,
    y,
    color: boardState.currentPlayer,
  };
  
  // Create a temporary board with the new stone
  const tempStones = [...stones, newStone];
  
  // Check if the move would be suicide (no liberties for the new group)
  const group = findGroup(tempStones, newStone);
  if (countLiberties(tempStones, group).length === 0) {
    // Check if the move would capture enemy stones
    const willCapture = findAdjacentGroups(tempStones, newStone)
      .some(adjGroup => {
        const adjStone = tempStones.find(s => 
          s.x === adjGroup[0].x && s.y === adjGroup[0].y
        );
        return adjStone?.color !== newStone.color && 
               countLiberties(tempStones, adjGroup).length === 0;
      });
    
    if (!willCapture) {
      return false; // Move is suicide
    }
  }
  
  // Check for ko rule violation
  if (violatesKoRule(boardState, tempStones)) {
    return false;
  }
  
  return true;
};

export const playMove = (
  boardState: BoardState,
  position: Position
): BoardState => {
  if (!isValidMove(boardState, position)) {
    return boardState;
  }
  
  // Save current board state
  const previousBoard = [...boardState.stones];
  
  // Create a new stone for the current player
  const newStone: Stone = {
    x: position.x,
    y: position.y,
    color: boardState.currentPlayer,
  };
  
  // Add the new stone to the board
  let newStones = [...boardState.stones, newStone];
  
  // Capture any surrounded enemy stones
  const capturedStones = findCapturedStones(newStones, newStone.color);
  
  // Update captured stones count
  let capturedBlack = boardState.capturedBlack;
  let capturedWhite = boardState.capturedWhite;
  
  if (capturedStones.length > 0) {
    if (boardState.currentPlayer === 'black') {
      capturedWhite += capturedStones.length;
    } else {
      capturedBlack += capturedStones.length;
    }
    
    // Remove captured stones
    newStones = newStones.filter(stone => 
      !capturedStones.some(captured => captured.x === stone.x && captured.y === stone.y)
    );
  }
  
  // Update the board state
  const nextPlayer = boardState.currentPlayer === 'black' ? 'white' : 'black';
  
  return {
    ...boardState,
    stones: newStones,
    currentPlayer: nextPlayer,
    lastMove: position,
    previousBoards: [...boardState.previousBoards, previousBoard],
    capturedBlack,
    capturedWhite,
    passes: 0, // Reset passes count
  };
};

export const passTurn = (boardState: BoardState): BoardState => {
  const passes = boardState.passes + 1;
  const gameOver = passes >= 2; // Game ends after two consecutive passes
  
  return {
    ...boardState,
    currentPlayer: boardState.currentPlayer === 'black' ? 'white' : 'black',
    passes,
    gameOver,
  };
};

export const resignGame = (boardState: BoardState): BoardState => {
  return {
    ...boardState,
    gameOver: true,
  };
};

export const findGroup = (stones: Stone[], startStone: Stone): Position[] => {
  const group: Position[] = [];
  const visited: Set<string> = new Set();
  const toVisit: Position[] = [{ x: startStone.x, y: startStone.y }];
  
  while (toVisit.length > 0) {
    const current = toVisit.pop()!;
    const key = `${current.x},${current.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    const stone = getStoneAt(stones, current.x, current.y);
    if (!stone || stone.color !== startStone.color) continue;
    
    group.push(current);
    
    // Add adjacent positions to visit
    getAdjacentPositions(current).forEach(pos => {
      toVisit.push(pos);
    });
  }
  
  return group;
};

export const countLiberties = (stones: Stone[], group: Position[]): Position[] => {
  const liberties: Position[] = [];
  const libertiesSet = new Set<string>();
  
  group.forEach(position => {
    getAdjacentPositions(position).forEach(adjPos => {
      // Check if the position is empty
      if (!getStoneAt(stones, adjPos.x, adjPos.y)) {
        const key = `${adjPos.x},${adjPos.y}`;
        if (!libertiesSet.has(key)) {
          libertiesSet.add(key);
          liberties.push(adjPos);
        }
      }
    });
  });
  
  return liberties;
};

export const findAdjacentGroups = (stones: Stone[], stone: Stone): Position[][] => {
  const adjacentGroups: Position[][] = [];
  const processedGroups = new Set<string>();
  
  getAdjacentPositions(stone).forEach(pos => {
    const adjStone = getStoneAt(stones, pos.x, pos.y);
    
    if (adjStone && adjStone.color !== stone.color) {
      const group = findGroup(stones, adjStone);
      const groupKey = group.map(p => `${p.x},${p.y}`).sort().join('|');
      
      if (!processedGroups.has(groupKey)) {
        processedGroups.add(groupKey);
        adjacentGroups.push(group);
      }
    }
  });
  
  return adjacentGroups;
};

export const findCapturedStones = (stones: Stone[], playerColor: StoneColor): Stone[] => {
  const capturedStones: Stone[] = [];
  const processedGroups = new Set<string>();
  
  stones
    .filter(stone => stone.color !== playerColor)
    .forEach(stone => {
      const group = findGroup(stones, stone);
      const groupKey = group.map(p => `${p.x},${p.y}`).sort().join('|');
      
      if (!processedGroups.has(groupKey)) {
        processedGroups.add(groupKey);
        
        const liberties = countLiberties(stones, group);
        if (liberties.length === 0) {
          group.forEach(pos => {
            const capturedStone = getStoneAt(stones, pos.x, pos.y);
            if (capturedStone) {
              capturedStones.push(capturedStone);
            }
          });
        }
      }
    });
  
  return capturedStones;
};

export const violatesKoRule = (boardState: BoardState, newStones: Stone[]): boolean => {
  // Check if this board state has occurred before
  for (let i = boardState.previousBoards.length - 1; i >= 0; i--) {
    const previousBoard = boardState.previousBoards[i];
    
    if (areIdenticalBoards(previousBoard, newStones)) {
      return true;
    }
  }
  
  return false;
};

export const areIdenticalBoards = (board1: Stone[], board2: Stone[]): boolean => {
  if (board1.length !== board2.length) {
    return false;
  }
  
  // Create maps for faster lookups
  const map1 = new Map<string, StoneColor>();
  const map2 = new Map<string, StoneColor>();
  
  board1.forEach(stone => {
    map1.set(`${stone.x},${stone.y}`, stone.color);
  });
  
  board2.forEach(stone => {
    map2.set(`${stone.x},${stone.y}`, stone.color);
  });
  
  // Check if every stone in board1 exists in board2 with the same color
  for (const [key, color] of map1.entries()) {
    if (map2.get(key) !== color) {
      return false;
    }
  }
  
  // Check if every stone in board2 exists in board1
  for (const key of map2.keys()) {
    if (!map1.has(key)) {
      return false;
    }
  }
  
  return true;
};

export const getAdjacentPositions = (position: Position): Position[] => {
  const { x, y } = position;
  return [
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
    { x, y: y + 1 },
  ];
};

export const calculateScore = (boardState: BoardState): { blackScore: number, whiteScore: number } => {
  const { stones, boardSize, capturedBlack, capturedWhite } = boardState;
  
  // Create a matrix to represent the board
  const boardMatrix: (StoneColor | 'black-territory' | 'white-territory')[][] = 
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  
  // Fill in the stones
  stones.forEach(stone => {
    boardMatrix[stone.y][stone.x] = stone.color;
  });
  
  // Identify territory
  identifyTerritory(boardMatrix, boardSize);
  
  // Count territory
  let blackTerritory = 0;
  let whiteTerritory = 0;
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (boardMatrix[y][x] === 'black-territory') {
        blackTerritory++;
      } else if (boardMatrix[y][x] === 'white-territory') {
        whiteTerritory++;
      }
    }
  }
  
  // Calculate final scores (territory + captures)
  const blackScore = blackTerritory + capturedWhite;
  const whiteScore = whiteTerritory + capturedBlack + 6.5; // Komi rule (6.5 points advantage to white)
  
  return { blackScore, whiteScore };
};

const identifyTerritory = (
  boardMatrix: (StoneColor | 'black-territory' | 'white-territory')[][],
  boardSize: number
): void => {
  const visited = Array(boardSize).fill(null)
    .map(() => Array(boardSize).fill(false));
  
  // Flood fill from each empty intersection
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (boardMatrix[y][x] === null && !visited[y][x]) {
        const region: Position[] = [];
        const borderingBlack = new Set<string>();
        const borderingWhite = new Set<string>();
        
        // Find all connected empty intersections and their bordering stones
        floodFill(
          boardMatrix,
          visited,
          x,
          y,
          region,
          borderingBlack,
          borderingWhite,
          boardSize
        );
        
        // Determine the territory owner
        let territoryType: 'black-territory' | 'white-territory' | null = null;
        
        if (borderingBlack.size > 0 && borderingWhite.size === 0) {
          territoryType = 'black-territory';
        } else if (borderingWhite.size > 0 && borderingBlack.size === 0) {
          territoryType = 'white-territory';
        }
        
        // Mark the territory if it has an owner
        if (territoryType) {
          region.forEach(pos => {
            boardMatrix[pos.y][pos.x] = territoryType;
          });
        }
      }
    }
  }
};

const floodFill = (
  boardMatrix: (StoneColor | 'black-territory' | 'white-territory')[][],
  visited: boolean[][],
  x: number,
  y: number,
  region: Position[],
  borderingBlack: Set<string>,
  borderingWhite: Set<string>,
  boardSize: number
): void => {
  // Check bounds
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return;
  }
  
  // Skip if already visited
  if (visited[y][x]) {
    return;
  }
  
  visited[y][x] = true;
  
  // Process based on what's at this position
  const currentColor = boardMatrix[y][x];
  
  if (currentColor === null) {
    // Empty intersection, add to region and continue flood fill
    region.push({ x, y });
    
    // Check adjacent positions
    floodFill(boardMatrix, visited, x - 1, y, region, borderingBlack, borderingWhite, boardSize);
    floodFill(boardMatrix, visited, x + 1, y, region, borderingBlack, borderingWhite, boardSize);
    floodFill(boardMatrix, visited, x, y - 1, region, borderingBlack, borderingWhite, boardSize);
    floodFill(boardMatrix, visited, x, y + 1, region, borderingBlack, borderingWhite, boardSize);
  } else if (currentColor === 'black') {
    // Border stone is black
    borderingBlack.add(`${x},${y}`);
  } else if (currentColor === 'white') {
    // Border stone is white
    borderingWhite.add(`${x},${y}`);
  }
};