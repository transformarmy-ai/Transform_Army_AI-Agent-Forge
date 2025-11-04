
import React from 'react';
import { MissionLogEntry } from '../App';

interface MissionLogProps {
  log: MissionLogEntry[];
}

const MissionLog: React.FC<MissionLogProps> = ({ log }) => {

  const getSourceClasses = (source: string): string => {
    if (source.toLowerCase().includes('error')) return 'text-[--color-accent-red] font-bold';
    if (source.toLowerCase().includes('operator')) return 'text-[--color-accent-cyan] font-bold';
    if (source.toLowerCase().includes('orchestrator')) return 'text-[--color-accent-green]';
    if (source.toLowerCase().includes('agentforge')) return 'text-[--color-accent-blue]';
    if (source.toLowerCase().includes('acoc')) return 'text-[--color-accent-blue] font-bold';
    if (source.toLowerCase().includes('system')) return 'text-[--color-text-secondary]';
    return 'text-[--color-accent-blue]';
  };
  
  if (!Array.isArray(log)) {
    return (
      <div className="bg-[--color-bg-secondary]/80 border border-[--color-border-primary] rounded-lg shadow-lg h-full flex flex-col p-4"
           style={{
             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
             background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.8) 100%)'
           }}>
        <h2 className="text-lg font-orbitron text-[--color-accent-cyan] p-4 border-b border-[--color-accent-cyan]/30 uppercase tracking-wider"
            style={{ textShadow: '0 0 10px var(--color-glow-cyan)' }}>
          :: Mission Log ::
        </h2>
        <p className="text-[--color-accent-red] p-4 font-mono">Log data is unavailable or malformed.</p>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-secondary]/80 border border-[--color-border-primary] rounded-lg shadow-lg h-full flex flex-col"
         style={{
           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
           background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.8) 100%)'
         }}>
      <h2 className="text-lg font-orbitron text-[--color-accent-cyan] p-4 border-b border-[--color-accent-cyan]/30 uppercase tracking-wider"
          style={{ textShadow: '0 0 10px var(--color-glow-cyan)' }}>
        :: UI LOG ::
      </h2>
      <div className="p-4 flex-grow overflow-y-auto font-mono text-xs text-[--color-text-primary] space-y-2"
           style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-border-primary) transparent' }}>
        {log.map((entry, index) => (
          <div key={index} className="border-l-2 border-[--color-border-primary] pl-2 hover:border-[--color-accent-cyan]/50 transition-colors"
               style={{ background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.05) 0%, transparent 100%)' }}>
            <span className="text-[--color-text-muted]">{entry.timestamp.split('T')[1].slice(0, 8)}</span>
            <span className={`${getSourceClasses(entry.source)} mx-2 uppercase tracking-wider`}>[{entry.source}]</span>
            <span className="text-[--color-text-secondary]">{entry.content}</span>
          </div>
        ))}
         <div ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }} />
      </div>
    </div>
  );
};

export default MissionLog;