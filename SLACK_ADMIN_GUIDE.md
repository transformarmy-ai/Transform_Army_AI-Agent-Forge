# Slack Integration & Admin Guide

**Transform Army AI** integrates with Slack to provide real-time notifications, command dispatch, and bidirectional mission updates.

---

## 1.0 Quick Setup

### 1.1 Create a Slack App

1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Name: `Transform Army AI` (or your preference)
5. Select your Slack workspace
6. Click **"Create App"**

### 1.2 Configure Bot Token & Permissions

1. In your app dashboard, go to **"OAuth & Permissions"**
2. Under **"Scopes"**, click **"Add an OAuth Scope"** and add:
   - `chat:write` - Post messages
   - `chat:write.public` - Post in public channels
   - `commands:read` - Read slash commands
   - `app_mentions:read` - Read app mentions
   - `channels:read` - List channels
   - `users:read` - Read user info

3. Click **"Install to Workspace"** at the top
4. Click **"Allow"** to authorize
5. Copy your **Bot User OAuth Token** (starts with `xoxb-`)

### 1.3 Get Signing Secret

1. Go to **"Basic Information"**
2. Scroll to **"App Credentials"**
3. Copy your **Signing Secret**

### 1.4 Set Environment Variables

Create `.env` file in your project with:

```bash
REACT_APP_SLACK_BOT_TOKEN=xoxb-your-bot-token-here
REACT_APP_SLACK_SIGNING_SECRET=your-signing-secret-here
REACT_APP_SLACK_CHANNEL_ID=C0123456789  # Optional: default notification channel
```

---

## 2.0 Configure Slash Commands

### 2.1 Add Slash Commands

In your Slack app dashboard, go to **"Slash Commands"** and create:

#### `/agent-status <agent-id>`
- Request URL: `https://your-domain.com/api/slack/commands`
- Short Description: Get agent status
- Usage Hint: `agent-id`

#### `/list-agents`
- Request URL: `https://your-domain.com/api/slack/commands`
- Short Description: List all active agents
- Usage Hint: (no hints)

#### `/dispatch-task <agent-id> <task-type>`
- Request URL: `https://your-domain.com/api/slack/commands`
- Short Description: Dispatch a task to an agent
- Usage Hint: `agent-id task-type`

#### `/mission-status <mission-id>`
- Request URL: `https://your-domain.com/api/slack/commands`
- Short Description: Get mission status
- Usage Hint: `mission-id`

### 2.2 Command Examples

```bash
# Get agent status
/agent-status red.recon.scout-01

# List all agents
/list-agents

# Dispatch a task
/dispatch-task red.recon.scout-01 scan

# Get mission status
/mission-status mission-2025-1104-001
```

---

## 3.0 Configure Event Subscriptions

### 3.1 Enable Events

1. Go to **"Event Subscriptions"**
2. Toggle **"Enable Events"** to ON
3. Set **Request URL** to: `https://your-domain.com/api/slack/events`
4. Slack will send a verification challenge; respond with the `challenge` value

### 3.2 Subscribe to Bot Events

Add these bot events:
- `app_mention` - When app is mentioned
- `message.channels` - Messages in public channels
- `message.groups` - Messages in private channels

---

## 4.0 Usage Examples

### 4.1 Sending Notifications from Agent Forge

```typescript
import { getSlackIntegration } from './services/slackIntegration';

const slack = getSlackIntegration();

// Send agent forged notification
await slack?.notifyAgentForged(
  'C0123456789',  // Channel ID
  'Red Team Scout',
  'Red',
  'Reconnaissance',
  'Configured for network scanning'
);

// Send mission update
await slack?.notifyMissionUpdate(
  'C0123456789',
  'mission-001',
  'started',
  'Blue Team responding to threat alert'
);

// Send alert
await slack?.notifyAlert(
  'C0123456789',
  'error',
  'Agent Connection Failed',
  'Red Team Scout is unreachable',
  'Check network connectivity and service logs'
);
```

### 4.2 Handling Incoming Slack Commands

```typescript
import { getSlackIntegration, SlackCommand } from './services/slackIntegration';

const slack = getSlackIntegration();

// Process slash command
const command: SlackCommand = {
  type: 'slash_command',
  command: '/list-agents',
  user_id: 'U123456',
  channel_id: 'C123456',
};

const result = await slack?.handleCommand(command);
console.log(result); // "Available agents: Agent1, Agent2, Agent3"
```

---

## 5.0 Slack API Endpoints (Backend Implementation)

### 5.1 Webhook Endpoints to Implement

Your backend needs to handle:

```
POST /api/slack/commands - Handle slash commands
POST /api/slack/events - Handle events (app mentions, messages)
POST /api/slack/interactivity - Handle button clicks, modal submissions
```

### 5.2 Example: Handle Slash Command

```typescript
// Node.js/Express example
app.post('/api/slack/commands', async (req, res) => {
  const { text, user_id, channel_id, command, response_url } = req.body;

  // Verify signature (in slackIntegration)
  if (!slack.verifySignature(req.headers['x-slack-request-timestamp'], req.headers['x-slack-signature'], body)) {
    return res.status(401).send('Unauthorized');
  }

  // Handle command
  let response;
  if (command === '/list-agents') {
    const agents = await orchestrator.listAgents();
    response = { text: `Agents: ${agents.map(a => a.name).join(', ')}` };
  }

  // Send response
  if (response_url) {
    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  res.json(response);
});
```

---

## 6.0 Channel Setup & Permissions

### 6.1 Create Dedicated Channels

Create these Slack channels for organization:

- `#agent-forge-notifications` - All agent creation & updates
- `#mission-logs` - Mission starts/completes
- `#alerts-critical` - Critical errors only
- `#commands` - Team uses for orchestrator commands

### 6.2 Add App to Channels

1. In Slack, type `/invite` in the channel
2. Select your app (`@Transform Army AI`)
3. Hit Enter

---

## 7.0 Security Best Practices

### 7.1 Token Security

- ✅ Store tokens in `.env` (never commit to git)
- ✅ Rotate tokens quarterly: Settings → Reinstall App
- ✅ Use separate tokens for dev/staging/prod
- ❌ Never paste tokens in logs or errors

### 7.2 Verify Incoming Requests

Always verify Slack request signatures:

```typescript
// Already implemented in slackIntegration.ts
const isValid = slack.verifySignature(
  req.headers['x-slack-request-timestamp'],
  req.headers['x-slack-signature'],
  rawBody
);
```

### 7.3 Rate Limiting

Slack rate limits: ~1 message per 1s per channel. If you hit limits:

```typescript
// Queue messages with backoff
const messageQueue: SlackMessage[] = [];
const processQueue = async () => {
  for (const msg of messageQueue) {
    await slack.sendMessage(msg);
    await new Promise(r => setTimeout(r, 100)); // 100ms between messages
  }
};
```

### 7.4 Permission Scope Least Privilege

Only request scopes you need:
- Don't use `admin` scope unless necessary
- Don't use `commands:write` (read-only)
- Regularly audit installed apps

---

## 8.0 Troubleshooting

### Issue: "Signing secret mismatch"

**Cause:** Wrong signing secret or request body is modified

**Fix:**
```typescript
// Ensure you're using the raw body, not parsed JSON
const signature = req.headers['x-slack-signature'];
const timestamp = req.headers['x-slack-request-timestamp'];
// Pass raw body string, not req.body
slack.verifySignature(timestamp, signature, rawBodyString);
```

### Issue: "Request URL failed to verify"

**Cause:** Endpoint not responding or returning wrong format

**Fix:**
- Endpoint must respond within 3 seconds
- For events, respond with `{ "challenge": req.body.challenge }`

```typescript
app.post('/api/slack/events', (req, res) => {
  if (req.body.type === 'url_verification') {
    // Challenge handshake
    return res.json({ challenge: req.body.challenge });
  }
  res.send('OK');
});
```

### Issue: "Bot token invalid"

**Cause:** Token expired or revoked

**Fix:**
1. Go to **OAuth & Permissions**
2. Click **"Reinstall to Workspace"**
3. Copy new token
4. Update `.env`

### Issue: "Command not responding"

**Cause:** Response URL expired (3 seconds to respond) or permissions missing

**Fix:**
```typescript
// Respond immediately, then process async
res.json({ text: 'Processing...' });

// Process the command async
setImmediate(async () => {
  const result = await orchestrator.listAgents();
  await fetch(response_url, {
    method: 'POST',
    body: JSON.stringify({ text: result }),
  });
});
```

---

## 9.0 Monitoring & Logging

### 9.1 Log All Slack Events

```typescript
slack.on('message', async (msg) => {
  console.log('📨 Slack message:', {
    user: msg.user,
    channel: msg.channel,
    text: msg.text,
    ts: msg.ts,
  });
  // Store in audit log
});
```

### 9.2 Monitor Rate Limits

```typescript
// Track message rate
let messageCount = 0;
const startTime = Date.now();

await slack.sendMessage(msg);
messageCount++;

const elapsed = (Date.now() - startTime) / 1000;
if (messageCount / elapsed > 1) {
  console.warn('⚠️ Approaching Slack rate limit');
}
```

---

## 10.0 Advanced: Interactive Components

### 10.1 Button Clicks

```typescript
const richMessage = {
  channel: 'C0123456789',
  text: 'Mission Control',
  blocks: [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: 'Start a mission?' },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Start' },
          value: 'start_mission',
          action_id: 'mission_start_btn',
        },
      ],
    },
  ],
};

await slack.sendMessage(richMessage);
```

### 10.2 Modal Dialogs

```typescript
const modal = {
  trigger_id: req.body.trigger_id,
  view: {
    type: 'modal',
    callback_id: 'agent_config_modal',
    title: { type: 'plain_text', text: 'Configure Agent' },
    blocks: [
      {
        type: 'input',
        block_id: 'agent_name',
        label: { type: 'plain_text', text: 'Agent Name' },
        element: { type: 'plain_text_input', action_id: 'name_input' },
      },
    ],
    submit: { type: 'plain_text', text: 'Create' },
  },
};

await slack.views.open(modal);
```

---

## 11.0 Testing

### 11.1 Test with cURL

```bash
# Test slash command
curl -X POST http://localhost:3000/api/slack/commands \
  -H 'X-Slack-Request-Timestamp: 1234567890' \
  -H 'X-Slack-Signature: v0=signature' \
  -d 'command=/list-agents&user_id=U123456'

# Test event
curl -X POST http://localhost:3000/api/slack/events \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "url_verification",
    "challenge": "challenge-string"
  }'
```

### 11.2 Test in Slack (Sandbox)

1. Create a private test workspace
2. Install your app
3. Type `/list-agents` in #general
4. Check console logs

---

## 12.0 Appendix: Full Permissions Checklist

| Scope | Purpose | Required |
|-------|---------|----------|
| `chat:write` | Send messages | ✅ Yes |
| `chat:write.public` | Post in public channels | ✅ Yes |
| `commands:read` | Handle slash commands | ✅ Yes |
| `app_mentions:read` | React to mentions | ⚠️ Optional |
| `channels:read` | List channels | ⚠️ Optional |
| `users:read` | Get user info | ⚠️ Optional |
| `reactions:write` | Add emoji reactions | ⚠️ Optional |
| `files:write` | Upload files | ❌ Future use |

---

**End of Slack Admin Guide**

Next: Set environment variables and test the `/list-agents` command in your workspace.
