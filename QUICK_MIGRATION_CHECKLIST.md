# Quick Migration Checklist for Google AI Studio Projects

## 🎯 Pre-Migration: Find What Needs Changing

```bash
# Run these commands in your project root:

# Find all Google GenAI imports
grep -r "from.*@google/genai" . --include="*.ts" --include="*.tsx"

# Find all GoogleGenAI initializations
grep -r "GoogleGenAI" . --include="*.ts" --include="*.tsx"

# Find package.json dependency
grep -r "@google/genai" package.json

# Find CDN imports in HTML
grep -r "@google/genai" *.html

# Find Type.OBJECT usage (Google schemas)
grep -r "Type\\.OBJECT" . --include="*.ts" --include="*.tsx"

# Find generateContent calls
grep -r "generateContent" . --include="*.ts" --include="*.tsx"
```

---

## ✅ Migration Checklist (In Order)

### 1. Create New Service Layer
- [ ] Create `services/llmService.ts`
- [ ] Add `LLMProviderInterface`
- [ ] Add schema converter function
- [ ] Implement GeminiProvider (REST API)
- [ ] Implement OpenAIProvider
- [ ] Implement AnthropicProvider
- [ ] Implement OpenRouterProvider
- [ ] Add `createLLMProvider()` factory
- [ ] Add `LLMProvider` enum

### 2. Update Existing AI Services
- [ ] Find all service files using GenAI
- [ ] Remove `import { GoogleGenAI, Type } from "@google/genai"`
- [ ] Add `import { createLLMProvider } from './llmService'`
- [ ] Convert all schemas from Type enum to JSON Schema strings
- [ ] Replace `ai.models.generateContent()` calls
- [ ] Replace `new GoogleGenAI()` initialization
- [ ] Update error handling

### 3. Update Dependencies
- [ ] Remove `@google/genai` from `package.json`
- [ ] Remove `@google/genai` from `index.html` importmap (if present)
- [ ] Run `npm install` to clean up

### 4. Update Configuration
- [ ] Add environment variables to `.env`
  - [ ] `GEMINI_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `OPENROUTER_API_KEY`
  - [ ] `ANTHROPIC_API_KEY`
- [ ] Update `vite.config.ts` (or webpack config)
  - [ ] Add all provider API keys to `define`

### 5. Update Types
- [ ] Add `LLMProvider` enum to `types.ts`
- [ ] Update any interfaces referencing LLM provider

### 6. Update UI (Optional)
- [ ] Add provider selection dropdown
- [ ] Add model placeholder helpers
- [ ] Update any hardcoded provider references

### 7. Testing
- [ ] Test Gemini: simple text + structured output
- [ ] Test OpenAI: simple text + structured output
- [ ] Test Anthropic: simple text + structured output
- [ ] Test OpenRouter: simple text + structured output
- [ ] Test error handling (missing/invalid keys)
- [ ] Run TypeScript compiler: `npm run build`
- [ ] Check for linter errors: `npm run lint`

### 8. Documentation
- [ ] Update README.md with new setup instructions
- [ ] Update `.env.example` file
- [ ] Add migration notes

---

## 🔍 Pattern Replacements

### Pattern 1: Import Statement

**Before:**
```typescript
import { GoogleGenAI, Type } from "@google/genai";
```

**After:**
```typescript
import { createLLMProvider, LLMProvider } from './llmService';
```

---

### Pattern 2: Initialization

**Before:**
```typescript
const API_KEY = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY! });
```

**After:**
```typescript
// No initialization needed
// Create provider on-demand when needed
```

---

### Pattern 3: Simple Generation

**Before:**
```typescript
const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }] },
    config: { temperature: 0.7 }
});
const text = response.text.trim();
```

**After:**
```typescript
const llm = createLLMProvider(LLMProvider.Gemini, 'gemini-2.5-pro');
if (!llm) throw new Error('API key not configured');

const text = await llm.generateContent(prompt, { temperature: 0.7 });
```

---

### Pattern 4: Structured Output

**Before:**
```typescript
const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: { parts: [{ text: prompt }] },
    config: {
        responseMimeType: "application/json",
        responseSchema: mySchema,
        temperature: 0.7
    }
});
const jsonText = response.text.trim();
const result = JSON.parse(jsonText);
```

**After:**
```typescript
const llm = createLLMProvider(LLMProvider.Gemini, 'gemini-2.5-pro');
if (!llm) throw new Error('API key not configured');

const jsonText = await llm.generateStructuredOutput(
    prompt, 
    mySchema, 
    { temperature: 0.7 }
);
const result = JSON.parse(jsonText);
```

---

### Pattern 5: Schema Definition

**Before:**
```typescript
const mySchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name" },
        age: { type: Type.NUMBER, description: "Age" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
};
```

**After:**
```typescript
const mySchema = {
    type: "object",
    properties: {
        name: { type: "string", description: "Name" },
        age: { type: "number", description: "Age" },
        tags: { type: "array", items: { type: "string" } }
    }
};
```

**Quick conversion rules:**
- `Type.OBJECT` → `"object"`
- `Type.STRING` → `"string"`
- `Type.NUMBER` → `"number"`
- `Type.ARRAY` → `"array"`
- `Type.BOOLEAN` → `"boolean"`
- Remove `nullable: true`, add to `required` array if needed

---

## 🚨 Common Gotchas

### Gotcha 1: CORS in Browser
**Problem:** Browser blocks direct API calls to external domains  
**Solution:** Use backend proxy or ensure API supports CORS

### Gotcha 2: Anthropic Structured Outputs
**Problem:** Anthropic doesn't support JSON schema natively  
**Solution:** Prompt enhancement (already handled in provider)

### Gotcha 3: Different Response Formats
**Problem:** Each API returns data differently  
**Solution:** Abstracted in provider implementations

### Gotcha 4: Missing API Keys
**Problem:** Silent failures when keys not configured  
**Solution:** Check `createLLMProvider()` returns `null` and handle

### Gotcha 5: Streaming Not Supported
**Problem:** Current implementation is synchronous  
**Solution:** Add streaming methods to interface if needed

---

## 📝 File-by-File Changes

### Must Change Files:
1. `services/llmService.ts` - **Create new**
2. `services/*AI*.ts` - **Update all**
3. `package.json` - **Remove dependency**
4. `index.html` - **Remove CDN**
5. `.env` - **Add new keys**
6. `vite.config.ts` - **Add env vars**
7. `types.ts` - **Add enum**

### Might Change Files:
8. UI components with provider selection
9. Constants/config files
10. README/docs

---

## ⚡ Quick Test Script

Add this to your test file:

```typescript
async function testAllProviders() {
  const providers = [
    LLMProvider.Gemini,
    LLMProvider.OpenAI,
    LLMProvider.Anthropic,
    LLMProvider.OpenRouter,
  ];

  for (const provider of providers) {
    console.log(`Testing ${provider}...`);
    
    const llm = createLLMProvider(provider);
    if (!llm) {
      console.log(`  ⚠️  Skipped: No API key configured`);
      continue;
    }

    try {
      const result = await llm.generateContent(
        "Say 'Hello' in one word.",
        { temperature: 0.7 }
      );
      console.log(`  ✅ Success: ${result}`);
    } catch (error) {
      console.log(`  ❌ Failed: ${error}`);
    }
  }
}

// Run: testAllProviders();
```

---

## 🎉 Success Indicators

You know migration is complete when:
- ✅ `npm run build` succeeds
- ✅ `npm run lint` passes
- ✅ All providers can generate text
- ✅ Structured outputs work with at least 2 providers
- ✅ No `@google/genai` in codebase
- ✅ No `GoogleGenAI` references
- ✅ User can select providers in UI
- ✅ Tests pass

---

## 📚 Reference Files

In your migrated project, refer to:
- `SKILL.md` - Full detailed guide
- `MIGRATION_COMPLETE.md` - Real example
- `services/llmService.ts` - Implementation reference
- `services/geminiService.ts` - Usage examples

---

## 🆘 Emergency Rollback

If something breaks:

```bash
# Revert to Google GenAI temporarily
npm install @google/genai@^1.28.0

# Add back to package.json dependencies
# Re-add CDN to index.html
# Revert service files to use GoogleGenAI
# Keep new llmService.ts for future migration
```

---

## 💡 Pro Tips

1. **Do one provider at a time** - Test Gemini first, then add others
2. **Use TypeScript** - Catches schema conversion errors
3. **Test structured outputs** - Most complex part
4. **Start with simple cases** - Move to complex ones after
5. **Keep both systems** - Gradual migration is safer
6. **Monitor costs** - Each provider has different pricing
7. **Add logging** - See which provider is being used
8. **Cache responses** - Save API costs during testing

---

**Total Files to Touch: ~10 files**  
**Estimated Time: 2-4 hours for typical project**  
**Difficulty: Medium**  
**Risk: Low (reversible)**

