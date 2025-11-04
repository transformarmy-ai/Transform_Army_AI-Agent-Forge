import { LLMProvider } from '../types';

// Common interface for all LLM providers
export interface LLMResponse {
  text: string;
  model?: string;
}

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProviderInterface {
  generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string>;
  getName(): string;
}

// Helper function to convert Google GenAI Type enum to JSON Schema
function convertGoogleSchemaToJSONSchema(schema: any): any {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  // Convert Type enum values to strings
  const typeMap: { [key: string]: string } = {
    'OBJECT': 'object',
    'STRING': 'string',
    'ARRAY': 'array',
    'NUMBER': 'number',
    'BOOLEAN': 'boolean',
  };

  const converted = { ...schema };

  // Convert type enum if present
  if (converted.type && typeof converted.type === 'string') {
    converted.type = typeMap[converted.type] || converted.type;
  }

  // Recursively convert nested objects
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
    converted.additionalProperties = convertGoogleSchemaToJSONSchema(converted.additionalProperties);
  }

  return converted;
}

// OpenAI Provider
export class OpenAIProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string {
    return 'OpenAI';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_schema', schema: convertGoogleSchemaToJSONSchema(schema) },
          temperature: config?.temperature ?? 0.7,
          max_tokens: config?.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] OpenAI API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      console.log('🔍 [DIAGNOSTIC] OpenAI API Success Response:');
      console.log('  - Raw content length:', content.length);
      console.log('  - First 100 chars:', content.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] OpenAI API Cleaned Response:');
      console.log('  - Cleaned content length:', cleanedContent.length);
      console.log('  - First 100 chars:', cleanedContent.substring(0, 100));
      
      return cleanedContent;
    } catch (error) {
      console.error('OpenAI provider error:', error);
      throw new Error(`Failed to generate content with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Anthropic Claude Provider
export class AnthropicProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string {
    return 'Anthropic Claude';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      // Anthropic doesn't support structured outputs like OpenAI yet, so we request JSON mode
      const enhancedPrompt = `${prompt}\n\nIMPORTANT: You must respond with ONLY valid JSON that matches this schema. Do not include any other text or markdown formatting.`;

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
          system: `You are a JSON generation assistant. Always respond with valid JSON only, no markdown, no explanations. Schema requirements: ${JSON.stringify(schema)}`,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] Anthropic API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`Anthropic API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const text = data.content[0].text.trim();
      
      console.log('🔍 [DIAGNOSTIC] Anthropic API Success Response:');
      console.log('  - Raw text length:', text.length);
      console.log('  - First 100 chars:', text.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] Anthropic API Cleaned Response:');
      console.log('  - Cleaned text length:', cleanedText.length);
      console.log('  - First 100 chars:', cleanedText.substring(0, 100));
      
      return cleanedText;
    } catch (error) {
      console.error('Anthropic provider error:', error);
      throw new Error(`Failed to generate content with Anthropic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// OpenRouter Provider
export class OpenRouterProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'mistralai/mistral-large') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string {
    return 'OpenRouter';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_schema', schema: convertGoogleSchemaToJSONSchema(schema) },
          temperature: config?.temperature ?? 0.7,
          max_tokens: config?.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] OpenRouter API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      console.log('🔍 [DIAGNOSTIC] OpenRouter API Success Response:');
      console.log('  - Raw content length:', content.length);
      console.log('  - First 100 chars:', content.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] OpenRouter API Cleaned Response:');
      console.log('  - Cleaned content length:', cleanedContent.length);
      console.log('  - First 100 chars:', cleanedContent.substring(0, 100));
      
      return cleanedContent;
    } catch (error) {
      console.error('OpenRouter provider error:', error);
      throw new Error(`Failed to generate content with OpenRouter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Gemini Provider (using REST API directly)
export class GeminiProvider implements LLMProviderInterface {
  private apiKey: string;
  private modelId: string;

  constructor(apiKey: string, modelId: string = 'gemini-2.5-pro') {
    this.apiKey = apiKey;
    this.modelId = modelId;
  }

  getName(): string {
    return 'Google Gemini';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: schema,
              temperature: config?.temperature ?? 0.7,
              maxOutputTokens: config?.maxTokens ?? 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] Gemini API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text.trim();
      
      console.log('🔍 [DIAGNOSTIC] Gemini API Success Response:');
      console.log('  - Raw content length:', content.length);
      console.log('  - First 100 chars:', content.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] Gemini API Cleaned Response:');
      console.log('  - Cleaned content length:', cleanedContent.length);
      console.log('  - First 100 chars:', cleanedContent.substring(0, 100));
      
      return cleanedContent;
    } catch (error) {
      console.error('Gemini provider error:', error);
      throw new Error(`Failed to generate content with Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Factory function to create the appropriate provider
export function createLLMProvider(
  provider: LLMProvider,
  modelName: string = ''
): LLMProviderInterface | null {
  const config = getProviderConfig(provider, modelName);
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

// Helper function to get API keys and model IDs from environment
function getProviderConfig(provider: LLMProvider, modelName: string): { apiKey: string; modelId: string } {
  const getDefaultModel = () => {
    switch (provider) {
      case LLMProvider.Gemini: return 'gemini-2.5-pro';
      case LLMProvider.OpenAI: return 'gpt-4o';
      case LLMProvider.OpenRouter: return 'mistralai/mistral-large';
      case LLMProvider.Anthropic: return 'claude-3-5-sonnet-20241022';
      default: return '';
    }
  };

  let apiKey = '';
  switch (provider) {
    case LLMProvider.Gemini:
      // DIAGNOSTIC LOG: Check both potential API key sources
      const geminiKey1 = process.env.API_KEY;
      const geminiKey2 = process.env.GEMINI_API_KEY;
      console.log('🔍 [DIAGNOSTIC] Gemini API Key Check:');
      console.log('  - process.env.API_KEY:', geminiKey1 ? 'SET' : 'MISSING');
      console.log('  - process.env.GEMINI_API_KEY:', geminiKey2 ? 'SET' : 'MISSING');
      apiKey = geminiKey1 || geminiKey2 || '';
      console.log('  - Final apiKey:', apiKey ? 'SET' : 'MISSING');
      console.log('  - Provider selected:', provider);
      break;
    case LLMProvider.OpenAI:
      const openaiKey = process.env.OPENAI_API_KEY;
      console.log('🔍 [DIAGNOSTIC] OpenAI API Key Check:');
      console.log('  - process.env.OPENAI_API_KEY:', openaiKey ? 'SET' : 'MISSING');
      apiKey = openaiKey || '';
      console.log('  - Final apiKey:', apiKey ? 'SET' : 'MISSING');
      console.log('  - Provider selected:', provider);
      break;
    case LLMProvider.OpenRouter:
      const openrouterKey = process.env.OPENROUTER_API_KEY;
      console.log('🔍 [DIAGNOSTIC] OpenRouter API Key Check:');
      console.log('  - process.env.OPENROUTER_API_KEY:', openrouterKey ? 'SET' : 'MISSING');
      apiKey = openrouterKey || '';
      console.log('  - Final apiKey:', apiKey ? 'SET' : 'MISSING');
      console.log('  - Provider selected:', provider);
      break;
    case LLMProvider.Anthropic:
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      console.log('🔍 [DIAGNOSTIC] Anthropic API Key Check:');
      console.log('  - process.env.ANTHROPIC_API_KEY:', anthropicKey ? 'SET' : 'MISSING');
      apiKey = anthropicKey || '';
      console.log('  - Final apiKey:', apiKey ? 'SET' : 'MISSING');
      console.log('  - Provider selected:', provider);
      break;
  }

  return {
    apiKey,
    modelId: modelName.trim() || getDefaultModel(),
  };
}

// Export for use in Anthropic if needed later
export { convertGoogleSchemaToJSONSchema };

