import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

@WebSocketGateway({ cors: { origin: '*' } })
export class OrchestratorGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    client.emit('orchestrator:status', { status: 'connected', ts: new Date().toISOString() });
  }

  handleDisconnect(client: Socket) {
    // No-op
  }

  @SubscribeMessage('orchestrator:request')
  handleRequest(@MessageBody() body: OrchestratorRequest): OrchestratorResponse {
    const base: Omit<OrchestratorResponse, 'id'> = {
      requestId: body.id,
      status: 'success',
      message: '',
      timestamp: new Date().toISOString(),
    };

    switch (body.action) {
      case 'list-agents':
        return {
          ...base,
          id: crypto.randomUUID(),
          data: [{ id: 'agent.sample.1', name: 'Sample Agent 1' }, { id: 'agent.sample.2', name: 'Sample Agent 2' }],
          message: 'Agent list',
        };
      case 'get-status':
        return {
          ...base,
          id: crypto.randomUUID(),
          data: { uptime: process.uptime() },
          message: 'Service OK',
        };
      case 'custom-command':
        return {
          ...base,
          id: crypto.randomUUID(),
          message: `Command received: ${String(body.payload?.text || '')}`,
        };
      default:
        return {
          ...base,
          id: crypto.randomUUID(),
          status: 'error',
          message: `Unhandled action: ${body.action}`,
        };
    }
  }
}


