import { create } from 'zustand';
import { ChatMessage, DocumentInfo } from '../types';

interface AppState {
  documents: DocumentInfo[];
  messages: ChatMessage[];
  activeDocumentId: string | null;
  inferenceMode: 'groq' | 'ollama';
  setInferenceMode: (mode: 'groq' | 'ollama') => void;
  addDocument: (doc: DocumentInfo) => void;
  updateDocumentStatus: (id: string, status: DocumentInfo['status'], progress?: number) => void;
  setActiveDocument: (id: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, message: Partial<ChatMessage>) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  documents: [],
  messages: [],
  activeDocumentId: null,
  inferenceMode: 'groq',
  setInferenceMode: (mode) => set({ inferenceMode: mode }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  updateDocumentStatus: (id, status, progress) => set((state) => ({
    documents: state.documents.map((doc) => 
      doc.id === id ? { ...doc, status, progress: progress ?? doc.progress } : doc
    )
  })),
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, update) => set((state) => ({
    messages: state.messages.map((msg) => 
      msg.id === id ? { ...msg, ...update } : msg
    )
  })),
  clearMessages: () => set({ messages: [] }),
}));
