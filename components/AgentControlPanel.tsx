
import React from 'react';
import { Team, AgentRole, Language, LLMProvider } from '../types';
import { SpinnerIcon, CogIcon } from './icons';

interface AgentControlPanelProps {
  teams: Team[];
  roles: AgentRole[];
  languages: Language[];
  llmProviders: LLMProvider[];
  modelName: string;
  availableTools: string[];
  customTools: string[];
  selectedTeam: Team;
  selectedRole: AgentRole;
  selectedLanguage: Language;
  selectedLLMProvider: LLMProvider;
  selectedTools: string[];
  onTeamChange: (team: Team) => void;
  onRoleChange: (role: AgentRole) => void;
  onLanguageChange: (language: Language) => void;
  onLLMProviderChange: (provider: LLMProvider) => void;
  onModelNameChange: (name: string) => void;
  onToolsChange: (tool: string) => void;
  onGenerate: () => void;
  onManageTools: () => void;
  isLoading: boolean;
  isLoadingMessage: string;
}

const CustomSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, value, onChange, children }) => (
    <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-[--color-accent-cyan] mb-1 uppercase tracking-wider font-orbitron">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-[--color-bg-tertiary] border border-[--color-border-primary] text-[--color-text-primary] rounded-md py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[--color-accent-cyan] focus:border-[--color-accent-cyan] transition-all duration-200 font-mono"
                style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }}
            >
                {children}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="h-5 w-5 text-[--color-accent-cyan]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </span>
        </div>
    </div>
);

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({
  teams,
  roles,
  languages,
  llmProviders,
  modelName,
  availableTools,
  customTools,
  selectedTeam,
  selectedRole,
  selectedLanguage,
  selectedLLMProvider,
  selectedTools,
  onTeamChange,
  onRoleChange,
  onLanguageChange,
  onLLMProviderChange,
  onModelNameChange,
  onToolsChange,
  onGenerate,
  onManageTools,
  isLoading,
  isLoadingMessage,
}) => {
  const allTools = [...new Set([...availableTools, ...customTools])];
  
  const getModelPlaceholder = () => {
    switch (selectedLLMProvider) {
      case LLMProvider.OpenAI:
        return 'e.g., gpt-4o';
      case LLMProvider.OpenRouter:
        return 'e.g., mistralai/mistral-large';
      case LLMProvider.Anthropic:
        return 'e.g., claude-3-5-sonnet-20241022';
      default:
        return 'e.g., mistralai/mistral-large';
    }
  };

  return (
    <div className="bg-[--color-bg-secondary]/80 border border-[--color-border-primary] rounded-lg p-4 md:p-6 shadow-lg backdrop-blur-md"
         style={{
           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
           background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.8) 100%)'
         }}>
      <h2 className="text-lg font-orbitron text-[--color-accent-cyan] mb-4 border-b border-[--color-accent-cyan]/30 pb-2 uppercase tracking-wider"
          style={{ textShadow: '0 0 10px var(--color-glow-cyan)' }}>
        :: Mission Parameters ::
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <CustomSelect label="Select Team" value={selectedTeam} onChange={(e) => onTeamChange(e.target.value as Team)}>
            {teams.map((team) => ( <option key={team} value={team}>{team} Team</option> )) }
        </CustomSelect>
        <CustomSelect label="Assign Role" value={selectedRole} onChange={(e) => onRoleChange(e.target.value as AgentRole)}>
            {roles.map((role) => ( <option key={role} value={role}>{role}</option> )) }
        </CustomSelect>
        <CustomSelect label="Select Language" value={selectedLanguage} onChange={(e) => onLanguageChange(e.target.value as Language)}>
            {languages.map((lang) => ( <option key={lang} value={lang}>{lang}</option> ))}
        </CustomSelect>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <CustomSelect label="LLM Provider" value={selectedLLMProvider} onChange={(e) => onLLMProviderChange(e.target.value as LLMProvider)}>
                {llmProviders.map((provider) => ( <option key={provider} value={provider}>{provider}</option>))}
            </CustomSelect>
             <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-[--color-accent-cyan] mb-1 uppercase tracking-wider font-orbitron">Custom Model Name</label>
                <input
                    type="text"
                    value={modelName}
                    onChange={(e) => onModelNameChange(e.target.value)}
                    placeholder={getModelPlaceholder()}
                    className="w-full bg-[--color-bg-tertiary] border border-[--color-border-primary] text-[--color-text-primary] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-cyan] focus:border-[--color-accent-cyan] transition-all duration-200 font-mono"
                    style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }}
                />
            </div>
        </div>
      </div>

      {(availableTools.length > 0 || customTools.length > 0) && (
          <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="block text-sm font-medium text-[--color-accent-cyan] uppercase tracking-wider font-orbitron">:: Tool Selection ::</h3>
                <button onClick={onManageTools} className="flex items-center text-xs text-[--color-text-secondary] hover:text-[--color-accent-cyan] transition-colors font-mono">
                    <CogIcon className="h-4 w-4 mr-1" />
                    Manage Custom Tools
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 bg-[--color-bg-tertiary]/50 p-3 rounded-md border border-[--color-border-primary]"
                   style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' }}>
                  {allTools.map(tool => (
                      <label key={tool} className="flex items-center space-x-2 text-sm text-[--color-text-secondary] cursor-pointer hover:text-[--color-accent-cyan] transition-colors font-mono">
                          <input
                              type="checkbox"
                              checked={selectedTools.includes(tool)}
                              onChange={() => onToolsChange(tool)}
                              className="w-4 h-4 text-[--color-accent-cyan] bg-[--color-bg-tertiary] border-[--color-border-primary] rounded focus:ring-[--color-accent-cyan]/80 focus:ring-2"
                              style={{ accentColor: 'var(--color-accent-cyan)' }}
                          />
                          <span>{tool}</span>
                      </label>
                  ))}
              </div>
          </div>
      )}

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-gradient-to-r from-[--color-accent-cyan] to-[--color-accent-blue] hover:from-[--color-accent-cyan]/90 hover:to-[--color-accent-blue]/90 disabled:from-[--color-text-muted] disabled:to-[--color-text-muted] disabled:cursor-not-allowed text-[--color-text-inverse] font-bold py-3 px-4 rounded-md transition-all duration-300 font-orbitron tracking-wider shadow-lg"
        style={{
          boxShadow: '0 4px 20px rgba(0, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4)',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
        }}
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin h-5 w-5 mr-3" />
            {isLoadingMessage || `FORGING ${selectedRole.toUpperCase()}...`}
          </>
        ) : (
          'ENGAGE & FORGE MANIFEST'
        )}
      </button>
    </div>
  );
};

export default AgentControlPanel;