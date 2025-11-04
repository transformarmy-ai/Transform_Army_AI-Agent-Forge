import React, { useMemo } from 'react';
import { Mission } from '../../context/MissionContext';

interface AnalyticsDashboardProps {
  mission: Mission;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ mission }) => {
  const stats = useMemo(() => {
    const successCount = mission.logs.filter(l => l.severity === 'success').length;
    const errorCount = mission.logs.filter(l => l.severity === 'error').length;
    const warningCount = mission.logs.filter(l => l.severity === 'warning').length;
    const infoCount = mission.logs.filter(l => l.severity === 'info').length;
    const total = mission.logs.length;

    return {
      successCount,
      errorCount,
      warningCount,
      infoCount,
      total,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
    };
  }, [mission.logs]);

  return (
    <div>
      <div className="px-4 py-3 border-b border-[--color-border-secondary] bg-gradient-to-r from-[--color-accent-blue] to-[--color-accent-red]">
        <h3 className="text-sm font-bold text-white uppercase">Analytics</h3>
      </div>

      <div className="divide-y divide-[--color-border-secondary] text-sm">
        {/* Status Card */}
        <div className="p-4">
          <p className="text-[--color-text-muted] uppercase text-xs mb-2 font-bold">Status</p>
          <div className="flex items-center justify-between">
            <span className="text-[--color-text-secondary]">Mission:</span>
            <span className="text-[--color-accent-red] font-bold uppercase">{mission.status}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-4">
          <p className="text-[--color-text-muted] uppercase text-xs mb-2 font-bold">Success Rate</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[--color-bg-tertiary] rounded overflow-hidden h-6">
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
            <span className="text-green-400 font-bold text-lg">{stats.successRate}%</span>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="p-4">
          <p className="text-[--color-text-muted] uppercase text-xs mb-3 font-bold">Tasks</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-400">✓ Success:</span>
              <span className="font-mono font-bold">{stats.successCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">✗ Error:</span>
              <span className="font-mono font-bold">{stats.errorCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">⚠ Warning:</span>
              <span className="font-mono font-bold">{stats.warningCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[--color-text-secondary]">ℹ Info:</span>
              <span className="font-mono font-bold">{stats.infoCount}</span>
            </div>
            <div className="border-t border-[--color-border-secondary] pt-2 mt-2 flex justify-between font-bold">
              <span className="text-[--color-accent-white]">Total:</span>
              <span className="font-mono text-[--color-accent-red]">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Agent Distribution */}
        <div className="p-4">
          <p className="text-[--color-text-muted] uppercase text-xs mb-3 font-bold">Team Distribution</p>
          <div className="space-y-2">
            {Object.entries(
              mission.agents.reduce((acc, agent) => {
                acc[agent.team] = (acc[agent.team] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([team, count]) => (
              <div key={team} className="flex justify-between">
                <span className="text-[--color-text-secondary]">{team}:</span>
                <span className="font-mono font-bold text-[--color-accent-blue]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
