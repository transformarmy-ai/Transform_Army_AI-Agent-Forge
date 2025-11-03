
import React from 'react';
import { APP_LOGO_BASE64 } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="border-b-2 border-[--color-accent-gold]/30 p-4 bg-[--color-bg-dark-brown]/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-center space-x-4">
      <img src={APP_LOGO_BASE64} alt="Transform Army AI Logo" className="h-12 md:h-16 w-auto drop-shadow-lg" />
      <div>
        <h1 className="text-2xl md:text-4xl font-bold font-orbitron text-[--color-accent-gold] tracking-widest">
          TRANSFORM ARMY AI
        </h1>
        <p className="text-sm md:text-base text-[--color-accent-red] font-mono mt-1 text-center">
          :: MANIFEST FORGE & EXCHANGE ::
        </p>
      </div>
    </header>
  );
};

export default Header;