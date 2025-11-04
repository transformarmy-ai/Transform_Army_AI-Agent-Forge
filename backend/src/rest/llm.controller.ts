import { Body, Controller, Post } from '@nestjs/common';
import { LLMService, ChatMessage } from '../services/llm.service';

type ProviderAlias = 'web' | 'local' | 'openrouter' | 'lmstudio';

interface ChatBody {
  provider?: ProviderAlias;
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}

@Controller('llm')
export class LLMController {
  constructor(private readonly llm: LLMService) {}

  @Post('chat')
  async chat(@Body() body: ChatBody) {
    const alias = (body.provider || 'web').toLowerCase() as ProviderAlias;
    const provider = alias === 'web' ? 'openrouter' : alias === 'local' ? 'lmstudio' : (alias as 'openrouter' | 'lmstudio');
    const content = await this.llm.chat({
      provider,
      model: body.model,
      messages: body.messages || [],
      temperature: body.temperature,
    });
    return { content };
  }
}


