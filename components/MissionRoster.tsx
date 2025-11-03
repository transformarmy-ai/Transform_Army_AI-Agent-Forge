
import React, { useState } from 'react';
import { AgentProfile, MissionTemplate } from '../types';
import { TrashIcon, EditIcon, TemplateIcon, DownloadIcon, LoadIcon } from './icons';
import { MISSION_TEMPLATES, APP_LOGO_BASE64 } from '../constants';

interface MissionRosterProps {
  agents: AgentProfile[];
  onSelectAgent: (agent: AgentProfile | null) => void;
  activeAgentId?: string | null;
  onClearRoster: () => void;
  onExportManifests: () => void;
  onImportManifest: () => void;
  onLoadTemplate: (template: MissionTemplate) => void;
  onEditAgent: (agent: AgentProfile) => void;
  isLoading: boolean;
}

const MissionRoster: React.FC<MissionRosterProps> = ({ 
    agents, 
    onSelectAgent, 
    activeAgentId, 
    onClearRoster,
    onExportManifests,
    onImportManifest,
    onLoadTemplate,
    onEditAgent,
    isLoading
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  
  const getTeamColor = (team: string) => {
    switch (team) {
      case 'Red': return 'border-[--color-accent-red]';
      case 'Blue': return 'border-[--color-accent-blue]';
      case 'System': return 'border-[--color-accent-gold]';
      default: return 'border-[--color-text-med]';
    }
  };

  const handleSelect = (agent: AgentProfile) => {
    if (agent.id === activeAgentId) {
        onSelectAgent(null); // Deselect if clicking the active one
    } else {
        onSelectAgent(agent);
    }
  };
  
  const handleTemplateSelect = (template: MissionTemplate) => {
      setShowTemplates(false);
      onLoadTemplate(template);
  }

  const IconButton: React.FC<{onClick: () => void, disabled: boolean, title: string, children: React.ReactNode }> = 
    ({onClick, disabled, title, children}) => (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            title={title} 
            className="text-[--color-text-med] hover:text-[--color-text-dark] transition-colors disabled:text-[--color-bg-light-brown] disabled:cursor-not-allowed"
        >
            {children}
        </button>
  );

  return (
    <div className="bg-[--color-bg-med-brown]/20 border border-[--color-bg-light-brown] rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-[--color-accent-gold]/30">
        <h2 className="text-lg font-orbitron text-[--color-accent-red]">
          :: Manifest Roster ::
        </h2>
        <div className="flex items-center space-x-3">
            <div className="relative" onMouseLeave={() => setShowTemplates(false)}>
                <IconButton onClick={() => setShowTemplates(!showTemplates)} disabled={isLoading} title="Load Mission Template">
                    <TemplateIcon className="h-5 w-5"/>
                </IconButton>
                {showTemplates && (
                    <div className="absolute right-0 mt-2 w-64 bg-[--color-bg-dark-brown] border border-[--color-bg-light-brown] rounded-md shadow-lg z-20">
                        <div className="p-2">
                            <p className="text-xs text-[--color-text-med] px-2 pb-1">Load a pre-configured team:</p>
                            {MISSION_TEMPLATES.map(template => (
                                <button key={template.name} onClick={() => handleTemplateSelect(template)} className="w-full text-left px-2 py-2 text-sm text-[--color-text-light] hover:bg-[--color-accent-red]/50 rounded">
                                    <p className="font-bold">{template.name}</p>
                                    <p className="text-xs text-[--color-text-med]">{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
             <IconButton onClick={onImportManifest} disabled={isLoading} title="Import Manifest (ACoC)"> <LoadIcon className="h-5 w-5"/> </IconButton>
            <IconButton onClick={onExportManifests} disabled={isLoading} title="Export Manifests"> <DownloadIcon className="h-5 w-5"/> </IconButton>
            <IconButton onClick={onClearRoster} disabled={isLoading} title="Clear Roster"> <TrashIcon className="h-5 w-5"/> </IconButton>
        </div>
      </div>
      <div className="p-4 flex-grow overflow-y-auto space-y-2">
        {agents.length === 0 && !isLoading && (
            <p className="text-sm text-[--color-text-med] text-center mt-4">No manifests forged. <br/> Use the panel above or load a template.</p>
        )}
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => handleSelect(agent)}
            className={`group relative w-full text-left p-2 rounded-md transition-all duration-300 ease-in-out border-l-4 cursor-pointer ${getTeamColor(agent.team)} ${
              activeAgentId === agent.id
                ? 'bg-[--color-accent-gold]/30 ring-2 ring-[--color-accent-gold]/80 scale-[1.03] shadow-lg shadow-black/20'
                : 'bg-white/40 hover:bg-white/60 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/10'
            }`}
          >
            <div className="w-full h-full flex items-center">
                <img src={agent.avatarBase64 || APP_LOGO_BASE64} alt={`${agent.role} avatar`} className="h-10 w-10 rounded-full mr-3 flex-shrink-0 border-2 border-[--color-bg-light-brown]/50" />
                <div className="flex-grow text-left">
                    <p className="font-bold text-sm text-[--color-text-dark] truncate">{agent.manifest.name}</p>
                    <p className="text-xs text-[--color-bg-med-brown]">{agent.role} (v{agent.manifest.version})</p>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditAgent(agent);
                        }}
                        className="p-1 rounded-full text-[--color-text-dark] hover:bg-black/10"
                        title="Edit Manifest"
                    >
                        <EditIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionRoster;