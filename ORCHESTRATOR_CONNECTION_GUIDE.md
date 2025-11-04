# Orchestrator Connection Guide

**Status**: ✅ Mission Control works WITHOUT backend (read-only mode)

---

## 🔌 Connection Status

### Current Error
```
❌ WebSocket connection timeout
❌ Max reconnection attempts reached
```

**This is EXPECTED and NORMAL** - it just means there's no backend Orchestrator service running.

---

## 🎯 Two Operating Modes

### Mode 1: **Without Backend** (Current - Works Fine!) ✅

**What works**:
- ✅ Create agents in Agent Forge
- ✅ View agents in Mission Control
- ✅ Monitor agent status and logs
- ✅ Unified log stream
- ✅ Everything except live orchestrator commands

**What doesn't work**:
- ❌ Send commands to Orchestrator
- ❌ Real-time agent task dispatch
- ❌ Live mission orchestration

**Status in UI**:
- Connection status shows: **"❌ Disconnected"**
- Chatbox shows: **"Not connected"**
- Everything else works normally

**Use Case**:
- Development and testing
- Agent creation and configuration
- Manifest generation and export
- Local development without backend

### Mode 2: **With Backend** (Optional - For Full Features)

**What works**:
- ✅ Everything from Mode 1
- ✅ Send natural language commands to Orchestrator
- ✅ Real-time agent task dispatch
- ✅ Live mission orchestration
- ✅ Dynamic agent control

**What's required**:
- Backend Orchestrator service running
- Environment variables configured
- WebSocket endpoint accessible

**Use Case**:
- Full production setup
- Live agent orchestration
- Mission control and monitoring
- Advanced agent coordination

---

## ✅ Mission Control WITHOUT Backend

You can use Mission Control right now for:

1. **Create & View Agents**
   - Create agents in Agent Forge ✅
   - See them in Mission Control sidebar ✅
   - Monitor their details ✅

2. **View Logs & Status**
   - Unified log stream shows all events ✅
   - Agent status indicators visible ✅
   - Mission controls functional ✅

3. **Mission Management**
   - Pause/Resume mission ✅
   - Complete/Abort mission ✅
   - View mission metrics ✅

4. **Agent Roster**
   - Live agent list ✅
   - Agent details on click ✅
   - Team distribution ✅

---

## 🚀 Setting Up Backend (Optional)

If you want the full orchestration features, you need to set up the backend Orchestrator service.

### Step 1: Environment Variables

Create/update `.env` file:
```bash
# Orchestrator Backend
REACT_APP_ORCHESTRATOR_URL=http://localhost:3000
REACT_APP_ORCHESTRATOR_WS=ws://localhost:3000
```

### Step 2: Backend Service

You need a backend service running at `ws://localhost:3000` that:
- Accepts WebSocket connections
- Receives orchestrator commands
- Manages live agent coordination
- Sends real-time mission updates

### Step 3: Backend Options

Choose ONE of these:
- **Python Flask/FastAPI** with WebSocket support
- **Node.js Express** with Socket.io or native WebSocket
- **Go** with WebSocket libraries
- **Any framework** with WebSocket support

### Step 4: Verify Connection

Once backend is running:
1. Go to Mission Control
2. Look for connection status: **"✅ Connected"**
3. Chatbox should be enabled
4. All orchestrator commands available

---

## 🔧 Troubleshooting

### Issue: "WebSocket connection timeout"

**Cause**: No backend service running at the configured URL

**Solutions**:
1. **Use Frontend Only** (Recommended for now)
   - Mission Control works fine without backend
   - Connection errors are harmless and don't affect functionality

2. **Start Backend Service**
   - Ensure backend is running on correct URL
   - Check `REACT_APP_ORCHESTRATOR_WS` configuration
   - Verify firewall/network settings

3. **Change Timeout Settings**
   - Edit `services/orchestratorService.ts`
   - Increase `maxReconnectAttempts` or `reconnectDelay` if needed

### Issue: "Connection established but commands fail"

**Cause**: Backend running but not properly handling requests

**Solutions**:
1. Check backend logs for errors
2. Verify backend can parse orchestrator protocol
3. Check request/response format compatibility

### Issue: "Connection drops frequently"

**Cause**: Network issues or backend restarts

**Solutions**:
1. Check network stability
2. Verify backend keeps running
3. Increase reconnection delay in service

---

## 📊 Feature Availability

| Feature | Without Backend | With Backend |
|---------|-----------------|--------------|
| **Create Agents** | ✅ | ✅ |
| **View Agents** | ✅ | ✅ |
| **Agent Details** | ✅ | ✅ |
| **View Logs** | ✅ | ✅ |
| **Mission Controls** | ✅ | ✅ |
| **Status Monitoring** | ✅ | ✅ |
| **Send Commands** | ❌ | ✅ |
| **Live Dispatch** | ❌ | ✅ |
| **Real-time Updates** | ❌ | ✅ |
| **Agent Orchestration** | ❌ | ✅ |

---

## 💡 Recommended Setup

### For Development
- ✅ Use WITHOUT backend
- ✅ Focus on agent creation and configuration
- ✅ Test manifests and templates
- ✅ No need for complex backend setup

### For Testing Full System
- ✅ Start simple backend WebSocket service
- ✅ Or use mock orchestrator
- ✅ Test command/response flow
- ✅ Verify integration

### For Production
- ✅ Deploy full Orchestrator service
- ✅ Configure environment variables
- ✅ Enable all mission control features
- ✅ Monitor and log all activities

---

## 🎯 Bottom Line

**You don't need the backend to use Mission Control!** ✅

The connection errors are harmless and expected when no backend is running. Mission Control is fully functional for:
- Creating and managing agents
- Viewing mission status
- Monitoring logs
- Managing mission lifecycle

Proceed with creating agents, and add the backend orchestrator later if you need live command dispatch.

---

**Ready to use Mission Control?**
1. Go to Agent Forge
2. Create agents
3. Click 🎛 Mission Control
4. Enjoy the dashboard (connection errors are fine!)
