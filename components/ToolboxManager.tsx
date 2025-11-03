
import React, { useState, useEffect } from 'react';
import { CustomTool } from '../types';
import { TrashIcon } from './icons';

interface ToolboxManagerProps {
  customTools: CustomTool[];
  onClose: () => void;
  onSave: (tools: CustomTool[]) => void;
}

const emptyTool: Omit<CustomTool, 'id'> & { paramsString: string } = {
    name: '',
    description: '',
    endpoint: '',
    parameters: {},
    paramsString: JSON.stringify({}, null, 2),
};


const ToolboxManager: React.FC<ToolboxManagerProps> = ({ customTools, onClose, onSave }) => {
    const [tools, setTools] = useState<CustomTool[]>(customTools);
    const [editingTool, setEditingTool] = useState<Partial<CustomTool> & { paramsString?: string }>(emptyTool);
    const [isParamsValid, setIsParamsValid] = useState(true);

    useEffect(() => {
        // Pre-populate with a better scaffold when adding a new tool
        if (!editingTool.id) {
            setEditingTool({ ...emptyTool, paramsString: '{\n  "parameter_name": { "type": "STRING", "description": "Description of the parameter." }\n}' });
        }
    }, [editingTool.id]);

    const handleParamChange = (value: string) => {
        setEditingTool(prev => ({ ...prev, paramsString: value }));
        try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
                setIsParamsValid(true);
            } else {
                setIsParamsValid(false);
            }
        } catch (e) {
            setIsParamsValid(false);
        }
    };
    
    const handleSaveTool = () => {
        if (!editingTool.name || !editingTool.description || !editingTool.endpoint || !isParamsValid) return;

        const finalTool: CustomTool = {
            id: editingTool.id || crypto.randomUUID(),
            name: editingTool.name,
            description: editingTool.description,
            endpoint: editingTool.endpoint,
            parameters: JSON.parse(editingTool.paramsString || '{}')
        };

        let newTools;
        if (editingTool.id) {
            newTools = tools.map(t => t.id === finalTool.id ? finalTool : t);
        } else {
            newTools = [...tools, finalTool];
        }
        setTools(newTools);
        setEditingTool({ ...emptyTool });
    };

    const handleEdit = (tool: CustomTool) => {
        setEditingTool({ ...tool, paramsString: JSON.stringify(tool.parameters, null, 2) });
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this custom tool?")) {
            setTools(tools.filter(t => t.id !== id));
        }
    };
    
    const handleSaveChanges = () => {
        onSave(tools);
        onClose();
    };
    
    const isCurrentFormValid = editingTool.name && editingTool.description && editingTool.endpoint && isParamsValid;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-[--color-bg-med-brown] border border-[--color-bg-light-brown] rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-[--color-accent-red]/30">
                    <h2 className="text-xl font-orbitron text-[--color-accent-red]">:: Custom Toolbox Manager ::</h2>
                    <button onClick={onClose} className="text-[--color-text-med] hover:text-white text-2xl font-bold">&times;</button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tool List */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-orbitron text-[--color-accent-gold] mb-2">Custom Tools</h3>
                        <div className="bg-[--color-bg-dark-brown]/50 p-2 rounded-md border border-[--color-bg-light-brown] flex-grow">
                           {tools.length === 0 && <p className="text-sm text-[--color-text-med] p-4 text-center">No custom tools defined.</p>}
                           <ul className="space-y-2">
                               {tools.map(tool => (
                                   <li key={tool.id} className="group flex justify-between items-center p-2 bg-[--color-bg-med-brown]/50 rounded">
                                       <div>
                                           <p className="font-bold text-sm text-[--color-text-light]">{tool.name}</p>
                                           <p className="text-xs text-[--color-text-med]">{tool.endpoint}</p>
                                       </div>
                                       <div className="flex items-center space-x-2">
                                           <button onClick={() => handleEdit(tool)} className="text-sm text-[--color-accent-blue] hover:underline">Edit</button>
                                           <button onClick={() => handleDelete(tool.id)} className="text-[--color-text-med] hover:text-[--color-accent-red]"><TrashIcon className="h-4 w-4"/></button>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                        </div>
                    </div>
                    {/* Tool Editor */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-orbitron text-[--color-accent-gold] mb-2">{editingTool.id ? 'Edit Tool' : 'Add New Tool'}</h3>
                         <input type="text" placeholder="Tool Name (e.g., zscaler_ip_check)" value={editingTool.name || ''} onChange={e => setEditingTool(p => ({...p, name: e.target.value}))} className="w-full bg-[--color-bg-dark-brown] border border-[--color-bg-light-brown] p-2 rounded focus:ring-[--color-accent-gold] text-[--color-text-light]"/>
                         <input type="text" placeholder="Tool Description" value={editingTool.description || ''} onChange={e => setEditingTool(p => ({...p, description: e.target.value}))} className="w-full bg-[--color-bg-dark-brown] border border-[--color-bg-light-brown] p-2 rounded focus:ring-[--color-accent-gold] text-[--color-text-light]"/>
                         <input type="text" placeholder="Toolbox API Endpoint (e.g., /check_ip_zscaler)" value={editingTool.endpoint || ''} onChange={e => setEditingTool(p => ({...p, endpoint: e.target.value}))} className="w-full bg-[--color-bg-dark-brown] border border-[--color-bg-light-brown] p-2 rounded focus:ring-[--color-accent-gold] text-[--color-text-light]"/>
                         <div>
                            <label className="text-sm text-[--color-accent-gold]">Parameters Schema (JSON)</label>
                            <textarea
                                value={editingTool.paramsString || '{}'}
                                onChange={e => handleParamChange(e.target.value)}
                                rows={6}
                                placeholder={`{\n  "ip_address": { "type": "STRING", "description": "The IP to check." }\n}`}
                                className={`w-full font-mono text-xs bg-[--color-bg-dark-brown] border p-2 rounded mt-1 text-[--color-text-light] ${isParamsValid ? 'border-[--color-bg-light-brown] focus:ring-[--color-accent-gold]' : 'border-[--color-accent-red] ring-[--color-accent-red]'}`}
                            />
                            {!isParamsValid && <p className="text-xs text-[--color-accent-red] mt-1">Invalid JSON format.</p>}
                         </div>
                         <button onClick={handleSaveTool} disabled={!isCurrentFormValid} className="w-full bg-[--color-accent-gold]/80 hover:bg-[--color-accent-gold] disabled:bg-[--color-bg-light-brown] disabled:cursor-not-allowed text-white font-bold py-2 rounded transition-colors">
                            {editingTool.id ? 'Update Tool' : 'Add Tool to List'}
                         </button>
                    </div>
                </main>

                <footer className="flex justify-end p-4 border-t border-[--color-bg-light-brown] bg-[--color-bg-dark-brown]/50">
                    <button onClick={handleSaveChanges} className="bg-[--color-accent-red]/90 hover:bg-[--color-accent-red] text-white font-bold py-2 px-4 rounded-md transition-colors font-orbitron">
                        Save All Changes & Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ToolboxManager;