import React from 'react';
import { StoneColor } from '../types/gameTypes';

interface StoneProps {
  color: StoneColor;
  isLastPlayed?: boolean;
  size?: number;
}

const Stone: React.FC<StoneProps> = ({ color, isLastPlayed = false, size = 24 }) => {
  if (!color) return null;
  
  const stoneStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.15s ease-in-out',
    zIndex: 10,
  };
  
  if (color === 'black') {
    stoneStyle.backgroundColor = '#000';
    stoneStyle.backgroundImage = 'radial-gradient(circle at 30% 30%, #444, #000)';
  } else {
    stoneStyle.backgroundColor = '#fff';
    stoneStyle.backgroundImage = 'radial-gradient(circle at 30% 30%, #fff, #ddd)';
    stoneStyle.border = '1px solid #ddd';
  }
  
  // For animation
  stoneStyle.animation = 'stone-appear 0.2s ease-out';
  
  return (
    <div style={stoneStyle}>
      {isLastPlayed && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size / 3,
            height: size / 3,
            borderRadius: '50%',
            backgroundColor: color === 'black' ? '#fff' : '#000',
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
};

export default Stone;