
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

**End of Document.**