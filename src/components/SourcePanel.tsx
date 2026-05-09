"use client";

import { useAppStore } from '@/store/useAppStore';
import { FileText, Database, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SourcePanel() {
  const { activeDocumentId, documents } = useAppStore();
  const activeDoc = documents.find(d => d.id === activeDocumentId);

  if (!activeDoc) return null;

  return (
    <div className="h-full flex flex-col bg-neutral-950 border-l border-neutral-800">
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/30">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" />
          Document Context
        </h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400 mt-1">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-neutral-200 break-all">{activeDoc.filename}</h3>
              <p className="text-xs text-neutral-500 mt-1">Uploaded {new Date(activeDoc.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Index Status
              </span>
              <span className="flex items-center gap-1 font-medium">
                {activeDoc.status === 'ready' ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-500">Indexed</span></>
                ) : activeDoc.status === 'error' ? (
                  <><AlertCircle className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-500">Error</span></>
                ) : (
                  <span className="text-amber-500 animate-pulse capitalize">{activeDoc.status}...</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Features Enabled</h3>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Semantic Chunking
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Nomic Embeddings
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Grounded Generation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Source Citations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
