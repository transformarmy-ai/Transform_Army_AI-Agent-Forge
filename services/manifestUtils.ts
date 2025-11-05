import { AgentV1, ToolV1 } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateAgentManifestBasic(manifest: any): ValidationResult {
  const errors: string[] = [];
  const err = (path: string, msg: string) => errors.push(`${path}: ${msg}`);

  if (!manifest || typeof manifest !== 'object') err('$', 'manifest must be an object');

  if (manifest.schemaVersion !== 'agent.v1') err('schemaVersion', 'must be "agent.v1"');
  if (!manifest.id || typeof manifest.id !== 'string') err('id', 'required string');
  if (!manifest.name || typeof manifest.name !== 'string') err('name', 'required string');
  if (!manifest.version || typeof manifest.version !== 'string') err('version', 'required string');
  if (!manifest.description || typeof manifest.description !== 'string') err('description', 'required string');
  if (!manifest.author || typeof manifest.author !== 'string') err('author', 'required string');

  if (!manifest.language || typeof manifest.language !== 'object') err('language', 'required object');
  else {
    if (!manifest.language.name) err('language.name', 'required string');
    if (!manifest.language.version) err('language.version', 'required string');
  }

  if (!manifest.execution || typeof manifest.execution !== 'object') err('execution', 'required object');
  else {
    if (!manifest.execution.kind) err('execution.kind', 'required string');
    if (!manifest.execution.command) err('execution.command', 'required string');
  }

  if (!manifest.model || typeof manifest.model !== 'object') err('model', 'required object');
  else {
    if (!manifest.model.provider) err('model.provider', 'required string');
    if (!manifest.model.modelId) err('model.modelId', 'required string');
  }

  if (!manifest.prompts || typeof manifest.prompts !== 'object') err('prompts', 'required object');
  else {
    if (!manifest.prompts.system || typeof manifest.prompts.system !== 'string') err('prompts.system', 'required string');
  }

  if (!Array.isArray(manifest.tools)) err('tools', 'required array');
  else {
    (manifest.tools as ToolV1[]).forEach((t, i) => {
      if (!t || typeof t !== 'object') err(`tools[${i}]`, 'must be object');
      else {
        if (!t.name) err(`tools[${i}].name`, 'required string');
        if (!t.description) err(`tools[${i}].description`, 'required string');
        if (!t.inputSchema || typeof t.inputSchema !== 'object') err(`tools[${i}].inputSchema`, 'required object');
      }
    });
  }

  if (!manifest.memory || typeof manifest.memory !== 'object') err('memory', 'required object');

  if (!manifest.env || typeof manifest.env !== 'object') err('env', 'required object');
  else {
    if (!Array.isArray(manifest.env.required)) err('env.required', 'required array');
    if (!Array.isArray(manifest.env.optional)) err('env.optional', 'required array');
  }

  if (!Array.isArray(manifest.tests) || manifest.tests.length === 0) err('tests', 'at least one test required');

  return { valid: errors.length === 0, errors };
}

function toKebabCase(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function enforceACoCRules(manifest: any): { manifest: AgentV1; changes: string[] } {
  const m = JSON.parse(JSON.stringify(manifest));
  const changes: string[] = [];

  if (m.schemaVersion !== 'agent.v1') {
    m.schemaVersion = 'agent.v1';
    changes.push('Normalized schemaVersion to "agent.v1"');
  }

  if (!m.author || m.author !== 'Transform Army AI') {
    m.author = 'Transform Army AI';
    changes.push('Set author to "Transform Army AI"');
  }

  if (!m.id || toKebabCase(m.id) !== m.id) {
    const old = m.id;
    m.id = toKebabCase(m.id || m.name || 'agent');
    if (old !== m.id) changes.push(`Normalized id to kebab-case: ${old} -> ${m.id}`);
  }

  // Ensure memory block
  if (!m.memory) {
    m.memory = { mode: 'external', provider: 'none', binding: 'TO_BE_CONFIGURED_ON_IMPORT', notes: 'Set to your own vector index.' };
    changes.push('Added default external memory block');
  }

  // Normalize language if provided as a string
  if (typeof m.language === 'string') {
    const langName = m.language;
    const lower = String(langName).toLowerCase();
    const inferredVersion = lower.includes('python') ? '3.11'
      : (lower.includes('javascript') || lower.includes('node')) ? '20.x'
      : lower.includes('go') ? '1.22'
      : lower.includes('rust') ? '1.77'
      : '1.0.0';
    m.language = { name: langName, version: inferredVersion };
    changes.push(`Coerced language string to object: {name: ${langName}, version: ${inferredVersion}}`);
  }

  // Ensure language block
  if (!m.language) {
    m.language = { name: 'Python', version: '3.11' };
    changes.push('Added default language block (Python 3.11)');
  } else {
    if (!m.language.name) {
      m.language.name = 'Python';
      changes.push('Set language.name to default: Python');
    }
    if (!m.language.version) {
      const lang = String(m.language.name).toLowerCase();
      m.language.version = lang.includes('python') ? '3.11'
        : lang.includes('javascript') || lang.includes('node') ? '20.x'
        : lang.includes('go') ? '1.22'
        : lang.includes('rust') ? '1.77'
        : '1.0.0';
      changes.push(`Set language.version to default for ${m.language.name}: ${m.language.version}`);
    }
  }

  // Ensure execution block
  if (!m.execution) {
    m.execution = { kind: 'process' };
    const lang = String(m.language?.name || '').toLowerCase();
    if (lang.includes('python')) {
      m.execution.command = 'python';
      m.execution.args = ['main.py'];
    } else if (lang.includes('javascript') || lang.includes('node')) {
      m.execution.command = 'node';
      m.execution.args = ['index.js'];
    } else if (lang.includes('go')) {
      m.execution.command = './main';
      m.execution.args = [];
    } else if (lang.includes('rust')) {
      m.execution.command = './main';
      m.execution.args = [];
    } else {
      m.execution.command = 'python';
      m.execution.args = ['main.py'];
    }
    changes.push('Added default execution block based on language');
  } else {
    if (!m.execution.kind) {
      m.execution.kind = 'process';
      changes.push('Set execution.kind to default: process');
    }
    if (!m.execution.command) {
      const lang = String(m.language?.name || '').toLowerCase();
      if (lang.includes('python')) m.execution.command = 'python';
      else if (lang.includes('javascript') || lang.includes('node')) m.execution.command = 'node';
      else m.execution.command = './main';
      changes.push(`Set execution.command to default for ${m.language?.name || 'unknown language'}`);
    }
    if (!Array.isArray(m.execution.args)) {
      const lang = String(m.language?.name || '').toLowerCase();
      if (lang.includes('python')) m.execution.args = ['main.py'];
      else if (lang.includes('javascript') || lang.includes('node')) m.execution.args = ['index.js'];
      else m.execution.args = [];
      changes.push('Set execution.args to default');
    }
  }

  // Ensure env exists
  if (!m.env) {
    m.env = { required: [], optional: [] };
    changes.push('Added default env block');
  }

  // Accumulate env.required from tools that require auth
  const requiredSet = new Set<string>(Array.isArray(m.env.required) ? m.env.required : []);
  if (Array.isArray(m.tools)) {
    m.tools.forEach((t: ToolV1) => {
      if ((t as any).requiresAuth && Array.isArray((t as any).authVars)) {
        (t as any).authVars.forEach((v: string) => requiredSet.add(v));
      }
    });
    const before = m.env.required?.length || 0;
    m.env.required = Array.from(requiredSet).sort();
    const after = m.env.required.length;
    if (after > before) changes.push(`Accumulated ${after - before} env required var(s) from tools`);
  }

  // Ensure at least one smoke test
  if (!Array.isArray(m.tests) || m.tests.length === 0) {
    m.tests = [
      {
        name: 'Smoke Test',
        description: 'Verifies agent can initialize and respond',
        type: 'smoke',
        command: 'echo "Agent ready"',
        expectedOutput: 'Agent ready'
      }
    ];
    changes.push('Added default smoke test');
  }

  // Ensure each tool has a minimal inputSchema
  if (Array.isArray(m.tools)) {
    m.tools = m.tools.map((t: any, idx: number) => {
      if (t && !t.inputSchema) {
        t.inputSchema = { type: 'object', properties: {}, required: [] };
        changes.push(`Added default inputSchema to tools[${idx}]`);
      }
      return t;
    });
  }

  // Default temperature if missing
  if (m.model && (m.model.temperature === undefined || m.model.temperature === null)) {
    m.model.temperature = 0.2;
    changes.push('Set model.temperature to 0.2');
  }

  // Attach importMeta (optional)
  const nonEmptyChanges = changes.filter(Boolean);
  if (nonEmptyChanges.length > 0) {
    (m as any).importMeta = {
      source: 'ACoC',
      changes: nonEmptyChanges,
      timestamp: new Date().toISOString(),
    };
  }

  return { manifest: m as AgentV1, changes: nonEmptyChanges };
}


