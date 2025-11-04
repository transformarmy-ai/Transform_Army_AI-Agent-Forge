
export enum Team {
  System = 'System',
  Red = 'Red',
  Blue = 'Blue',
}

export enum Language {
  Python = 'Python',
  JavaScript = 'JavaScript',
  Go = 'Go',
  Rust = 'Rust',
}

export enum LLMProvider {
  OpenAI = 'OpenAI',
  OpenRouter = 'OpenRouter',
  Anthropic = 'Anthropic',
  Ollama = 'Ollama (Local)',
  LMStudio = 'LM Studio (Local)',
}

export enum RedTeamRole {
  Reconnaissance = 'Reconnaissance',
  VulnerabilityScanning = 'Vulnerability Scanning',
  PayloadDelivery = 'Payload Delivery',
  SocialEngineering = 'Social Engineering',
}

export enum BlueTeamRole {
  LogAnalysis = 'Log Analysis',
  ThreatHunting = 'Threat Hunting',
  IncidentResponse = 'IncidentResponse',
  AssetInventory = 'Asset Inventory',
}

export enum SystemTeamRole {
  Orchestrator = 'Orchestrator',
  RedTeamArmory = 'Red Team Armory',
  BlueTeamGarrison = 'Blue Team Garrison',
  IntelligenceAnalyst = 'Intelligence Analyst',
}

export type AgentRole = RedTeamRole | BlueTeamRole | SystemTeamRole;

export enum AgentStatus {
  Idle = 'Idle',
  Running = 'Running',
  Error = 'Error',
}

// Corresponds to agent.v1 schema
export interface LanguageV1 {
    name: string;
    version: string;
}

export interface ExecutionV1 {
    kind: 'process' | 'http';
    command?: string;
    args?: string[];
    endpoint?: string;
}

export interface ModelV1 {
    provider: string;
    modelId: string;
    temperature: number;
    maxTokens?: number;
}

export interface PromptsV1 {
    system: string;
    assistant?: string;
    userStarters?: string[];
}

export interface ToolParameterV1 {
    type: string;
    description: string;
}

export interface ToolSchemaV1 {
    type: string;
    properties: { [key: string]: ToolParameterV1 };
    required?: string[];
}

export interface ToolV1 {
    name: string;
    description: string;
    inputSchema: ToolSchemaV1;
    outputSchema?: ToolSchemaV1;
    requiresAuth?: boolean;
    authVars?: string[];
}

export interface MemoryV1 {
    mode: 'external' | 'embedded';
    provider: string;
    binding: string;
    notes?: string;
}

export interface EnvV1 {
    required: string[];
    optional: string[];
}

export interface TestV1 {
    name: string;
    description: string;
    type: 'smoke' | 'unit' | 'integration';
    command?: string;
    expectedOutput?: string;
}

export interface ImportMetaV1 {
    source: string;
    timestamp: string;
    changes: string[];
    strategy?: 'rebuild-team';
}

export interface AgentV1 {
    schemaVersion: 'agent.v1';
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    language: LanguageV1;
    execution: ExecutionV1;
    model: ModelV1;
    prompts: PromptsV1;
    tools: ToolV1[];
    memory: MemoryV1;
    env: EnvV1;
    tests: TestV1[];
    importMeta?: ImportMetaV1;
}

export interface AgentTeamMemberV1 {
    role: string;
    agentRef: string; // e.g., "planner.json"
}

export interface AgentTeamV1 {
    schemaVersion: 'agent-team.v1';
    id: string;
    name: string;
    version: string;
    members: AgentTeamMemberV1[];
    orchestration: {
        mode: 'sequential' | 'parallel' | 'planner-directed';
        entryAgent: string;
    };
    sharedMemory: {
        enabled: boolean;
        binding: string;
        provider: string;
    };
    env: EnvV1;
    tests?: TestV1[];
}

export interface OrchestratorV1 {
    schemaVersion: 'orchestrator.v1';
    id: string;
    name: string;
    version: string;
    orchestration: {
        mode: 'planner-directed';
        entryRole: string;
        maxAgents: number;
    };
    teamDoctrine: {
        role: string;
        agentTemplate: string; // "inline:template-name"
        required: boolean;
        scalable?: boolean;
    }[];
    agentTemplates: { [key: string]: AgentV1 };
    sharedMemory: MemoryV1;
    env: EnvV1;
    tests?: TestV1[];
    importMeta?: ImportMetaV1;
}

// This is the main profile used by the UI. It wraps the core manifest.
export interface AgentProfile {
  id: string; // This is the UI's internal UUID, may differ from manifest ID
  manifest: AgentV1;
  team: Team;
  role: AgentRole;
  status?: AgentStatus;
  avatarBase64?: string;
}

// Utility types
export interface CustomTool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  parameters: { [key: string]: { type: string; description: string } };
}

export interface TemplateAgentConfig {
  team: Team;
  role: AgentRole;
  language: Language;
  llmProvider: LLMProvider;
  modelName?: string;
  tools?: string[];
}

export interface MissionTemplate {
  name: string;
  description: string;
  agents: TemplateAgentConfig[];
}

export interface IntelFile {
  id: string;
  name: string;
  content: string;
}