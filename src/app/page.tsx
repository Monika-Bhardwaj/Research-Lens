"use client";

import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import SourcePanel from '@/components/SourcePanel';
import { Settings } from 'lucide-react';

export default function Home() {
  const { activeDocumentId, inferenceMode, setInferenceMode } = useAppStore();

  return (
    <main className="flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur-md">
          <h1 className="font-semibold tracking-tight text-lg bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Research Lens
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1">
              <span className="text-neutral-400">Model:</span>
              <select 
                value={inferenceMode}
                onChange={(e) => setInferenceMode(e.target.value as 'groq' | 'ollama')}
                className="bg-transparent border-none outline-none text-emerald-400 cursor-pointer font-medium"
              >
                <option value="groq">Groq (Cloud)</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {activeDocumentId ? (
            <>
              <div className="flex-1 border-r border-neutral-800">
                <ChatPanel />
              </div>
              <div className="w-[400px] shrink-0 bg-neutral-900/30">
                <SourcePanel />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-neutral-500">
              <div className="w-20 h-20 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4 shadow-2xl shadow-emerald-500/10 border border-neutral-800">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-neutral-300">Upload a document to begin</h2>
              <p className="max-w-md text-center">
                Select a PDF or text file from the sidebar to start analyzing, querying, and extracting insights with AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
