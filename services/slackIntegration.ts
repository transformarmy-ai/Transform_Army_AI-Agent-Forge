export interface SlackConfig {
  botToken: string;
  signingSecret: string;
  channelId?: string;
  appId?: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  thread_ts?: string;
  metadata?: {
    event_type: 'agent_forge' | 'orchestrator_command' | 'mission_update' | 'alert';
    mission_id?: string;
    agent_id?: string;
  };
}

export interface SlackCommand {
  type: 'slash_command' | 'message_shortcut' | 'event';
  command?: string;
  text?: string;
  user_id: string;
  channel_id: string;
  response_url?: string;
  trigger_id?: string;
}

export class SlackIntegration {
  private config: SlackConfig;
  private baseUrl = 'https://slack.com/api';
  private eventHandlers: Map<string, (data: any) => Promise<void>> = new Map();

  constructor(config: SlackConfig) {
    this.config = config;
  }

  /**
   * Send a message to Slack
   */
  async sendMessage(message: SlackMessage): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      console.log('✅ Message sent to Slack:', data.ts);
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      throw error;
    }
  }

  /**
   * Send a rich message with blocks
   */
  async sendRichMessage(
    channel: string,
    title: string,
    fields: { label: string; value: string }[],
    metadata?: any
  ): Promise<void> {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: fields.map(f => ({
          type: 'mrkdwn',
          text: `*${f.label}:*\n${f.value}`,
        })),
      },
      {
        type: 'divider',
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Generated at ${new Date().toLocaleTimeString()}_`,
          },
        ],
      },
    ];

    await this.sendMessage({
      channel,
      text: title,
      blocks,
      metadata,
    });
  }

  /**
   * Notify about a forged agent
   */
  async notifyAgentForged(
    channel: string,
    agentName: string,
    team: string,
    role: string,
    details?: string
  ): Promise<void> {
    const fields = [
      { label: 'Agent Name', value: agentName },
      { label: 'Team', value: team },
      { label: 'Role', value: role },
    ];

    if (details) {
      fields.push({ label: 'Details', value: details });
    }

    await this.sendRichMessage(
      channel,
      '⚙️ Agent Forged Successfully',
      fields,
      { event_type: 'agent_forge', agent_name: agentName }
    );
  }

  /**
   * Notify about mission update
   */
  async notifyMissionUpdate(
    channel: string,
    missionId: string,
    status: 'started' | 'completed' | 'failed',
    details?: string
  ): Promise<void> {
    const statusEmoji = { started: '🚀', completed: '✅', failed: '❌' }[status];
    const fields = [
      { label: 'Mission ID', value: missionId },
      { label: 'Status', value: status.toUpperCase() },
    ];

    if (details) {
      fields.push({ label: 'Details', value: details });
    }

    await this.sendRichMessage(
      channel,
      `${statusEmoji} Mission ${status}`,
      fields,
      { event_type: 'mission_update', mission_id: missionId }
    );
  }

  /**
   * Notify about alert/error
   */
  async notifyAlert(
    channel: string,
    severity: 'info' | 'warning' | 'error' | 'critical',
    title: string,
    message: string,
    details?: string
  ): Promise<void> {
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '🔴',
      critical: '🚨',
    }[severity];

    const fields = [
      { label: 'Severity', value: severity.toUpperCase() },
      { label: 'Message', value: message },
    ];

    if (details) {
      fields.push({ label: 'Details', value: details });
    }

    await this.sendRichMessage(
      channel,
      `${severityEmoji} ${title}`,
      fields,
      { event_type: 'alert' }
    );
  }

  /**
   * Verify Slack request signature (for incoming webhooks/events)
   */
  verifySignature(
    timestamp: string,
    signature: string,
    body: string
  ): boolean {
    // Prevent replay attacks
    const now = Date.now() / 1000;
    if (Math.abs(now - parseFloat(timestamp)) > 300) {
      console.warn('⚠️ Slack request timestamp too old (possible replay attack)');
      return false;
    }

    // Verify signature
    const crypto = require('crypto');
    const baseString = `v0:${timestamp}:${body}`;
    const hash = crypto
      .createHmac('sha256', this.config.signingSecret)
      .update(baseString)
      .digest('hex');
    const expectedSignature = `v0=${hash}`;

    return signature === expectedSignature;
  }

  /**
   * Handle incoming Slack command
   */
  async handleCommand(command: SlackCommand): Promise<string> {
    console.log('📋 Slack command received:', command.command, command.text);

    const commands: { [key: string]: (text: string) => Promise<string> } = {
      '/agent-status': this.handleAgentStatusCommand.bind(this),
      '/list-agents': this.handleListAgentsCommand.bind(this),
      '/dispatch-task': this.handleDispatchTaskCommand.bind(this),
      '/mission-status': this.handleMissionStatusCommand.bind(this),
    };

    const handler = commands[command.command || ''];
    if (handler) {
      return await handler(command.text || '');
    }

    return 'Unknown command';
  }

  private async handleAgentStatusCommand(text: string): Promise<string> {
    // Placeholder: integrate with orchestrator
    return `Agent status for: ${text}`;
  }

  private async handleListAgentsCommand(text: string): Promise<string> {
    // Placeholder: integrate with orchestrator
    return 'Available agents: Agent1, Agent2, Agent3';
  }

  private async handleDispatchTaskCommand(text: string): Promise<string> {
    // Placeholder: integrate with orchestrator
    return `Task dispatched: ${text}`;
  }

  private async handleMissionStatusCommand(text: string): Promise<string> {
    // Placeholder: integrate with orchestrator
    return `Mission status for: ${text}`;
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: (data: any) => Promise<void>): void {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Trigger event handler
   */
  async emit(eventType: string, data: any): Promise<void> {
    const handler = this.eventHandlers.get(eventType);
    if (handler) {
      await handler(data);
    }
  }
}

// Singleton instance
let slackIntegration: SlackIntegration | null = null;

export function getSlackIntegration(): SlackIntegration | null {
  const botToken = process.env.REACT_APP_SLACK_BOT_TOKEN;
  const signingSecret = process.env.REACT_APP_SLACK_SIGNING_SECRET;

  if (!botToken || !signingSecret) {
    console.warn('⚠️ Slack integration not configured (missing SLACK_BOT_TOKEN or SLACK_SIGNING_SECRET)');
    return null;
  }

  if (!slackIntegration) {
    slackIntegration = new SlackIntegration({
      botToken,
      signingSecret,
      channelId: process.env.REACT_APP_SLACK_CHANNEL_ID,
    });
  }

  return slackIntegration;
}
