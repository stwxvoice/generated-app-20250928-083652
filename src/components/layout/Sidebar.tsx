import React, { useState } from 'react';
import { Folder as FolderIcon, Plus, LogOut, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SettingsModal } from '@/components/SettingsModal';
import { CreateItemDialog } from '@/components/CreateItemDialog';
import { FolderItem } from './FolderItem';
import { toast } from 'sonner';
export function Sidebar() {
  const fileTree = useAppStore((s) => s.fileTree);
  const activeFolderId = useAppStore((s) => s.activeFolderId);
  const toggleSettingsModal = useAppStore((s) => s.toggleSettingsModal);
  const { logout, user } = useAuth();
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{ isOpen: boolean; itemType: 'note' | 'folder' }>({ isOpen: false, itemType: 'note' });
  const openDialog = (itemType: 'note' | 'folder') => {
    if (itemType === 'note' && !activeFolderId) {
      toast.warning('Please select a folder first to create a new note.');
      return;
    }
    setDialogState({ isOpen: true, itemType });
  };
  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background/95 backdrop-blur-sm">
        <div className="p-4 flex-shrink-0 border-b flex items-center justify-between">
          <h1 className="text-xl font-display font-bold">Synapse Scribe</h1>
        </div>
        <div className="p-4 flex-shrink-0 flex items-center gap-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => openDialog('note')}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => openDialog('folder')}>
            <FolderIcon className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
        <ScrollArea className="flex-grow p-2">
          <div className="space-y-1">
            {fileTree.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 mt-auto border-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground truncate">
              {user?.username || 'User'}
            </span>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSettingsModal}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsLogoutAlertOpen(true)}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log Out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <SettingsModal />
      <CreateItemDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        itemType={dialogState.itemType}
        parentFolderId={dialogState.itemType === 'note' ? activeFolderId : null}
      />
      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be returned to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => logout()}>Log Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}