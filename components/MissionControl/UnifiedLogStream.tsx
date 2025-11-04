import React, { useState, useEffect, useRef } from 'react';
import { useMission } from '../../context/MissionContext';

const UnifiedLogStream: React.FC = () => {
  const { mission } = useMission();
  const [filter, setFilter] = useState<'all' | 'agent' | 'orchestrator' | 'system'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mission?.logs, autoScroll]);

  if (!mission) {
    return (
      <div className="h-full bg-[--color-bg-primary] border border-[--color-border-primary] rounded flex items-center justify-center">
        <p className="text-[--color-text-muted]">No mission loaded</p>
      </div>
    );
  }

  const filteredLogs = mission.logs.filter(log => {
    const matchesFilter = filter === 'all' ||
      (filter === 'agent' && log.source !== 'Orchestrator' && log.source !== 'System') ||
      (filter === 'orchestrator' && log.source === 'Orchestrator') ||
      (filter === 'system' && log.source === 'System');
    
    const matchesSearch = searchTerm === '' ||
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-[--color-text-secondary]';
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '•';
    }
  };

  const getSourceColor = (source: string) => {
    if (source.startsWith('Agent')) return 'text-cyan-400';
    if (source === 'Orchestrator') return 'text-[--color-accent-red]';
    if (source === 'System') return 'text-blue-400';
    if (source.toLowerCase().includes('slack')) return 'text-purple-400';
    return 'text-[--color-text-secondary]';
  };

  return (
    <div className="h-full flex flex-col bg-[--color-bg-primary] border border-[--color-border-primary] rounded overflow-hidden">
      {/* Header with Filters */}
      <div className="px-4 py-3 bg-[--color-bg-secondary] border-b border-[--color-border-secondary] flex gap-3 items-center flex-wrap">
        <div className="flex gap-2">
          {(['all', 'agent', 'orchestrator', 'system'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-[--color-accent-red] text-white'
                  : 'bg-[--color-bg-primary] text-[--color-text-secondary] hover:bg-[--color-bg-elevated]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[150px] px-3 py-1 bg-[--color-bg-primary] border border-[--color-border-primary] rounded text-sm text-[--color-text-primary] focus:outline-none focus:border-[--color-accent-red]"
        />

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            autoScroll
              ? 'bg-green-600 text-white'
              : 'bg-[--color-bg-elevated] text-[--color-text-secondary] hover:bg-[--color-bg-elevated]'
          }`}
          title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
        >
          {autoScroll ? '📍 FOLLOW' : '📍 PAUSED'}
        </button>

        <span className="text-xs text-[--color-text-muted] ml-auto">
          {filteredLogs.length} of {mission.logs.length} logs
        </span>
      </div>

      {/* Logs Container */}
      <div className="flex-1 overflow-y-auto font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[--color-text-muted]">
            <p>No logs matching filters</p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className="py-1 hover:bg-[--color-bg-elevated] rounded px-2 transition-colors group"
              >
                <div className="flex gap-3 items-start">
                  {/* Timestamp */}
                  <span className="text-[--color-text-muted] opacity-60 whitespace-nowrap text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>

                  {/* Severity Icon */}
                  <span className={getSeverityColor(log.severity)}>
                    {getSeverityIcon(log.severity)}
                  </span>

                  {/* Source */}
                  <span className={`${getSourceColor(log.source)} font-bold whitespace-nowrap w-20`}>
                    {log.source.length > 20 ? log.source.substring(0, 17) + '...' : log.source}
                  </span>

                  {/* Content */}
                  <span className="text-[--color-text-primary] flex-1 break-words">
                    {log.content}
                  </span>

                  {/* Details Button */}
                  {log.data && (
                    <button
                      className="opacity-0 group-hover:opacity-100 ml-2 px-2 py-0.5 bg-[--color-bg-secondary] hover:bg-[--color-bg-elevated] rounded text-xs transition-all"
                      title={JSON.stringify(log.data, null, 2)}
                    >
                      […]
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="px-4 py-2 bg-[--color-bg-secondary] border-t border-[--color-border-secondary] text-xs text-[--color-text-muted]">
        <div className="flex justify-between items-center">
          <span>Last 1000 logs shown</span>
          <span>Total: {mission.logs.length} entries</span>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogStream;
