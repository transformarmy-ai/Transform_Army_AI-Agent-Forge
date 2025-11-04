
# Transform Army AI: Design & Implementation Guide

**Document Version:** 1.0 (Manifest-Driven Architecture)
**Clearance Level:** Engineering & Architecture
**Subject:** System Architecture, Manifest Schemas, and ACoC/C-CoC Protocol

---

## 1.0 Architectural Overview

**Transform Army AI** has been re-architected into a standardized **Agent Manifest Forge & Exchange**. Its primary purpose is to create, manage, and share AI agents through a portable, declarative manifest format: `agent.v1`. It facilitates interoperability by providing powerful AI-driven export and import (ACoC/C-CoC) capabilities.

### 1.1 High-Level Workflow Diagram

```
+--------------------------------+       +--------------------------+
|  React Frontend (Manifest Forge)|<----->| Multi-Provider LLM APIs  |
|                                |       | (Generation/Normalization)|
| - Agent Forge UI               |       | - OpenAI                 |
|                                |       | - Anthropic              |
|                                |       | - OpenRouter             |
|                                |       +--------------------------+
| - Roster Management            |
| - Export / Import (ACoC)       |
+----------+---------------------+
           |
+----------v---------------------+
|      Browser localStorage      |
| {snapshot with manifests}      |
+--------------------------------+

```

The application is now a self-contained, client-side tool for interacting with multiple LLM provider APIs (OpenAI, Anthropic, OpenRouter) to produce and normalize standardized JSON manifests.

---

## 2.0 Core Manifest Schemas

These schemas are based on the `LLM Agent Design Requirements Guide`.

### 2.1 `agent.v1`
This is the core artifact, describing a single agent.

**Structure:**
```json
{
  "schemaVersion": "agent.v1",
  "id": "string", "name": "string", "version": "string",
  "description": "string", "author": "string",
  "language": { "name": "string", "version": "string" },
  "execution": { "kind": "string", "command": "string", "args": ["string"] },
  "model": { "provider": "string", "modelId": "string", "temperature": "number" },
  "prompts": { "system": "string" },
  "tools": [ { "name": "string", "description": "string", "inputSchema": { ... } } ],
  "memory": { "mode": "string", "provider": "string", "binding": "string" },
  "env": { "required": ["string"], "optional": ["string"] },
  "tests": [ { "name": "string", "type": "smoke", ... } ],
  "importMeta": { ... } // Optional, added during ACoC
}
```

### 2.2 `agent-team.v1`
Describes a group of agents and their wiring.

**Structure:**
```json
{
  "schemaVersion": "agent-team.v1",
  "id": "string", "name": "string", "version": "string",
  "members": [ { "role": "string", "agentRef": "string" } ],
  "orchestration": { "mode": "string", "entryAgent": "string" },
  "sharedMemory": { "enabled": true, "binding": "string", ... },
  "env": { "required": ["string"] }
}
```

### 2.3 `orchestrator.v1`
Describes a "Commander" agent that carries doctrine for team creation.

**Structure:**
```json
{
  "schemaVersion": "orchestrator.v1",
  "id": "string", "name": "string", "version": "string",
  "teamDoctrine": [ { "role": "string", "agentTemplate": "string", ... } ],
  "agentTemplates": { "template_name": { ...agent.v1 manifest... } },
  ...
}
```

---

## 3.0 AI-Powered Import & Normalization (ACoC/C-CoC) Workflow

This is the core "intelligent" feature of the new architecture.

### 3.1 Workflow Diagram

```
+----------------+  1. Upload  +---------------------+  2. Send to AI w/ Rules   +-------------------+
| Foreign JSON   |----------->| React App           |------------------------->|   Gemini API      |
| (non-compliant)|            | (handleImportManifest)|                         | (normalizeAgent)  |
+----------------+            +----------+----------+                         +---------+---------+
                                        ^                                               | 3. AI applies ACoC
                                        | 5. Update UI                                  |   rules & returns
                                        |                                               v
                             +----------+-----------+  4. Parse & Add to Roster +---------+---------+
                             | missionAgents (state)|<-------------------------| Compliant agent.v1|
                             +--------------------+                           +-------------------+
```

### 3.2 Technical Implementation

1.  **`App.tsx` (`handleImportManifest`)**:
    -   Uses a hidden `<input type="file">` to open a file dialog.
    -   Reads the selected `.json` file as a raw text string.
    -   Calls the `normalizeAgent` function from `geminiService.ts`, passing the raw string.
    -   Receives a compliant `AgentProfile` object back from the service.
    -   Updates the application state, adding the new, normalized agent to the roster.

2.  **`geminiService.ts` (`normalizeAgent`)**:
    -   This is the core of the AI logic. It does **not** attempt to parse or manipulate the JSON itself.
    -   It constructs a new, specific prompt for the Gemini API.
    -   This prompt contains the **ACoC/C-CoC rules** from the design document, instructing the AI on *how* to perform the normalization.
    -   It embeds the user's uploaded `foreignManifestJson` string directly into this prompt.
    -   It makes a `generateContent` call, but this time, the `responseSchema` is the full `agentV1Schema`.
    -   The AI reads the rules and the foreign manifest, performs the normalization in its own context, and generates a new, compliant `agent.v1` manifest as a structured JSON object.
    -   The service then wraps this manifest in a UI-friendly `AgentProfile` and returns it.

This process leverages the LLM's powerful reasoning capabilities to handle the complex and unpredictable task of converting a foreign data structure into a compliant one, which is far more robust than writing brittle, rule-based JavaScript code to do the same.

**End of Document.**