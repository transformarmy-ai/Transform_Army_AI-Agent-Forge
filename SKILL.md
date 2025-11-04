# Skill: Migrate Google AI Studio Projects to Multi-Provider LLM System

## Overview

This skill provides a comprehensive guide for migrating any Google AI Studio project from the `@google/genai` SDK to a flexible, multi-provider LLM architecture that supports OpenAI, Anthropic, and OpenRouter via REST APIs.

**Note**: This document is maintained for historical/educational purposes. The current implementation supports OpenAI, Anthropic, and OpenRouter providers.

---

## Problem Statement

Google AI Studio projects using `@google/genai` face several limitations:
- Vendor lock-in to Google's ecosystem
- Limited to Google's AI models
- SDK dependency issues
- No flexibility to switch providers based on cost/performance

**Solution**: Create a universal LLM abstraction layer that works with any LLM provider via REST APIs.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (UI, Components, Business Logic)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      LLM Service Layer (NEW!)           │
│  ┌───────────────────────────────────┐  │
│  │ LLMProviderInterface (Universal)  │  │
│  └────────┬──────────────────────────┘  │
│           │                              │
│  ┌────────┴─────────┬────────────────┐  │
│  │                  │                │  │
│  ▼                  ▼                ▼  │
│  [REMOVED]         OpenAIProvider  ...  │
│  (deprecated)      (REST)               │
└─────────────────────────────────────────┘
```

---

## Migration Steps

### Step 1: Identify All Google GenAI Dependencies

**Search for:**
```bash
# Find all imports of Google GenAI
grep -r "from.*@google/genai" .
grep -r "import.*GoogleGenAI" .
grep -r "@google/genai" package.json
grep -r "@google/genai" index.html
```

**Files to check:**
- `package.json` - Dependencies
- `index.html` - CDN imports
- All service files using AI
- Configuration files

**Key patterns:**
- `import { GoogleGenAI, Type } from "@google/genai"`
- `new GoogleGenAI({ apiKey })`
- `ai.models.generateContent()`
- `responseMimeType: "application/json"`
- `responseSchema`

---

### Step 2: Create the Multi-Provider Service Layer

**File: `services/llmService.ts`** (Create new file)

#### 2.1 Define Core Interfaces

```typescript
// Common configuration
export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
}

// Universal provider interface
export interface LLMProviderInterface {
  generateContent(
    prompt: string,
    config?: LLMConfig
  ): Promise<string>;
  
  generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string>;
  
  getName(): string;
  supportsStructuredOutputs(): boolean;
}
```

#### 2.2 Schema Converter

Google uses `Type.OBJECT`, `Type.STRING`, etc. Convert to JSON Schema:

```typescript
function convertGoogleSchemaToJSONSchema(schema: any): any {
  const typeMap: { [key: string]: string } = {
    'OBJECT': 'object',
    'STRING': 'string',
    'ARRAY': 'array',
    'NUMBER': 'number',
    'BOOLEAN': 'boolean',
  };

  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  const converted = { ...schema };

  // Convert type enum
  if (converted.type && typeof converted.type === 'string') {
    converted.type = typeMap[converted.type] || converted.type;
  }

  // Recursively convert nested properties
  if (converted.properties) {
    const newProps: any = {};
    for (const [key, value] of Object.entries(converted.properties)) {
      newProps[key] = convertGoogleSchemaToJSONSchema(value);
    }
    converted.properties = newProps;
  }

  if (converted.items) {
    converted.items = convertGoogleSchemaToJSONSchema(converted.items);
  }

  if (converted.additionalProperties) {
    converted.additionalProperties = convertGoogleSchemaToJSONSchema(
      converted.additionalProperties
    );
  }

  return converted;
}
```

#### 2.3 (Removed) Provider Example

```typescript
// This section has been removed. Refer to OpenAI, Anthropic, OpenRouter, or Local (Ollama/LM Studio) providers.
```

#### 2.4 Implement Other Providers

**OpenAI Provider:**

```typescript
export class OpenAIProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string { return 'OpenAI'; }
  supportsStructuredOutputs(): boolean { return true; }

  async generateContent(prompt: string, config?: LLMConfig): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: prompt }],
        response_format: { 
          type: 'json_schema', 
          json_schema: { schema: convertGoogleSchemaToJSONSchema(schema) }
        },
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
}
```

**Anthropic Provider:**

```typescript
export class AnthropicProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string { return 'Anthropic Claude'; }
  supportsStructuredOutputs(): boolean { return false; } // Request JSON in prompt

  async generateContent(prompt: string, config?: LLMConfig): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        max_tokens: config?.maxTokens ?? 4096,
        temperature: config?.temperature ?? 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    // Anthropic doesn't support structured outputs, so enhance the prompt
    const enhancedPrompt = `${prompt}\n\nIMPORTANT: You must respond with ONLY valid JSON that matches this schema. Do not include any other text or markdown formatting.\n\nSchema requirements: ${JSON.stringify(schema)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        max_tokens: config?.maxTokens ?? 4096,
        temperature: config?.temperature ?? 0.7,
        messages: [{ role: 'user', content: enhancedPrompt }],
        system: 'You are a JSON generation assistant. Always respond with valid JSON only, no markdown, no explanations.',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();
    
    // Remove markdown code blocks if present
    return text.replace(/^```json\n/, '').replace(/```$/, '').trim();
  }
}
```

**OpenRouter Provider:**

```typescript
export class OpenRouterProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'mistralai/mistral-large') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string { return 'OpenRouter'; }
  supportsStructuredOutputs(): boolean { return true; }

  async generateContent(prompt: string, config?: LLMConfig): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: 'user', content: prompt }],
        response_format: { 
          type: 'json_schema', 
          json_schema: { schema: convertGoogleSchemaToJSONSchema(schema) }
        },
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
}
```

#### 2.5 Provider Factory

```typescript
export enum LLMProvider {
  Gemini = 'Google Gemini',
  OpenAI = 'OpenAI',
  OpenRouter = 'OpenRouter',
  Anthropic = 'Anthropic',
}

export function createLLMProvider(
  provider: LLMProvider,
  modelName: string = '',
  apiKey?: string
): LLMProviderInterface | null {
  const config = getProviderConfig(provider, modelName, apiKey);
  if (!config.apiKey) {
    console.warn(`No API key configured for ${provider}`);
    return null;
  }

  switch (provider) {
    case LLMProvider.Gemini:
      return new GeminiProvider(config.apiKey, config.modelId);
    case LLMProvider.OpenAI:
      return new OpenAIProvider(config.apiKey, config.modelId);
    case LLMProvider.OpenRouter:
      return new OpenRouterProvider(config.apiKey, config.modelId);
    case LLMProvider.Anthropic:
      return new AnthropicProvider(config.apiKey, config.modelId);
    default:
      console.error(`Unsupported LLM provider: ${provider}`);
      return null;
  }
}

function getProviderConfig(provider: LLMProvider, modelName: string, apiKey?: string) {
  const getDefaultModel = () => {
    switch (provider) {
      case LLMProvider.Gemini: return 'gemini-2.5-pro';
      case LLMProvider.OpenAI: return 'gpt-4o';
      case LLMProvider.OpenRouter: return 'mistralai/mistral-large';
      case LLMProvider.Anthropic: return 'claude-3-5-sonnet-20241022';
      default: return '';
    }
  };

  let finalApiKey = '';
  if (apiKey) {
    finalApiKey = apiKey;
  } else {
    switch (provider) {
      case LLMProvider.Gemini:
        finalApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
        break;
      case LLMProvider.OpenAI:
        finalApiKey = process.env.OPENAI_API_KEY || '';
        break;
      case LLMProvider.OpenRouter:
        finalApiKey = process.env.OPENROUTER_API_KEY || '';
        break;
      case LLMProvider.Anthropic:
        finalApiKey = process.env.ANTHROPIC_API_KEY || '';
        break;
    }
  }

  return {
    apiKey: finalApiKey,
    modelId: modelName.trim() || getDefaultModel(),
  };
}
```

---

### Step 3: Update Existing AI Service Files

**File: `services/yourExistingAIService.ts`** (Update existing)

#### 3.1 Remove Google GenAI Imports

**Before:**
```typescript
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });
```

**After:**
```typescript
import { createLLMProvider, LLMProvider } from './llmService';
// Or if not using enum: import { createLLMProvider } from './llmService';
```

#### 3.2 Convert Schema Definitions

**Before:**
```typescript
const mySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name" },
        count: { type: Type.NUMBER }
    }
};
```

**After:**
```typescript
const mySchema = {
    type: "object",
    properties: {
        name: { type: "string", description: "Name" },
        count: { type: "number" }
    }
};
```

#### 3.3 Update AI Generation Calls

**Before:**
```typescript
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
```

**After:**
```typescript
const llmProvider = createLLMProvider(LLMProvider.Gemini, 'gemini-2.5-pro');
if (!llmProvider) {
  throw new Error('Failed to create LLM provider. Check API keys.');
}

const jsonText = await llmProvider.generateStructuredOutput(
  prompt,
  agentV1Schema,
  { temperature: 0.7 }
);
```

#### 3.4 Handle Non-Structured Outputs

**Before:**
```typescript
const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }] },
    config: {
        temperature: 0.7,
    }
});

const text = response.text.trim();
```

**After:**
```typescript
const llmProvider = createLLMProvider(LLMProvider.Gemini, 'gemini-2.5-pro');
if (!llmProvider) {
  throw new Error('Failed to create LLM provider. Check API keys.');
}

const text = await llmProvider.generateContent(
  prompt,
  { temperature: 0.7 }
);
```

---

### Step 4: Update Configuration Files

#### 4.1 package.json

**Before:**
```json
{
  "dependencies": {
    "@google/genai": "^1.28.0",
    ...
  }
}
```

**After:**
```json
{
  "dependencies": {
    ...
  }
}
```

**Remove:** `@google/genai` from dependencies

#### 4.2 index.html (if using CDN)

**Before:**
```html
<script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.28.0",
    ...
  }
}
</script>
```

**After:**
```html
<script type="importmap">
{
  "imports": {
    ...
  }
}
</script>
```

**Remove:** `@google/genai` from importmap

#### 4.3 vite.config.ts (or webpack config)

**Before:**
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
```

**After:**
```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || ''),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || ''),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY || ''),
    },
  };
});
```

#### 4.4 .env File

**Before:**
```bash
API_KEY=your_gemini_key
```

**After:**
```bash
# Gemini (default/fallback)
API_KEY=your_gemini_key
GEMINI_API_KEY=your_gemini_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_key
```

---

### Step 5: Update Type Definitions (if applicable)

**File: `types.ts` or similar**

**Add:**
```typescript
export enum LLMProvider {
  Gemini = 'Google Gemini',
  OpenAI = 'OpenAI',
  OpenRouter = 'OpenRouter',
  Anthropic = 'Anthropic',
}
```

**Update any interfaces that reference LLM providers.**

---

### Step 6: Update UI Components (if applicable)

If your UI allows users to select LLM providers:

**File: `components/YourAIComponent.tsx`**

**Before:**
```typescript
const llmProviders = ['Gemini'];
```

**After:**
```typescript
import { LLMProvider } from '../types';

const llmProviders = [
  LLMProvider.Gemini,
  LLMProvider.OpenAI,
  LLMProvider.OpenRouter,
  LLMProvider.Anthropic
];
```

**Update model placeholders:**

```typescript
const getModelPlaceholder = (provider: LLMProvider) => {
  switch (provider) {
    case LLMProvider.Gemini:
      return 'e.g., gemini-2.5-pro';
    case LLMProvider.OpenAI:
      return 'e.g., gpt-4o';
    case LLMProvider.OpenRouter:
      return 'e.g., mistralai/mistral-large';
    case LLMProvider.Anthropic:
      return 'e.g., claude-3-5-sonnet-20241022';
    default:
      return 'Enter model name';
  }
};
```

---

## Testing Checklist

After migration, test each provider:

### ✅ Gemini
- [ ] Simple text generation works
- [ ] Structured JSON output works
- [ ] Error handling works (invalid key)
- [ ] Custom models work

### ✅ OpenAI
- [ ] Simple text generation works
- [ ] Structured JSON output works
- [ ] Different models work (gpt-4, gpt-3.5-turbo)
- [ ] Error handling works

### ✅ Anthropic
- [ ] Simple text generation works
- [ ] JSON output (via prompt enhancement) works
- [ ] Different models work
- [ ] Error handling works

### ✅ OpenRouter
- [ ] Simple text generation works
- [ ] Structured JSON output works
- [ ] Different models work
- [ ] Error handling works

### ✅ General
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] All existing functionality works

---

## Common Issues & Solutions

### Issue 1: "Failed to create LLM provider"

**Cause:** API key not configured

**Solution:**
```typescript
// Make sure environment variables are set
console.log('Gemini key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
console.log('OpenAI key:', process.env.OPENAI_API_KEY ? 'Set' : 'Missing');

// Or pass API key directly
const provider = createLLMProvider(
  LLMProvider.OpenAI,
  'gpt-4o',
  'your-api-key-here'
);
```

### Issue 2: Schema validation errors

**Cause:** Provider doesn't support structured outputs

**Solution:**
```typescript
const provider = createLLMProvider(LLMProvider.Anthropic);

if (provider && !provider.supportsStructuredOutputs()) {
  // Use generateContent and parse manually
  const text = await provider.generateContent(prompt);
  // Fallback JSON parsing with validation
}
```

### Issue 3: CORS errors

**Cause:** Frontend calling APIs directly

**Solution:** Create a backend proxy:
```typescript
// Backend route: /api/llm
app.post('/api/llm', async (req, res) => {
  const { provider, model, prompt, schema } = req.body;
  const llm = createLLMProvider(provider, model);
  const result = await llm.generateStructuredOutput(prompt, schema);
  res.json({ result });
});
```

### Issue 4: Rate limiting

**Cause:** Too many requests

**Solution:** Add retry logic:
```typescript
async function generateWithRetry(
  provider: LLMProviderInterface,
  prompt: string,
  schema: any,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await provider.generateStructuredOutput(prompt, schema);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Advanced: Adding Custom Providers

To add a new provider (e.g., Cohere, Hugging Face):

1. **Implement the interface:**

```typescript
export class CohereProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'command') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string { return 'Cohere'; }
  supportsStructuredOutputs(): boolean { return false; }

  async generateContent(prompt: string, config?: LLMConfig): Promise<string> {
    const response = await fetch('https://api.cohere.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelId,
        prompt,
        temperature: config?.temperature ?? 0.7,
        max_tokens: config?.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.generations[0].text.trim();
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    // Implement JSON mode or prompt enhancement
    return this.generateContent(prompt, config);
  }
}
```

2. **Add to factory:**

```typescript
export enum LLMProvider {
  // ... existing
  Cohere = 'Cohere',
}

export function createLLMProvider(
  provider: LLMProvider,
  modelName: string = '',
  apiKey?: string
): LLMProviderInterface | null {
  // ... existing code
  switch (provider) {
    // ... existing cases
    case LLMProvider.Cohere:
      return new CohereProvider(config.apiKey, config.modelId);
    default:
      console.error(`Unsupported LLM provider: ${provider}`);
      return null;
  }
}
```

3. **Add environment variable support:**

```typescript
case LLMProvider.Cohere:
  finalApiKey = process.env.COHERE_API_KEY || '';
  break;
```

4. **Update config files:**

```typescript
// vite.config.ts
'process.env.COHERE_API_KEY': JSON.stringify(env.COHERE_API_KEY || ''),
```

---

## Migration Template Checklist

Use this checklist for any Google AI Studio project:

### Pre-Migration Analysis
- [ ] Identify all files using `@google/genai`
- [ ] Document current usage patterns
- [ ] Note all schemas in use
- [ ] List all models currently used
- [ ] Check for Type enum usage

### Migration Execution
- [ ] Create `services/llmService.ts`
- [ ] Implement Gemini provider (REST)
- [ ] Implement at least one other provider
- [ ] Add provider factory
- [ ] Convert all schema definitions
- [ ] Update all AI service files
- [ ] Update configuration files
- [ ] Remove Google GenAI dependencies
- [ ] Update environment variables

### Post-Migration Testing
- [ ] Test each provider with simple text
- [ ] Test structured outputs
- [ ] Test error handling
- [ ] Verify no TypeScript errors
- [ ] Verify build succeeds
- [ ] Test in production environment

### Documentation
- [ ] Update README with new API keys
- [ ] Document provider-specific considerations
- [ ] Add migration notes
- [ ] Update examples

---

## Key Files Reference

| File Type | What to Change |
|-----------|----------------|
| `package.json` | Remove `@google/genai` |
| `index.html` | Remove `@google/genai` from importmap |
| `vite.config.ts` | Add all provider env vars |
| `.env` | Add all API keys |
| `types.ts` | Add `LLMProvider` enum |
| `services/*Service.ts` | Replace GenAI calls |
| All schemas | Convert Type.OBJECT to "object" |
| UI components | Add provider selection |

---

## Benefits of This Migration

1. **Flexibility:** Use any LLM based on cost/quality needs
2. **No Vendor Lock-in:** Switch providers without code changes
3. **Better Error Handling:** Consistent error messages
4. **Cost Optimization:** Use cheaper providers when possible
5. **Future-Proof:** Easy to add new providers
6. **Standard APIs:** Use REST instead of proprietary SDKs
7. **Better DX:** Clear provider interface

---

## Success Criteria

✅ **Migration is successful when:**
- All tests pass with multiple providers
- No Google GenAI dependencies remain
- Users can select providers via UI
- Same functionality works across providers
- Build succeeds without errors
- Documentation is updated
- Environment setup is straightforward

---

## Quick Reference: Provider Comparison

| Provider | Model Examples | Structured Outputs | Best For | Cost |
|----------|---------------|-------------------|----------|------|
| Gemini | gemini-2.5-pro, gemini-1.5-pro | ✅ Native | Speed, JSON | Free tier |
| OpenAI | gpt-4o, gpt-4-turbo | ✅ Native | Quality | $$$ |
| Anthropic | claude-3-5-sonnet | ⚠️ Prompt-based | Reasoning | $$ |
| OpenRouter | mistralai/mistral-large, llama-3 | ✅ Native | Flexibility | $ |

---

## Example: Complete Migration

See `MIGRATION_COMPLETE.md` for a complete working example from the Transform Army AI project.

---

## Need Help?

Common patterns to search for in codebase:
- `GoogleGenAI` - SDK initialization
- `generateContent` - API calls
- `Type.OBJECT` - Schema definitions
- `@google/genai` - Imports
- `responseSchema` - Structured outputs
- `responseMimeType` - JSON mode

---

**This skill is portable and can be applied to any Google AI Studio project.**

