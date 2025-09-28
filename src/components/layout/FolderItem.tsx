import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronRight, Trash2, FolderPlus } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Folder } from 'worker/types';
import { cn } from '@/lib/utils';
import { CreateItemDialog } from '@/components/CreateItemDialog';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
interface FolderItemProps {
  folder: Folder;
  level?: number;
}
export function FolderItem({ folder, level = 0 }: FolderItemProps) {
  const { activeFolderId, setActiveFolder, deleteFolder } = useAppStore();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const openCreateSubfolderDialog = () => setCreateDialogOpen(true);
  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const isActive = activeFolderId === folder.id;
  return (
    <>
      <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={cn(
                'flex items-center gap-2 w-full text-sm rounded-md transition-colors duration-150 group',
                isActive
                  ? 'bg-blue-500/10 text-blue-500 font-semibold'
                  : 'text-foreground/70 hover:bg-accent hover:text-foreground'
              )}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <CollapsibleTrigger asChild>
                <button className="p-1 rounded-sm hover:bg-accent disabled:opacity-50">
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-transform duration-200',
                      !isCollapsed && 'rotate-90',
                      folder.folders.length === 0 && 'invisible'
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <button
                onClick={() => setActiveFolder(folder.id)}
                className="flex-grow flex items-center gap-2 py-1.5 text-left truncate"
              >
                <FolderIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{folder.name}</span>
              </button>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={openCreateSubfolderDialog}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Sub-folder
            </ContextMenuItem>
            <ContextMenuItem className="text-red-500" onClick={openDeleteDialog}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          {folder.folders.length > 0 && (
            <div className="space-y-1 mt-1">
              {folder.folders.map((subFolder) => (
                <FolderItem key={subFolder.id} folder={subFolder} level={level + 1} />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      <CreateItemDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        itemType="folder"
        parentFolderId={folder.id}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the folder and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteFolder(folder.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}