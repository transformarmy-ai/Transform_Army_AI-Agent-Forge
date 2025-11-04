# Transform Army AI: Agent Forge & Command Post

**Transform Army AI** is an integrated, web-based Command Post for prototyping, deploying, and commanding AI-powered cybersecurity agentic teams. It combines a powerful **Agent Forge** with a real-time mission control interface, allowing a single operator to manage a full spectrum of offensive (Red Team), defensive (Blue Team), and command (System) operations.

This platform is designed for cybersecurity managers, researchers, and enthusiasts who want to learn about and leverage the power of autonomous AI agents in a controlled, local environment.

---

## Architecture Overview

Transform Army AI operates on a **Two-Page System**:

### 1. **Agent Forge** (`/` or `/forge`)
- **Purpose**: Create, configure, and test individual agents
- **Features**:
  - Team selection (System, Red, Blue)
  - Role selection (specific to team)
  - Language selection (Python, Go, JavaScript, etc.)
  - LLM Provider selection (OpenAI, OpenRouter, Anthropic, Ollama, LM Studio)
  - Tool configuration and management
  - Real-time agent manifest generation
  - Avatar generation for agents
- **Output**: Individual agent manifests ready for deployment

### 2. **Mission Control** (`/mission-control`)
- **Purpose**: Monitor, command, and orchestrate deployed agents
- **Features**:
  - Real-time agent status monitoring
  - Unified log stream (agents, orchestrator, system, Slack)
  - Orchestrator command interface (natural language)
  - Mission lifecycle management (start, pause, resume, complete)
  - Agent roster with quick actions
  - Elon Musk persona ("First principles thinking in real-time agent orchestration")

**Navigation**: 
- Click the **"🎛"** button in Agent Forge to open Mission Control (appears when agents are forged)
- Or navigate directly to `/mission-control`
- Both pages share `MissionContext` for seamless state synchronization

---

## Core Features

-   **Agent Forge:** A powerful UI for generating specialized agents. Define an agent's Team, Role, Language, LLM, and authorized Tools.
-   **Mission Control:** Real-time mission orchestration dashboard with agent monitoring, unified logging, and command interface.
-   **AI-Generated Avatars:** Each forged agent receives a unique, steampunk-themed avatar that reflects its role and team.
-   **Multi-Agent Teams:** Forge Red Teams for offensive operations and Blue Teams for defensive tasks, all coordinated by a central Orchestrator.
-   **Multi-Provider LLM Support:**
    - **Cloud**: OpenAI, OpenRouter, Anthropic
    - **Local**: Ollama, LM Studio (free, run on your machine)
-   **One-Click Deployment:** Generate a complete, self-contained `docker-compose` mission package with a single click. This includes all agents, toolboxes, a long-term memory database, and real-time C2 servers.
-   **Autonomous Operations:** Deploy your agent teams to run autonomously for hours, pursuing high-level objectives on their own.
-   **Live Mission Command:** A real-time C2 hub featuring:
    -   **Mission Status Dashboard:** Mission name, status, elapsed time, agent count
    -   **Agent Roster:** Real-time agent status (Active/Idle/Error)
    -   **Unified Log Stream:** Multi-source logs (agents, orchestrator, system, Slack) with filtering and search
    -   **Command Interface:** Natural language commands to Orchestrator
    -   **Live Chat C2:** Direct communication with agents
-   **System Tools for Orchestration:**
    - **DuckDuckGo Search**: Internet searching for reconnaissance
    - **GitHub Tools**: Repository search and code lookup for code-related tasks
-   **A Learning Organization (Phase 3):** Your agentic organization learns from every mission. It uses a persistent vector database (`ChromaDB`) to store key learnings and successful TTPs (Tactics, Techniques, and Procedures), making future operations more effective.
-   **Document-Based Training (RAG):** "Train" your agents by uploading intelligence documents. The system automatically ingests this data into its knowledge base, allowing the Orchestrator to formulate plans based on your provided intel.
-   **Peer-to-Peer Communication:** Agents can communicate directly with each other, enabling dynamic collaboration and emergent strategies.
-   **Extensible & Secure Toolboxes:** Agents use tools via a secure API call to dedicated "Toolbox" containers (`The Armory` & `The Garrison`). These toolboxes are the secure bridge to all external APIs, scripts, and platforms.
-   **Dynamic Arsenal:** Add, edit, and manage your own custom tools directly from the UI without touching any code. Integrate any internal script or external API into the agentic system on the fly.
-   **Wargame Simulation Mode:** Deploy a full Red Team and Blue Team to operate against each other autonomously. The system manages turns, checks for victory conditions, and learns from both offensive and defensive actions, creating a 24/7 cyber wargaming simulator.
-   **Slack Integration:** Command your teams from anywhere. Receive real-time reports and respond to critical HITL requests with interactive buttons directly in your Slack workspace.
-   **Mission Templates:** Instantly forge complete, pre-configured teams for standard Red or Blue team operations.

---

## Getting Started

### Quick Start

1.  **Open Agent Forge:** Load the application in your browser (defaults to `/forge`)
2.  **Forge a Team:** Use the **Mission Parameters** panel to configure an agent:
    - Select **Team** (System, Red, or Blue)
    - Select **Role** (specific to the team)
    - Select **Language** (Python, Go, JavaScript, etc.)
    - Select **LLM Provider** (local or cloud-based)
    - Select or create **Tools**
    - Click **"ENGAGE & FORGE MANIFEST"**
3.  **Review & Export:** Check the manifest in the **Documentation Display** panel, then export if desired
4.  **Go to Mission Control:** Click the **"🎛"** button to open Mission Control (appears when agents exist)
5.  **Monitor & Command:** Watch agents in real-time, view unified logs, and send commands

### Using Local LLMs

**Option 1: Ollama** (Recommended for beginners)
```bash
# Install Ollama from https://ollama.ai
# Run Ollama service (default: http://localhost:11434)
ollama serve

# In another terminal, pull a model
ollama pull llama3.1
```

**Option 2: LM Studio**
- Download from https://lmstudio.ai
- Load a GGUF model in the UI
- Start the local server (default: http://localhost:1234)

Then in Agent Forge:
- Select **LLM Provider**: "Ollama" or "LM Studio"
- Select **Model**: Available models from your local provider
- Create agents as normal

### Cloud-Based LLMs