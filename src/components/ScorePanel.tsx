import React from 'react';
import { BoardState } from '../types/gameTypes';
import { calculateScore } from '../utils/gameLogic';

interface ScorePanelProps {
  boardState: BoardState;
}

const ScorePanel: React.FC<ScorePanelProps> = ({ boardState }) => {
  const { blackScore, whiteScore } = calculateScore(boardState);
  
  return (
    <div className="score-panel p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-center">Game Score</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-100 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{
                backgroundColor: '#000',
                boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            />
            <span className="font-medium">Black</span>
          </div>
          
          <div className="text-2xl font-bold">{Math.floor(blackScore)}</div>
          
          <div className="mt-2 text-sm text-gray-600">
            <div>Territory: {Math.floor(blackScore - boardState.capturedWhite)}</div>
            <div>Captures: {boardState.capturedWhite}</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-100 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            />
            <span className="font-medium">White</span>
          </div>
          
          <div className="text-2xl font-bold">{Math.floor(whiteScore)}</div>
          
          <div className="mt-2 text-sm text-gray-600">
            <div>Territory: {Math.floor(whiteScore - boardState.capturedBlack - 6.5)}</div>
            <div>Captures: {boardState.capturedBlack}</div>
            <div>Komi: 6.5</div>
          </div>
        </div>
      </div>
      
      {boardState.gameOver && (
        <div className="mt-4 text-center p-2 bg-blue-50 rounded-md">
          <div className="font-medium text-blue-800">
            {blackScore > whiteScore ? 'Black wins!' : 'White wins!'}
          </div>
          <div className="text-sm text-blue-600">
            by {Math.abs(Math.floor(blackScore - whiteScore))} points
          </div>
        </div>
      )}
    </div>
  );
};

export default ScorePanel;