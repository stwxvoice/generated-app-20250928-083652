import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/appStore';
interface CreateItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'note' | 'folder';
  parentFolderId: string | null;
}
export function CreateItemDialog({ isOpen, onClose, itemType, parentFolderId }: CreateItemDialogProps) {
  const [name, setName] = useState('');
  const { addNote, addFolder } = useAppStore();
  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (itemType === 'note' && parentFolderId) {
      addNote(parentFolderId, name);
    } else if (itemType === 'folder') {
      addFolder(parentFolderId, name);
    }
    onClose();
  };
  const title = itemType === 'note' ? 'Create New Note' : 'Create New Folder';
  const description = itemType === 'note' ? 'Enter a title for your new note.' : 'Enter a name for your new folder.';
  const label = itemType === 'note' ? 'Title' : 'Folder Name';
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <Label htmlFor="item-name">{label}</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}