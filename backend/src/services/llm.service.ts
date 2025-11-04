import { Injectable } from '@nestjs/common';

export type LLMProvider = 'openrouter' | 'lmstudio';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  provider: LLMProvider;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}

@Injectable()
export class LLMService {
  private getOpenRouterApiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY;
  }

  private getLMStudioBaseUrl(): string {
    return process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234';
  }

  async chat(req: ChatRequest): Promise<string> {
    if (req.provider === 'openrouter') {
      return this.chatOpenRouter(req);
    }
    if (req.provider === 'lmstudio') {
      return this.chatLMStudio(req);
    }
    throw new Error(`Unsupported provider: ${req.provider}`);
  }

  private async chatOpenRouter(req: ChatRequest): Promise<string> {
    const apiKey = this.getOpenRouterApiKey();
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
    const model = req.model || 'openrouter/auto';
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`OpenRouter error: ${response.status} ${text}`);
    }
    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || '';
    if (!content) throw new Error('OpenRouter returned empty content');
    return content;
  }

  private async chatLMStudio(req: ChatRequest): Promise<string> {
    const base = this.getLMStudioBaseUrl().replace(/\/$/, '');
    const url = `${base}/v1/chat/completions`;
    const model = req.model || 'local-model';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.2,
      }),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`LM Studio error: ${response.status} ${text}`);
    }
    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text || '';
    if (!content) throw new Error('LM Studio returned empty content');
    return content;
  }
}


