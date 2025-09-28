import React, { useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteList } from '@/components/layout/NoteList';
import { Editor } from '@/components/editor/Editor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppStore } from '@/store/appStore';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const fetchFileTree = useAppStore((s) => s.fetchFileTree);
  const isLoading = useAppStore((s) => s.isLoading);
  const error = useAppStore((s) => s.error);
  useEffect(() => {
    fetchFileTree();
  }, [fetchFileTree]);
  if (isLoading) {
    return (
      <main className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your notes...</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="h-screen w-screen flex flex-col items-center justify-center bg-background text-destructive">
        <h1 className="text-2xl font-bold">Failed to load application</h1>
        <p className="mt-2">{error}</p>
      </main>
    );
  }
  return (
    <main className="h-screen w-screen bg-muted/40 text-foreground overflow-hidden">
      <ThemeToggle className="absolute top-2 right-2 z-50" />
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <NoteList />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={55}>
          <Editor />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </main>
  );
}