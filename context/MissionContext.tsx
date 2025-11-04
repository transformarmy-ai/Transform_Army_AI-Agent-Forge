import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AgentProfile, Team, AgentRole, Language, LLMProvider } from '../types';

export interface MissionLogEntry {
  timestamp: string;
  source: string;
  content: string;
  data?: any;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  team?: Team;
  template?: string;
  agents: AgentProfile[];
  logs: MissionLogEntry[];
  startedAt?: string;
  completedAt?: string;
  orchestratorConnectionStatus: 'connected' | 'connecting' | 'disconnected';
  selectedAgentId?: string;
}

interface MissionContextType {
  mission: Mission | null;
  setMission: (mission: Mission | null) => void;
  addAgent: (agent: AgentProfile) => void;
  removeAgent: (agentId: string) => void;
  updateAgentStatus: (agentId: string, status: string) => void;
  addLogEntry: (source: string, content: string, severity?: 'info' | 'warning' | 'error' | 'success', data?: any) => void;
  clearLogs: () => void;
  setOrchestratorConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  selectAgent: (agentId: string | undefined) => void;
  startMission: (name: string, description?: string, team?: Team, template?: string) => void;
  endMission: (status: 'completed' | 'failed') => void;
  pauseMission: () => void;
  resumeMission: () => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const STORAGE_KEY = 'transform-army.mission.v1';

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: Mission = JSON.parse(raw);
      // Reset transient connection status on load
      const restored: Mission = {
        ...parsed,
        orchestratorConnectionStatus: 'disconnected',
      };
      setMission(restored);
    } catch (err) {
      // Corrupt storage; clear it
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever mission changes
  useEffect(() => {
    try {
      if (!mission) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const toStore: Mission = {
        ...mission,
        // Do not persist 'connected' to avoid stale UI; set to disconnected on load
        orchestratorConnectionStatus: mission.orchestratorConnectionStatus,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Ignore quota or serialization errors
    }
  }, [mission]);

  const addAgent = useCallback((agent: AgentProfile) => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agents: [...prev.agents, agent],
      };
    });
  }, []);

  const removeAgent = useCallback((agentId: string) => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agents: prev.agents.filter(a => a.id !== agentId),
      };
    });
  }, []);

  const updateAgentStatus = useCallback((agentId: string, status: string) => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agents: prev.agents.map(a => a.id === agentId ? { ...a, status: status as any } : a),
      };
    });
  }, []);

  const addLogEntry = useCallback((source: string, content: string, severity: 'info' | 'warning' | 'error' | 'success' = 'info', data?: any) => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        logs: [...prev.logs.slice(-999), {
          timestamp: new Date().toISOString(),
          source,
          content,
          severity,
          data,
        }],
      };
    });
  }, []);

  const clearLogs = useCallback(() => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        logs: [],
      };
    });
  }, []);

  const setOrchestratorConnectionStatus = useCallback((status: 'connected' | 'connecting' | 'disconnected') => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        orchestratorConnectionStatus: status,
      };
    });
  }, []);

  const selectAgent = useCallback((agentId: string | undefined) => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        selectedAgentId: agentId,
      };
    });
  }, []);

  const startMission = useCallback((name: string, description?: string, team?: Team, template?: string) => {
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      name,
      description,
      team,
      template,
      status: 'active',
      agents: [],
      logs: [],
      startedAt: new Date().toISOString(),
      orchestratorConnectionStatus: 'disconnected',
    };
    setMission(newMission);
  }, []);

  const endMission = useCallback((status: 'completed' | 'failed') => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status,
        completedAt: new Date().toISOString(),
      };
    });
  }, []);

  const pauseMission = useCallback(() => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'paused',
      };
    });
  }, []);

  const resumeMission = useCallback(() => {
    setMission(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'active',
      };
    });
  }, []);

  const value: MissionContextType = {
    mission,
    setMission,
    addAgent,
    removeAgent,
    updateAgentStatus,
    addLogEntry,
    clearLogs,
    setOrchestratorConnectionStatus,
    selectAgent,
    startMission,
    endMission,
    pauseMission,
    resumeMission,
  };

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within MissionProvider');
  }
  return context;
};
