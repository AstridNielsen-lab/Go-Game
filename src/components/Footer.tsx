import React from 'react';
import { Globe, Phone, Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/50 backdrop-blur-md text-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Like Look Solutions</h3>
            <div className="text-gray-300 space-y-1">
              <p className="text-lg">Julio Campos Machado</p>
              <p>Fullstack Developer</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end space-y-3">
            <a 
              href="https://youtu.be/8ud_2Ww3dqY?si=VuwQQNY--uR4FTv1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Music size={24} />
              <span>Música perfeita para jogar</span>
            </a>
            
            <a 
              href="https://likelook.wixsite.com/solutions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe size={24} />
              <span>likelook.wixsite.com/solutions</span>
            </a>
            
            <a 
              href="https://wa.me/5511970603441" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Phone size={24} />
              <span>+55 11 97060-3441</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;