# ChromaDB – Vector Memory (Optional)

## Do you need Chroma?
Use Chroma if you want any of the following:
- Long-term agent memory across sessions
- RAG over documents, code, logs, knowledge bases
- Semantic search for Mission Control (e.g., past missions/logs)

If you only need live orchestration and don’t do document search or memory, you can skip Chroma.

## Enable with Docker
Chroma is already added to `docker-compose.yml`.

Start services:
```bash
docker compose up -d --build
```

Defaults:
- REST: `http://localhost:8000`
- Data volume: `chroma_data`

## Frontend/Backend config
Set env (already in `README.env.example`):
```env
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

## Minimal API usage (HTTP)
Chroma exposes an HTTP API (v2); typical flow:
1) Create collection
2) Upsert embeddings/documents
3) Query similar items

Example (curl):
```bash
# Create collection (v2)
curl -s -X POST "http://localhost:8000/api/v2/collections" \
  -H 'Content-Type: application/json' \
  -d '{"name":"mission-memory"}'

# List collections (v2)
curl -s http://localhost:8000/api/v2/collections
```

Note: Chroma expects embeddings provided by you (OpenAI, local models, etc.). In a later phase we can add an embedding service (OpenAI or local) and backend endpoints that accept raw text, embed it, and upsert to Chroma automatically.

## Recommended next steps
- Add an EmbeddingService in backend (OpenAI or local) for automatic embeddings
- Add endpoints: `POST /api/vector/upsert`, `POST /api/vector/query`
- Connect Mission logs and docs to Chroma for semantic search

## Security
- Restrict access in production (network policies, auth proxy)
- Consider running Chroma behind the API and disallowing direct exposure


