import { OrchestratorService } from './orchestratorService';
import { ChatMessage } from '../components/OrchestratorChatbox';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTeam?: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  dueDate?: string;
  metadata?: Record<string, any>;
}

export interface TeamDeployment {
  id: string;
  name: string;
  agents: string[];
  status: 'active' | 'idle' | 'standby' | 'archived';
  deployedAt: string;
  taskIds: string[];
}

export interface GeneralAgentContext {
  missionId: string;
  tasks: Task[];
  teams: TeamDeployment[];
  orchestratorService: OrchestratorService;
}

/**
 * General Agent Service - Manages task assignment, team deployment, and coordination
 */
export class GeneralAgentService {
  private context: GeneralAgentContext;
  private commandHistory: string[] = [];

  constructor(missionId: string, orchestratorService: OrchestratorService) {
    this.context = {
      missionId,
      tasks: [],
      teams: [],
      orchestratorService,
    };
  }

  /**
   * Parse natural language command and execute
   */
  async processCommand(userInput: string): Promise<string> {
    this.commandHistory.push(userInput);
    const normalizedInput = userInput.toLowerCase().trim();

    // Task Management Commands
    if (this.matchesPattern(normalizedInput, ['create task', 'assign task', 'new task'])) {
      return await this.handleCreateTask(userInput);
    }

    if (this.matchesPattern(normalizedInput, ['list tasks', 'show tasks', 'get tasks'])) {
      return this.handleListTasks();
    }

    if (this.matchesPattern(normalizedInput, ['complete task', 'finish task'])) {
      return this.handleCompleteTask(userInput);
    }

    if (this.matchesPattern(normalizedInput, ['delete task', 'remove task'])) {
      return this.handleDeleteTask(userInput);
    }

    // Team Management Commands
    if (this.matchesPattern(normalizedInput, ['spin up', 'create team', 'deploy team'])) {
      return await this.handleSpinUpTeam(userInput);
    }

    if (this.matchesPattern(normalizedInput, ['spin down', 'stop team', 'retire team'])) {
      return this.handleSpinDownTeam(userInput);
    }

    if (this.matchesPattern(normalizedInput, ['list teams', 'show teams'])) {
      return this.handleListTeams();
    }

    // Mission Status
    if (this.matchesPattern(normalizedInput, ['status', 'report', 'help'])) {
      return await this.handleMissionStatus();
    }

    // Default custom command
    return await this.sendCustomCommand(userInput);
  }

  private async handleCreateTask(input: string): Promise<string> {
    try {
      const taskId = `task-${Date.now()}`;
      const title = this.extractContent(input) || 'Unnamed Task';
      const priority = this.extractPriority(input);

      const task: Task = {
        id: taskId,
        title,
        description: input,
        priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.context.tasks.push(task);
      return `✅ Task created: "${task.title}"\nPriority: ${priority.toUpperCase()}\nID: ${taskId}`;
    } catch (error) {
      return `❌ Failed to create task`;
    }
  }

  private handleListTasks(): string {
    if (this.context.tasks.length === 0) {
      return '📋 No tasks yet. Create one with "create task: {description}"';
    }

    let output = '📋 **TASK LIST**\n\n';
    this.context.tasks.forEach((task, idx) => {
      const emoji = this.getStatusEmoji(task.status);
      output += `${idx + 1}. ${emoji} ${task.title} [${task.priority}]\n   ID: ${task.id}\n`;
    });
    return output;
  }

  private handleCompleteTask(input: string): string {
    const taskId = this.extractId(input, 'task');
    if (!taskId) return '❌ Specify task ID (e.g., "complete task task-12345")';

    const task = this.context.tasks.find(t => t.id === taskId);
    if (!task) return `❌ Task not found`;

    task.status = 'completed';
    return `✅ Task "${task.title}" completed!`;
  }

  private handleDeleteTask(input: string): string {
    const taskId = this.extractId(input, 'task');
    if (!taskId) return '❌ Specify task to delete';

    const idx = this.context.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return `❌ Task not found`;

    this.context.tasks.splice(idx, 1);
    return `✅ Task deleted`;
  }

  private async handleSpinUpTeam(input: string): Promise<string> {
    try {
      const teamName = this.extractContent(input) || `Alpha-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const teamId = `team-${Date.now()}`;

      const agents = await this.context.orchestratorService.listAgents().catch(() => []);
      const agentIds = agents.slice(0, 3).map((a: any) => a.id || a.name || `Agent-${Math.random()}`);

      const team: TeamDeployment = {
        id: teamId,
        name: teamName,
        agents: agentIds.length > 0 ? agentIds : ['Agent-1', 'Agent-2', 'Agent-3'],
        status: 'active',
        deployedAt: new Date().toISOString(),
        taskIds: [],
      };

      this.context.teams.push(team);
      return `🚀 Team "${teamName}" DEPLOYED!\nAgents: ${team.agents.join(', ')}\nID: ${teamId}`;
    } catch (error) {
      return `🚀 Team deployed (backend unavailable for agents)`;
    }
  }

  private handleSpinDownTeam(input: string): string {
    const teamId = this.extractId(input, 'team');
    if (!teamId) return '❌ Specify team to retire';

    const team = this.context.teams.find(t => t.id === teamId);
    if (!team) return `❌ Team not found`;

    team.status = 'archived';
    return `🛑 Team "${team.name}" RETIRED\nAgents freed: ${team.agents.length}`;
  }

  private handleListTeams(): string {
    if (this.context.teams.length === 0) {
      return '👥 No teams deployed. Use "spin up team: {name}"';
    }

    let output = '👥 **TEAM ROSTER**\n\n';
    this.context.teams.forEach((team, idx) => {
      const emoji = team.status === 'active' ? '🟢' : '⚫';
      output += `${idx + 1}. ${emoji} ${team.name}\n   Agents: ${team.agents.join(', ')}\n   ID: ${team.id}\n`;
    });
    return output;
  }

  private async handleMissionStatus(): Promise<string> {
    const active = this.context.tasks.filter(t => t.status !== 'completed').length;
    const teams = this.context.teams.filter(t => t.status === 'active').length;
    const agents = this.context.teams.reduce((sum, t) => sum + t.agents.length, 0);

    return `📊 **MISSION STATUS**\n\nActive Tasks: ${active}\nDeployed Teams: ${teams}\nTotal Agents: ${agents}`;
  }

  private async sendCustomCommand(command: string): Promise<string> {
    try {
      const response = await this.context.orchestratorService.sendTextCommand(command);
      return `🔄 ${response}`;
    } catch (error) {
      return `⚠️ Command: "${command}" - Processing...`;
    }
  }

  // Utilities
  private matchesPattern(input: string, patterns: string[]): boolean {
    return patterns.some(p => input.includes(p.toLowerCase()));
  }

  private extractContent(input: string): string | null {
    const match = input.match(/[:\s]+(.+?)(?:\.|,|$)/);
    return match ? match[1].trim() : null;
  }

  private extractId(input: string, type: string): string | null {
    const pattern = new RegExp(`${type}[:\\s]+(${type}-\\d+)`, 'i');
    const match = input.match(pattern);
    return match ? match[1] : null;
  }

  private extractPriority(input: string): 'critical' | 'high' | 'medium' | 'low' {
    if (/critical|urgent|asap/i.test(input)) return 'critical';
    if (/high|important/i.test(input)) return 'high';
    if (/low|minor/i.test(input)) return 'low';
    return 'medium';
  }

  private getStatusEmoji(status: string): string {
    const map: Record<string, string> = {
      'completed': '✅',
      'in-progress': '🔄',
      'failed': '❌',
      'pending': '⏳',
    };
    return map[status] || '❓';
  }

  getTasks(): Task[] {
    return this.context.tasks;
  }

  getTeams(): TeamDeployment[] {
    return this.context.teams;
  }

  getContext(): GeneralAgentContext {
    return this.context;
  }
}
