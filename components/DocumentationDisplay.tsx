
import React from 'react';
import { AgentV1, TestV1 } from '../types';

interface DocumentationDisplayProps {
  manifest?: AgentV1;
}

const DocSection: React.FC<{ title: string; children: React.ReactNode; mono?: boolean }> = ({ title, children, mono=false }) => (
    <div>
        <h3 className="font-orbitron text-lg text-[--color-accent-gold] mb-2 border-b-2 border-[--color-accent-gold]/20 pb-1">
            {title}
        </h3>
        <div className={`text-[--color-text-dark] text-sm leading-relaxed whitespace-pre-wrap ${mono ? 'font-mono' : ''}`}>{children}</div>
    </div>
);

const TestDisplay: React.FC<{ test: TestV1 }> = ({ test }) => (
    <div className="bg-black/10 p-3 rounded-md border border-[--color-bg-light-brown]">
        <p className="font-bold text-sm text-[--color-text-dark]">{test.name} ({test.type})</p>
        <p className="text-xs text-[--color-bg-med-brown]">{test.description}</p>
        {test.command && <pre className="text-xs mt-2 bg-black/20 p-2 rounded"><code>{test.command}</code></pre>}
    </div>
);


const DocumentationDisplay: React.FC<DocumentationDisplayProps> = ({ manifest }) => {
  if (!manifest) {
    return (
        <div className="text-center p-8 border-2 border-dashed border-[--color-bg-light-brown] rounded-lg h-full flex flex-col justify-center items-center">
            <h2 className="text-xl font-orbitron text-[--color-accent-red]">Manifest Details</h2>
            <p className="mt-2 text-[--color-bg-med-brown]">Select an agent from the roster to view its manifest.</p>
        </div>
    );
  }
  
  return (
    <div className="bg-[--color-bg-med-brown]/20 border border-[--color-bg-light-brown] rounded-lg shadow-lg p-6 h-full overflow-y-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-orbitron text-[--color-accent-red]">{manifest.name}</h2>
        <p className="text-sm text-[--color-text-med]">ID: {manifest.id} | Version: {manifest.version}</p>
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
            <div className="text-xs font-mono bg-black/10 p-3 rounded-md border border-[--color-bg-light-brown]">
                <p><span className="font-bold">Source:</span> {manifest.importMeta.source}</p>
                <p><span className="font-bold">Timestamp:</span> {manifest.importMeta.timestamp}</p>
                <p className="font-bold mt-2">Changes Made:</p>
                <ul className="list-disc list-inside">
                    {manifest.importMeta.changes.map((change, i) => <li key={i}>{change}</li>)}
                </ul>
            </div>
        </DocSection>
      )}

    </div>
  );
};

export default DocumentationDisplay;