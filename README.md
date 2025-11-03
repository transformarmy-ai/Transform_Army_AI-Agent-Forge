# Transform Army AI: Agent Forge & Command Post

**Transform Army AI** is an integrated, web-based Command Post for prototyping, deploying, and commanding AI-powered cybersecurity agentic teams. It combines a powerful **Agent Forge** with a real-time mission control interface, allowing a single operator to manage a full spectrum of offensive (Red Team), defensive (Blue Team), and command (System) operations.

This platform is designed for cybersecurity managers, researchers, and enthusiasts who want to learn about and leverage the power of autonomous AI agents in a controlled, local environment.

---

## Core Features

-   **Agent Forge:** A powerful UI for generating specialized agents. Define an agent's Team, Role, Language, LLM, and authorized Tools.
-   **AI-Generated Avatars:** Each forged agent receives a unique, steampunk-themed avatar that reflects its role and team.
-   **Multi-Agent Teams:** Forge Red Teams for offensive operations and Blue Teams for defensive tasks, all coordinated by a central Orchestrator.
-   **One-Click Deployment:** Generate a complete, self-contained `docker-compose` mission package with a single click. This includes all agents, toolboxes, a long-term memory database, and real-time C2 servers.
-   **Autonomous Operations:** Deploy your agent teams to run autonomously for hours, pursuing high-level objectives on their own.
-   **Live Mission Command:** A real-time C2 hub within the UI featuring:
    -   **Mission Control Dashboard:** A high-level visual overview of agent statuses, health, communications, and tool usage with interactive Pause/Resume controls.
    -   **Live C2 Feed:** A raw, streaming text log of all mission events.
    -   **Live Chat C2:** A chat interface for sending direct commands to any agent during a live mission.
    -   **Interactive HITL:** Agents can request human guidance for critical decisions. You can provide authorization directly from the UI or a connected Slack channel.
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

1.  **Open the Application:** Load the `index.html` file in your browser.
2.  **Forge a Team:** Use the **Mission Parameters** panel to forge your agents. A good start is to use the **Templates** dropdown in the Mission Roster to create a "Standard Red Team."
3.  **Deploy the Mission:** Once your team is assembled, click the **Deploy Mission** (rocket) icon in the Mission Roster header. This will download a `transform_army_ai_mission.zip` file.
4.  **Launch the Mission:**
    -   Unzip the file.
    -   (Optional) Configure your Slack credentials in a new `.env` file (see `README.env.example`).
    -   Open a terminal in the mission directory and run `docker-compose up -d --build`. This will build and start all containers.
    -   Wait for the services to become healthy, then run `python mission_controller.py`.
5.  **Command in Real-Time:** Switch back to the web UI. The center panel will now be in "Live Mission Command" mode. You can monitor the operation on the dashboard, view the raw feed, provide input when requested, or chat directly with your agents.