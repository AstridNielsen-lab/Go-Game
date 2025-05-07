import React from 'react';
import { X, Undo, SkipForward, RotateCcw, Minus, Plus } from 'lucide-react';

interface GameControlsProps {
  onPass: () => void;
  onResign: () => void;
  onRestart: () => void;
  onChangeSize: (size: number) => void;
  currentBoardSize: number;
  currentPlayer: 'black' | 'white' | null;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onPass,
  onResign,
  onRestart,
  onChangeSize,
  currentBoardSize,
  currentPlayer,
  gameOver,
}) => {
  const handleSizeChange = (newSize: number) => {
    if (newSize >= 9 && newSize <= 19) {
      onChangeSize(newSize);
    }
  };
  
  return (
    <div className="game-controls p-4 bg-gray-100 rounded-lg shadow-sm mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h3 className="text-lg font-semibold mb-2">
            {gameOver 
              ? "Game Over" 
              : `Current Player: ${currentPlayer === 'black' ? 'Black' : 'White'}`}
          </h3>
          <div 
            className="w-6 h-6 rounded-full inline-block mr-2" 
            style={{ 
              backgroundColor: currentPlayer === 'black' ? '#000' : '#fff',
              border: currentPlayer === 'white' ? '1px solid #ddd' : 'none',
              boxShadow: '1px 1px 3px rgba(0,0,0,0.2)'
            }}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-md shadow-sm transition-colors flex items-center"
            onClick={onPass}
            disabled={gameOver}
          >
            <SkipForward size={16} className="mr-1" />
            <span>Pass</span>
          </button>
          
          <button
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-md shadow-sm transition-colors flex items-center"
            onClick={onResign}
            disabled={gameOver}
          >
            <X size={16} className="mr-1" />
            <span>Resign</span>
          </button>
          
          <button
            className="px-3 py-2 bg-white hover:bg-gray-50 text-gray-800 rounded-md shadow-sm transition-colors flex items-center"
            onClick={onRestart}
          >
            <RotateCcw size={16} className="mr-1" />
            <span>Restart</span>
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-center items-center space-x-4">
          <span className="text-sm font-medium">Board Size:</span>
          
          <button
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded shadow-sm transition-colors"
            onClick={() => handleSizeChange(currentBoardSize - 2)}
            disabled={currentBoardSize <= 9}
          >
            <Minus size={16} />
          </button>
          
          <div className="flex space-x-2">
            <button
              className={`px-2 py-1 rounded ${currentBoardSize === 9 ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              onClick={() => onChangeSize(9)}
            >
              9×9
            </button>
            <button
              className={`px-2 py-1 rounded ${currentBoardSize === 13 ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              onClick={() => onChangeSize(13)}
            >
              13×13
            </button>
            <button
              className={`px-2 py-1 rounded ${currentBoardSize === 19 ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
              onClick={() => onChangeSize(19)}
            >
              19×19
            </button>
          </div>
          
          <button
            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-50 rounded shadow-sm transition-colors"
            onClick={() => handleSizeChange(currentBoardSize + 2)}
            disabled={currentBoardSize >= 19}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;