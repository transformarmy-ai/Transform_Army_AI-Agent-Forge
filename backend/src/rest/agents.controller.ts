import { Controller, Get } from '@nestjs/common';

@Controller('agents')
export class AgentsController {
  @Get()
  findAll() {
    return [
      { id: 'agent.sample.1', name: 'Sample Agent 1' },
      { id: 'agent.sample.2', name: 'Sample Agent 2' },
    ];
  }
}


