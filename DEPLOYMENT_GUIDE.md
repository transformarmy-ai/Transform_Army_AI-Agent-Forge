# Transform Army AI - Deployment Guide

## Quick Start (5 minutes)

### 1. Prerequisites
```bash
# Node.js 18+ and npm installed
node --version  # Should be v18.0.0 or higher
npm --version
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Create .env file in project root
cp README.env.example .env

# Edit .env and add your LLM provider API key
# Choose ONE:
# OPENROUTER_API_KEY=sk-...
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-...
```

### 4. Start Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### 5. Use Application
1. Open Agent Forge at `http://localhost:5173/forge`
2. Create an agent using the form
3. Click "🎛 Mission Control" button
4. Monitor your agent in real-time

---

## Full Setup Guide

### Environment Configuration

Create a `.env` file in the project root:

```bash
# ===== LLM Provider Configuration =====
# Choose ONE provider:

# Option 1: OpenRouter (Recommended - supports 100+ models)
OPENROUTER_API_KEY=sk-or-...

# Option 2: OpenAI Direct
OPENAI_API_KEY=sk-...

# Option 3: Anthropic (Claude models)
ANTHROPIC_API_KEY=sk-ant-...

# Option 4: Ollama (Local, free)
OLLAMA_BASE_URL=http://localhost:11434

# Option 5: LM Studio (Local, free)
LMSTUDIO_BASE_URL=http://localhost:1234

# ===== Orchestrator Backend =====
REACT_APP_ORCHESTRATOR_URL=http://localhost:3000
REACT_APP_ORCHESTRATOR_WS=ws://localhost:3000

# ===== Slack Integration (Optional) =====
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_CHANNEL_ID=C1234567890

# ===== System Tools (Optional) =====
# GitHub Integration
GITHUB_API_TOKEN=ghp_...
GITHUB_USERNAME=your_username

# DuckDuckGo Search (optional - no key required)
# DUCKDUCKGO_API_KEY=...
```

### Using Local LLMs

#### Option A: Ollama (Recommended)

```bash
# 1. Install Ollama
# Visit https://ollama.ai

# 2. Start Ollama service
ollama serve

# 3. In another terminal, pull a model
ollama pull llama3.1
ollama pull mistral

# 4. In .env:
OLLAMA_BASE_URL=http://localhost:11434

# 5. In Agent Forge, select "Ollama" as LLM Provider
```

#### Option B: LM Studio

```bash
# 1. Download LM Studio
# Visit https://lmstudio.ai

# 2. Load a GGUF model in the UI
# Download from https://huggingface.co/models?search=gguf

# 3. Start the local server (via LM Studio UI)
# Default port: 1234

# 4. In .env:
LMSTUDIO_BASE_URL=http://localhost:1234

# 5. In Agent Forge, select "LM Studio" as LLM Provider
```

### Using Cloud LLMs

#### OpenRouter (Best for beginners)

```bash
# 1. Sign up at https://openrouter.ai
# 2. Get your API key from dashboard
# 3. Add to .env:
OPENROUTER_API_KEY=sk-or-...
```

#### OpenAI

```bash
# 1. Sign up at https://openai.com
# 2. Create API key in account settings
# 3. Add to .env:
OPENAI_API_KEY=sk-...
```

#### Anthropic (Claude)

```bash
# 1. Sign up at https://console.anthropic.com
# 2. Create API key in settings
# 3. Add to .env:
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Running Mission Control

### Step 1: Start Agent Forge

```bash
npm run dev
# Navigate to http://localhost:5173
```

### Step 2: Create Agents

In Agent Forge:
1. Select **Team** (System, Red, or Blue)
2. Select **Role** (specific to team)
3. Select **Language** (Python, Go, JavaScript, etc.)
4. Select **LLM Provider** (local or cloud)
5. Select or create **Tools**
6. Click **"ENGAGE & FORGE MANIFEST"**

### Step 3: Go to Mission Control

After creating at least one agent:
1. Click the **"🎛 Mission Control"** button (bottom right)
2. Or navigate to `http://localhost:5173/mission-control`

### Step 4: Monitor & Command

In Mission Control:
1. View mission status in header
2. Watch agent roster in sidebar
3. Monitor unified logs
4. Send commands via Orchestrator chatbox

---

## Configuration Files

### vite.config.ts

```typescript
// Already configured for environment variables
// Environment variables are automatically injected as REACT_APP_*
```

### .env.example (README.env.example)

See `README.env.example` in project root for all available options.

### package.json Scripts

```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run type-check # TypeScript type checking
```

---

## Slack Integration Setup

### 1. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Enter App Name: "Transform Army AI"
5. Select your workspace

### 2. Configure Bot Token Scopes

1. Go to "OAuth & Permissions"
2. Add scopes:
   - `chat:write`
   - `chat:write.public`
   - `commands`
   - `incoming-webhook`

3. Install app to workspace
4. Copy "Bot User OAuth Token" → `SLACK_BOT_TOKEN` in .env

### 3. Get Signing Secret

1. Go to "Basic Information"
2. Copy "Signing Secret" → `SLACK_SIGNING_SECRET` in .env

### 4. Find Channel ID

1. In Slack, right-click channel
2. Select "View channel details"
3. Copy Channel ID → `SLACK_CHANNEL_ID` in .env

### 5. Test Integration

In Agent Forge, create an agent with Slack integration enabled. You should see notifications in your Slack channel.

---

## GitHub Integration Setup

### 1. Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token"
3. Select scopes:
   - `repo` (full control of repositories)
   - `read:user` (read user profile data)

4. Copy token → `GITHUB_API_TOKEN` in .env

### 2. Add GitHub Username

```bash
# In .env:
GITHUB_USERNAME=your_github_username
```

### 3. Test Integration

System tools will now have GitHub search and repository access.

---

## Orchestrator Backend Setup

### Option A: Local Development (No Backend)

Mission Control works read-only without backend:
- ✅ Can create and view agents
- ✅ Can see logs
- ❌ Cannot send real commands to agents
- ❌ Cannot get live orchestrator responses

### Option B: With Backend

If you have an Orchestrator backend running:

```bash
# In .env:
REACT_APP_ORCHESTRATOR_URL=http://localhost:3000
REACT_APP_ORCHESTRATOR_WS=ws://localhost:3000

# Or for production:
REACT_APP_ORCHESTRATOR_URL=https://your-domain.com
REACT_APP_ORCHESTRATOR_WS=wss://your-domain.com
```

The Orchestrator service will:
- Connect via WebSocket
- Auto-reconnect on disconnect
- Support natural language commands
- Stream live agent updates

---

## Production Deployment

### Build for Production

```bash
npm run build
# Outputs to ./dist directory
```

### Deploy Static Files

The `dist` folder contains everything needed:
- `index.html` - Entry point
- `assets/` - JavaScript and CSS bundles
- All assets are hashed for caching

#### Option A: Netlify

```bash
npm install -g netlify-cli

# First deployment
netlify deploy --prod --dir=dist

# Future deployments
npm run build && netlify deploy --prod --dir=dist
```

#### Option B: Vercel

```bash
npm install -g vercel

# First deployment
vercel --prod

# Future deployments
npm run build && vercel --prod
```

#### Option C: Docker

```dockerfile
# Dockerfile provided in project root
# Build: docker build -t transform-army-ai .
# Run: docker run -p 3000:3000 transform-army-ai
```

#### Option D: Self-Hosted (Nginx)

```bash
# 1. Build
npm run build

# 2. Copy dist to web server
cp -r dist /var/www/html/

# 3. Configure nginx (see nginx.conf in project)
```

### Environment Variables in Production

For production, inject environment variables at runtime:

```bash
# Using Docker
docker run -e REACT_APP_ORCHESTRATOR_URL=https://... transform-army-ai

# Using environment file
cat > .env.production << EOF
REACT_APP_ORCHESTRATOR_URL=https://your-domain.com
REACT_APP_ORCHESTRATOR_WS=wss://your-domain.com
EOF
npm run build
```

---

## Troubleshooting Deployment

### Issue: Blank page after deployment

**Cause**: Incorrect base URL or missing environment variables  
**Fix**:
1. Check `vite.config.ts` base path
2. Verify environment variables set correctly
3. Check browser console for errors

### Issue: API calls failing with CORS error

**Cause**: Backend not configured for CORS  
**Fix**:
1. Enable CORS on backend
2. Add frontend URL to allowed origins
3. Use proxy if needed

### Issue: WebSocket won't connect

**Cause**: Wrong protocol (http vs https, ws vs wss)  
**Fix**:
1. Use `wss://` for HTTPS
2. Use `ws://` for HTTP
3. Verify backend accepts connections
4. Check firewall/security rules

### Issue: Environment variables not loading

**Cause**: Variables not prefixed with `REACT_APP_`  
**Fix**:
1. All client-side variables must start with `REACT_APP_`
2. Rebuild after changing .env
3. Server-side secrets can use different prefix

---

## Development Tips

### Debug Mode

```bash
# Enable verbose logging in browser console
# Set in localStorage:
localStorage.setItem('DEBUG_TRANSFORM_ARMY', 'true');
```

### API Inspection

1. Open DevTools → Network tab
2. Filter by XHR/WebSocket
3. Click requests to inspect

### Component Debugging

```bash
# React DevTools browser extension recommended
# Use React Profiler to identify performance bottlenecks
```

### Type Checking

```bash
# Run type checker without building
npm run type-check
```

---

## Performance Optimization

### Production Build Optimization

```bash
# The build automatically:
# - Minifies JavaScript
# - Optimizes CSS
# - Creates hashed bundles for caching
# - Generates source maps (for debugging)
```

### Browser Caching

Add headers to maximize caching:

```
# For assets (hashed filenames)
Cache-Control: max-age=31536000

# For HTML (always fresh)
Cache-Control: no-cache, must-revalidate
```

### Content Delivery Network (CDN)

Deploy using a CDN for faster worldwide access:
- Netlify (automatic)
- Vercel (automatic)
- CloudFlare
- AWS CloudFront

---

## Monitoring & Logging

### Browser Console Logs

Agent Forge and Mission Control log important events:
```
✅ Success messages (green)
⚠️ Warning messages (yellow)
❌ Error messages (red)
ℹ️ Info messages (blue)
```

### Backend Logs

Check your Orchestrator backend logs for:
- Connection issues
- Command failures
- Agent errors

### Slack Integration Logs

Enable Slack app logging in https://api.slack.com/apps for audit trail.

---

## Checklist for Production

- [ ] Environment variables configured
- [ ] LLM provider API keys added
- [ ] Orchestrator backend running (if used)
- [ ] Slack integration tested (if used)
- [ ] GitHub integration tested (if used)
- [ ] HTTPS certificate configured
- [ ] Firewall rules for WebSocket
- [ ] Rate limiting configured
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation reviewed
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Disaster recovery plan in place

---

## Support

For issues and questions:

1. Check relevant guide:
   - `MISSION_CONTROL_GUIDE.md` - User guide
   - `ARCHITECTURE.md` - Technical architecture
   - `ADMIN_GUIDE.md` - Admin procedures
   - `SLACK_ADMIN_GUIDE.md` - Slack setup
   - `SYSTEM_TOOLS_GUIDE.md` - Tools reference

2. Review browser console for errors

3. Check backend logs if applicable

4. Enable debug mode for more verbose output

---

**Happy deploying!** 🚀

Transform Army AI - Making AI orchestration frictionless.
