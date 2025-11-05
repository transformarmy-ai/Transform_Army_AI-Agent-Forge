import React, { useEffect, useRef, useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { AgentStatus } from '../../types';

const AgentMonitor: React.FC = () => {
  const { mission, selectAgent, removeAgent, clearAgents, addLogEntry } = useMission();
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!mission) {
    return (
      <div className="h-full bg-[--color-bg-secondary] border-r border-[--color-border-primary] flex items-center justify-center">
        <p className="text-[--color-text-muted]">No mission</p>
      </div>
    );
  }

  const getStatusBadge = (status: any) => {
    switch (status) {
      case AgentStatus.Running:
        return { color: 'bg-green-500', label: '🟢 ACTIVE', glow: 'shadow-lg shadow-green-500/50' };
      case AgentStatus.Idle:
        return { color: 'bg-yellow-500', label: '🟡 IDLE', glow: 'shadow-md shadow-yellow-500/30' };
      case AgentStatus.Error:
        return { color: 'bg-red-500', label: '🔴 ERROR', glow: 'shadow-lg shadow-red-500/50' };
      default:
        return { color: 'bg-gray-500', label: '⚪ UNKNOWN', glow: '' };
    }
  };

  const sortedAgents = [...mission.agents].sort((a, b) => {
    // Sort by status: Running > Idle > Error
    const statusOrder = { [AgentStatus.Running]: 0, [AgentStatus.Idle]: 1, [AgentStatus.Error]: 2 };
    return (statusOrder[a.status as any] || 3) - (statusOrder[b.status as any] || 3);
  });

  // Matrix rain background scoped to roster panel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let columns = 0;
    let fontSize = 14;
    let drops: number[] = [];
    const glyphs = '01';

    const resize = () => {
      const parent = canvas.parentElement as HTMLElement;
      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(12, Math.floor(width / 50));
      columns = Math.max(1, Math.floor(width / fontSize));
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -20));
      ctx.font = `${fontSize}px monospace`;
    };

    const draw = () => {
      const parent = canvas.parentElement as HTMLElement;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(220, 20, 60, 0.6)'; // crimson

      for (let i = 0; i < columns; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        if (y >= -fontSize && y <= height + fontSize) {
          ctx.fillText(text, x, y);
        }
        if (y > height && Math.random() > 0.975) {
          drops[i] = Math.floor(Math.random() * -20);
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[--color-bg-secondary] border-r border-[--color-border-primary] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[--color-bg-secondary] to-[--color-bg-elevated] border-b border-[--color-border-primary] flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-orbitron font-bold text-[--color-accent-red]" style={{ textShadow: '0 0 10px var(--color-glow-red)' }}>
            AGENT ROSTER
          </h2>
          <p className="text-xs text-[--color-text-muted] mt-1">
            {mission.agents.length} agents deployed
          </p>
        </div>
        <button
          className="px-2 py-1 text-xs rounded border border-red-500 text-red-400 hover:bg-red-900/20 transition-colors"
          title="Clear all agents"
          onClick={() => {
            if (mission.agents.length === 0) return;
            if (window.confirm('Remove ALL agents from this mission?')) {
              clearAgents();
              addLogEntry('System', 'All agents cleared from mission', 'warning');
              setExpandedAgent(null);
            }
          }}
        >
          🗑 Clear All
        </button>
      </div>

      {/* Agents List with Matrix background */}
      <div className="relative flex-1 overflow-y-auto space-y-2 p-3">
        {/* Matrix Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 -z-10 opacity-15 pointer-events-none"
          aria-hidden="true"
        />
        {mission.agents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[--color-text-muted] text-sm">
            <p>No agents deployed yet</p>
          </div>
        ) : (
          sortedAgents.map(agent => {
            const statusBadge = getStatusBadge(agent.status);
            const isExpanded = expandedAgent === agent.id;

            return (
              <div
                key={agent.id}
                className="bg-[--color-bg-primary] border border-[--color-border-secondary] rounded overflow-hidden hover:border-[--color-accent-red] transition-all"
              >
                {/* Agent Header */}
                <button
                  onClick={() => {
                    selectAgent(isExpanded ? undefined : agent.id);
                    setExpandedAgent(isExpanded ? null : agent.id);
                  }}
                  className="w-full px-3 py-2 hover:bg-[--color-bg-elevated] transition-colors text-left flex items-center gap-2"
                >
                  {/* Status Indicator */}
                  <div className={`w-2.5 h-2.5 rounded-full ${statusBadge.color} ${statusBadge.glow}`} />

                  {/* Agent Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[--color-text-primary] truncate text-sm">
                      {agent.manifest.name}
                    </p>
                    <p className="text-xs text-[--color-text-muted] truncate">
                      {agent.team} / {agent.role}
                    </p>
                  </div>

                  {/* Chevron */}
                  <span className={`text-[--color-text-secondary] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 py-2 bg-[--color-bg-elevated] border-t border-[--color-border-secondary] space-y-2 text-xs">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-[--color-text-muted]">Status:</span>
                      <span className={`px-2 py-0.5 rounded font-semibold ${statusBadge.color} text-white`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Agent Details */}
                    <div className="space-y-1 text-[--color-text-muted]">
                      <p>
                        <span className="text-[--color-text-secondary]">Language:</span> {agent.manifest.language.name}
                      </p>
                      <p>
                        <span className="text-[--color-text-secondary]">Model:</span> {agent.manifest.model.modelId}
                      </p>
                      <p>
                        <span className="text-[--color-text-secondary]">Tools:</span> {agent.manifest.tools.length}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-[--color-border-secondary]">
                      <button
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                        title="Chat with agent"
                      >
                        💬 Chat
                      </button>
                      <button
                        className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition-colors"
                        title="Dispatch task"
                      >
                        ▶️ Task
                      </button>
                      <button
                        className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                        title="Terminate agent"
                      >
                        ⏹ Stop
                      </button>
                      <button
                        className="flex-1 px-2 py-1 bg-[--color-bg-primary] border border-red-600 text-red-400 hover:bg-red-900/20 rounded text-xs font-semibold transition-colors"
                        title="Delete agent from mission"
                        onClick={() => {
                          if (window.confirm(`Remove agent "${agent.manifest.name}" from mission?`)) {
                            removeAgent(agent.id);
                            addLogEntry('System', `Agent removed: ${agent.manifest.name}`, 'warning');
                            if (expandedAgent === agent.id) setExpandedAgent(null);
                          }
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-3 py-2 bg-[--color-bg-primary] border-t border-[--color-border-primary] text-xs text-[--color-text-muted]">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Active:</span>
            <span className="text-green-400 font-semibold">
              {mission.agents.filter(a => a.status === AgentStatus.Running).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Idle:</span>
            <span className="text-yellow-400 font-semibold">
              {mission.agents.filter(a => a.status === AgentStatus.Idle).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Error:</span>
            <span className="text-red-400 font-semibold">
              {mission.agents.filter(a => a.status === AgentStatus.Error).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMonitor;
