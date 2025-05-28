import React from 'react';
import { Globe, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Like Look Solutions</h3>
            <p className="text-gray-300">Desenvolvido por Julio Campos Machado</p>
            <p className="text-gray-300">Fullstack Developer</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <a 
              href="https://likelook.wixsite.com/solutions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-2"
            >
              <Globe size={20} />
              <span>likelook.wixsite.com/solutions</span>
            </a>
            
            <a 
              href="https://wa.me/5511970603441" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300"
            >
              <Phone size={20} />
              <span>+55 11 97060-3441</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;