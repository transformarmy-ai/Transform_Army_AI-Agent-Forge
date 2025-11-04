# Transform Army AI - System Architecture

## Table of Contents

1. [System Overview](#system-overview)
2. [Two-Page Architecture](#two-page-architecture)
3. [State Management](#state-management)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [Integration Points](#integration-points)
7. [Technology Stack](#technology-stack)
8. [Performance Considerations](#performance-considerations)

---

## System Overview

Transform Army AI is a web-based command and control platform for AI-powered agent orchestration, cybersecurity operations, and multi-team coordination. The system is divided into two primary interfaces that share state and work in concert:

```
┌─────────────────────────────────────────────────────────────┐
│                    Transform Army AI                         │
├──────────────────────┬──────────────────────────────────────┤
│   Agent Forge        │       Mission Control                │
│  (Agent Creation)    │    (Mission Orchestration)           │
├──────────────────────┼──────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           MissionContext (Shared State)              │  │
│  │  - Mission lifecycle, agents, logs, orchestrator     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
├──────────────────────┬──────────────────────────────────────┤
│  Services Layer      │  (All Pages Access)                  │
│  - LLM Service       │  - Orchestrator Service              │
│  - Manifest Utils    │  - Slack Integration                 │
│  - System Tools      │  - Sounds & Audio                    │
└──────────────────────┴──────────────────────────────────────┘
```

---

## Two-Page Architecture

### Page 1: Agent Forge (`/` or `/forge`)

**Purpose**: Agent creation, configuration, and manifest generation

**Primary Components**:
- `App.tsx` - Main container
- `AgentControlPanel.tsx` - Configuration UI (team, role, language, LLM, tools)
- `MissionRoster.tsx` - Agent list and management
- `DocumentationDisplay.tsx` - Generated manifest viewer
- `MissionLog.tsx` - Operation log
- `EditAgentModal.tsx` - Agent editing interface
- `ToolboxManager.tsx` - Tool management

**Workflow**:
```
User Input
    ↓
Team/Role/Language Selection
    ↓
LLM Provider Selection
    ↓
Tool Configuration
    ↓
Click "ENGAGE & FORGE MANIFEST"
    ↓
generateAgentWithRetry() → LLM
    ↓
parseJSONSafely() + enforceACoCRules()
    ↓
Create AgentProfile + Add to Mission
    ↓
Display in MissionRoster
    ↓
Export / Go to Mission Control
```

**State Management**:
- Local component state for UI
- MissionContext for agents array
- localStorage for persistence

**LLM Integration**:
- Supports 5 providers: OpenAI, OpenRouter, Anthropic, Ollama, LM Studio
- Automatic provider fallback
- Retry with exponential backoff (up to 3 attempts)
- Robust JSON parsing and repair

### Page 2: Mission Control (`/mission-control`)

**Purpose**: Real-time mission monitoring and orchestration

**Primary Components**:
- `MissionControl.tsx` - Main page container
- `MissionHeader.tsx` - Mission status and controls
- `AgentMonitor.tsx` - Agent roster sidebar
- `UnifiedLogStream.tsx` - Centralized log display
- `OrchestratorChatbox.tsx` - Command interface (shared with Forge)

**Workflow**:
```
Mission Control Page Load
    ↓
Initialize OrchestratorService
    ↓
Attempt WebSocket Connection
    ↓
Subscribe to Connection Status Changes
    ↓
Display Mission Header with Status
    ↓
Render Agent Roster with Live Status
    ↓
Stream Unified Logs (agents, orchestrator, system, Slack)
    ↓
Accept Natural Language Commands via Chatbox
    ↓
Send Commands to Orchestrator Service
    ↓
Display Results in Logs + Chat History
```

**State Management**:
- MissionContext for mission state
- Local component state for UI (expanded agents, filters, etc.)
- Real-time updates via service callbacks

---

## State Management

### MissionContext (`context/MissionContext.tsx`)

**Purpose**: Centralized, shared state for both pages

**Structure**:
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

interface MissionLogEntry {
  timestamp: string;
  source: string;
  content: string;
  data?: any;
  severity?: 'info' | 'warning' | 'error' | 'success';
}
```

**Key Operations**:
- `addAgent(agent)` - Add forged agent to mission
- `removeAgent(agentId)` - Remove agent from mission
- `updateAgentStatus(agentId, status)` - Update agent status
- `addLogEntry(source, content, severity, data)` - Log event
- `startMission(name, team, template)` - Create new mission
- `pauseMission()` / `resumeMission()` - Control mission state
- `endMission(status)` - Complete or abort mission

**Hooks**:
```typescript
const { mission, addAgent, addLogEntry, ... } = useMission();
```

**Persistence**:
- In-memory (survives page refresh but not browser close)
- Optional localStorage export for persistence
- Optional backend sync to Orchestrator service

---

## Component Structure

### Agent Forge Components

```
App.tsx (Root)
├── Header.tsx
├── AgentControlPanel.tsx
│   ├── Team selector
│   ├── Role selector
│   ├── Language selector
│   ├── LLM provider selector
│   └── Tool selector
├── MissionRoster.tsx
│   └── Agent cards with actions
├── DocumentationDisplay.tsx
│   └── Manifest viewer
├── MissionLog.tsx
│   └── Event log
├── EditAgentModal.tsx
├── ToolboxManager.tsx
├── OrchestratorChatbox.tsx (Shared)
└── Navigation button to Mission Control
```

### Mission Control Components

```
MissionControl.tsx (Root)
├── MissionHeader.tsx
│   ├── Mission status indicator
│   ├── Elapsed time counter
│   ├── Team roster counts
│   └── Mission controls (Pause/Resume/Complete/Abort)
├── AgentMonitor.tsx (Sidebar)
│   ├── Agent list (sorted by status)
│   └── Agent details (expandable)
└── UnifiedLogStream.tsx
    ├── Filter buttons
    ├── Search input
    ├── Auto-scroll toggle
    └── Log entries with details
└── OrchestratorChatbox.tsx (Floating/Toggleable)
```

### Shared Components

- `OrchestratorChatbox.tsx` - Used in both Forge and Mission Control
- Icons (`components/icons/`) - Reusable SVG icons

---

## Data Flow

### Creating an Agent (Agent Forge → Mission)

```
User fills form → AgentControlPanel
    ↓
Click "ENGAGE & FORGE MANIFEST"
    ↓
App.handleGenerateAgent()
    ↓
generateAgentWithRetry(provider, prompt)
    ↓
LLM generates JSON manifest
    ↓
parseJSONSafely(response) - Repair malformed JSON
    ↓
enforceACoCRules(manifest) - Auto-fill missing fields
    ↓
Create AgentProfile object
    ↓
useMission().addAgent(agent)
    ↓
Update MissionRoster display
    ↓
Enable "🎛 Mission Control" button
```

### Deploying to Mission Control

```
User clicks "🎛 Mission Control" button
    ↓
AppRouter navigates to /mission-control
    ↓
MissionControl.tsx mounts
    ↓
Initialize OrchestratorService
    ↓
Subscribe to orchestrator status
    ↓
Connect to Orchestrator via WebSocket
    ↓
MissionHeader renders mission status
    ↓
AgentMonitor renders agent roster
    ↓
UnifiedLogStream shows logs
    ↓
Ready for commands
```

### Sending an Orchestrator Command

```
User types command in OrchestratorChatbox
    ↓
Press Enter → handleSendMessage()
    ↓
orchestratorService.sendTextCommand(message)
    ↓
Create OrchestratorRequest with random ID
    ↓
Send via WebSocket to backend
    ↓
Set timeout (30 seconds)
    ↓
Wait for response with matching ID
    ↓
addLogEntry('User', message, 'info')
    ↓
Receive response
    ↓
addLogEntry('Orchestrator', response, 'success')
    ↓
Update chat history in UI
    ↓
Notify Slack (if configured)
```

---

## Integration Points

### 1. LLM Providers

**File**: `services/llmService.ts`

**Supported Providers**:
- **OpenAI**: REST API via OpenRouter wrapper or direct
- **OpenRouter**: REST API (supports 100+ models)
- **Anthropic**: REST API via Claude models
- **Ollama**: Local, REST API (default: http://localhost:11434)
- **LM Studio**: Local, REST API (default: http://localhost:1234)

**Selection Priority**:
1. User-selected provider in UI
2. Fallback to `.env` provider
3. Default: OpenRouter

**JSON Schema Enforcement**:
- All responses validated against agent manifest schema
- Temperature: 0.2 (for consistency)
- Strict prompts for JSON generation

### 2. Orchestrator Service

**File**: `services/orchestratorService.ts`

**Communication**:
- WebSocket for bidirectional communication
- Rest fallback for HTTP
- Auto-reconnect with exponential backoff
- Message timeout: 30 seconds

**Supported Commands**:
- `list-agents` - Get agent roster
- `get-status` - Orchestrator health check
- `dispatch-task` - Send task to agent
- `get-logs` - Retrieve logs with filtering
- `cancel-task` - Abort running task
- `custom-command` - Natural language command

**Event Subscription**:
```typescript
orchestrator.onConnectionStatusChange((status) => {
  setOrchestratorConnectionStatus(status);
});
```

### 3. Slack Integration

**File**: `services/slackIntegration.ts`

**Features**:
- Send rich messages with blocks
- Agent deployment notifications
- Mission status updates
- Alert notifications (error/warning/critical)
- Verify request signatures
- Handle slash commands
- Event-driven architecture

**Configuration**:
```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...
SLACK_CHANNEL_ID=C1234567890
```

### 4. System Tools

**File**: `services/systemToolsService.ts`

**DuckDuckGo Search**:
- Free internet search
- No API key required (optional token for advanced)
- Used by Orchestrator for reconnaissance

**GitHub Tools**:
- Repository search and filtering
- Clone information (metadata only)
- User profile lookup
- Requires GitHub Personal Access Token

**Configuration**:
```bash
GITHUB_API_TOKEN=ghp_...
GITHUB_USERNAME=your_username
```

### 5. Audio/Sounds

**File**: `utils/sounds.ts`

**Features**:
- Lazy initialization of AudioContext
- Compliance with browser autoplay policies
- Activation on user gesture
- Futuristic UI sound effects

**Gestures that activate audio**:
- Mouse down
- Key press
- Touch

---

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Vite**: Build tool

### Services
- **WebSocket**: Real-time communication
- **Fetch API**: HTTP requests
- **LocalStorage**: Client-side persistence

### External Services
- **LLM Providers**: For agent generation
- **Orchestrator Backend**: For mission control
- **Slack API**: For notifications
- **GitHub API**: For code search
- **DuckDuckGo API**: For internet search

### Styling & Theming
- **CSS Variables**: Hacker theme customization
- **Tailwind CSS**: Utility-first styling
- **SVG**: Icons and avatars
- **Canvas**: Matrix rain background effect

---

## Performance Considerations

### Optimization Techniques

1. **State Management**:
   - MissionContext memoization prevents unnecessary re-renders
   - useCallback hooks for event handlers
   - Selective state subscriptions

2. **Log Rendering**:
   - Keep only last 1000 logs in UI (others in backend)
   - Virtual scrolling ready (can be implemented)
   - Debounced log updates

3. **Agent Status Updates**:
   - Efficient filtering and sorting in AgentMonitor
   - Memoized status indicators
   - Throttled status checks

4. **Network**:
   - WebSocket for efficient real-time updates (no polling)
   - Message batching where possible
   - Connection pooling

### Limits & Scaling

- **Max Agents**: No hard limit; tested with 50+ concurrent agents
- **Max Logs**: 1000 in UI, unlimited in backend
- **Max Commands**: Rate-limited by backend (typically 10/sec per user)
- **Concurrent Missions**: Limited by backend capacity

### Browser Compatibility

- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support (WebSocket compatible)
- Edge: Full support

---

## File Organization

```
agent_forge/
├── App.tsx                          # Agent Forge main component
├── AppRouter.tsx                    # Navigation between pages
├── index.html                       # Entry point, global styles
├── main.tsx                         # Vite entry point
│
├── pages/
│   └── MissionControl.tsx           # Mission Control main page
│
├── components/
│   ├── Header.tsx
│   ├── AgentControlPanel.tsx
│   ├── MissionRoster.tsx
│   ├── DocumentationDisplay.tsx
│   ├── MissionLog.tsx
│   ├── EditAgentModal.tsx
│   ├── ToolboxManager.tsx
│   ├── OrchestratorChatbox.tsx      # Shared component
│   ├── MissionControl/
│   │   ├── MissionHeader.tsx
│   │   ├── AgentMonitor.tsx
│   │   └── UnifiedLogStream.tsx
│   └── icons/
│       └── *.tsx                    # SVG icons
│
├── context/
│   └── MissionContext.tsx           # Shared state management
│
├── services/
│   ├── llmService.ts                # LLM provider integration
│   ├── geminiService.ts             # Agent generation + JSON repair
│   ├── orchestratorService.ts       # Orchestrator communication
│   ├── slackIntegration.ts          # Slack notifications
│   ├── systemToolsService.ts        # DuckDuckGo + GitHub
│   └── manifestUtils.ts             # ACoC rules enforcement
│
├── utils/
│   ├── sounds.ts                    # Audio effects
│   └── [other utilities]
│
├── types.ts                         # TypeScript interfaces
├── constants.ts                     # App-wide constants
│
└── docs/
    ├── README.md                    # Quick start
    ├── ARCHITECTURE.md              # This file
    ├── MISSION_CONTROL_GUIDE.md     # Mission Control manual
    ├── ADMIN_GUIDE.md               # Admin procedures
    ├── SLACK_ADMIN_GUIDE.md         # Slack setup
    ├── SYSTEM_TOOLS_GUIDE.md        # Tools reference
    ├── LOCAL_LLM_SETUP.md           # Local LLM guide
    └── [other guides]
```

---

## Future Enhancements

- [ ] Multi-user collaboration with real-time sync
- [ ] Mission playback and replay from logs
- [ ] Advanced analytics and KPIs dashboard
- [ ] Voice commands (experimental)
- [ ] Custom mission templates UI
- [ ] Webhook notifications for external systems
- [ ] API for external tool integration
- [ ] Agent team presets and favorites
- [ ] Heat maps for agent activity over time
- [ ] Automated incident response workflows

---

**Last Updated**: November 2025
**Version**: 2.0 (Two-Page Architecture)
