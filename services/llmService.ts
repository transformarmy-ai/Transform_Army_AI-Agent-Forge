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

// Ollama Provider (Local)
export class OllamaProvider implements LLMProviderInterface {
  private baseUrl: string;
  private modelId: string;

  constructor(baseUrl: string = 'http://localhost:11434', modelId: string = 'llama3.1') {
    this.baseUrl = baseUrl;
    this.modelId = modelId;
  }

  getName(): string {
    return 'Ollama (Local)';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      // Ollama uses a different API format
      const enhancedPrompt = `${prompt}\n\nIMPORTANT: You must respond with ONLY valid JSON that matches this schema. Do not include any other text, markdown formatting, or explanations.\n\nSchema: ${JSON.stringify(schema)}`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          prompt: enhancedPrompt,
          stream: false,
          options: {
            temperature: config?.temperature ?? 0.7,
            num_predict: config?.maxTokens ?? 4096,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] Ollama API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`Ollama API error: ${response.status} - ${error}. Make sure Ollama is running locally.`);
      }

      const data = await response.json();
      const content = data.response.trim();
      
      console.log('🔍 [DIAGNOSTIC] Ollama API Success Response:');
      console.log('  - Raw content length:', content.length);
      console.log('  - First 100 chars:', content.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] Ollama API Cleaned Response:');
      console.log('  - Cleaned content length:', cleanedContent.length);
      console.log('  - First 100 chars:', cleanedContent.substring(0, 100));
      
      return cleanedContent;
    } catch (error) {
      console.error('Ollama provider error:', error);
      throw new Error(`Failed to generate content with Ollama: ${error instanceof Error ? error.message : String(error)}. Ensure Ollama is running on ${this.baseUrl}`);
    }
  }
}

// LM Studio Provider (Local)
export class LMStudioProvider implements LLMProviderInterface {
  private baseUrl: string;
  private modelId: string;

  constructor(baseUrl: string = 'http://localhost:1234', modelId: string = 'local-model') {
    this.baseUrl = baseUrl;
    this.modelId = modelId;
  }

  getName(): string {
    return 'LM Studio (Local)';
  }

  async generateStructuredOutput(
    prompt: string,
    schema: any,
    config?: LLMConfig
  ): Promise<string> {
    try {
      // LM Studio uses OpenAI-compatible API
      const enhancedPrompt = `${prompt}\n\nIMPORTANT: You must respond with ONLY valid JSON that matches this schema. Do not include any other text, markdown formatting, or explanations.\n\nSchema: ${JSON.stringify(schema)}`;

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            { 
              role: 'system', 
              content: 'You are a JSON generation assistant. Always respond with valid JSON only, no markdown, no explanations.' 
            },
            { role: 'user', content: enhancedPrompt }
          ],
          temperature: config?.temperature ?? 0.7,
          max_tokens: config?.maxTokens ?? 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('🔍 [DIAGNOSTIC] LM Studio API Error Response:');
        console.log('  - Status:', response.status);
        console.log('  - Status Text:', response.statusText);
        console.log('  - Error body:', error);
        throw new Error(`LM Studio API error: ${response.status} - ${error}. Make sure LM Studio server is running.`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();
      
      console.log('🔍 [DIAGNOSTIC] LM Studio API Success Response:');
      console.log('  - Raw content length:', content.length);
      console.log('  - First 100 chars:', content.substring(0, 100));
      
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/^```json\n/, '').replace(/```$/, '').trim();
      console.log('🔍 [DIAGNOSTIC] LM Studio API Cleaned Response:');
      console.log('  - Cleaned content length:', cleanedContent.length);
      console.log('  - First 100 chars:', cleanedContent.substring(0, 100));
      
      return cleanedContent;
    } catch (error) {
      console.error('LM Studio provider error:', error);
      throw new Error(`Failed to generate content with LM Studio: ${error instanceof Error ? error.message : String(error)}. Ensure LM Studio server is running on ${this.baseUrl}`);
    }
  }
}

// Factory function to create the appropriate provider
export function createLLMProvider(
  provider: LLMProvider,
  modelName: string = ''
): LLMProviderInterface | null {
  const config = getProviderConfig(provider, modelName);
  
  // Local providers don't need API keys
  if (!config.apiKey && provider !== LLMProvider.Ollama && provider !== LLMProvider.LMStudio) {
    console.warn(`No API key configured for ${provider}`);
    return null;
  }

  switch (provider) {
    case LLMProvider.OpenAI:
      return new OpenAIProvider(config.apiKey, config.modelId);
    case LLMProvider.OpenRouter:
      return new OpenRouterProvider(config.apiKey, config.modelId);
    case LLMProvider.Anthropic:
      return new AnthropicProvider(config.apiKey, config.modelId);
    case LLMProvider.Ollama:
      return new OllamaProvider(config.baseUrl, config.modelId);
    case LLMProvider.LMStudio:
      return new LMStudioProvider(config.baseUrl, config.modelId);
    default:
      console.error(`Unsupported LLM provider: ${provider}`);
      return null;
  }
}

// Helper function to get API keys and model IDs from environment
function getProviderConfig(provider: LLMProvider, modelName: string): { apiKey: string; modelId: string; baseUrl?: string } {
  const getDefaultModel = () => {
    switch (provider) {
      case LLMProvider.OpenAI: return 'gpt-4o';
      case LLMProvider.OpenRouter: return 'mistralai/mistral-large';
      case LLMProvider.Anthropic: return 'claude-3-5-sonnet-20241022';
      case LLMProvider.Ollama: return 'llama3.1';
      case LLMProvider.LMStudio: return 'local-model';
      default: return '';
    }
  };

  const getDefaultBaseUrl = () => {
    switch (provider) {
      case LLMProvider.Ollama: return 'http://localhost:11434';
      case LLMProvider.LMStudio: return 'http://localhost:1234';
      default: return '';
    }
  };

  let apiKey = '';
  let baseUrl = '';
  
  switch (provider) {
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
    case LLMProvider.Ollama:
      baseUrl = process.env.OLLAMA_BASE_URL || getDefaultBaseUrl();
      console.log('🔍 [DIAGNOSTIC] Ollama Configuration:');
      console.log('  - Base URL:', baseUrl);
      console.log('  - Model:', modelName || getDefaultModel());
      console.log('  - Provider selected:', provider);
      break;
    case LLMProvider.LMStudio:
      baseUrl = process.env.LMSTUDIO_BASE_URL || getDefaultBaseUrl();
      console.log('🔍 [DIAGNOSTIC] LM Studio Configuration:');
      console.log('  - Base URL:', baseUrl);
      console.log('  - Model:', modelName || getDefaultModel());
      console.log('  - Provider selected:', provider);
      break;
  }

  return {
    apiKey,
    modelId: modelName.trim() || getDefaultModel(),
    baseUrl: baseUrl || getDefaultBaseUrl(),
  };
}

// Export for use in Anthropic if needed later
export { convertGoogleSchemaToJSONSchema };

