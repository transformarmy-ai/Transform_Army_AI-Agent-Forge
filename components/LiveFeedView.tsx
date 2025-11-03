import React, { useState, useEffect, useRef } from 'react';
import { SpinnerIcon } from './icons';

interface LiveFeedEvent {
    timestamp: string;
    source: string;
    type: string;
    content: string;
    data?: any;
}

const LiveFeedView: React.FC = () => {
    const [events, setEvents] = useState<LiveFeedEvent[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAwaitingInput, setIsAwaitingInput] = useState(false);
    const [humanInput, setHumanInput] = useState('');
    const ws = useRef<WebSocket | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Connect to the WebSocket server
        ws.current = new WebSocket('ws://localhost:8765');

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setEvents([{
                timestamp: new Date().toISOString(),
                source: "C2 Interface",
                type: "connection_status",
                content: "Successfully connected to Live Feed server."
            }]);
        };

        ws.current.onmessage = (event) => {
            try {
                const message: LiveFeedEvent = JSON.parse(event.data);
                setEvents(prev => [...prev, message]);

                if (message.type === 'hitl_request') {
                    setIsAwaitingInput(true);
                }

            } catch (e) {
                console.error("Failed to parse WebSocket message", e);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
             setEvents(prev => [...prev, {
                timestamp: new Date().toISOString(),
                source: "C2 Interface",
                type: "connection_status",
                content: "Connection to Live Feed server lost. Please ensure the mission is running via docker-compose."
            }]);
        };
        
        ws.current.onerror = (error) => {
             console.error('WebSocket error:', error);
             setEvents(prev => [...prev, {
                timestamp: new Date().toISOString(),
                source: "C2 Interface",
                type: "error",
                content: "Error connecting to Live Feed server. Is the mission running?"
            }]);
        }

        return () => {
            ws.current?.close();
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    const handleSendInput = () => {
        if (ws.current && humanInput.trim()) {
            ws.current.send(JSON.stringify({ type: 'human_response', response: humanInput }));
            setEvents(prev => [...prev, {
                timestamp: new Date().toISOString(),
                source: "Operator",
                type: "human_response_sent",
                content: humanInput
            }]);
            setHumanInput('');
            setIsAwaitingInput(false);
        }
    };
    
    const getSourceColor = (source: string) => {
        if (source.includes("Orchestrator")) return "text-green-400";
        if (source.includes("Controller")) return "text-yellow-400";
        if (source.includes("C2")) return "text-purple-400";
        return "text-cyan-400";
    }

    return (
        <div className="bg-black border border-cyan-400/30 rounded-lg shadow-lg h-full flex flex-col font-mono">
            <h2 className="text-lg font-orbitron text-cyan-300 p-4 border-b border-cyan-400/50 flex items-center">
                :: Live Mission C2 Feed ::
                <span className={`ml-auto text-xs font-mono px-2 py-1 rounded ${isConnected ? 'bg-green-500/50 text-green-300' : 'bg-red-500/50 text-red-300'}`}>
                    {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
            </h2>
            <div className="p-4 flex-grow overflow-y-auto text-xs space-y-2">
                {events.map((event, index) => (
                    <div key={index}>
                        <span className="text-gray-500">{event.timestamp.split('T')[1].slice(0, 8)}</span>
                        <span className={`${getSourceColor(event.source)} mx-2`}>[{event.source}]</span>
                        <span className="text-gray-300 whitespace-pre-wrap">{event.content}</span>
                    </div>
                ))}
                 <div ref={bottomRef} />
            </div>
            {isAwaitingInput && (
                 <div className="p-4 border-t border-cyan-400/50 bg-gray-900/50">
                    <label className="block text-sm font-medium text-yellow-300 mb-2 flex items-center">
                        <SpinnerIcon className="animate-spin h-4 w-4 mr-2" />
                        Awaiting Operator Input:
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={humanInput}
                            onChange={(e) => setHumanInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
                            placeholder="Provide guidance and press Enter..."
                            className="flex-grow bg-gray-800 border border-yellow-400/50 text-gray-200 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            autoFocus
                        />
                        <button
                            onClick={handleSendInput}
                            className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold p-2 rounded-md flex items-center justify-center transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveFeedView;