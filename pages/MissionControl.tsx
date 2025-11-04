import React, { useEffect, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import MissionHeader from '../components/MissionControl/MissionHeader';
import AgentMonitor from '../components/MissionControl/AgentMonitor';
import UnifiedLogStream from '../components/MissionControl/UnifiedLogStream';
import OrchestratorChatbox from '../components/OrchestratorChatbox';
import GeneralAgentChatbox from '../components/GeneralAgentChatbox';
import { getOrchestratorService } from '../services/orchestratorService';

const MissionControl: React.FC = () => {
  const { mission, startMission, setOrchestratorConnectionStatus, addLogEntry } = useMission();
  const [isChatboxOpen, setIsChatboxOpen] = React.useState(false);
  const [isGeneralOpen, setIsGeneralOpen] = React.useState(false);
  const orchestratorServiceRef = useRef(getOrchestratorService());

  useEffect(() => {
    if (!mission) {
      startMission('Active Mission', 'Real-time agent orchestration and monitoring');
    }
  }, [mission, startMission]);

  useEffect(() => {
    if (!mission) return;

    const orchestrator = orchestratorServiceRef.current;
    const unsubscribe = orchestrator.onConnectionStatusChange((status) => {
      setOrchestratorConnectionStatus(status);
      const statusEmoji = status === 'connected' ? '✅' : status === 'connecting' ? '⏳' : '❌';
      addLogEntry('System', `Orchestrator ${statusEmoji} ${status}`, status === 'connected' ? 'success' : 'warning');
    });

    orchestrator.connect().catch(err => {
      console.warn('⚠️ Failed to connect to Orchestrator:', err);
      addLogEntry('System', 'Orchestrator connection unavailable.', 'warning');
    });

    return () => {
      unsubscribe();
    };
  }, [mission, setOrchestratorConnectionStatus, addLogEntry]);

  const handleSendOrchestratorMessage = async (message: string) => {
    try {
      addLogEntry('User', message, 'info');
      const orchestrator = orchestratorServiceRef.current;
      const response = await orchestrator.sendTextCommand(message);
      addLogEntry('Orchestrator', response, 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addLogEntry('System Error', `Command failed: ${errorMsg}`, 'error');
      throw err;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[--color-bg-primary] overflow-hidden">
      <canvas
        id="matrixCanvas"
        className="fixed inset-0 -z-10 opacity-20"
        style={{ display: 'block' }}
      />

      <MissionHeader />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 overflow-hidden border-r border-[--color-border-primary]">
          <AgentMonitor />
        </div>

        <div className="flex-1 overflow-hidden p-4">
          <UnifiedLogStream />
        </div>
      </div>

      <GeneralAgentChatbox
        isOpen={isGeneralOpen}
        onClose={() => setIsGeneralOpen(false)}
        missionId={mission?.id || 'unknown'}
      />

      <OrchestratorChatbox
        isOpen={isChatboxOpen}
        onClose={() => setIsChatboxOpen(false)}
        onSendMessage={handleSendOrchestratorMessage}
        connectionStatus={mission?.orchestratorConnectionStatus || 'disconnected'}
      />

      <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-40">
        <button
          onClick={() => setIsGeneralOpen(!isGeneralOpen)}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center font-bold text-2xl hover:animate-pulse border-2 border-white/30"
          title="GENERAL - Field Commander"
        >
          🎖️
        </button>

        <button
          onClick={() => setIsChatboxOpen(!isChatboxOpen)}
          className="w-16 h-16 bg-gradient-to-br from-[--color-accent-red] to-[--color-accent-blue] text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center z-40 font-bold text-2xl hover:animate-pulse"
          title="Orchestrator Chat"
        >
          💬
        </button>
      </div>

      {mission?.orchestratorConnectionStatus && mission.orchestratorConnectionStatus !== 'disconnected' && (
        <div className={`fixed bottom-24 right-6 text-xs px-3 py-1.5 rounded border ${
          mission.orchestratorConnectionStatus === 'connected'
            ? 'bg-green-900/30 border-green-500 text-green-300'
            : 'bg-yellow-900/30 border-yellow-500 text-yellow-300'
        }`}>
          🔗 {mission.orchestratorConnectionStatus.toUpperCase()}
        </div>
      )}

      <footer className="px-6 py-3 bg-[--color-bg-secondary] border-t border-[--color-border-primary] text-center text-xs text-[--color-text-muted]">
        <p>
          🚀 <span className="font-semibold">Transform Army AI Mission Control</span> • Orchestrating the future
        </p>
      </footer>
    </div>
  );
};

export default MissionControl;
