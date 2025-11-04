
import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Team, AgentRole, Language, AgentProfile, SystemTeamRole, LLMProvider, AgentStatus, CustomTool, TemplateAgentConfig, MissionTemplate, IntelFile, AgentTeamV1, OrchestratorV1, AgentV1 } from './types';
import { TEAMS, LANGUAGES, ROLES_BY_TEAM, LLM_PROVIDERS, AVAILABLE_TOOLS_BY_ROLE, MISSION_TEMPLATES } from './constants';
import { generateAgent, normalizeAgent, generateAvatar } from './services/geminiService';
import Header from './components/Header';
import AgentControlPanel from './components/AgentControlPanel';
import DocumentationDisplay from './components/DocumentationDisplay';
import { SpinnerIcon } from './components/icons';
import MissionRoster from './components/MissionRoster';
import MissionLog from './components/MissionLog';
import EditAgentModal from './components/EditAgentModal';
import ToolboxManager from './components/ToolboxManager';


export interface MissionLogEntry {
  timestamp: string;
  source: string;
  content: string;
  data?: any;
}

interface MissionSnapshot {
  roster: AgentProfile[];
  log: MissionLogEntry[];
  customTools: CustomTool[];
}

const LOCAL_STORAGE_KEY = 'transform_army_ai_snapshot_v3_manifest';

const App: React.FC = () => {
  // Agent Forge State
  const [selectedTeam, setSelectedTeam] = useState<Team>(Team.System);
  const [availableRoles, setAvailableRoles] = useState<AgentRole[]>(ROLES_BY_TEAM[Team.System]);
  const [selectedRole, setSelectedRole] = useState<AgentRole>(SystemTeamRole.Orchestrator);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.Python);
  const [selectedLLMProvider, setSelectedLLMProvider] = useState<LLMProvider>(LLMProvider.OpenRouter);
  const [modelName, setModelName] = useState<string>('');
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);
  
  // Mission State
  const [missionAgents, setMissionAgents] = useState<AgentProfile[]>([]);
  const [missionLog, setMissionLog] = useState<MissionLogEntry[]>([]);
  const [activeDetailView, setActiveDetailView] = useState<AgentProfile | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [isToolManagerOpen, setIsToolManagerOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    try {
      const savedSnapshotJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSnapshotJSON) {
        const savedData: MissionSnapshot = JSON.parse(savedSnapshotJSON);
        setMissionAgents(savedData.roster || []);
        setMissionLog(savedData.log || []);
        setCustomTools(savedData.customTools || []);
        addLogEntry("System", "Loaded manifest snapshot from previous session.");
      } else {
        addLogEntry("System", "New session started. Welcome, Commander.");
      }
    } catch (e) {
      console.error("Failed to load mission snapshot from localStorage", e);
      addLogEntry("System Error", "Could not load mission state from previous session.");
    }
  }, []);

  useEffect(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      const handler = setTimeout(() => {
        try {
          const missionSnapshot: MissionSnapshot = {
            roster: missionAgents,
            log: missionLog,
            customTools: customTools,
          };
          const snapshotJSON = JSON.stringify(missionSnapshot);
          localStorage.setItem(LOCAL_STORAGE_KEY, snapshotJSON);
        } catch (e) {
          console.error("Failed to auto-save mission snapshot", e);
        }
      }, 1000);
      return () => {
        clearTimeout(handler);
      };
  }, [missionAgents, missionLog, customTools]);


  useEffect(() => {
    const newRoles = ROLES_BY_TEAM[selectedTeam];
    setAvailableRoles(newRoles);
    if (!newRoles.includes(selectedRole)) {
      setSelectedRole(newRoles[0]);
    }
  }, [selectedTeam, selectedRole]);

  useEffect(() => {
    const tools = AVAILABLE_TOOLS_BY_ROLE[selectedRole] || [];
    setAvailableTools(tools);
    setSelectedTools([]); 
  }, [selectedRole]);

  const addLogEntry = (source: string, content: string, data?: any) => {
    setMissionLog(prevLog => [...prevLog.slice(-100), {
      timestamp: new Date().toISOString(),
      source,
      content,
      data
    }]);
  };

  const handleGenerateAgent = async (
    team: Team,
    role: AgentRole,
    language: Language,
    llmProvider: LLMProvider,
    model: string,
    tools: string[]
  ) => {
    setIsLoading(true);
    setIsLoadingMessage(`FORGING ${role.toUpperCase()} MANIFEST...`);
    setError(null);
    try {
      addLogEntry("AgentForge", `Initiating manifest forge for ${role} agent...`);
      const allCustomTools = customTools.filter(ct => tools.includes(ct.name));
      
      const profile = await generateAgent(team, role, language, llmProvider, model, tools, allCustomTools);

      setMissionAgents(prevAgents => [...prevAgents, profile]);
      addLogEntry("AgentForge", `Successfully forged manifest: ${profile.manifest.name}.`, profile.manifest);
      setActiveDetailView(profile);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      addLogEntry("System Error", errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMessage('');
    }
  };
  
  const handleToolsChange = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleClearRoster = () => {
    if (window.confirm("Are you sure you want to clear the entire mission state? This action cannot be undone.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setMissionAgents([]);
      setMissionLog([]);
      setCustomTools([]);
      setActiveDetailView(null);
      addLogEntry("System", "Mission state has been cleared.");
    }
  };

  const handleUpdateAgent = (updatedAgent: AgentProfile) => {
    setMissionAgents(prev => prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent));
    addLogEntry("System", `Agent ${updatedAgent.manifest.name} has been updated.`);
    if (activeDetailView?.id === updatedAgent.id) {
        setActiveDetailView(updatedAgent);
    }
    setEditingAgent(null);
  };
  
  const handleSaveAndForgeNew = (updatedAgent: AgentProfile) => {
    handleUpdateAgent(updatedAgent);
    setSelectedTeam(updatedAgent.team);
    setSelectedRole(updatedAgent.role);
    setSelectedLanguage(updatedAgent.manifest.language.name as Language);
    setSelectedLLMProvider(updatedAgent.manifest.model.provider as LLMProvider);
    setModelName(updatedAgent.manifest.model.modelId);
    const toolNames = updatedAgent.manifest.tools.map(t => t.name);
    setSelectedTools(toolNames);
  };


  const handleExportManifests = async () => {
    if (missionAgents.length === 0) {
        alert("Cannot export. Please forge at least one agent.");
        return;
    }
    addLogEntry("System", "Generating manifest export package...");
    setIsLoading(true);
    setIsLoadingMessage("GENERATING EXPORT...");
    try {
        const zip = new JSZip();
        
        missionAgents.forEach(agent => {
            const filename = `${agent.manifest.id}.json`;
            zip.file(filename, JSON.stringify(agent.manifest, null, 2));
        });

        if (missionAgents.length > 1) {
            const teamManifest: AgentTeamV1 = {
                schemaVersion: 'agent-team.v1',
                id: 'exported-cyber-taskforce',
                name: 'Exported Cyber Taskforce',
                version: '1.0.0',
                members: missionAgents.map(a => ({ role: a.role, agentRef: `${a.manifest.id}.json`})),
                orchestration: { mode: 'planner-directed', entryAgent: missionAgents.find(a => a.role === SystemTeamRole.Orchestrator)?.manifest.id || missionAgents[0].manifest.id },
                sharedMemory: { enabled: true, binding: 'indexes/exported-shared', provider: 'qdrant' },
                env: { required: Array.from(new Set(missionAgents.flatMap(a => a.manifest.env.required))), optional: [] }
            };
            zip.file('agent-team.v1.json', JSON.stringify(teamManifest, null, 2));
        }

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "transform_army_ai_manifests.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addLogEntry("System", "Manifest package successfully generated and downloaded.");

    } catch(e) {
        console.error("Failed to generate export package", e);
        addLogEntry("System Error", "Failed to generate export package.");
    } finally {
        setIsLoading(false);
        setIsLoadingMessage("");
    }
  };

  const handleImportClick = () => {
      importFileInputRef.current?.click();
  };
  
  const handleImportManifest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setIsLoadingMessage('NORMALIZING AGENT (ACoC)...');
    setError(null);
    addLogEntry('ACoC', `Importing and normalizing ${file.name}...`);

    try {
        const fileContent = await file.text();
        const normalizedProfile = await normalizeAgent(fileContent);

        setMissionAgents(prev => [...prev, normalizedProfile]);
        addLogEntry('ACoC', `Successfully imported and normalized ${normalizedProfile.manifest.name}.`, normalizedProfile.manifest);
        setActiveDetailView(normalizedProfile);

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during import.";
        setError(errorMessage);
        addLogEntry("System Error", errorMessage);
    } finally {
        setIsLoading(false);
        setIsLoadingMessage('');
        if (importFileInputRef.current) {
            importFileInputRef.current.value = "";
        }
    }
  };


  const handleLoadTemplate = async (template: MissionTemplate) => {
      if (missionAgents.length > 0 && !window.confirm("Loading a template will clear your current manifest roster. Are you sure?")) {
          return;
      }
      
      setMissionAgents([]);
      setMissionLog([]);
      setActiveDetailView(null);
      
      addLogEntry("System", `Loading mission template: ${template.name}...`);
      setIsLoading(true);
      
      const newAgents: AgentProfile[] = [];
      try {
        for (const [index, agentConfig] of template.agents.entries()) {
            setIsLoadingMessage(`FORGING ${agentConfig.role.toUpperCase()} (${index + 1}/${template.agents.length})...`);
            
            const allCustomToolsForAgent = customTools.filter(ct => (agentConfig.tools || []).includes(ct.name));
            
            const profile = await generateAgent(
                agentConfig.team,
                agentConfig.role,
                agentConfig.language,
                agentConfig.llmProvider,
                agentConfig.modelName || '',
                agentConfig.tools || [],
                allCustomToolsForAgent
            );
            newAgents.push(profile);
            addLogEntry("AgentForge", `(Template) Forged manifest: ${profile.manifest.name}.`);
        }
        setMissionAgents(newAgents);
        if (newAgents.length > 0) {
            setActiveDetailView(newAgents[newAgents.length - 1]);
        }
        addLogEntry("System", `Mission template "${template.name}" loaded successfully.`);
      } catch(e) {
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
          addLogEntry("System Error", `Failed to forge agent from template. Error: ${errorMessage}. Aborting.`);
          setMissionAgents(newAgents); // Still add the ones that succeeded
      } finally {
        setIsLoading(false);
        setIsLoadingMessage('');
      }
  };

  const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8 border-2 border-dashed border-[--color-bg-light-brown] rounded-lg h-full flex flex-col justify-center items-center col-span-1 lg:col-span-8">
      <h2 className="text-2xl font-orbitron text-[--color-accent-red]">Welcome to the Manifest Forge</h2>
      <p className="mt-2 text-[--color-bg-med-brown] max-w-lg">
        Use the **Mission Parameters** panel to forge compliant `agent.v1` manifests, or load a pre-configured team from the **Templates** menu in the Mission Roster.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[--color-bg-parchment]">
      <Header />
      <main className="p-4 md:p-8 max-w-[95rem] mx-auto">
        <div className="mb-8">
          <AgentControlPanel
            teams={TEAMS}
            roles={availableRoles}
            languages={LANGUAGES}
            llmProviders={LLM_PROVIDERS}
            modelName={modelName}
            availableTools={availableTools}
            customTools={customTools.map(t => t.name)}
            selectedTeam={selectedTeam}
            selectedRole={selectedRole}
            selectedLanguage={selectedLanguage}
            selectedLLMProvider={selectedLLMProvider}
            selectedTools={selectedTools}
            onTeamChange={(team) => setSelectedTeam(team)}
            onRoleChange={(role) => setSelectedRole(role)}
            onLanguageChange={(lang) => setSelectedLanguage(lang)}
            onLLMProviderChange={(provider) => setSelectedLLMProvider(provider)}
            onModelNameChange={setModelName}
            onToolsChange={handleToolsChange}
            onGenerate={() => handleGenerateAgent(selectedTeam, selectedRole, selectedLanguage, selectedLLMProvider, modelName, selectedTools)}
            onManageTools={() => setIsToolManagerOpen(true)}
            isLoading={isLoading}
            isLoadingMessage={isLoadingMessage}
          />
        </div>

        {error && (
            <div className="bg-[--color-accent-red]/20 border border-[--color-accent-red] text-[--color-accent-red] p-4 rounded-lg text-center mb-8">
                <h3 className="font-bold font-orbitron mb-2">:: SYSTEM ERROR ::</h3>
                <p>{error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
          {missionAgents.length === 0 && !isLoading && <WelcomeMessage />}
          
          {isLoading && !isLoadingMessage.includes('FORGING') && (
             <div className="flex flex-col justify-center items-center h-full text-[--color-accent-red] col-span-1 lg:col-span-12">
                <SpinnerIcon className="animate-spin h-12 w-12 mb-4" />
                <p className="text-xl font-orbitron tracking-widest">{isLoadingMessage || "PROCESSING..."}</p>
            </div>
          )}

          {(missionAgents.length > 0 || isLoading) && (
            <>
              <div className="lg:col-span-4">
                <MissionRoster 
                  agents={missionAgents} 
                  onSelectAgent={setActiveDetailView}
                  activeAgentId={activeDetailView?.id}
                  onClearRoster={handleClearRoster}
                  onExportManifests={handleExportManifests}
                  onImportManifest={handleImportClick}
                  onLoadTemplate={handleLoadTemplate}
                  onEditAgent={setEditingAgent}
                  isLoading={isLoading}
                />
                <input type="file" ref={importFileInputRef} onChange={handleImportManifest} className="hidden" accept=".json"/>
              </div>
              <div className="lg:col-span-5">
                 <DocumentationDisplay manifest={activeDetailView?.manifest} />
              </div>
              <div className="lg:col-span-3">
                 <MissionLog log={missionLog} />
              </div>
            </>
          )}
        </div>
      </main>
      
      {editingAgent && (
        <EditAgentModal 
            agent={editingAgent}
            onClose={() => setEditingAgent(null)}
            onSave={handleUpdateAgent}
            onSaveAndForgeNew={handleSaveAndForgeNew}
        />
      )}

      {isToolManagerOpen && (
          <ToolboxManager
            customTools={customTools}
            onClose={() => setIsToolManagerOpen(false)}
            onSave={setCustomTools}
          />
      )}

      <footer className="text-center p-4 text-xs text-[--color-text-med]">
        Transform Army AI: Agent Manifest Forge & Exchange | For Standardized Agent Portability
      </footer>
    </div>
  );
};

export default App;