"use client";

import { useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FileText, Plus, File, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function Sidebar() {
  const { documents, activeDocumentId, setActiveDocument, addDocument, updateDocumentStatus } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docId = file.name; // Simplified, in a real app use uuid
    
    // Check if doc exists
    if (documents.some(d => d.id === docId)) {
      alert("Document already uploaded");
      return;
    }

    addDocument({
      id: docId,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0,
    });
    
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      updateDocumentStatus(docId, 'parsing', 20);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      updateDocumentStatus(docId, 'ready', 100);
      setActiveDocument(docId);
    } catch (error) {
      console.error(error);
      updateDocumentStatus(docId, 'error', 0);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-[280px] bg-neutral-950 border-r border-neutral-800 flex flex-col">
      <div className="p-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Upload Document
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.txt"
          onChange={handleFileUpload}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">Your Knowledge Base</h3>
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDocument(doc.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
              activeDocumentId === doc.id 
                ? 'bg-neutral-800/80 text-white' 
                : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
            }`}
          >
            <div className={`p-2 rounded-lg ${activeDocumentId === doc.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.filename}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                  {doc.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
