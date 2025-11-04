import { Controller, Get } from '@nestjs/common';

@Controller('missions')
export class MissionsController {
  @Get('status')
  status() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}


