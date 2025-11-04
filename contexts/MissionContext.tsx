import React, { createContext, useContext, useState, useCallback } from 'react';
import { AgentProfile } from '../types';

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
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  agents: AgentProfile[];
  logs: MissionLogEntry[];
  startedAt: string;
  endedAt?: string;
  orchestratorConnectionStatus: 'connected' | 'connecting' | 'disconnected';
  successRate: number;
  activeTaskCount: number;
}

interface MissionContextType {
  mission: Mission | null;
  createMission: (name: string, agents: AgentProfile[]) => void;
  addLogEntry: (source: string, content: string, data?: any, severity?: string) => void;
  updateMissionStatus: (status: Mission['status']) => void;
  updateOrchestratorStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  clearMission: () => void;
  addAgentToMission: (agent: AgentProfile) => void;
  removeAgentFromMission: (agentId: string) => void;
  getAgentLogs: (agentId: string) => MissionLogEntry[];
  getMissionStats: () => { totalTasks: number; successRate: number; agentCount: number };
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mission, setMission] = useState<Mission | null>(null);

  const createMission = useCallback((name: string, agents: AgentProfile[]) => {
    const newMission: Mission = {
      id: crypto.randomUUID(),
      name,
      status: 'planning',
      agents,
      logs: [],
      startedAt: new Date().toISOString(),
      orchestratorConnectionStatus: 'disconnected',
      successRate: 0,
      activeTaskCount: 0,
    };
    setMission(newMission);
    console.log(`✅ Mission created: ${name}`);
  }, []);

  const addLogEntry = useCallback((source: string, content: string, data?: any, severity: string = 'info') => {
    setMission(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        logs: [...prev.logs.slice(-499), {
          timestamp: new Date().toISOString(),
          source,
          content,
          data,
          severity: severity as any,
        }],
      };
    });
  }, []);

  const updateMissionStatus = useCallback((status: Mission['status']) => {
    setMission(prev => {
      if (!prev) return prev;
      return { ...prev, status, endedAt: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined };
    });
    console.log(`📊 Mission status: ${status}`);
  }, []);

  const updateOrchestratorStatus = useCallback((status: 'connected' | 'connecting' | 'disconnected') => {
    setMission(prev => (prev ? { ...prev, orchestratorConnectionStatus: status } : prev));
  }, []);

  const clearMission = useCallback(() => {
    setMission(null);
    console.log('🗑️ Mission cleared');
  }, []);

  const addAgentToMission = useCallback((agent: AgentProfile) => {
    setMission(prev => {
      if (!prev) return prev;
      return { ...prev, agents: [...prev.agents, agent] };
    });
  }, []);

  const removeAgentFromMission = useCallback((agentId: string) => {
    setMission(prev => {
      if (!prev) return prev;
      return { ...prev, agents: prev.agents.filter(a => a.id !== agentId) };
    });
  }, []);

  const getAgentLogs = useCallback((agentId: string): MissionLogEntry[] => {
    if (!mission) return [];
    return mission.logs.filter(log => log.data?.agentId === agentId);
  }, [mission]);

  const getMissionStats = useCallback(() => {
    if (!mission) return { totalTasks: 0, successRate: 0, agentCount: 0 };
    const successLogs = mission.logs.filter(l => l.severity === 'success').length;
    const totalLogs = mission.logs.length;
    return {
      totalTasks: mission.logs.length,
      successRate: totalLogs > 0 ? (successLogs / totalLogs) * 100 : 0,
      agentCount: mission.agents.length,
    };
  }, [mission]);

  const value: MissionContextType = {
    mission,
    createMission,
    addLogEntry,
    updateMissionStatus,
    updateOrchestratorStatus,
    clearMission,
    addAgentToMission,
    removeAgentFromMission,
    getAgentLogs,
    getMissionStats,
  };

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
};

export const useMission = (): MissionContextType => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within MissionProvider');
  }
  return context;
};
