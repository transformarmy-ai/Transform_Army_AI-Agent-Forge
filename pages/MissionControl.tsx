import React, { useEffect, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import MissionHeader from '../components/MissionControl/MissionHeader';
import AgentMonitor from '../components/MissionControl/AgentMonitor';
import UnifiedLogStream from '../components/MissionControl/UnifiedLogStream';
import OrchestratorChatbox from '../components/OrchestratorChatbox';
import { getOrchestratorService } from '../services/orchestratorService';

const MissionControl: React.FC = () => {
  const { mission, startMission, setOrchestratorConnectionStatus, addLogEntry } = useMission();
  const [isChatboxOpen, setIsChatboxOpen] = React.useState(false);
  const orchestratorServiceRef = useRef(getOrchestratorService());

  useEffect(() => {
    // Initialize mission if not already created
    if (!mission) {
      startMission('Active Mission', 'Real-time agent orchestration and monitoring');
    }
  }, [mission, startMission]);

  useEffect(() => {
    // Only initialize orchestrator connection if mission exists
    if (!mission) return;

    // Initialize Orchestrator connection
    const orchestrator = orchestratorServiceRef.current;
    const unsubscribe = orchestrator.onConnectionStatusChange((status) => {
      setOrchestratorConnectionStatus(status);
      const statusEmoji = status === 'connected' ? '✅' : status === 'connecting' ? '⏳' : '❌';
      addLogEntry('System', `Orchestrator ${statusEmoji} ${status}`, status === 'connected' ? 'success' : status === 'connecting' ? 'warning' : 'error');
    });

    // Attempt connection on mount
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
      {/* Background Matrix Rain (inherited from index.html) */}
      <canvas
        id="matrixCanvas"
        className="fixed inset-0 -z-10 opacity-20"
        style={{ display: 'block' }}
      />

      {/* Header */}
      <MissionHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent Monitor */}
        <div className="w-80 overflow-hidden border-r border-[--color-border-primary]">
          <AgentMonitor />
        </div>

        {/* Right Content - Log Stream */}
        <div className="flex-1 overflow-hidden p-4">
          <UnifiedLogStream />
        </div>
      </div>

      {/* Orchestrator Chatbox */}
      <OrchestratorChatbox
        isOpen={isChatboxOpen}
        onClose={() => setIsChatboxOpen(false)}
        onSendMessage={handleSendOrchestratorMessage}
        connectionStatus={mission?.orchestratorConnectionStatus || 'disconnected'}
      />

      {/* Floating Chatbox Toggle Button */}
      <button
        onClick={() => setIsChatboxOpen(!isChatboxOpen)}
        className="fixed bottom-6 right-4 w-16 h-16 bg-gradient-to-br from-[--color-accent-red] to-[--color-accent-blue] text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center z-40 font-bold text-2xl hover:animate-pulse"
        title={isChatboxOpen ? 'Close Orchestrator Chat' : 'Open Orchestrator Chat'}
      >
        💬
      </button>

      {/* Status Indicator */}
      {mission?.orchestratorConnectionStatus && mission.orchestratorConnectionStatus !== 'disconnected' && (
        <div className={`fixed bottom-24 right-6 text-xs px-3 py-1.5 rounded border ${
          mission.orchestratorConnectionStatus === 'connected'
            ? 'bg-green-900/30 border-green-500 text-green-300'
            : 'bg-yellow-900/30 border-yellow-500 text-yellow-300'
        }`}>
          🔗 {mission.orchestratorConnectionStatus.toUpperCase()}
        </div>
      )}

      {/* Footer - Elon Musk Persona Message */}
      <footer className="px-6 py-3 bg-[--color-bg-secondary] border-t border-[--color-border-primary] text-center text-xs text-[--color-text-muted]">
        <p>
          🚀 <span className="font-semibold">Transform Army AI Mission Control</span> • First principles thinking in real-time agent orchestration • Make AI better
        </p>
      </footer>
    </div>
  );
};

export default MissionControl;
