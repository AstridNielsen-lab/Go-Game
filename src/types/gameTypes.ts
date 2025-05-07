export type StoneColor = 'black' | 'white' | null;

export interface Position {
  x: number;
  y: number;
}

export interface Stone extends Position {
  color: StoneColor;
}

export interface BoardState {
  stones: Stone[];
  currentPlayer: StoneColor;
  lastMove: Position | null;
  previousBoards: Stone[][];
  capturedBlack: number;
  capturedWhite: number;
  gameOver: boolean;
  passes: number;
  boardSize: number;
}

export interface Group {
  stones: Position[];
  liberties: Position[];
}