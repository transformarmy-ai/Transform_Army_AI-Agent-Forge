# Docker Test & Audit Plan

## Goals
- Validate services build and start correctly (frontend, api, db, redis, chroma)
- Verify health checks and dependencies
- Confirm network connectivity and endpoints
- Provide troubleshooting playbook

## Pre-req
```bash
cp README.env.example .env
# Fill in providers (OPENROUTER_API_KEY if using web provider)
```

## Build
```bash
docker compose build
```
- Expected: All images build successfully

## Start
```bash
docker compose up -d
```
- Expected: 4–5 containers running

## Inspect status
```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```
- Expected:
  - transform-army-ai-forge: Up (healthy)
  - transform-army-api: Up (healthy)
  - transform-army-db: Up (healthy)
  - transform-army-redis: Up (healthy)
  - transform-army-chroma: Up (healthy) [optional]

## Logs (spot-check)
```bash
docker logs transform-army-ai-forge --tail=50
docker logs transform-army-api --tail=50
```
- Frontend: Nginx serving index (200 for /)
- API: "🚀 Backend listening on http://localhost:3000"

## Healthchecks
- Frontend: GET http://localhost:88/health (200)
- API: GET http://localhost:3000/api/missions/status (200 JSON)
- DB: `pg_isready -U postgres -d transform_army` (healthy)
- Redis: `redis-cli ping` → PONG (healthy)
- Chroma: GET http://localhost:8000/api/v2/collections (200) [optional]

## Connectivity tests
```bash
# From host
curl -s http://localhost:88 | head
curl -s http://localhost:3000/api/missions/status
# WebSocket (install wscat if needed)
npx wscat -c ws://localhost:3000
```
- WS expected: connection opens (orchestrator gateway emits status event)

## End-to-end smoke
- Open Agent Forge UI at http://<host>:88
- Create a team/template to ensure frontend works
- Open Mission Control; backend connected → status shows connecting/connected

## Troubleshooting
- API fails with Nest HTTP driver error:
  - Ensure `@nestjs/platform-express` is installed (added) and node_modules copied to runtime
  - Rebuild: `docker compose build api && docker compose up -d api`
- API unhealthy:
  - Check `docker logs transform-army-api`
  - Ensure DB/Redis healthy; api depends_on waits for service_healthy
- Frontend unhealthy:
  - Confirm /health endpoint returns 200 (nginx.conf included)
- Chroma not healthy:
  - Check `docker logs transform-army-chroma`, then GET `/api/v2/collections`

## Production Notes
- Disable `synchronize: true` for TypeORM and use migrations
- Restrict CORS / origins in backend
- Add authentication (JWT) for REST/WS
- Consider reverse proxy (Traefik/Nginx) for TLS and public ingress


