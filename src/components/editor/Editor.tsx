import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useEditor, EditorContent, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useAppStore } from '@/store/appStore';
import { Toolbar } from './Toolbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from 'react-use';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Download, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { AIPanel } from '@/components/ai/AIPanel';
import { AgentConfig, Folder, Note } from 'worker/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { exportAsHtml, exportAsMarkdown } from '@/lib/export';
import { cn } from '@/lib/utils';
type SaveStatus = 'idle' | 'saving' | 'saved';
const findNote = (folders: Folder[], noteId: string): Note | null => {
  for (const folder of folders) {
    const note = folder.notes.find(n => n.id === noteId);
    if (note) return note;
    const foundInSubfolder = findNote(folder.folders, noteId);
    if (foundInSubfolder) return foundInSubfolder;
  }
  return null;
};
export function Editor() {
  const fileTree = useAppStore((s) => s.fileTree);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const updateNoteContentInStore = useAppStore((s) => s.updateNoteContent);
  const toggleAIPanel = useAppStore((s) => s.toggleAIPanel);
  const activeNote = useMemo(() => {
    if (!activeNoteId) return null;
    return findNote(fileTree, activeNoteId);
  }, [fileTree, activeNoteId]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.content.size === 0) {
            return 'Untitled Note';
          }
          return 'Start writing here...';
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (activeNote) {
        setSaveStatus('saving');
        updateNoteContentInStore(activeNote.id, editor.getHTML());
      }
    },
  });
  const debouncedUpdate = useCallback(async () => {
    if (editor && activeNote && editor.getHTML() !== activeNote.content) {
      await api.updateNoteContent(activeNote.id, editor.getHTML());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('idle');
    }
  }, [editor, activeNote]);
  useDebounce(debouncedUpdate, 1000, [editor?.getHTML(), activeNote?.id, debouncedUpdate]);
  useEffect(() => {
    if (editor && activeNote) {
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content, false);
        setSaveStatus('idle');
      }
    } else if (editor && !activeNote) {
      editor.commands.clearContent();
    }
  }, [activeNote, editor]);
  const handleGenerate = async (configs: AgentConfig[]) => {
    if (!editor) return;
    api.generateText(configs, (chunk) => {
        editor.commands.insertContentAt(editor.state.selection.from, chunk);
    });
  };
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>;
      case 'saved':
        return <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Saved</>;
      default:
        return null;
    }
  };
  if (!activeNote) {
    return (
      <div className="h-full flex items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="text-center text-muted-foreground">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Select a note to start editing</p>
          <p className="text-sm">or create a new one in a folder.</p>
        </div>
      </div>
    );
  }
  return (
    <TooltipProvider>
      <div className="h-full relative bg-background/70 backdrop-blur-sm flex flex-col">
        {editor && (
          <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="z-20">
            <Toolbar editor={editor} />
          </FloatingMenu>
        )}
        <div className="flex-shrink-0 p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold truncate">{activeNote.title}</h2>
            <div className={cn("flex items-center text-sm text-muted-foreground transition-opacity", saveStatus !== 'idle' ? 'opacity-100' : 'opacity-0')}>
              {renderSaveStatus()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleAIPanel}
                  variant="outline"
                  className="bg-card hover:bg-accent"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Tools
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open AI Agent Chain Panel</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-card hover:bg-accent">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => exportAsMarkdown(activeNote.title, editor?.getHTML() || '')}>
                      Export as Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportAsHtml(activeNote.title, editor?.getHTML() || '')}>
                      Export as HTML (.html)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export note to a local file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <AIPanel onGenerate={handleGenerate} />
        <ScrollArea className="flex-grow">
          <EditorContent editor={editor} />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}