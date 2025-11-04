# Docker Environment Variable Setup - Technical Details

> **Related:** [DOCKER_README.md](./DOCKER_README.md) for user-facing instructions | [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md) for quick reference

## 🔒 Security Best Practice

The `.env` file is **excluded** from the Docker build context via `.dockerignore` for security reasons. This prevents accidentally committing sensitive API keys into the Docker image layers.

## ⚙️ How It Works

Instead of copying `.env` directly, we use Docker's build argument system:

### The Flow

```
1. Create .env file locally (never committed to git)
   ↓
2. docker-compose reads .env and extracts variables
   ↓
3. Variables passed as --build-arg to Docker
   ↓
4. Dockerfile ARG instructions receive values
   ↓
5. Values written to .env inside container during build
   ↓
6. Vite's loadEnv() reads .env during npm run build
   ↓
7. process.env.* values baked into static JavaScript
   ↓
8. Final image: only static files, no .env in layers
```

## 📋 Files Involved

### `.dockerignore`
```dockerfile
.env          # Excluded from COPY . .
```

### `Dockerfile`
```dockerfile
ARG OPENAI_API_KEY       # Accept build argument
ARG OPENROUTER_API_KEY
ARG ANTHROPIC_API_KEY
# ... etc

RUN echo "OPENAI_API_KEY=${OPENAI_API_KEY}" > .env   # Create .env in container
RUN npm run build                                       # Vite reads it
```

### `docker-compose.yml`
```yaml
build:
  args:
    OPENAI_API_KEY: ${OPENAI_API_KEY:-}      # Pass value from .env
    OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-}
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:-}
    # ... etc
```

### `.env` (local file, not in git)
```bash
OPENAI_API_KEY=sk-your-key-here
OPENROUTER_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-your-key-here
# ... etc
```

## ✅ Benefits of This Approach

1. **Security:** `.env` never copied into image layers
2. **Flexibility:** Easy to change keys without modifying code
3. **Standard:** Uses Docker's native build arg system
4. **Compatibility:** Works with docker-compose auto-reading .env

## ⚠️ Common Pitfalls

### ❌ Don't do this:
```bash
# This won't work - .env is excluded by .dockerignore
COPY .env .
```

### ✅ Do this instead:
```bash
# Use build arguments
ARG GEMINI_API_KEY
RUN echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > .env
```

## 🧪 Testing Your Setup

### Verify .env is being read:
```bash
# Check docker-compose reads it
docker-compose config

# Should show:
# GEMINI_API_KEY: sk-your-key-here
```

### Verify keys get baked in:
```bash
# Build the image
docker-compose build

# Extract and check built JavaScript
docker create --name temp agent-forge:latest
docker cp temp:/usr/share/nginx/html /tmp/extracted
docker rm temp

# Search for your API key (should be visible)
grep -r "GEMINI_API_KEY" /tmp/extracted
```

## 🔍 Debugging

### Keys not working?

1. **Check .env exists:**
   ```bash
   cat .env
   ```

2. **Check docker-compose reads it:**
   ```bash
   docker-compose config | grep API_KEY
   ```

3. **Check build args passed:**
   ```bash
   docker-compose build --progress=plain 2>&1 | grep -A 5 "ARG GEMINI_API_KEY"
   ```

4. **Check Vite receives them:**
   Build will fail if keys are missing at build-time

### Empty keys?

If you see:
```javascript
process.env.GEMINI_API_KEY = ""
```

It means:
- `.env` file missing or empty
- `docker-compose` not reading `.env`
- Variables not passed as build args
- Check `docker-compose.yml` args section

## 📝 Alternative: Manual Build Args

If you don't want to use `.env`:

```bash
docker build \
  --build-arg GEMINI_API_KEY="sk-..." \
  --build-arg OPENAI_API_KEY="sk-..." \
  -t agent-forge .
```

## 🚀 Production Deployment

For CI/CD:

```bash
# Use secrets management
docker build \
  --build-arg GEMINI_API_KEY="$GEMINI_API_KEY_SECRET" \
  --build-arg OPENAI_API_KEY="$OPENAI_API_KEY_SECRET" \
  -t agent-forge:prod .
```

## 📚 References

- [Docker Build Args](https://docs.docker.com/engine/reference/builder/#arg)
- [Docker Compose Variable Substitution](https://docs.docker.com/compose/compose-file/compose-file-v3/#variable-substitution)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

