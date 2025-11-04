
import { Team, Language, RedTeamRole, BlueTeamRole, LLMProvider, SystemTeamRole, AgentRole, MissionTemplate } from './types';

export const TEAMS = [Team.System, Team.Red, Team.Blue];
export const LANGUAGES = [Language.Python, Language.JavaScript, Language.Go, Language.Rust];
export const LLM_PROVIDERS = [
  LLMProvider.OpenAI, 
  LLMProvider.OpenRouter, 
  LLMProvider.Anthropic,
  LLMProvider.Ollama,
  LLMProvider.LMStudio
];

// Transform Army AI Logo - Hacker Shield motif in site colors
const transformArmyLogoSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111317" />
      <stop offset="100%" stop-color="#0A0A0A" />
    </linearGradient>
    <linearGradient id="shieldCore" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#00308F" />
      <stop offset="100%" stop-color="#DC143C" />
    </linearGradient>
    <radialGradient id="shieldGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="glyphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FF3055" />
    </linearGradient>
    <pattern id="gridPattern" patternUnits="userSpaceOnUse" width="10" height="10">
      <path d="M0 5H10 M5 0V10" stroke="#DC143C" stroke-width="0.4" opacity="0.25" />
    </pattern>
    <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <g>
    <!-- Outer shield silhouette -->
    <path d="M50 8 L80 18 L88 35 L88 60 L80 84 L50 94 L20 84 L12 60 L12 35 L20 18 Z"
          fill="url(#shieldOuter)" stroke="#FFFFFF" stroke-width="2.5" />

    <!-- Inner shield core -->
    <path d="M50 18 L70 25 L78 38 L78 57 L70 78 L50 86 L30 78 L22 57 L22 38 L30 25 Z"
          fill="url(#shieldCore)" stroke="#FFFFFF" stroke-width="1.5" />

    <!-- Subtle glow overlay -->
    <path d="M50 18 L70 25 L78 38 L78 57 L70 78 L50 86 L30 78 L22 57 L22 38 L30 25 Z"
          fill="url(#shieldGlow)" opacity="0.35" />

    <!-- Grid overlay -->
    <path d="M50 18 L70 25 L78 38 L78 57 L70 78 L50 86 L30 78 L22 57 L22 38 L30 25 Z"
          fill="url(#gridPattern)" opacity="0.6" />

    <!-- Central circuit spine -->
    <path d="M50 25 L50 78" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    <circle cx="50" cy="32" r="2.7" fill="#FFFFFF" opacity="0.4" />
    <circle cx="50" cy="50" r="3" fill="#FFFFFF" opacity="0.6" />
    <circle cx="50" cy="68" r="2.4" fill="#FFFFFF" opacity="0.4" />

    <!-- Angular hacker glyph (stylised T / A) -->
    <g filter="url(#glowRed)">
      <path d="M32 42 L68 42" stroke="url(#glyphGradient)" stroke-width="4" stroke-linecap="round" />
      <path d="M32 42 L45 68" stroke="url(#glyphGradient)" stroke-width="4" stroke-linecap="round" />
      <path d="M68 42 L55 68" stroke="url(#glyphGradient)" stroke-width="4" stroke-linecap="round" />
      <path d="M40 57 L60 57" stroke="url(#glyphGradient)" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Circuit branches -->
    <path d="M28 48 L22 52 L22 60" stroke="#FF3055" stroke-width="1.2" opacity="0.5" />
    <path d="M72 48 L78 52 L78 60" stroke="#FF3055" stroke-width="1.2" opacity="0.5" />
    <circle cx="22" cy="60" r="1.8" fill="#FF3055" opacity="0.6" />
    <circle cx="78" cy="60" r="1.8" fill="#FF3055" opacity="0.6" />
  </g>
</svg>
`;
export const APP_LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(transformArmyLogoSvg)}`;


export const ROLES_BY_TEAM: { [key in Team]: (RedTeamRole | BlueTeamRole | SystemTeamRole)[] } = {
  [Team.System]: [
    SystemTeamRole.Orchestrator, 
    SystemTeamRole.RedTeamArmory, 
    SystemTeamRole.BlueTeamGarrison,
    SystemTeamRole.IntelligenceAnalyst,
  ],
  [Team.Red]: [
    RedTeamRole.Reconnaissance,
    RedTeamRole.VulnerabilityScanning,
    RedTeamRole.PayloadDelivery,
    RedTeamRole.SocialEngineering,
  ],
  [Team.Blue]: [
    BlueTeamRole.LogAnalysis,
    BlueTeamRole.ThreatHunting,
    BlueTeamRole.IncidentResponse,
    BlueTeamRole.AssetInventory,
  ],
};

// Base tools available to all tactical agents
const BASE_TACTICAL_TOOLS = ['request_human_input', 'send_message', 'generate_and_execute_script', 'read_file', 'write_file'];

// System-level tools available to Orchestrator and System agents
export const SYSTEM_TOOLS = [
  'duckduckgo_search',      // Internet search via DuckDuckGo
  'github_query',           // GitHub repository search and code lookup
  'github_clone',           // Clone GitHub repositories
  'request_human_input',
  'send_message',
  'generate_and_execute_script',
];

export const AVAILABLE_TOOLS_BY_ROLE: { [key in AgentRole]?: string[] } = {
    [SystemTeamRole.Orchestrator]: [...SYSTEM_TOOLS],
    [SystemTeamRole.RedTeamArmory]: [...SYSTEM_TOOLS],
    [SystemTeamRole.BlueTeamGarrison]: [...SYSTEM_TOOLS],
    [SystemTeamRole.IntelligenceAnalyst]: [...SYSTEM_TOOLS],
    [RedTeamRole.Reconnaissance]: ['nmap_scan', 'theharvester_search', ...BASE_TACTICAL_TOOLS],
    [RedTeamRole.VulnerabilityScanning]: ['sqlmap_scan', 'nikto_scan', ...BASE_TACTICAL_TOOLS],
    [RedTeamRole.PayloadDelivery]: [...BASE_TACTICAL_TOOLS],
    [RedTeamRole.SocialEngineering]: [...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.LogAnalysis]: ['query_logs_osquery', 'analyze_pcap_tshark', ...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.ThreatHunting]: ['scan_file_clamav', 'check_ip_virustotal', ...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.IncidentResponse]: [...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.AssetInventory]: ['query_logs_osquery', ...BASE_TACTICAL_TOOLS],
};

const PYTHON_OPENROUTER = { language: Language.Python, llmProvider: LLMProvider.OpenRouter };

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // Red Team Templates
  { name: 'Red: Standard Pentest Squad', description: 'A balanced offensive team for general penetration testing.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['nmap_scan', 'theharvester_search'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_OPENROUTER, tools: ['sqlmap_scan', 'nikto_scan'] },
  ]},
  { name: 'Red: Initial Recon & Probe', description: 'A lightweight team focused on initial access and intelligence gathering.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['nmap_scan', 'theharvester_search'] },
  ]},
  { name: 'Red: Web Application Assault', description: 'A specialized team for targeting and exploiting web applications.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['nmap_scan'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_OPENROUTER, tools: ['sqlmap_scan', 'nikto_scan'] },
  ]},
  { name: 'Red: Social Engineering Campaign', description: 'A team focused on human-factor exploits and phishing.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['theharvester_search'] },
      { team: Team.Red, role: RedTeamRole.SocialEngineering, ...PYTHON_OPENROUTER, tools: [] },
  ]},
  { name: 'Red: Payload Operations', description: 'A team for developing, delivering, and executing custom payloads.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_OPENROUTER },
  ]},
  // 5 more red team
  { name: 'Red: Full Spectrum Infiltration', description: 'A comprehensive team for deep network infiltration and lateral movement.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['nmap_scan'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_OPENROUTER, tools: ['sqlmap_scan'] },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_OPENROUTER },
  ]},
  { name: 'Red: OSINT Deep Dive', description: 'A single-purpose team for extensive open-source intelligence gathering.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['theharvester_search'] },
  ]},
  { name: 'Red: Network Sweep & Map', description: 'A quick-deployment team to map a target network.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_OPENROUTER, tools: ['nmap_scan'] },
  ]},
  { name: 'Red: SQLi Strike Team', description: 'A specialized team to find and exploit SQL injection vulnerabilities.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_OPENROUTER, tools: ['sqlmap_scan'] },
  ]},
  { name: 'Red: Phishing & Payload', description: 'A two-pronged team for social engineering and payload delivery.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.SocialEngineering, ...PYTHON_OPENROUTER },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_OPENROUTER },
  ]},
  
  // Blue Team Templates
  { name: 'Blue: Standard SOC', description: 'A balanced defensive team for general threat hunting and log analysis.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_OPENROUTER, tools: ['scan_file_clamav', 'check_ip_virustotal'] },
  ]},
  { name: 'Blue: Incident Response Unit', description: 'A rapid-response team for investigating and containing active threats.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.IncidentResponse, ...PYTHON_OPENROUTER },
  ]},
  { name: 'Blue: Endpoint Threat Hunt', description: 'A specialized team for deep investigation of endpoint logs and behavior.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.AssetInventory, ...PYTHON_OPENROUTER, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_OPENROUTER, tools: ['scan_file_clamav'] },
  ]},
  { name: 'Blue: Network Traffic Analysis', description: 'A team focused on analyzing network captures for malicious activity.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER, tools: ['analyze_pcap_tshark'] },
  ]},
  { name: 'Blue: Malware Analysis', description: 'A team for scanning and analyzing potentially malicious files.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_OPENROUTER, tools: ['scan_file_clamav'] },
  ]},
    // 5 more blue team
  { name: 'Blue: Full Incident Response', description: 'A comprehensive team for end-to-end incident handling.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.IncidentResponse, ...PYTHON_OPENROUTER },
  ]},
  { name: 'Blue: Asset & Log Review', description: 'A foundational team for inventory and log baseline analysis.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.AssetInventory, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER },
  ]},
  { name: 'Blue: Threat Intel Sweep', description: 'A proactive team to hunt for known IOCs based on external intel.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_OPENROUTER, tools: ['check_ip_virustotal'] },
  ]},
  { name: 'Blue: OSQuery Deep Dive', description: 'A specialized team for extensive endpoint querying with osquery.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER, tools: ['query_logs_osquery'] },
  ]},
  { name: 'Blue: PCAP Analysis Unit', description: 'A single-purpose team for deep analysis of network packet captures.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_OPENROUTER },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_OPENROUTER },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_OPENROUTER, tools: ['analyze_pcap_tshark'] },
  ]},
];