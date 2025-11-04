import { ChatMessage } from '../components/OrchestratorChatbox';

export interface OrchestratorRequest {
  id: string;
  action: 'list-agents' | 'dispatch-task' | 'get-status' | 'get-logs' | 'cancel-task' | 'custom-command';
  payload?: any;
  timestamp: string;
}

export interface OrchestratorResponse {
  id: string;
  requestId: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  message: string;
  timestamp: string;
}

export class OrchestratorService {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  private messageCallbacks: Map<string, (response: OrchestratorResponse) => void> = new Map();
  private statusCallbacks: ((status: 'connected' | 'connecting' | 'disconnected') => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(baseUrl: string = 'http://localhost:3000', wsUrl: string = 'ws://localhost:3000') {
    this.baseUrl = baseUrl;
    this.wsUrl = wsUrl;
  }

  /**
   * Connect to Orchestrator via WebSocket
   */
  async connect(): Promise<void> {
    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      return;
    }

    this.setConnectionStatus('connecting');

    try {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);

        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.reconnectAttempts = 0;
          this.setConnectionStatus('connected');
          console.log('✅ Connected to Orchestrator');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const response: OrchestratorResponse = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (err) {
            console.error('Failed to parse Orchestrator message:', err);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('WebSocket error:', error);
          this.setConnectionStatus('disconnected');
          reject(error);
        };

        this.ws.onclose = () => {
          this.setConnectionStatus('disconnected');
          this.attemptReconnect();
        };
      });
    } catch (error) {
      console.error('Failed to connect to Orchestrator:', error);
      this.setConnectionStatus('disconnected');
      this.attemptReconnect();
      throw error;
    }
  }

  /**
   * Disconnect from Orchestrator
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setConnectionStatus('disconnected');
  }

  /**
   * Send a command to the Orchestrator
   */
  async sendCommand(action: OrchestratorRequest['action'], payload?: any): Promise<OrchestratorResponse> {
    if (this.connectionStatus !== 'connected') {
      throw new Error('Not connected to Orchestrator');
    }

    const request: OrchestratorRequest = {
      id: crypto.randomUUID(),
      action,
      payload,
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(request.id);
        reject(new Error(`Command timeout: ${action}`));
      }, 30000); // 30s timeout

      this.messageCallbacks.set(request.id, (response: OrchestratorResponse) => {
        clearTimeout(timeout);
        this.messageCallbacks.delete(request.id);
        if (response.status === 'success') {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(request));
      } else {
        clearTimeout(timeout);
        this.messageCallbacks.delete(request.id);
        reject(new Error('WebSocket is not open'));
      }
    });
  }

  /**
   * Send raw text command (natural language)
   */
  async sendTextCommand(command: string): Promise<string> {
    try {
      const response = await this.sendCommand('custom-command', { text: command });
      return response.message;
    } catch (error) {
      throw new Error(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<any[]> {
    try {
      const response = await this.sendCommand('list-agents');
      return response.data || [];
    } catch (error) {
      console.error('Failed to list agents:', error);
      return [];
    }
  }

  /**
   * Get Orchestrator status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await this.sendCommand('get-status');
      return response.data;
    } catch (error) {
      console.error('Failed to get status:', error);
      return null;
    }
  }

  /**
   * Dispatch a task to an agent
   */
  async dispatchTask(agentId: string, taskType: string, payload: any): Promise<string> {
    try {
      const response = await this.sendCommand('dispatch-task', {
        agentId,
        taskType,
        payload,
      });
      return response.data?.taskId || 'unknown';
    } catch (error) {
      throw new Error(`Task dispatch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get logs
   */
  async getLogs(filter?: { agentId?: string; missionId?: string; limit?: number }): Promise<any[]> {
    try {
      const response = await this.sendCommand('get-logs', filter);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get logs:', error);
      return [];
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChange(callback: (status: 'connected' | 'connecting' | 'disconnected') => void): () => void {
    this.statusCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    return this.connectionStatus;
  }

  // Private methods

  private handleMessage(response: OrchestratorResponse): void {
    console.log('📨 Orchestrator response:', response);
    const callback = this.messageCallbacks.get(response.requestId);
    if (callback) {
      callback(response);
    }
  }

  private setConnectionStatus(status: 'connected' | 'connecting' | 'disconnected'): void {
    this.connectionStatus = status;
    this.statusCallbacks.forEach(cb => cb(status));
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect().catch(err => console.error('Reconnect failed:', err)), delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }
}

// Singleton instance
let orchestratorService: OrchestratorService | null = null;

export function getOrchestratorService(): OrchestratorService {
  if (!orchestratorService) {
    const baseUrl = process.env.REACT_APP_ORCHESTRATOR_URL || 'http://localhost:3000';
    const wsUrl = process.env.REACT_APP_ORCHESTRATOR_WS || 'ws://localhost:3000';
    orchestratorService = new OrchestratorService(baseUrl, wsUrl);
  }
  return orchestratorService;
}
