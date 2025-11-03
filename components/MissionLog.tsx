
import React from 'react';
import { MissionLogEntry } from '../App';

interface MissionLogProps {
  log: MissionLogEntry[];
}

const MissionLog: React.FC<MissionLogProps> = ({ log }) => {

  const getSourceClasses = (source: string): string => {
    if (source.toLowerCase().includes('error')) return 'text-[--color-accent-red] font-bold';
    if (source.toLowerCase().includes('operator')) return 'text-[--color-accent-gold] font-bold';
    if (source.toLowerCase().includes('orchestrator')) return 'text-green-500';
    if (source.toLowerCase().includes('agentforge')) return 'text-purple-400';
    if (source.toLowerCase().includes('acoc')) return 'text-[--color-accent-blue] font-bold';
    if (source.toLowerCase().includes('system')) return 'text-[--color-text-med]';
    return 'text-[--color-accent-blue]';
  };
  
  if (!Array.isArray(log)) {
    return (
      <div className="bg-[--color-bg-med-brown]/20 border border-[--color-bg-light-brown] rounded-lg shadow-lg h-full flex flex-col p-4">
        <h2 className="text-lg font-orbitron text-[--color-accent-red] p-4 border-b border-[--color-accent-red]/30">
          :: Mission Log ::
        </h2>
        <p className="text-[--color-accent-red] p-4">Log data is unavailable or malformed.</p>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-med-brown]/20 border border-[--color-bg-light-brown] rounded-lg shadow-lg h-full flex flex-col">
      <h2 className="text-lg font-orbitron text-[--color-accent-red] p-4 border-b border-[--color-accent-red]/30">
        :: UI LOG ::
      </h2>
      <div className="p-4 flex-grow overflow-y-auto font-mono text-xs text-[--color-text-dark] space-y-2">
        {log.map((entry, index) => (
          <div key={index}>
            <span className="text-[--color-text-med]">{entry.timestamp.split('T')[1].slice(0, 8)}</span>
            <span className={`${getSourceClasses(entry.source)} mx-2`}>[{entry.source}]</span>
            <span>{entry.content}</span>
          </div>
        ))}
         <div ref={(el) => { el?.scrollIntoView({ behavior: 'smooth' }); }} />
      </div>
    </div>
  );
};

export default MissionLog;