import React, { useEffect, useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { Team } from '../../types';

const MissionHeader: React.FC = () => {
  const { mission, pauseMission, resumeMission, endMission } = useMission();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    if (!mission?.startedAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(mission.startedAt!);
      const diff = now.getTime() - start.getTime();
      
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [mission?.startedAt]);

  if (!mission) {
    return (
      <div className="h-24 bg-[--color-bg-secondary] border-b border-[--color-border-primary] flex items-center justify-center">
        <p className="text-[--color-text-muted]">No active mission</p>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (mission.status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    return mission.status.toUpperCase();
  };

  const teamCounts = {
    [Team.System]: mission.agents.filter(a => a.team === Team.System).length,
    [Team.Red]: mission.agents.filter(a => a.team === Team.Red).length,
    [Team.Blue]: mission.agents.filter(a => a.team === Team.Blue).length,
  };

  const totalAgents = mission.agents.length;
  const activeAgents = mission.agents.filter(a => a.status === 'Running').length;

  return (
    <div className="bg-[--color-bg-secondary] border-b-2 border-[--color-accent-red] shadow-lg">
      {/* Top Row - Mission Name & Status */}
      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[--color-bg-secondary] to-[--color-bg-elevated]">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-[--color-accent-red]" style={{ textShadow: '0 0 15px var(--color-glow-red)' }}>
              MISSION CONTROL
            </h1>
            <p className="text-sm text-[--color-text-secondary] mt-1">
              {mission.name} {mission.template && `(${mission.template})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`} />
            <span className="font-mono font-bold text-[--color-text-primary]">{getStatusText()}</span>
          </div>

          {/* Elapsed Time */}
          <div className="text-center">
            <p className="text-xs text-[--color-text-muted]">ELAPSED</p>
            <p className="text-xl font-mono font-bold text-[--color-accent-blue]">{elapsedTime}</p>
          </div>

          {/* Total Agents */}
          <div className="text-center">
            <p className="text-xs text-[--color-text-muted]">AGENTS ACTIVE</p>
            <p className="text-xl font-mono font-bold text-[--color-accent-white]">{activeAgents}/{totalAgents}</p>
          </div>
        </div>
      </div>

      {/* Bottom Row - Team Roster & Controls */}
      <div className="px-6 py-3 flex items-center justify-between bg-[--color-bg-primary] border-t border-[--color-border-secondary]">
        {/* Team Counts */}
        <div className="flex gap-8">
          {Object.entries(teamCounts).map(([team, count]) => (
            <div key={team} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                team === Team.System ? 'bg-[--color-bg-secondary] text-[--color-accent-white]' :
                team === Team.Red ? 'bg-red-900/30 text-red-300' :
                'bg-blue-900/30 text-blue-300'
              }`}>
                {team === Team.System ? '⚙️' : team === Team.Red ? '🔴' : '🔵'} {team.toUpperCase()}
              </span>
              <span className="font-mono font-bold">{count}/{mission.agents.length === 0 ? '0' : Math.ceil(mission.agents.length / 3)}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {mission.status === 'active' ? (
            <button
              onClick={pauseMission}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-semibold transition-colors"
              title="Pause mission"
            >
              ⏸ PAUSE
            </button>
          ) : mission.status === 'paused' ? (
            <button
              onClick={resumeMission}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition-colors"
              title="Resume mission"
            >
              ▶ RESUME
            </button>
          ) : null}

          {(mission.status === 'active' || mission.status === 'paused') && (
            <>
              <button
                onClick={() => endMission('completed')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors"
                title="Mark mission complete"
              >
                ✓ COMPLETE
              </button>
              <button
                onClick={() => endMission('failed')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition-colors"
                title="Mark mission failed"
              >
                ✕ ABORT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionHeader;
