
# Transform Army AI: Admin Guide & Operations Manual

**Document Version:** 1.0 (Manifest-Driven Architecture)
**Clearance Level:** Commander, Cyber Operations
**Subject:** Mission Command Protocol for the Agent Manifest Forge & Exchange

---

## 1.0 Mission Briefing: The Manifest Forge & Exchange

**Transform Army AI** has been re-architected into a standardized **Manifest Forge & Exchange**. Its primary purpose is to create, manage, and share AI agents through a portable, declarative manifest format: `agent.v1`.

This platform allows you to design and standardize your agentic teams, ensuring they can be imported, understood, and run by any compliant system in your organization. The focus has shifted from direct deployment to **portability and standardization**.

## 2.0 The Command Post: System & Component Overview

-   **Mission Parameters (Control Panel):** Your agent definition center. Define an agent's Team, Role, Language, and LLM to generate a compliant `agent.v1` manifest.
-   **Manifest Roster (Left Panel):** Your roster of forged agent manifests.
-   **Main View (Center Panel):** Your primary interaction window for inspecting the details of a selected agent manifest, including its description, system prompt, and smoke tests.
-   **Mission Log (Right Panel):** A timestamped log of your actions within the Forge UI.

---

## 3.0 Core Doctrine: The `agent.v1` Manifest

The `agent.v1` manifest is the cornerstone of this system. It is a JSON file that declaratively describes everything about an agent:
-   **Identity:** Its unique ID, name, and version.
-   **Execution:** The language it's written in and how to run it.
-   **Intelligence:** The LLM model it uses and its core system prompt.
-   **Capabilities:** The tools it can use, defined with clear schemas.
-   **Memory:** How and where it stores long-term information.
-   **Requirements:** A list of environment variables (secrets) it needs to function.
-   **Verification:** A set of smoke tests to confirm it's working.

This standard ensures that any system can understand and safely execute your agents.

---

## 4.0 Operational Protocol: Forging & Managing Manifests

### 4.1 Step 1: Forge Manifests

1.  **Use a Template (Fastest):** In the Manifest Roster header, use the **Templates** dropdown to instantly forge a complete set of manifests for a standard team.
2.  **Forge Manually:**
    -   Use the **Mission Parameters** panel to define the characteristics of an agent.
    -   Click **"ENGAGE & FORGE MANIFEST"**.
    -   The AI will generate a compliant `agent.v1` manifest, which will appear in your roster.

### 4.2 Step 2: Export for Portability

The primary function of the Forge is to export these standardized manifests for use in other systems (e.g., a CI/CD pipeline, a production orchestrator, or another team's Forge).

1.  **Assemble your roster:** Forge all the agent manifests you need for a given mission or team.
2.  **Click Export:** Click the **Export Manifests** (download) icon in the Manifest Roster header.
3.  **Download Package:** A `.zip` file will be generated and downloaded. This package contains the individual `.json` manifest files for each agent, as well as a sample `agent-team.v1.json` that describes how they work together.

### 4.3 Step 3: Import & Normalize (Agent Change of Command - ACoC)

You can import agent manifests from other teams or systems, even if they are not fully compliant. The Forge includes an AI-powered normalization engine.

1.  **Click Import:** Click the **Import Manifest** (upload) icon in the Manifest Roster header.
2.  **Select a File:** Choose a `.json` manifest file from your local machine.
3.  **AI Normalization (ACoC):** The system will send the foreign manifest to the AI with a set of rules (the "Agent Change of Command" protocol). The AI will:
    -   Normalize the manifest to the `agent.v1` standard.
    -   Preserve the agent's identity and tools.
    -   Infer missing information where possible.
    -   Add an `importMeta` block detailing the changes it made.
4.  **Review:** The newly imported and normalized agent will appear in your roster. You can inspect it to see how the ACoC process has adapted it for your ecosystem.

---

## 5.0 Communicating with the Orchestrator

The Orchestrator agent coordinates other agents and missions. You can interact with it via the UI, CLI, or API depending on your deployment.

### 5.1 From the Forge UI

- Forge or import an Orchestrator manifest (System Team → Orchestrator role).
- Open the manifest details and review:
  - `execution.command` and `args`
  - `tools` exposed by the Orchestrator (e.g., task dispatch, roster status)
  - `env.required` (configure these in your runtime)
- Use the Mission Roster actions to export the Orchestrator and deploy it to your runtime environment.

### 5.2 CLI Pattern (Example)

Assuming your Orchestrator runs as a process and exposes a command interface:

```bash
# Ping orchestrator health
./orchestrator --health

# Dispatch a task to an agent
./orchestrator --dispatch \
  --agent-id red.recon.scout-01 \
  --task '{"type":"scan","target":"10.0.0.0/24"}'

# Query mission status
./orchestrator --status --mission-id mission-2025-1104-001
```

Match these to your Orchestrator manifest’s `execution` and `tools` definitions.

### 5.3 HTTP API Pattern (Example)

If the Orchestrator exposes an HTTP API (common in containerized deployments):

```bash
# Create/dispatch task
curl -s -X POST http://orchestrator.local/api/v1/tasks \
  -H 'Content-Type: application/json' \
  -d '{
    "agentId": "red.recon.scout-01",
    "type": "scan",
    "payload": { "target": "10.0.0.0/24" }
  }'

# Get task status
curl -s http://orchestrator.local/api/v1/tasks/{taskId}
```

The exact endpoints should be reflected in the Orchestrator `tools` section (define input schemas and responses in the manifest for portability).

### 5.4 WebSocket/Event Stream (Optional)

For real-time mission updates, the Orchestrator may provide a WebSocket or event stream:

```bash
# Example WebSocket URL
wss://orchestrator.local/ws
```

Subscribe to mission events (task queued, started, completed) and audit logs. Document the event schema in the manifest’s `tools` or an `events` annex.

### 5.5 Environment & Security

- Set all variables in `env.required` (API keys, broker URLs, database DSNs).
- Run with least privilege; scope API keys to mission.
- Prefer mTLS or token auth for HTTP/WebSocket control planes.
- Log all directives and results for after-action review.

### 5.6 ACoC Alignment

When importing a foreign Orchestrator manifest:
- ACoC normalization preserves identity, tools, and memory references.
- Missing `env.required` are accumulated from tool `authVars`.
- A default smoke test is added if missing to verify orchestration is reachable (e.g., `--health`).
- An `importMeta` block is appended to document normalization changes.

**Tip:** Keep Orchestrator `tools` small and composable (dispatch, query status, list agents). Route complex workflows through mission plans or higher-level runbooks.

**End of Document.**