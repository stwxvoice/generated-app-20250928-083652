import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, FilePlus2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Note, Folder } from 'worker/types';
import { CreateItemDialog } from '@/components/CreateItemDialog';
import { Input } from '@/components/ui/input';
const findFolder = (folders: Folder[], folderId: string): Folder | null => {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    const found = findFolder(folder.folders, folderId);
    if (found) return found;
  }
  return null;
};
export function NoteList() {
  const fileTree = useAppStore((s) => s.fileTree);
  const activeFolderId = useAppStore((s) => s.activeFolderId);
  const activeNoteId = useAppStore((s) => s.activeNoteId);
  const setActiveNote = useAppStore((s) => s.setActiveNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogState, setDeleteDialogState] = useState<{ isOpen: boolean; note: Note | null }>({ isOpen: false, note: null });
  const [isCreateNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const activeFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return findFolder(fileTree, activeFolderId);
  }, [fileTree, activeFolderId]);
  const filteredAndSortedNotes = useMemo(() => {
    const notes = activeFolder ? activeFolder.notes : [];
    const filtered = notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [activeFolder, searchTerm]);
  const openDeleteDialog = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogState({ isOpen: true, note });
  };
  return (
    <div className="h-full bg-background/80 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b flex-shrink-0 space-y-3">
        <h2 className="text-lg font-semibold truncate">{activeFolder?.name || 'Notes'}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {!activeFolderId ? (
          <div className="p-8 text-center text-muted-foreground h-full flex items-center justify-center">
            <p>Select a folder to see its notes.</p>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
            <FilePlus2 className="h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold">No notes found</h3>
            <p className="text-sm">{searchTerm ? 'Try a different search term.' : 'Create your first note in this folder.'}</p>
            {!searchTerm && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setCreateNoteDialogOpen(true)}>
                Create a new note
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredAndSortedNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNote(note.id)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors duration-150 group relative',
                  activeNoteId === note.id ? 'bg-accent' : 'hover:bg-accent'
                )}
              >
                <h3 className="font-medium truncate pr-8">{note.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => openDeleteDialog(note, e)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
      <AlertDialog open={deleteDialogState.isOpen} onOpenChange={(isOpen) => setDeleteDialogState({ ...deleteDialogState, isOpen })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteDialogState.note?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deleteDialogState.note) {
                  deleteNote(deleteDialogState.note.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <CreateItemDialog
        isOpen={isCreateNoteDialogOpen}
        onClose={() => setCreateNoteDialogOpen(false)}
        itemType="note"
        parentFolderId={activeFolderId}
      />
    </div>
  );
}