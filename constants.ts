
import { Team, Language, RedTeamRole, BlueTeamRole, LLMProvider, SystemTeamRole, AgentRole, MissionTemplate } from './types';

export const TEAMS = [Team.System, Team.Red, Team.Blue];
export const LANGUAGES = [Language.Python, Language.JavaScript, Language.Go, Language.Rust];
export const LLM_PROVIDERS = [LLMProvider.Gemini, LLMProvider.OpenAI, LLMProvider.OpenRouter];

// A programmatically generated SVG gear logo, themed to match the app.
// This is a self-contained data URL, making the app portable.
const gearSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="dropshadow" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </Merge>
    </filter>
  </defs>
  <g transform="rotate(15 50 50)" style="filter:url(#dropshadow)">
    <path 
      d="M 50,12 A 38,38 0 0,1 50,88 A 38,38 0 0,1 50,12 M 50,22 A 28,28 0 0,0 50,78 A 28,28 0 0,0 50,22 Z"
      fill="var(--color-bg-med-brown)"
    />
    <path 
      d="M 45,2 55,2 58,10 65,12 70,18 75,25 78,32 80,40 78,48 75,55 70,62 65,68 58,70 55,78 45,78 42,70 35,68 30,62 25,55 22,48 20,40 22,32 25,25 30,18 35,12 42,10 Z"
      fill="var(--color-accent-gold)" 
      stroke="var(--color-bg-dark-brown)"
      stroke-width="1.5"
    />
    <circle cx="50" cy="50" r="18" fill="var(--color-bg-dark-brown)" />
    <circle cx="50" cy="50" r="10" fill="var(--color-accent-gold)" />
  </g>
</svg>
`;
export const APP_LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(gearSvg.replace(/var\(--color-accent-gold\)/g, '#D4AF37').replace(/var\(--color-bg-dark-brown\)/g, '#2E1F16').replace(/var\(--color-bg-med-brown\)/g, '#4A352F'))}`;


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

export const AVAILABLE_TOOLS_BY_ROLE: { [key in AgentRole]?: string[] } = {
    [RedTeamRole.Reconnaissance]: ['nmap_scan', 'theharvester_search', ...BASE_TACTICAL_TOOLS],
    [RedTeamRole.VulnerabilityScanning]: ['sqlmap_scan', 'nikto_scan', ...BASE_TACTICAL_TOOLS],
    [RedTeamRole.PayloadDelivery]: [...BASE_TACTICAL_TOOLS],
    [RedTeamRole.SocialEngineering]: [...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.LogAnalysis]: ['query_logs_osquery', 'analyze_pcap_tshark', ...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.ThreatHunting]: ['scan_file_clamav', 'check_ip_virustotal', ...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.IncidentResponse]: [...BASE_TACTICAL_TOOLS],
    [BlueTeamRole.AssetInventory]: ['query_logs_osquery', ...BASE_TACTICAL_TOOLS],
};

const PYTHON_GEMINI = { language: Language.Python, llmProvider: LLMProvider.Gemini };

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // Red Team Templates
  { name: 'Red: Standard Pentest Squad', description: 'A balanced offensive team for general penetration testing.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['nmap_scan', 'theharvester_search'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_GEMINI, tools: ['sqlmap_scan', 'nikto_scan'] },
  ]},
  { name: 'Red: Initial Recon & Probe', description: 'A lightweight team focused on initial access and intelligence gathering.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['nmap_scan', 'theharvester_search'] },
  ]},
  { name: 'Red: Web Application Assault', description: 'A specialized team for targeting and exploiting web applications.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['nmap_scan'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_GEMINI, tools: ['sqlmap_scan', 'nikto_scan'] },
  ]},
  { name: 'Red: Social Engineering Campaign', description: 'A team focused on human-factor exploits and phishing.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['theharvester_search'] },
      { team: Team.Red, role: RedTeamRole.SocialEngineering, ...PYTHON_GEMINI, tools: [] },
  ]},
  { name: 'Red: Payload Operations', description: 'A team for developing, delivering, and executing custom payloads.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_GEMINI },
  ]},
  // 5 more red team
  { name: 'Red: Full Spectrum Infiltration', description: 'A comprehensive team for deep network infiltration and lateral movement.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['nmap_scan'] },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_GEMINI, tools: ['sqlmap_scan'] },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_GEMINI },
  ]},
  { name: 'Red: OSINT Deep Dive', description: 'A single-purpose team for extensive open-source intelligence gathering.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['theharvester_search'] },
  ]},
  { name: 'Red: Network Sweep & Map', description: 'A quick-deployment team to map a target network.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.Reconnaissance, ...PYTHON_GEMINI, tools: ['nmap_scan'] },
  ]},
  { name: 'Red: SQLi Strike Team', description: 'A specialized team to find and exploit SQL injection vulnerabilities.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.VulnerabilityScanning, ...PYTHON_GEMINI, tools: ['sqlmap_scan'] },
  ]},
  { name: 'Red: Phishing & Payload', description: 'A two-pronged team for social engineering and payload delivery.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.RedTeamArmory, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.SocialEngineering, ...PYTHON_GEMINI },
      { team: Team.Red, role: RedTeamRole.PayloadDelivery, ...PYTHON_GEMINI },
  ]},
  
  // Blue Team Templates
  { name: 'Blue: Standard SOC', description: 'A balanced defensive team for general threat hunting and log analysis.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_GEMINI, tools: ['scan_file_clamav', 'check_ip_virustotal'] },
  ]},
  { name: 'Blue: Incident Response Unit', description: 'A rapid-response team for investigating and containing active threats.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.IncidentResponse, ...PYTHON_GEMINI },
  ]},
  { name: 'Blue: Endpoint Threat Hunt', description: 'A specialized team for deep investigation of endpoint logs and behavior.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.AssetInventory, ...PYTHON_GEMINI, tools: ['query_logs_osquery'] },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_GEMINI, tools: ['scan_file_clamav'] },
  ]},
  { name: 'Blue: Network Traffic Analysis', description: 'A team focused on analyzing network captures for malicious activity.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI, tools: ['analyze_pcap_tshark'] },
  ]},
  { name: 'Blue: Malware Analysis', description: 'A team for scanning and analyzing potentially malicious files.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_GEMINI, tools: ['scan_file_clamav'] },
  ]},
    // 5 more blue team
  { name: 'Blue: Full Incident Response', description: 'A comprehensive team for end-to-end incident handling.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.IncidentResponse, ...PYTHON_GEMINI },
  ]},
  { name: 'Blue: Asset & Log Review', description: 'A foundational team for inventory and log baseline analysis.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.AssetInventory, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI },
  ]},
  { name: 'Blue: Threat Intel Sweep', description: 'A proactive team to hunt for known IOCs based on external intel.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.ThreatHunting, ...PYTHON_GEMINI, tools: ['check_ip_virustotal'] },
  ]},
  { name: 'Blue: OSQuery Deep Dive', description: 'A specialized team for extensive endpoint querying with osquery.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI, tools: ['query_logs_osquery'] },
  ]},
  { name: 'Blue: PCAP Analysis Unit', description: 'A single-purpose team for deep analysis of network packet captures.', agents: [
      { team: Team.System, role: SystemTeamRole.Orchestrator, ...PYTHON_GEMINI },
      { team: Team.System, role: SystemTeamRole.BlueTeamGarrison, ...PYTHON_GEMINI },
      { team: Team.Blue, role: BlueTeamRole.LogAnalysis, ...PYTHON_GEMINI, tools: ['analyze_pcap_tshark'] },
  ]},
];