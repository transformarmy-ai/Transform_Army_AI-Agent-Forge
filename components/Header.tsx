
import React from 'react';
import { APP_LOGO_BASE64 } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="border-b-2 border-[--color-border-accent]/50 p-4 bg-[--color-bg-secondary]/90 backdrop-blur-md sticky top-0 z-10 flex items-center justify-center space-x-4 shadow-lg">
      <div className="relative">
        <img src={APP_LOGO_BASE64} alt="Transform Army AI Logo" className="h-12 md:h-16 w-auto drop-shadow-lg filter hue-rotate-180 saturate-150" />
        <div className="absolute inset-0 h-12 md:h-16 w-auto bg-[--color-glow-cyan] blur-xl opacity-50 -z-10"></div>
      </div>
      <div className="text-center">
        <h1 className="text-2xl md:text-4xl font-bold font-orbitron text-[--color-accent-cyan] tracking-widest uppercase"
            style={{
              textShadow: '0 0 20px var(--color-glow-cyan), 0 0 40px rgba(0, 255, 255, 0.3)',
              letterSpacing: '0.15em'
            }}>
          TRANSFORM ARMY AI
        </h1>
        <p className="text-sm md:text-base text-[--color-accent-blue] font-mono mt-1 text-center uppercase tracking-widest"
           style={{
             textShadow: '0 0 10px var(--color-glow-blue)',
             letterSpacing: '0.2em'
           }}>
          :: MANIFEST FORGE & EXCHANGE ::
        </p>
      </div>
    </header>
  );
};

export default Header;