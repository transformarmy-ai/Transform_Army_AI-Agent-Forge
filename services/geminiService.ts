
import { AgentProfile, Team, AgentRole, Language, LLMProvider, SystemTeamRole, CustomTool, AgentV1, LanguageV1, ExecutionV1, ModelV1, PromptsV1, ToolV1, MemoryV1, EnvV1, TestV1, AgentStatus } from '../types';
import { createLLMProvider } from './llmService';
import { enforceACoCRules, validateAgentManifestBasic } from './manifestUtils';

// Robust JSON parser that handles control characters and malformed JSON
function parseJSONSafely(jsonString: string): any {
  try {
    // First, try direct parsing
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('⚠️ [JSON PARSE] Initial parse failed, attempting repair...');
    
    // Try to extract JSON from markdown code blocks more aggressively
    let cleaned = jsonString.trim();
    // Remove BOM and unicode line/paragraph separators
    cleaned = cleaned.replace(/^\uFEFF/, '').replace(/[\u2028\u2029]/g, '');
    
    // Remove markdown code blocks (various formats)
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    
    // Try to find JSON object boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Remove JavaScript-style comments (both // and /* */)
    // We need to be careful to only remove comments outside of strings
    let commentRemoved = '';
    let inString = false;
    let escaped = false;
    let i = 0;
    
    while (i < cleaned.length) {
      const char = cleaned[i];
      const nextChar = i + 1 < cleaned.length ? cleaned[i + 1] : '';
      
      if (escaped) {
        commentRemoved += char;
        escaped = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        commentRemoved += char;
        i++;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        commentRemoved += char;
        i++;
        continue;
      }
      
      if (!inString) {
        // Check for single-line comment //
        if (char === '/' && nextChar === '/') {
          // Skip until end of line
          while (i < cleaned.length && cleaned[i] !== '\n' && cleaned[i] !== '\r') {
            i++;
          }
          // Skip the newline character(s) too
          if (i < cleaned.length) {
            if (cleaned[i] === '\r' && i + 1 < cleaned.length && cleaned[i + 1] === '\n') {
              i += 2; // Handle \r\n
            } else if (cleaned[i] === '\n' || cleaned[i] === '\r') {
              i++; // Handle \n or \r
            }
          }
          continue;
        }
        
        // Check for multi-line comment /* */
        if (char === '/' && nextChar === '*') {
          // Skip until we find */
          i += 2;
          while (i < cleaned.length) {
            if (cleaned[i] === '*' && i + 1 < cleaned.length && cleaned[i + 1] === '/') {
              i += 2;
              break;
            }
            i++;
          }
          continue;
        }
      }
      
      commentRemoved += char;
      i++;
    }
    
    // STEP 1: Escape control characters INSIDE strings first (before removing them)
    let fixed = commentRemoved;
    inString = false;
    escaped = false;
    let controlCharFixed = '';
    
    for (let j = 0; j < fixed.length; j++) {
      const char = fixed[j];
      
      if (escaped) {
        controlCharFixed += char;
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        controlCharFixed += char;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        controlCharFixed += char;
        continue;
      }
      
      if (inString) {
        // Inside a string, escape control characters
        if (char === '\n') {
          controlCharFixed += '\\n';
        } else if (char === '\r') {
          controlCharFixed += '\\r';
        } else if (char === '\t') {
          controlCharFixed += '\\t';
        } else if (char === '\f') {
          controlCharFixed += '\\f';
        } else if (char === '\b') {
          controlCharFixed += '\\b';
        } else if (char.charCodeAt(0) < 32) {
          // Any other control character - use unicode escape
          controlCharFixed += '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
        } else {
          controlCharFixed += char;
        }
      } else {
        // Outside strings, keep the character as-is for now
        controlCharFixed += char;
      }
    }
    
    // STEP 2: Remove trailing commas before closing braces/brackets
    let sanitized = controlCharFixed.replace(/,(?=\s*[}\]])/g, '');
    
    // STEP 3: Remove any remaining control characters OUTSIDE of strings
    // (these would be truly malformed JSON at this point)
    sanitized = sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    
    // STEP 4: Try a direct parse after basic sanitization
    try {
      const parsed = JSON.parse(sanitized);
      console.log('✅ [JSON PARSE] Successfully parsed after sanitization');
      return parsed;
    } catch (secondError) {
      console.warn('⚠️ [JSON PARSE] Sanitization parse failed, trying aggressive repair...');
      console.error('  - Second error:', secondError instanceof Error ? secondError.message : String(secondError));
      
      // STEP 5: Aggressive repair - fix common JSON issues
      try {
        let aggressive = sanitized;
        
        // Fix unescaped quotes in strings (this is tricky, best effort)
        // Replace literal newlines within quoted strings that weren't caught
        aggressive = aggressive.replace(/("\w+":\s*")([^"]*?)"/g, (match, prefix, content) => {
          // Escape any unescaped newlines in the content
          const fixed = content.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
          return prefix + fixed + '"';
        });
        
        // Remove any non-printable characters that might be lingering
        aggressive = aggressive.replace(/[^\x20-\x7E\n\r\t]/g, '');
        
        // Fix common double-escape issues
        aggressive = aggressive
          .replace(/\\\\"/g, '\\"')   // \" -> "
          .replace(/([^\\])\\\\n/g, '$1\\n')
          .replace(/([^\\])\\\\t/g, '$1\\t');
        
        // Try to parse the aggressively cleaned version
        const parsed = JSON.parse(aggressive);
        console.log('✅ [JSON PARSE] Successfully parsed after aggressive repair');
        return parsed;
      } catch (thirdError) {
        console.error('❌ [JSON PARSE] All repair attempts failed');
        console.error('  - Original error:', error instanceof Error ? error.message : String(error));
        console.error('  - Second error:', secondError instanceof Error ? secondError.message : String(secondError));
        console.error('  - Third error:', thirdError instanceof Error ? thirdError.message : String(thirdError));
        console.error('  - Problematic JSON (first 500 chars):', sanitized.substring(0, 500));
        console.error('  - Problematic JSON (last 500 chars):', sanitized.substring(Math.max(0, sanitized.length - 500)));
        
        // As a last resort, try to extract just the JSON object using a more lenient approach
        try {
          // Find the outermost braces and extract everything between them
          const firstBrace = sanitized.indexOf('{');
          const lastBrace = sanitized.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const extracted = sanitized.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(extracted);
            console.log('✅ [JSON PARSE] Successfully parsed after extraction');
            return parsed;
          }
        } catch (fourthError) {
          console.error('  - Fourth error:', fourthError instanceof Error ? fourthError.message : String(fourthError));
        }
        
        throw new Error(`Failed to parse JSON response from LLM after multiple repair attempts. Original error: ${error instanceof Error ? error.message : String(error)}. The LLM may have returned malformed JSON.`);
      }
    }
  }
}

// JSON Schema definitions (converted from Google Type enum to standard JSON Schema)
const toolParameterSchema = {
    type: "object",
    properties: {
        type: { type: "string" },
        description: { type: "string" }
    }
};

const toolSchemaV1 = {
    type: "object",
    properties: {
        name: { type: "string" },
        description: { type: "string" },
        inputSchema: {
            type: "object",
            properties: {
                type: { type: "string", description: "Should always be 'object'" },
                properties: {
                    type: "object",
                    properties: {},
                    additionalProperties: toolParameterSchema
                },
                required: { type: "array", items: { type: "string" } }
            }
        },
        requiresAuth: { type: "boolean" },
        authVars: { type: "array", items: { type: "string" } }
    },
    required: ['name', 'description', 'inputSchema']
};

const agentV1Schema = {
    type: "object",
    properties: {
        schemaVersion: { type: "string", description: "MUST be 'agent.v1'" },
        id: { type: "string", description: "A unique, kebab-case identifier for the agent, e.g., 'red-team-recon-scout'." },
        name: { type: "string", description: "A human-readable name, e.g., 'Red Team Recon Scout'." },
        version: { type: "string", description: "The semantic version of this agent, e.g., '1.0.0'." },
        description: { type: "string" },
        author: { type: "string", description: "The author of the agent, always 'Transform Army AI'." },
        language: {
            type: "object",
            properties: { name: { type: "string" }, version: { type: "string" } }
        },
        execution: {
            type: "object",
            properties: {
                kind: { type: "string", description: "e.g., 'process' or 'http'" },
                command: { type: "string" },
                args: { type: "array", items: { type: "string" } }
            }
        },
        model: {
            type: "object",
            properties: {
                provider: { type: "string" },
                modelId: { type: "string" },
                temperature: { type: "number" }
            }
        },
        prompts: {
            type: "object",
            properties: { system: { type: "string", description: "The complete, detailed system prompt for the agent." } }
        },
        tools: { type: "array", items: toolSchemaV1 },
        memory: {
            type: "object",
            properties: {
                mode: { type: "string" },
                provider: { type: "string" },
                binding: { type: "string" },
                notes: { type: "string" }
            }
        },
        env: {
            type: "object",
            properties: {
                required: { type: "array", items: { type: "string" } },
                optional: { type: "array", items: { type: "string" } }
            }
        },
        tests: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    type: { type: "string", description: "MUST be 'smoke'" },
                    command: { type: "string" },
                    expectedOutput: { type: "string" }
                }
            }
        },
        importMeta: {
            type: "object",
            properties: {
                source: { type: "string" },
                changes: { type: "array", items: { type: "string" } },
                timestamp: { type: "string" }
            }
        }
    },
    required: ['schemaVersion', 'id', 'name', 'version', 'description', 'author', 'language', 'execution', 'model', 'prompts', 'tools', 'memory', 'env', 'tests']
};

const getBasePrompt = (team: Team, role: AgentRole, language: Language, llmProvider: LLMProvider, modelName: string, customTools: ToolV1[]) => {
  const defaultModelId = llmProvider === LLMProvider.OpenAI ? 'gpt-4o' :
                         llmProvider === LLMProvider.OpenRouter ? 'mistralai/mistral-large' :
                         llmProvider === LLMProvider.Anthropic ? 'claude-3-5-sonnet-20241022' : 'gpt-4o';
  const finalModelName = modelName.trim() || defaultModelId;
  const languageVersion = language === Language.Python ? "3.11" : language === Language.JavaScript ? "20.x" : language === Language.Go ? "1.22" : "1.77";

  return `
    You are building an agent manifest for my Transform Army AI ecosystem. Your output MUST be a single JSON object that is fully compliant with the 'agent.v1' schema I will provide.

    IMPORTANT: STRICT JSON RULES YOU MUST FOLLOW EXACTLY
    - Return ONLY the JSON object. No markdown code fences, no prose, no explanations.
    - Use double quotes for all property names and all string values.
    - Escape control characters in strings: use \\n for newlines, \\t for tabs, \\" for quotes.
    - Do NOT include trailing commas in arrays or objects.
    - Do NOT include any comments (no // or /* */).
    - Ensure all brackets and braces are properly matched and closed.
    - Do not include special characters outside of proper JSON escapes.

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
    // Create the appropriate LLM provider
    const llmProviderInstance = createLLMProvider(llmProvider, modelName);
    
    if (!llmProviderInstance) {
      throw new Error(`Failed to create LLM provider for ${llmProvider}. Please check your API keys.`);
    }

    console.log(`Using ${llmProviderInstance.getName()} for agent generation...`);
    
    const jsonText = await llmProviderInstance.generateStructuredOutput(
      prompt,
      agentV1Schema,
      { temperature: 0.2 }
    );
    
    // DIAGNOSTIC LOG: Log the raw response before parsing
    console.log('🔍 [DIAGNOSTIC] Raw LLM response:');
    console.log('  - Response length:', jsonText.length);
    console.log('  - Response type:', typeof jsonText);
    console.log('  - First 200 chars:', jsonText.substring(0, 200));
    console.log('  - Last 200 chars:', jsonText.substring(Math.max(0, jsonText.length - 200)));
    
    // Use safe JSON parser that handles control characters
    let agentManifest: AgentV1 = parseJSONSafely(jsonText);
    // Enforce ACoC rules and validate
    const enforced = enforceACoCRules(agentManifest);
    const validation = validateAgentManifestBasic(enforced.manifest);
    if (!validation.valid) {
      console.error('❌ [VALIDATION] Agent manifest failed validation:', validation.errors);
      throw new Error(`Agent manifest failed validation: ${validation.errors.join('; ')}`);
    }
    agentManifest = enforced.manifest;

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

export const generateAgentWithRetry = async (
  team: Team,
  role: AgentRole,
  language: Language,
  llmProvider: LLMProvider,
  modelName: string,
  selectedTools: string[],
  customTools: CustomTool[],
  maxRetries: number = 3
): Promise<AgentProfile> => {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries}`);
      return await generateAgent(team, role, language, llmProvider, modelName, selectedTools, customTools);
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ [RETRY] Attempt ${attempt} failed:`, err instanceof Error ? err.message : String(err));
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
  }
  throw new Error(`Failed to generate agent after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
};

export const normalizeAgent = async (foreignManifestJson: string, llmProvider: LLMProvider, modelName: string): Promise<AgentProfile> => {
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
        // Use user-selected provider for normalization
        console.log(`🔧 [NORMALIZE FIX] Using provider: ${llmProvider} with model: ${modelName || 'default'}`);
        const llmProviderInstance = createLLMProvider(llmProvider, modelName);
        
        if (!llmProviderInstance) {
          throw new Error('Failed to create LLM provider for normalization. Please check your API keys.');
        }

        console.log(`Using ${llmProviderInstance.getName()} for manifest normalization...`);
        
        const jsonText = await llmProviderInstance.generateStructuredOutput(
          prompt,
          agentV1Schema,
          { temperature: 0.2 }
        );
        
        // DIAGNOSTIC LOG: Log the raw response before parsing
        console.log('🔍 [DIAGNOSTIC] Raw LLM response for normalization:');
        console.log('  - Response length:', jsonText.length);
        console.log('  - Response type:', typeof jsonText);
        console.log('  - First 200 chars:', jsonText.substring(0, 200));
        console.log('  - Last 200 chars:', jsonText.substring(Math.max(0, jsonText.length - 200)));
        
        // Use safe JSON parser that handles control characters
        let normalizedManifest: AgentV1 = parseJSONSafely(jsonText);
        const enforced = enforceACoCRules(normalizedManifest);
        const validation = validateAgentManifestBasic(enforced.manifest);
        if (!validation.valid) {
          console.error('❌ [VALIDATION] Normalized manifest failed validation:', validation.errors);
          throw new Error(`Normalized manifest failed validation: ${validation.errors.join('; ')}`);
        }
        normalizedManifest = enforced.manifest;

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