
import React, { useState, useEffect } from 'react';
import { AgentProfile, AgentV1 } from '../types';

interface EditAgentModalProps {
  agent: AgentProfile;
  onClose: () => void;
  onSave: (updatedAgent: AgentProfile) => void;
  onSaveAndForgeNew: (updatedAgent: AgentProfile) => void;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, onClose, onSave, onSaveAndForgeNew }) => {
  const [formData, setFormData] = useState<AgentProfile>({ ...agent });

  useEffect(() => {
    setFormData(agent);
  }, [agent]);
  
  const handleManifestChange = (field: keyof AgentV1 | `prompts.system`, value: string) => {
    setFormData(prev => {
        const newManifest = {...prev.manifest};
        if (field === 'prompts.system') {
            newManifest.prompts = { ...newManifest.prompts, system: value };
        } else if (field === 'name' || field === 'id' || field === 'version' || field === 'description') {
            newManifest[field] = value;
        }
        return { ...prev, manifest: newManifest };
     });
  };

  const handleSave = (andForgeNew = false) => {
    if (andForgeNew) {
        onSaveAndForgeNew(formData);
    } else {
        onSave(formData);
    }
    onClose();
  };
  
  const renderTextarea = (label: string, value: string, onChange: (value: string) => void, rows: number = 3) => (
    <div>
        <label className="block text-sm font-medium text-[--color-accent-gold] mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="w-full bg-[--color-bg-dark-brown]/80 border border-[--color-bg-light-brown] text-[--color-text-light] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-gold] font-mono text-sm"
        />
    </div>
  );
  
   const renderInput = (label: string, value: string, onChange: (value: string) => void) => (
    <div>
        <label className="block text-sm font-medium text-[--color-accent-gold] mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[--color-bg-dark-brown]/80 border border-[--color-bg-light-brown] text-[--color-text-light] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[--color-accent-gold] font-mono text-sm"
        />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[--color-bg-med-brown] border border-[--color-bg-light-brown] rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-[--color-accent-red]/30">
          <h2 className="text-xl font-orbitron text-[--color-accent-red]">
            :: Edit Manifest: <span className="text-[--color-accent-gold]">{agent.manifest.name}</span> ::
          </h2>
          <button onClick={onClose} className="text-[--color-text-med] hover:text-white text-2xl font-bold">&times;</button>
        </header>
        
        <main className="p-6 overflow-y-auto flex-grow space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {renderInput("Agent Name", formData.manifest.name, (val) => handleManifestChange('name', val))}
              {renderInput("Agent ID", formData.manifest.id, (val) => handleManifestChange('id', val))}
              {renderInput("Version", formData.manifest.version, (val) => handleManifestChange('version', val))}
            </div>
            {renderTextarea("Description", formData.manifest.description, (val) => handleManifestChange('description', val), 2)}
            {renderTextarea("System Prompt", formData.manifest.prompts.system, (val) => handleManifestChange('prompts.system', val), 15)}
        </main>
        
        <footer className="flex justify-between items-center p-4 border-t border-[--color-bg-light-brown] bg-[--color-bg-dark-brown]/50">
            <button onClick={() => handleSave(true)} className="bg-[--color-accent-blue]/80 hover:bg-[--color-accent-blue] text-white font-bold py-2 px-4 rounded-md transition-colors font-orbitron">
                Save and Forge New
            </button>
            <div className="space-x-4">
              <button onClick={onClose} className="bg-[--color-bg-light-brown] hover:bg-[--color-text-med] text-[--color-text-dark] font-bold py-2 px-4 rounded-md transition-colors">
                  Cancel
              </button>
              <button onClick={() => handleSave(false)} className="bg-[--color-accent-gold]/80 hover:bg-[--color-accent-gold] text-white font-bold py-2 px-4 rounded-md transition-colors font-orbitron">
                  Save Changes
              </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default EditAgentModal;