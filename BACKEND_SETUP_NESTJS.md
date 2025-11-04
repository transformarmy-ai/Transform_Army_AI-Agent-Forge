## Transform Army Backend (NestJS + Socket.IO + BullMQ + Postgres)

### Overview
- WebSocket gateway for Orchestrator protocol
- REST endpoints for agents, missions, tasks, logs
- Postgres via TypeORM (synchronize on first run)
- Redis-ready for BullMQ (queue wiring to be added in phase 2)

### Quick Start (Docker Compose)
1. Copy env:
   ```bash
   cp README.env.example .env
   ```
2. Start services (from project root):
   ```bash
   docker compose up -d --build
   ```
3. Frontend connects to backend:
   - REST: `http://localhost:3000/api`
   - WebSocket: `ws://localhost:3000`

4. LLM providers (backend):
   - Web provider (OpenRouter): set `OPENROUTER_API_KEY`
   - Local provider (LM Studio): ensure `LMSTUDIO_BASE_URL` (default `http://localhost:1234`)
   - Endpoint: `POST /api/llm/chat` with body:
     ```json
     {
       "provider": "web", // or "local" (aliases: openrouter, lmstudio)
       "model": "openrouter/auto",
       "messages": [{"role":"user","content":"hello"}],
       "temperature": 0.2
     }
     ```

### Services
- api: NestJS backend (`backend/`)
- db: Postgres 15 (port 5432)
- redis: Redis 7 (port 6379)

### Env Vars
```env
REACT_APP_ORCHESTRATOR_URL=http://localhost:3000
REACT_APP_ORCHESTRATOR_WS=ws://localhost:3000
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/transform_army
REDIS_URL=redis://localhost:6379
```

### Protocol (WS)
Request:
```json
{ "id": "uuid", "action": "list-agents", "payload": {}, "timestamp": "ISO" }
```
Response:
```json
{ "id": "uuid", "requestId": "uuid", "status": "success", "message": "", "data": {}, "timestamp": "ISO" }
```

### Endpoints (REST)
- GET `/api/agents`
- GET `/api/missions/status`
- GET `/api/tasks`
- GET `/api/logs`

### Development (without Docker)
```bash
cd backend
npm install
npx nest build
npm run start:dev
```

### Notes
- TypeORM `synchronize: true` is enabled for development.
- BullMQ wiring is planned for the next phase (queues and workers).
- Adjust CORS domains in `src/main.ts` if deploying behind a domain.


