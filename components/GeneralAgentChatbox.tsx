import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, LoadingIcon } from './icons';
import { GeneralAgentService, Task, TeamDeployment } from '../services/generalAgentService';
import { getOrchestratorService } from '../services/orchestratorService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'general' | 'system';
  content: string;
  timestamp: string;
}

interface GeneralAgentChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  missionId: string;
}

const GeneralAgentChatbox: React.FC<GeneralAgentChatboxProps> = ({
  isOpen,
  onClose,
  missionId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'general',
      content: '🎖️ GENERAL here. Ready for mission orders. What\'s your command, Commander?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalAgent, setGeneralAgent] = useState<GeneralAgentService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize GENERAL agent
  useEffect(() => {
    const orchestrator = getOrchestratorService();
    const general = new GeneralAgentService(missionId, orchestrator);
    setGeneralAgent(general);

    // Welcome message
    const welcomeMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'system',
      content: '📋 Commands: "create task: {name}", "spin up team: {name}", "list tasks", "list teams", "help"',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, welcomeMsg]);
  }, [missionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !generalAgent) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await generalAgent.processCommand(inputValue);
      const generalMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'general',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, generalMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Command failed'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-full max-h-[600px] bg-[--color-bg-elevated] border-2 border-[--color-accent-red] rounded-lg shadow-2xl flex flex-col z-50 drop-shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-[--color-accent-red] via-black to-[--color-accent-blue] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎖️</span>
          <div>
            <h3 className="font-bold text-lg">GENERAL COMMAND</h3>
            <p className="text-xs opacity-75">Field Commander AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:text-red-200 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[--color-bg-primary]">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[--color-accent-red] text-white rounded-br-none'
                  : msg.role === 'general'
                  ? 'bg-[--color-accent-blue] text-white rounded-bl-none'
                  : 'bg-yellow-900/20 border border-yellow-700 text-yellow-300'
              }`}
            >
              <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[--color-bg-secondary] text-[--color-text-secondary] px-4 py-2 rounded-lg flex items-center gap-2">
              <LoadingIcon className="w-4 h-4 animate-spin" />
              <span className="text-sm">GENERAL is processing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-[--color-border-secondary] p-3 bg-[--color-bg-secondary]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Commander, your orders..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-[--color-bg-primary] border border-[--color-accent-red] rounded text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-accent-red] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2 bg-[--color-accent-red] text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralAgentChatbox;
