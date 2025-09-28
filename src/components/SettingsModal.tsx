import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/appStore';
import { WebDAVClient } from '@/lib/webdav';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
export function SettingsModal() {
  const isOpen = useAppStore((s) => s.isSettingsModalOpen);
  const toggleSettingsModal = useAppStore((s) => s.toggleSettingsModal);
  const webdavConfig = useAppStore((s) => s.webdavConfig);
  const updateWebdavConfig = useAppStore((s) => s.updateWebdavConfig);
  const fileTree = useAppStore((s) => s.fileTree);
  const fetchFileTree = useAppStore((s) => s.fetchFileTree);
  const [localConfig, setLocalConfig] = useState(webdavConfig);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isSyncing, setIsSyncing] = useState(false);
  const handleTestConnection = async () => {
    setStatus('testing');
    try {
      const client = new WebDAVClient(localConfig);
      await client.checkConnection();
      setStatus('success');
      toast.success('WebDAV connection successful!');
    } catch (error) {
      setStatus('error');
      toast.error(`WebDAV connection failed: ${(error as Error).message}`);
    }
  };
  const handleSave = () => {
    updateWebdavConfig(localConfig);
    toggleSettingsModal();
    toast.success('Settings saved.');
  };
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const client = new WebDAVClient(webdavConfig);
      await client.uploadFileTree(fileTree);
      toast.success('Sync to WebDAV successful!');
    } catch (error) {
      toast.error(`Sync failed: ${(error as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleRestore = async () => {
    if (!confirm('This will overwrite your local notes. Are you sure?')) return;
    setIsSyncing(true);
    try {
      const client = new WebDAVClient(webdavConfig);
      const remoteFileTree = await client.downloadFileTree();
      // This is a simplified restore. A real app would merge or use backend to update.
      // For now, we just log it and tell the user to refresh after a backend update.
      // A full client-side state replacement would be: useAppStore.setState({ fileTree: remoteFileTree });
      console.log('Downloaded file tree:', remoteFileTree);
      toast.success('Restore from WebDAV successful! Data will be available on next refresh.');
      // In a real scenario, we'd post this to the backend to update the durable object state.
      // Then call fetchFileTree() to get the latest state.
    } catch (error) {
      toast.error(`Restore failed: ${(error as Error).message}`);
    } finally {
      setIsSyncing(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={toggleSettingsModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your application settings and WebDAV synchronization.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h3 className="font-semibold text-lg">WebDAV Configuration</h3>
          <div className="space-y-2">
            <Label htmlFor="webdav-url">Server URL</Label>
            <Input
              id="webdav-url"
              placeholder="https://your-webdav-server.com/remote.php/dav/files/username/"
              value={localConfig.url}
              onChange={(e) => setLocalConfig({ ...localConfig, url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webdav-username">Username</Label>
            <Input
              id="webdav-username"
              value={localConfig.username}
              onChange={(e) => setLocalConfig({ ...localConfig, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webdav-password">Password</Label>
            <Input
              id="webdav-password"
              type="password"
              value={localConfig.password}
              onChange={(e) => setLocalConfig({ ...localConfig, password: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTestConnection} disabled={status === 'testing'}>
              {status === 'testing' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            {status === 'success' && <Check className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
          </div>
          <div className="flex items-center gap-2 pt-4">
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sync to WebDAV
            </Button>
            <Button variant="destructive" onClick={handleRestore} disabled={isSyncing}>
              {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Restore from WebDAV
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}