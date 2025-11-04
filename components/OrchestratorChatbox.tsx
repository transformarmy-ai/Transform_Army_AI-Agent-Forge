import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, LoadingIcon } from './icons';

export interface ChatMessage {
  id: string;
  role: 'user' | 'orchestrator' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    missionId?: string;
    agentId?: string;
    taskId?: string;
  };
}

export interface OrchestratorChatboxProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => Promise<void>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

const OrchestratorChatbox: React.FC<OrchestratorChatboxProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  connectionStatus
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

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
      await onSendMessage(inputValue);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-[--color-bg-elevated] border-2 border-[--color-border-accent] rounded-lg shadow-2xl flex flex-col z-50 drop-shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-[--color-accent-red] to-[--color-accent-blue] text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">Orchestrator Command</h3>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:text-red-200 transition-colors"
          aria-label="Close chatbox"
        >
          ✕
        </button>
      </div>

      {/* Status Line */}
      <div className="bg-[--color-bg-secondary] px-4 py-2 text-sm text-[--color-text-secondary] border-b border-[--color-border-secondary]">
        Status: <span className="text-[--color-accent-red] font-semibold">{getStatusText()}</span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[--color-bg-primary]">
        {messages.length === 0 && (
          <div className="text-center text-[--color-text-muted] py-8">
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs mt-2">Type a command or query below to begin.</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[--color-accent-red] text-white rounded-br-none'
                  : msg.role === 'orchestrator'
                  ? 'bg-[--color-accent-blue] text-white rounded-bl-none'
                  : 'bg-[--color-bg-secondary] text-[--color-text-secondary] border border-[--color-border-secondary]'
              }`}
            >
              <p className="text-sm break-words">{msg.content}</p>
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
              <span className="text-sm">Orchestrator is responding...</span>
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
            placeholder="Type command (e.g., 'list agents', 'status', 'dispatch task')..."
            disabled={isLoading || connectionStatus !== 'connected'}
            className="flex-1 px-3 py-2 bg-[--color-bg-primary] border border-[--color-border-primary] rounded text-[--color-text-primary] focus:outline-none focus:border-[--color-accent-red] focus:ring-2 focus:ring-[--color-accent-red] focus:ring-opacity-50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || connectionStatus !== 'connected' || !inputValue.trim()}
            className="px-4 py-2 bg-[--color-accent-red] text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            aria-label="Send message"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrchestratorChatbox;
