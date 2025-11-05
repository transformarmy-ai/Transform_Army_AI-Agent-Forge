import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';

type OrchestratorAction = 'list-agents' | 'dispatch-task' | 'get-status' | 'get-logs' | 'cancel-task' | 'custom-command';

interface OrchestratorRequest {
  id: string;
  action: OrchestratorAction;
  payload?: any;
  timestamp: string;
}

interface OrchestratorResponse {
  id: string;
  requestId: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  message: string;
  timestamp: string;
}

export function attachRawWs(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    // No-op welcome; frontend tracks status via connection open
    ws.on('message', (data: WebSocket.RawData) => {
      try {
        const req: OrchestratorRequest = JSON.parse(String(data));
        const base: Omit<OrchestratorResponse, 'id'> = {
          requestId: req.id,
          status: 'success',
          message: '',
          timestamp: new Date().toISOString(),
        };

        let resp: OrchestratorResponse;
        switch (req.action) {
          case 'list-agents':
            resp = { ...base, id: randomUUID(), data: [
              { id: 'agent.sample.1', name: 'Sample Agent 1' },
              { id: 'agent.sample.2', name: 'Sample Agent 2' },
            ], message: 'Agent list' };
            break;
          case 'get-status':
            resp = { ...base, id: randomUUID(), data: { uptime: process.uptime() }, message: 'Service OK' };
            break;
          case 'custom-command':
            resp = { ...base, id: randomUUID(), message: `Command received: ${String(req.payload?.text || '')}` };
            break;
          default:
            resp = { ...base, id: randomUUID(), status: 'error', message: `Unhandled action: ${req.action}` };
        }
        ws.send(JSON.stringify(resp));
      } catch (err) {
        // Ignore malformed frames
      }
    });
  });
}


