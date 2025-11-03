
import { GoogleGenAI, Type } from "@google/genai";
import { AgentProfile, Team, AgentRole, Language, LLMProvider, SystemTeamRole, CustomTool, AgentV1, LanguageV1, ExecutionV1, ModelV1, PromptsV1, ToolV1, MemoryV1, EnvV1, TestV1, AgentStatus } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const toolParameterSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING },
        description: { type: Type.STRING }
    }
};

const toolSchemaV1 = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        inputSchema: {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, description: "Should always be 'object'" },
                properties: {
                    type: Type.OBJECT,
                    properties: {},
                    additionalProperties: toolParameterSchema
                },
                required: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
            }
        },
        requiresAuth: { type: Type.BOOLEAN, nullable: true },
        authVars: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
    },
    required: ['name', 'description', 'inputSchema']
};

const agentV1Schema = {
    type: Type.OBJECT,
    properties: {
        schemaVersion: { type: Type.STRING, description: "MUST be 'agent.v1'" },
        id: { type: Type.STRING, description: "A unique, kebab-case identifier for the agent, e.g., 'red-team-recon-scout'." },
        name: { type: Type.STRING, description: "A human-readable name, e.g., 'Red Team Recon Scout'." },
        version: { type: Type.STRING, description: "The semantic version of this agent, e.g., '1.0.0'." },
        description: { type: Type.STRING },
        author: { type: Type.STRING, description: "The author of the agent, always 'Transform Army AI'." },
        language: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, version: { type: Type.STRING } }
        },
        execution: {
            type: Type.OBJECT,
            properties: {
                kind: { type: Type.STRING, description: "e.g., 'process' or 'http'" },
                command: { type: Type.STRING, nullable: true },
                args: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }
            }
        },
        model: {
            type: Type.OBJECT,
            properties: {
                provider: { type: Type.STRING },
                modelId: { type: Type.STRING },
                temperature: { type: Type.NUMBER }
            }
        },
        prompts: {
            type: Type.OBJECT,
            properties: { system: { type: Type.STRING, description: "The complete, detailed system prompt for the agent." } }
        },
        tools: { type: Type.ARRAY, items: toolSchemaV1 },
        memory: {
            type: Type.OBJECT,
            properties: {
                mode: { type: Type.STRING },
                provider: { type: Type.STRING },
                binding: { type: Type.STRING },
                notes: { type: Type.STRING, nullable: true }
            }
        },
        env: {
            type: Type.OBJECT,
            properties: {
                required: { type: Type.ARRAY, items: { type: Type.STRING } },
                optional: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        tests: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING, description: "MUST be 'smoke'" },
                    command: { type: Type.STRING, nullable: true },
                    expectedOutput: { type: Type.STRING, nullable: true }
                }
            }
        }
    },
    required: ['schemaVersion', 'id', 'name', 'version', 'description', 'author', 'language', 'execution', 'model', 'prompts', 'tools', 'memory', 'env', 'tests']
};

const getBasePrompt = (team: Team, role: AgentRole, language: Language, llmProvider: LLMProvider, modelName: string, customTools: ToolV1[]) => {
  const defaultModelId = llmProvider === LLMProvider.Gemini ? 'gemini-2.5-pro' : llmProvider === LLMProvider.OpenAI ? 'gpt-4o' : 'mistralai/mixtral-8x7b-instruct';
  const finalModelName = modelName.trim() || defaultModelId;
  const languageVersion = language === Language.Python ? "3.11" : language === Language.JavaScript ? "20.x" : language === Language.Go ? "1.22" : "1.77";

  return `
    You are building an agent manifest for my Transform Army AI ecosystem. Your output MUST be a single JSON object that is fully compliant with the 'agent.v1' schema I will provide.

    **Core Requirements Document:**
    - Every agent must output a manifest with \`schemaVersion: "agent.v1"\`.
    - Every agent must declare language and execution.
    - Every agent must declare memory (use external preferred).
    - Every agent must declare env (required and optional).
    - Every agent must list tools with schemas.
    - Every agent must include at least one smoke test.
    - Never ship secrets. Always ship placeholders.
    - If a tool needs a secret, add it to env.required.

    **Generation Task:**
    - **Team:** ${team} Team
    - **Role:** ${role}
    - **Language:** ${language} (version ${languageVersion})
    - **LLM Provider:** ${llmProvider}
    - **Model:** ${finalModelName}
    - **Custom Tools to Include:** ${customTools.map(t => t.name).join(', ') || 'None'}

    **Instructions:**
    1.  **Identity:** Create a suitable \`id\`, \`name\`, and \`description\` for an agent with the specified team and role. Set version to "1.0.0". Set author to "Transform Army AI".
    2.  **Execution:** Define the \`language\` and \`execution\` fields. For Python, command is 'python' and args is ['main.py']. For JS, 'node' and ['index.js']. For Go, command is './main'. For Rust, './main'.
    3.  **Model & Memory:** Use these defaults:
        - \`model\`: provider: "${llmProvider}", modelId: "${finalModelName}", temperature: 0.2
        - \`memory\`: mode: "external", provider: "none", binding: "TO_BE_CONFIGURED_ON_IMPORT", notes: "Set to your own vector index."
    4.  **Prompts:** Write a detailed, professional system prompt in the \`prompts.system\` field. This prompt should define the agent's persona, its core mandate, its rules of engagement, and how it should use its tools to achieve its goals.
    5.  **Tools:** Populate the \`tools\` array. Include the custom tools provided and add any other standard tools that are logical for this agent's role (e.g., a Reconnaissance agent should have a tool for network scanning).
    6.  **Env:** Analyze the tools. If any require authentication (e.g., an API key), add the required variable name to the \`env.required\` array.
    7.  **Tests:** Create at least one 'smoke' test. This should be a simple command or description that verifies the agent can start up or perform a basic action.

    Now, generate the complete 'agent.v1' JSON manifest.
  `;
};

export const generateAgent = async (
  team: Team,
  role: AgentRole,
  language: Language,
  llmProvider: LLMProvider,
  modelName: string,
  selectedTools: string[],
  customTools: CustomTool[]
): Promise<AgentProfile> => {
    
    // Map custom tools to the V1 format for the prompt
    const customToolsV1: ToolV1[] = customTools.map(ct => ({
        name: ct.name,
        description: ct.description,
        inputSchema: {
            type: 'object',
            properties: ct.parameters,
        },
        requiresAuth: true, // Assume custom tools might need auth
        authVars: [`${ct.name.toUpperCase()}_API_KEY`]
    }));

  const prompt = getBasePrompt(team, role, language, llmProvider, modelName, customToolsV1);

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: agentV1Schema,
            temperature: 0.7,
        }
    });
    
    const jsonText = response.text.trim();
    const agentManifest: AgentV1 = JSON.parse(jsonText);

    const avatarBase64 = await generateAvatar(team, role);

    const agentProfile: AgentProfile = {
        id: crypto.randomUUID(),
        manifest: agentManifest,
        team,
        role,
        status: AgentStatus.Idle,
        avatarBase64
    };

    return agentProfile;

  } catch (error) {
    console.error("Error generating agent manifest:", error);
    throw new Error("Failed to generate agent manifest from AI. Please check your API key and network connection.");
  }
};

export const normalizeAgent = async (foreignManifestJson: string): Promise<AgentProfile> => {
    const prompt = `
        You are an agent manifest normalization engine. Your task is to apply the "Agent Change of Command (ACoC)" rules to the provided foreign agent manifest and output a compliant 'agent.v1' manifest.

        **ACoC Rules:**
        1. **Normalize** to \`schemaVersion: "agent.v1"\`.
        2. **Preserve** identity fields (\`id\`, \`name\`, \`version\`) if they exist. If not, generate plausible ones.
        3. **Preserve** tools. If a tool has no schema, create a generic schema for it.
        4. **Preserve** memory references. Do not delete or inline memory. If it's unclear, use the default external memory block.
        5. **Accumulate** env vars. Inspect the whole manifest and all tools for anything that looks like a secret or API key and add it to \`env.required\`.
        6. **Add** an \`importMeta\` object describing the changes you made (e.g., "Normalized to agent.v1", "Added smoke test", "Inferred missing tool schemas").
        7. **Add** a default smoke test if one is missing.
        8. **Output** the fully formed, compliant \`agent.v1\` JSON manifest.

        **Foreign Agent Manifest to Normalize:**
        \`\`\`json
        ${foreignManifestJson}
        \`\`\`

        Now, produce the normalized 'agent.v1' manifest as a single JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: agentV1Schema,
            }
        });

        const jsonText = response.text.trim();
        const normalizedManifest: AgentV1 = JSON.parse(jsonText);

        // Determine Team/Role from manifest for UI purposes
        const name = normalizedManifest.name.toLowerCase();
        let team = Team.System;
        if (name.includes('red')) team = Team.Red;
        if (name.includes('blue')) team = Team.Blue;
        
        // This is a rough guess for the UI, the manifest is the source of truth.
        const role = normalizedManifest.name as AgentRole; 

        const avatarBase64 = await generateAvatar(team, role);

        return {
            id: crypto.randomUUID(),
            manifest: normalizedManifest,
            team,
            role,
            status: AgentStatus.Idle,
            avatarBase64
        };

    } catch (error) {
        console.error("Error normalizing agent manifest:", error);
        throw new Error("AI failed to normalize the provided agent manifest.");
    }
};


// SIMULATED: In a real scenario, this would call the actual image generation API.
export const generateAvatar = async (team: Team, role: AgentRole): Promise<string> => {
  // This is a placeholder that returns a deterministic, steampunk-themed avatar based on a hash of the role.
  // This avoids actual API calls in this environment but demonstrates the principle.
  const getHash = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; 
    }
    return Math.abs(hash);
  };

  const hash = getHash(role);
  const teamColor = team === Team.Red ? '192, 57, 43' : team === Team.Blue ? '52, 152, 219' : '212, 175, 55';
  
  const svg = `
    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="f1" x="-0.5" y="-0.5" width="2" height="2">
          <feTurbulence type="fractalNoise" baseFrequency="${0.02 + (hash % 5) * 0.01}" numOctaves="3" result="noise"/>
          <feDiffuseLighting in="noise" lighting-color="rgb(${teamColor})" surfaceScale="2">
            <feDistantLight azimuth="45" elevation="60"/>
          </feDiffuseLighting>
        </filter>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${teamColor});stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:rgb(46,31,22);stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill="rgb(46,31,22)"/>
      <rect width="64" height="64" filter="url(#f1)" opacity="0.3"/>
      <circle cx="32" cy="32" r="28" fill="url(#g1)" stroke="rgba(${teamColor}, 0.5)" stroke-width="2"/>
      <text x="32" y="38" font-family="Orbitron, sans-serif" font-size="24" fill="rgba(245,234,221,0.8)" text-anchor="middle" font-weight="bold">
        ${role.charAt(0)}${role.length > 1 ? role.charAt(1).toUpperCase() : ''}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};