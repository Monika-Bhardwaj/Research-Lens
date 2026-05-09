import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Lens - AI RAG Application',
  description: 'A production-grade AI RAG application inspired by Google NotebookLM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
