
import React from 'react';
import { AgentV1, TestV1 } from '../types';

interface DocumentationDisplayProps {
  manifest?: AgentV1;
}

const DocSection: React.FC<{ title: string; children: React.ReactNode; mono?: boolean }> = ({ title, children, mono=false }) => (
    <div>
        <h3 className="font-orbitron text-lg text-[--color-accent-cyan] mb-2 border-b-2 border-[--color-accent-cyan]/20 pb-1 uppercase tracking-wider"
            style={{ textShadow: '0 0 8px var(--color-glow-cyan)' }}>
            {title}
        </h3>
        <div className={`text-[--color-text-primary] text-sm leading-relaxed whitespace-pre-wrap ${mono ? 'font-mono' : ''}`}>{children}</div>
    </div>
);

const TestDisplay: React.FC<{ test: TestV1 }> = ({ test }) => (
    <div className="bg-[--color-bg-tertiary]/50 p-3 rounded-md border border-[--color-border-primary]"
         style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }}>
        <p className="font-bold text-sm text-[--color-text-primary] font-orbitron">{test.name} ({test.type})</p>
        <p className="text-xs text-[--color-text-secondary] font-mono">{test.description}</p>
        {test.command && <pre className="text-xs mt-2 bg-[--color-bg-secondary] p-2 rounded border border-[--color-border-primary] font-mono"
                             style={{ boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)' }}><code>{test.command}</code></pre>}
    </div>
);


const DocumentationDisplay: React.FC<DocumentationDisplayProps> = ({ manifest }) => {
  if (!manifest) {
    return (
        <div className="text-center p-8 border-2 border-dashed border-[--color-border-accent]/50 rounded-lg h-full flex flex-col justify-center items-center bg-[--color-bg-secondary]/50 backdrop-blur-sm">
            <h2 className="text-xl font-orbitron text-[--color-accent-cyan] uppercase tracking-wider"
                style={{ textShadow: '0 0 15px var(--color-glow-cyan)' }}>Manifest Details</h2>
            <p className="mt-2 text-[--color-text-secondary] font-[--font-secondary]">Select an agent from the roster to view its manifest.</p>
        </div>
    );
  }
  
  return (
    <div className="bg-[--color-bg-secondary]/80 border border-[--color-border-primary] rounded-lg shadow-lg p-6 h-full overflow-y-auto space-y-6"
         style={{
           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
           background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.8) 100%)',
           scrollbarWidth: 'thin',
           scrollbarColor: 'var(--color-border-primary) transparent'
         }}>
      <div className="text-center border-b border-[--color-border-primary]/30 pb-4">
        <h2 className="text-2xl font-orbitron text-[--color-accent-cyan] uppercase tracking-wider"
            style={{ textShadow: '0 0 20px var(--color-glow-cyan)' }}>{manifest.name}</h2>
        <p className="text-sm text-[--color-text-secondary] font-mono mt-2">ID: {manifest.id} | Version: {manifest.version}</p>
      </div>
      
      <DocSection title=":: Description ::">
        {manifest.description}
      </DocSection>
      
      <DocSection title=":: System Prompt ::" mono>
        {manifest.prompts.system}
      </DocSection>

      {manifest.tests && manifest.tests.length > 0 && (
        <DocSection title=":: Smoke Tests ::">
          <div className="space-y-2">
              {manifest.tests.map((test, index) => <TestDisplay key={index} test={test} />)}
          </div>
        </DocSection>
      )}

      {manifest.importMeta && (
        <DocSection title=":: Import Meta ::">
            <div className="text-xs font-mono bg-[--color-bg-tertiary]/50 p-3 rounded-md border border-[--color-border-primary]"
                 style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' }}>
                <p><span className="font-bold text-[--color-accent-cyan]">Source:</span> {manifest.importMeta.source}</p>
                <p><span className="font-bold text-[--color-accent-cyan]">Timestamp:</span> {manifest.importMeta.timestamp}</p>
                <p className="font-bold text-[--color-accent-cyan] mt-2">Changes Made:</p>
                <ul className="list-disc list-inside space-y-1">
                    {manifest.importMeta.changes.map((change, i) => <li key={i}>{change}</li>)}
                </ul>
            </div>
        </DocSection>
      )}

    </div>
  );
};

export default DocumentationDisplay;