import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Folder, Note, AgentConfig } from 'worker/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
const defaultAgentConfigs: AgentConfig[] = Array(4).fill({
  enabled: false,
  prompt: '',
  model: 'gemini-1.5-flash-latest',
});
defaultAgentConfigs[0].enabled = true;
interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}
interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}
// Helper functions for deep object manipulation
const findFolder = (folders: Folder[], folderId: string): Folder | null => {
  for (const folder of folders) {
    if (folder.id === folderId) return folder;
    const found = findFolder(folder.folders, folderId);
    if (found) return found;
  }
  return null;
};
const findNote = (folders: Folder[], noteId: string): Note | null => {
  for (const folder of folders) {
    const note = folder.notes.find(n => n.id === noteId);
    if (note) return note;
    const foundInSubfolder = findNote(folder.folders, noteId);
    if (foundInSubfolder) return foundInSubfolder;
  }
  return null;
};
const removeNoteFromTree = (folders: Folder[], noteId: string): boolean => {
  for (const folder of folders) {
    const noteIndex = folder.notes.findIndex(n => n.id === noteId);
    if (noteIndex > -1) {
      folder.notes.splice(noteIndex, 1);
      return true;
    }
    if (removeNoteFromTree(folder.folders, noteId)) {
      return true;
    }
  }
  return false;
};
const removeFolderFromTree = (folders: Folder[], folderId: string): boolean => {
  const folderIndex = folders.findIndex(f => f.id === folderId);
  if (folderIndex > -1) {
    folders.splice(folderIndex, 1);
    return true;
  }
  for (const folder of folders) {
    if (removeFolderFromTree(folder.folders, folderId)) {
      return true;
    }
  }
  return false;
};
type AppState = {
  fileTree: Folder[];
  activeFolderId: string | null;
  activeNoteId: string | null;
  isLoading: boolean;
  error: string | null;
  isAIPanelOpen: boolean;
  agentConfigs: AgentConfig[];
  isSettingsModalOpen: boolean;
  webdavConfig: WebDAVConfig;
  auth: AuthState;
};
type AppActions = {
  fetchFileTree: () => Promise<void>;
  setActiveFolder: (folderId: string) => void;
  setActiveNote: (noteId: string) => void;
  updateNoteContent: (noteId: string, content: string) => void;
  addNote: (folderId: string, title: string) => Promise<void>;
  addFolder: (parentFolderId: string | null, name: string) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  toggleAIPanel: () => void;
  updateAgentConfig: (index: number, config: Partial<AgentConfig>) => void;
  toggleSettingsModal: () => void;
  updateWebdavConfig: (config: WebDAVConfig) => void;
  login: (username: string) => void;
  logout: () => void;
};
export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      fileTree: [],
      activeFolderId: null,
      activeNoteId: null,
      isLoading: true,
      error: null,
      isAIPanelOpen: false,
      agentConfigs: defaultAgentConfigs,
      isSettingsModalOpen: false,
      webdavConfig: { url: '', username: '', password: '' },
      auth: { isAuthenticated: false, username: null },
      fetchFileTree: async () => {
        try {
          set({ isLoading: true, error: null });
          const fileTree = await api.getFileTree();
          set((state) => {
            state.fileTree = fileTree;
            if (fileTree.length > 0 && !state.activeFolderId) {
              const firstFolder = fileTree[0];
              state.activeFolderId = firstFolder.id;
              state.activeNoteId = firstFolder.notes[0]?.id || null;
            }
            state.isLoading = false;
          });
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
        }
      },
      setActiveFolder: (folderId) =>
        set((state) => {
          state.activeFolderId = folderId;
          const folder = findFolder(state.fileTree, folderId);
          state.activeNoteId = folder?.notes[0]?.id || null;
        }),
      setActiveNote: (noteId) =>
        set((state) => {
          state.activeNoteId = noteId;
        }),
      updateNoteContent: (noteId, content) => {
        set((state) => {
          const note = findNote(state.fileTree, noteId);
          if (note) {
            note.content = content;
            note.updatedAt = new Date().toISOString();
          }
        });
      },
      addNote: async (folderId, title) => {
        try {
          const newNote = await api.addNote(folderId, title);
          set((state) => {
            const folder = findFolder(state.fileTree, folderId);
            if (folder) {
              folder.notes.unshift(newNote);
              state.activeNoteId = newNote.id;
            }
          });
          toast.success(`Note "${title}" created.`);
        } catch (error) {
          toast.error(`Failed to add note: ${(error as Error).message}`);
        }
      },
      addFolder: async (parentFolderId, name) => {
        try {
          const newFolder = await api.addFolder(parentFolderId, name);
          set((state) => {
            if (parentFolderId) {
              const parentFolder = findFolder(state.fileTree, parentFolderId);
              parentFolder?.folders.push(newFolder);
            } else {
              state.fileTree.push(newFolder);
            }
          });
          toast.success(`Folder "${name}" created.`);
        } catch (error) {
          toast.error(`Failed to add folder: ${(error as Error).message}`);
        }
      },
      deleteNote: async (noteId) => {
        try {
          await api.deleteNote(noteId);
          set((state) => {
            if (state.activeNoteId === noteId) {
              state.activeNoteId = null;
            }
            removeNoteFromTree(state.fileTree, noteId);
          });
          toast.success("Note deleted.");
        } catch (error) {
          toast.error(`Failed to delete note: ${(error as Error).message}`);
        }
      },
      deleteFolder: async (folderId) => {
        try {
          await api.deleteFolder(folderId);
          set((state) => {
            if (state.activeFolderId === folderId) {
              state.activeFolderId = null;
              state.activeNoteId = null;
            }
            removeFolderFromTree(state.fileTree, folderId);
          });
          toast.success("Folder deleted.");
        } catch (error) {
          toast.error(`Failed to delete folder: ${(error as Error).message}`);
        }
      },
      toggleAIPanel: () => set((state) => {
        state.isAIPanelOpen = !state.isAIPanelOpen;
      }),
      updateAgentConfig: (index, config) => set((state) => {
        state.agentConfigs[index] = { ...state.agentConfigs[index], ...config };
      }),
      toggleSettingsModal: () => set((state) => {
        state.isSettingsModalOpen = !state.isSettingsModalOpen;
      }),
      updateWebdavConfig: (config) => set((state) => {
        state.webdavConfig = config;
      }),
      login: (username) => set((state) => {
        state.auth.isAuthenticated = true;
        state.auth.username = username;
      }),
      logout: () => set((state) => {
        state.auth.isAuthenticated = false;
        state.auth.username = null;
        state.activeFolderId = null;
        state.activeNoteId = null;
        state.fileTree = [];
      }),
    })),
    {
      name: 'synapse-scribe-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        webdavConfig: state.webdavConfig,
        agentConfigs: state.agentConfigs,
        auth: state.auth,
      }),
    }
  )
);