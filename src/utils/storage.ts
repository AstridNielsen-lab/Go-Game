export interface GameState {
  playerName: string;
  stones: any[];
  currentPlayer: 'black' | 'white' | null;
  logs: {
    player: string;
    move: string;
    timestamp: string;
  }[];
}

export const saveGameState = (state: GameState) => {
  localStorage.setItem('goGame', JSON.stringify(state));
};

export const loadGameState = (): GameState | null => {
  const saved = localStorage.getItem('goGame');
  return saved ? JSON.parse(saved) : null;
};

export const clearGameState = () => {
  localStorage.removeItem('goGame');
};