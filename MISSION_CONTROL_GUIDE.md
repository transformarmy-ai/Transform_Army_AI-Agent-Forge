# Mission Control - Transform Army AI Command Center

**"First principles thinking in real-time agent orchestration. Make AI better."**

## Overview

**Mission Control** is the advanced command and monitoring interface for Transform Army AI, providing real-time visibility into agent operations, mission orchestration, and system coordination. It complements the **Agent Forge** (creation tool) by offering mission-level command and control.

## Architecture

### Two-Page System

1. **Agent Forge** (`/` or `/forge`) - Agent creation and configuration
2. **Mission Control** (`/mission-control`) - Mission execution and monitoring

Both pages share a `MissionContext` for state synchronization, allowing agents created in Forge to be immediately visible and controllable in Mission Control.

### Component Structure

```
MissionControl/
├── MissionControl.tsx          # Main page container
├── MissionHeader.tsx            # Mission status, elapsed time, team counts
├── AgentMonitor.tsx             # Sidebar with agent roster
├── UnifiedLogStream.tsx         # Centralized log display
└── OrchestratorChatbox.tsx     # Command interface (shared with Forge)
```

### State Management

**MissionContext** (`context/MissionContext.tsx`) manages:
- Active mission state (name, status, team, agents, logs)
- Agent roster with real-time status updates
- Unified log stream (agents, orchestrator, system, Slack)
- Orchestrator connection status
- Mission lifecycle (start, pause, resume, complete, abort)

```typescript
interface Mission {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  team?: Team;
  template?: string;
  agents: AgentProfile[];
  logs: MissionLogEntry[];
  startedAt?: string;
  completedAt?: string;
  orchestratorConnectionStatus: 'connected' | 'connecting' | 'disconnected';
  selectedAgentId?: string;
}
```

## Features

### 🎯 Mission Header
- **Real-time Mission Name & Status**: Visual status indicators (green=active, yellow=paused, blue=completed, red=failed)
- **Elapsed Time Counter**: Live timer since mission start
- **Team Roster Counts**: System, Red Team, Blue Team agent distribution
- **Active Agent Counter**: Shows running vs. total agents
- **Mission Controls**: Pause/Resume, Complete, Abort buttons
- **Elon Musk Persona**: "First principles thinking in real-time agent orchestration"

### 🤖 Agent Roster (Sidebar)
- **Live Status Monitoring**: Color-coded status badges (Green=Active, Yellow=Idle, Red=Error)
- **Agent Details**: Name, team, role, language, model, tools
- **Expandable Agents**: Click to see full details and quick actions
- **Smart Sorting**: Agents sorted by status (Active > Idle > Error)
- **Quick Actions**: Chat, Task Dispatch, Stop buttons
- **Summary Footer**: Agent count by status

### 📊 Unified Log Stream
- **Multi-Source Logging**: Agents, Orchestrator, System, Slack events
- **Filtering & Search**: Filter by source type, search by keyword
- **Severity Levels**: Error (❌), Warning (⚠️), Success (✅), Info (•)
- **Color-Coded Sources**:
  - Agent: Cyan
  - Orchestrator: Red
  - System: Blue
  - Slack: Purple
- **Auto-Scroll with Pause**: Follow latest logs or scroll manually
- **Detailed Data Inspection**: Hover to see JSON details
- **Retained History**: Last 1000 logs shown, full history available

### 💬 Orchestrator Chatbox
- **Natural Language Commands**: Send free-text commands to Orchestrator
- **Connection Status**: Real-time connection indicator
- **Message History**: Scrollable message thread
- **Loading States**: Visual feedback during processing
- **Rich Responses**: Formatted orchestrator responses

### 🚀 Mission Lifecycle

#### Starting a Mission
1. Create agents in Agent Forge
2. Click **"🎛 Mission Control"** button (appears when agents exist)
3. Mission automatically starts with deployed agents
4. Begin issuing commands via OrchestratorChatbox

#### During Mission
- Monitor agent status in real-time
- View unified logs from all sources
- Issue commands to orchestrator or specific agents
- Pause for investigation or adjustment

#### Completing a Mission
- Click **"✓ COMPLETE"** when objectives met
- Or **"✕ ABORT"** to terminate mission immediately
- Mission state preserved in logs and history

## Usage Scenarios

### Real-Time Monitoring
"Monitor a penetration test in progress with live status updates and agent communications all in one view."

1. Deploy reconnaissance, vulnerability scanning, and payload delivery agents
2. Open Mission Control
3. Watch agent status transitions (Idle → Running → Idle)
4. Review logs to track discovery progression

### Incident Response
"Coordinate a rapid response with multiple teams investigating different aspects of an incident."

1. Deploy System, Blue Team (defense), and Red Team (analysis) agents
2. Use Mission Control to track real-time agent interactions
3. Use Orchestrator chatbox to dispatch urgent tasks
4. Keep Slack channel updated via integration

### Troubleshooting
"Quickly identify which agent failed and why."

1. Filter logs by severity (Errors)
2. Expand agent details to check status
3. View agent logs for debugging
4. Use quick action buttons to restart or stop agents

## Integration Points

### Slack Integration
Automatically notifies Slack channel of:
- Agent deployment
- Mission status changes (started, completed, failed)
- Critical alerts and errors
- Orchestrator command execution

**Configuration**:
```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_CHANNEL_ID=C1234567890
```

### Orchestrator Communication
- WebSocket connection for real-time bidirectional communication
- Supports natural language commands
- Auto-reconnect with exponential backoff
- Command timeout protection (30 seconds)

**Commands**:
- `list agents` - Show deployed agents
- `get status` - Orchestrator health check
- `dispatch task <agent> <task>` - Send task to specific agent
- Any custom command handler

### Local LLM Support
Mission Control works with local LLM providers:
- **Ollama**: Free, open-source, runs on your machine
- **LM Studio**: User-friendly GUI for GGUF models

Both support the same agent creation and deployment workflow.

## Persona: Elon Musk Edition

Mission Control is designed with an **Elon Musk-inspired persona** for command and control:

### Principles
- **First Principles Thinking**: Break down complex missions into fundamental tasks
- **Rapid Iteration**: Deploy, observe, adjust, repeat
- **Vertical Integration**: Full stack control from agent creation to orchestration
- **Efficiency Focus**: Maximize agent utilization and minimize overhead
- **Radical Transparency**: All logs visible, all status real-time
- **Make AI Better**: Continuous improvement through monitoring and feedback

### Design Language
- **Bold, Direct Interface**: No hidden complexity
- **Real-Time Feedback**: Know exactly what's happening at all times
- **Aggressive Optimization**: Parallel agent execution, efficient resource use
- **Inspirational Copy**: "First principles thinking in real-time agent orchestration"

### Command Tone
- Expect direct, no-nonsense responses
- Efficiency metrics highlighted
- Failure modes logged prominently
- Success celebrated quantitatively

## Technical Details

### Performance
- **Log Retention**: 1000 most recent logs in UI (full history in backend)
- **Update Frequency**: Real-time for status, 1-second intervals for timers
- **Agent Limit**: No hard limit; tested with 50+ concurrent agents
- **Message Queue**: Uses MissionContext for thread-safe updates

### State Persistence
- **Mission State**: Stored in MissionContext (in-memory)
- **Local Storage**: Import/Export missions as JSON for archival
- **Backend Sync**: Optional sync to Orchestrator service

### Scalability
- **Horizontal Scaling**: Each user gets independent MissionContext
- **Vertical Scaling**: Context memoization prevents re-renders
- **Network**: WebSocket-based communication (no polling overhead)

## Configuration

### Environment Variables

```bash
# Orchestrator Backend
REACT_APP_ORCHESTRATOR_URL=http://localhost:3000
REACT_APP_ORCHESTRATOR_WS=ws://localhost:3000

# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_CHANNEL_ID=C1234567890

# Local LLMs
OLLAMA_BASE_URL=http://localhost:11434
LMSTUDIO_BASE_URL=http://localhost:1234
```

### Styling
Mission Control uses the hacker theme CSS variables from `index.html`:
- `--color-accent-red`: Primary action color (#DC143C)
- `--color-accent-blue`: Secondary color (#00308F)
- `--color-accent-white`: Text/borders (#FFFFFF)
- `--color-bg-primary`: Main background (#000000)
- Custom glow effects for immersive feel

## Troubleshooting

### Orchestrator Won't Connect
1. Verify backend is running: `http://localhost:3000`
2. Check WebSocket port: `ws://localhost:3000`
3. Review browser console for connection errors
4. Fallback: Mission Control works read-only without backend

### Logs Not Appearing
1. Verify agents are running and logged in
2. Check MissionContext is initialized
3. Filter settings may be hiding logs (check filter buttons)
4. Review browser DevTools for errors

### Agent Status Not Updating
1. Ensure Orchestrator connection is active
2. Verify agent heartbeat (check logs)
3. Check agent resource limits not exceeded
4. Restart agent if stuck in wrong state

## Future Enhancements

- [ ] Mission playback/replay from logs
- [ ] Advanced analytics and KPIs
- [ ] Multi-mission dashboard
- [ ] Webhook notifications for external systems
- [ ] Custom mission templates
- [ ] Agent team configuration presets
- [ ] Heat maps for agent activity
- [ ] Voice commands (experimental)

## See Also

- [Orchestrator Service Guide](./ADMIN_GUIDE.md)
- [Slack Integration Guide](./SLACK_ADMIN_GUIDE.md)
- [System Tools Reference](./SYSTEM_TOOLS_GUIDE.md)
- [Agent Forge Documentation](./README.md)

---

**Transform Army AI** - Making AI orchestration frictionless. 🚀
