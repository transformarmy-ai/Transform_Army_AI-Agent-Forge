# GENERAL Agent - Interactive Command System

**Status**: ✅ IMPLEMENTED & READY

---

## 🎖️ Overview

The **GENERAL** is a Field Commander AI agent that you can interact with via natural language. You command the GENERAL to:

- 📋 **Create & Manage Tasks** - Assign projects and missions
- 👥 **Deploy & Spin Down Teams** - Assemble or retire agent teams on demand
- 🎯 **Coordinate Operations** - Real-time mission control
- 🔄 **Orchestrate Agents** - Direct agents to accomplish tasks

---

## 🚀 How to Use

### Access GENERAL Agent

1. **Go to Mission Control** (🎛 button in Agent Forge)
2. **Click 🎖️ button** (bottom-right corner)
3. **GENERAL Chatbox opens**
4. **Type your orders!**

### Command Format

Commands are natural language. Examples:

```
Create task: Analyze security logs
Spin up team: Red Team Security
List tasks
List teams
Complete task task-12345
Help
```

---

## 📋 Task Management Commands

### Create a Task
```
create task: {description}
assign task: {description}
new task: {description}

Example: "create task: Scan network for vulnerabilities"
Result: ✅ Task created with ID, priority assessed
```

### List Tasks
```
list tasks
show tasks
my tasks

Result: Shows all tasks grouped by priority (critical, high, medium, low)
```

### Complete Task
```
complete task {task-id}
finish task {task-id}

Example: "complete task task-1234567890"
Result: ✅ Task marked as completed
```

### Delete Task
```
delete task {task-id}
remove task {task-id}
cancel task {task-id}

Example: "delete task task-1234567890"
Result: ✅ Task deleted from roster
```

---

## 👥 Team Deployment Commands

### Spin Up Team
```
spin up team: {name}
create team: {name}
deploy team: {name}
assemble team: {name}

Example: "spin up team: Cyber Defense Unit"
Result: 🚀 Team deployed with 3 agents, team-ID assigned
```

### Spin Down Team
```
spin down team {team-id}
stop team {team-id}
retire team {team-id}

Example: "spin down team team-1234567890"
Result: 🛑 Team retired, agents freed back to pool
```

### List Teams
```
list teams
show teams
team roster

Result: Shows all deployed teams, agents, and status
```

### Check Team Status
```
team status
check team
team info

Result: Shows current team composition, tasks, and status
```

---

## 🔄 Task Assignment & Coordination

### Assign Agent to Task
```
assign agent: {agent-name}

Example: "assign agent: Agent-Alpha to task task-123"
Result: ✅ Agent recruited and ready
```

### Mission Status
```
status
report
mission update

Result: 📊 Shows:
  - Active tasks
  - Deployed teams  
  - Total agents
  - Command history
```

---

## 💡 Command Examples

### Scenario 1: Immediate Threat Response
```
User: "Create task: urgent security breach investigation"
GENERAL: ✅ Task created, priority CRITICAL

User: "Spin up team: Incident Response"
GENERAL: 🚀 Team deployed with Security-Agent-1, IR-Agent-2, Forensics-Agent-3

User: "List tasks"
GENERAL: Shows breach investigation at top (critical priority)

User: "Team status"
GENERAL: Shows team with 3 agents, 1 active task
```

### Scenario 2: Routine Maintenance
```
User: "Create task: weekly log analysis"
GENERAL: ✅ Task created, priority MEDIUM

User: "Assign agent: Logger-Bot"
GENERAL: ✅ Logger-Bot recruited

User: "Status"
GENERAL: Shows 1 active task, 1 agent, 0 teams
```

### Scenario 3: Large Operation
```
User: "Create task high: multi-site vulnerability scan"
GENERAL: ✅ Task created, HIGH priority

User: "Spin up team: Network Reconnaissance"
GENERAL: 🚀 Team deployed with 3 agents

User: "Create task high: threat intelligence analysis"
GENERAL: ✅ 2nd task created

User: "List teams"
GENERAL: Shows 1 active team with ongoing tasks

User: "Report"
GENERAL: Shows 2 active tasks, 1 team, 3 agents in field
```

---

## 🎯 Priority Levels

GENERAL automatically detects priority from your commands:

| Keywords | Priority |
|----------|----------|
| critical, urgent, asap | 🔴 CRITICAL |
| high, important | 🟠 HIGH |
| (default) | 🟡 MEDIUM |
| low, minor | 🟢 LOW |

Example: "create task critical: respond to breach" → Priority set to CRITICAL

---

## 🎪 Status Indicators

### Task Status
| Emoji | Status |
|-------|--------|
| ✅ | Completed |
| 🔄 | In Progress |
| ❌ | Failed |
| ⏳ | Pending |

### Team Status
| Emoji | Status |
|-------|--------|
| 🟢 | Active |
| 🟡 | Idle |
| ⚫ | Archived |

---

## 🔧 Integration Features

### With Orchestrator
GENERAL automatically coordinates with the Orchestrator service:
- Fetches available agents for team deployment
- Sends commands to Orchestrator
- Manages task-to-agent assignments
- Handles failures gracefully

### Fallback Mode
If Orchestrator backend is unavailable:
- ✅ Local task management still works
- ✅ Team rosters created locally
- ✅ Commands queued for Orchestrator
- ✅ All features functional

---

## 📊 Mission Control Dashboard

The GENERAL's task and team info automatically syncs with:
- **Unified Log Stream** - All GENERAL commands logged
- **Agent Monitor** - Shows team composition
- **Mission Status** - Real-time metrics

### What You See
```
📋 Active Tasks: 5
👥 Deployed Teams: 2
🤖 Total Agents: 6
🎯 Recent Commands: Create task, Spin up team, Status
```

---

## 🚀 Advanced Usage

### Bulk Operations
```
"Create task: Task 1"
"Create task: Task 2"  
"Create task: Task 3"

→ Quickly queue multiple tasks
```

### Dynamic Team Sizing
```
"Spin up team: Large Operation" (auto 3 agents)
"Spin up team: Small Ops" (auto 3 agents)
"Spin down team team-old" (free agents)
```

### Task Prioritization
GENERAL tracks task priority:
- Critical tasks listed first
- Automatic escalation possible
- Easy to reassign team focus

---

## 💬 Chat Features

### Message History
- ✅ All commands stored in chat
- ✅ Timestamps on every message
- ✅ Role indicators (You, GENERAL, System)
- ✅ Color-coded by role

### Auto-Formatting
```
GENERAL responses include:
✅ Emojis for status clarity
📊 Organized information
🎖️ Professional formatting
⏰ Timestamps
```

---

## ⚙️ Configuration

### Default Settings
- **Teams created with**: 3 agents
- **Task priority**: Auto-detected, defaults to MEDIUM
- **Connection mode**: Works with or without backend
- **Team status**: Active by default

### Customization
Edit `services/generalAgentService.ts` to:
- Change default team size
- Add new commands
- Customize response messages
- Add team specializations

---

## 🐛 Troubleshooting

### GENERAL not responding
**Solution**: Ensure Mission Control is loaded

### Teams not showing agents
**Solution**: Backend unavailable - teams created with defaults

### Commands not recognized
**Solution**: Use natural language, examples provided in "help"

### Chatbox not opening
**Solution**: Click 🎖️ button, ensure mission is active

---

## 🎓 Command Patterns

GENERAL recognizes flexible patterns:

```
✅ Works:
- "create task: investigate logs"
- "Create Task: Investigate Logs"
- "MAKE TASK investigate logs"

Pattern matching is flexible!
```

---

## 📈 Future Enhancements

Potential additions:
- 🤖 Agent specialization ("deploy security team")
- 📅 Task scheduling ("schedule for 10am")
- 🎯 Goal tracking ("track progress to 100%")
- 🔔 Notifications ("alert me when done")
- 📊 Analytics ("show performance metrics")
- 🤝 Collaboration ("assign to team")

---

## 🎖️ GENERAL Persona

The GENERAL operates with:
- ✅ Professional military terminology
- ✅ Real-time decision making
- ✅ Clear chain of command
- ✅ Mission focus
- ✅ Team coordination expertise

Think of GENERAL as your Field Commander who:
- Listens to your strategic goals
- Deploys teams to execute
- Reports status in real-time
- Adapts to your needs
- Completes the mission

---

## 🚀 Getting Started

1. **Create Agents** in Agent Forge (🔨)
2. **Go to Mission Control** (🎛)
3. **Click 🎖️ GENERAL button**
4. **Type**: "create task: sample task"
5. **Type**: "spin up team: sample team"
6. **Type**: "list tasks" and "list teams"
7. **Type**: "status" for overview

**That's it! You now command the GENERAL!**

---

**GENERAL Status**: ✅ READY FOR DEPLOYMENT

Questions? Type "help" in the chatbox!

