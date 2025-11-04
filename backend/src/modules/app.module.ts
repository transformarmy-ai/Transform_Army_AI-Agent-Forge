import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrchestratorGateway } from '../ws/orchestrator.gateway';
import { AgentsController } from '../rest/agents.controller';
import { MissionsController } from '../rest/missions.controller';
import { TasksController } from '../rest/tasks.controller';
import { LogsController } from '../rest/logs.controller';
import { LLMController } from '../rest/llm.controller';
import { Agent } from '../orm/agent.entity';
import { Mission } from '../orm/mission.entity';
import { Task } from '../orm/task.entity';
import { LLMService } from '../services/llm.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // Dev only
    }),
    TypeOrmModule.forFeature([Agent, Mission, Task]),
  ],
  controllers: [AgentsController, MissionsController, TasksController, LogsController, LLMController],
  providers: [OrchestratorGateway, LLMService],
})
export class AppModule {}


