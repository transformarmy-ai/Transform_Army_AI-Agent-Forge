
import { Team, Language, RedTeamRole, BlueTeamRole, LLMProvider, SystemTeamRole, AgentRole, MissionTemplate } from './types';

export const TEAMS = [Team.System, Team.Red, Team.Blue];
export const LANGUAGES = [Language.Python, Language.JavaScript, Language.Go, Language.Rust];
export const LLM_PROVIDERS = [LLMProvider.OpenAI, LLMProvider.OpenRouter, LLMProvider.Anthropic];

// Transform Army AI Logo - Hacker/Patriotic Theme
// Shield with circuit board pattern and stylized "TA" monogram
const transformArmyLogoSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="dropshadow" height="130%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="2" result="offsetblur"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="redGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="blueGlow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#DC143C;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF1744;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00308F;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0052CC;stop-opacity:1" />
    </linearGradient>
    <pattern id="circuitPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0,10 L 10,10 L 10,0 M 10,10 L 20,10 M 10,10 L 10,20" stroke="#DC143C" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="10" cy="10" r="1" fill="#DC143C" opacity="0.5"/>
    </pattern>
  </defs>
  <g style="filter:url(#dropshadow)">
    <!-- Shield Background -->
    <path d="M 50,10 L 75,18 L 85,35 L 85,60 L 75,85 L 50,92 L 25,85 L 15,60 L 15,35 L 25,18 Z" 
          fill="url(#blueGradient)" stroke="#FFFFFF" stroke-width="2" style="filter:url(#blueGlow)"/>
    
    <!-- Inner Shield -->
    <path d="M 50,20 L 68,26 L 75,38 L 75,58 L 68,78 L 50,85 L 32,78 L 25,58 L 25,38 L 32,26 Z" 
          fill="#000000" stroke="#FFFFFF" stroke-width="1" opacity="0.9"/>
    
    <!-- Circuit Pattern Overlay -->
    <path d="M 50,20 L 68,26 L 75,38 L 75,58 L 68,78 L 50,85 L 32,78 L 25,58 L 25,38 L 32,26 Z" 
          fill="url(#circuitPattern)" opacity="0.4"/>
    
    <!-- Stylized "TA" Monogram -->
    <g transform="translate(50,52.5)">
      <!-- T -->
      <path d="M -18,-15 L -18,5 M -25,-15 L -11,-15" 
            stroke="url(#redGradient)" stroke-width="3" stroke-linecap="round" style="filter:url(#redGlow)"/>
      <!-- A -->
      <path d="M -5,-15 L -5,5 M -5,-15 L 5,-15 L 5,5 M -5,-5 L 5,-5" 
            stroke="url(#redGradient)" stroke-width="3" stroke-linecap="round" style="filter:url(#redGlow)"/>
      <!-- Connecting Circuit Line -->
      <path d="M 8,5 L 15,5 L 15,-5 L 25,-5" 
            stroke="url(#redGradient)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <circle cx="25" cy="-5" r="2" fill="url(#redGradient)" style="filter:url(#redGlow)"/>
    </g>
    
    <!-- Circuit Nodes -->
    <circle cx="30" cy="30" r="2" fill="#DC143C" opacity="0.7"/>
    <circle cx="70" cy="30" r="2" fill="#DC143C" opacity="0.7"/>
    <circle cx="30" cy="70" r="2" fill="#DC143C" opacity="0.7"/>
    <circle cx="70" cy="70" r="2" fill="#DC143C" opacity="0.7"/>
    
    <!-- Circuit Lines -->
    <path d="M 30,30 L 35,35 L 35,40 L 30,45" stroke="#DC143C" stroke-width="1" fill="none" opacity="0.5"/>
    <path d="M 70,30 L 65,35 L 65,40 L 70,45" stroke="#DC143C" stroke-width="1" fill="none" opacity="0.5"/>
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