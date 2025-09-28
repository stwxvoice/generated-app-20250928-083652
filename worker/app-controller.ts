import { DurableObject } from 'cloudflare:workers';
import type { Folder, Note } from './types';
import type { Env } from './core-utils';
interface User {
  username: string;
  passwordHash: string;
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
const findNote = (folders: Folder[], noteId: string): { note: Note, parentFolder: Folder } | null => {
    for (const folder of folders) {
        const note = folder.notes.find(n => n.id === noteId);
        if (note) return { note, parentFolder: folder };
        const foundInSubfolder = findNote(folder.folders, noteId);
        if (foundInSubfolder) return foundInSubfolder;
    }
    return null;
}
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
const defaultFileSystem: Folder[] = [
  {
    id: 'folder-1',
    name: 'Getting Started',
    notes: [
      {
        id: 'note-1-1',
        title: 'Welcome to Synapse Scribe',
        content: '<h2>Welcome to Synapse Scribe!</h2><p>This is your first note. You can edit it, create new notes, and organize them into folders.</p><p>Use the toolbar to format your text. Happy writing!</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    folders: [],
  },
];
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
export class AppController extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  // User Authentication
  async registerUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.ctx.storage.get<User>(`user_${username}`);
    if (user) {
      return { success: false, error: 'Username already exists' };
    }
    const passwordHash = await hashPassword(password);
    await this.ctx.storage.put(`user_${username}`, { username, passwordHash });
    // Create default file system for new user
    await this.ctx.storage.put(`fileTree_${username}`, defaultFileSystem);
    return { success: true };
  }
  async loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    const user = await this.ctx.storage.get<User>(`user_${username}`);
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Invalid username or password' };
    }
    return { success: true };
  }
  // Synapse Scribe Data Management
  async getFileTree(userId: string): Promise<Folder[]> {
    let fileTree = await this.ctx.storage.get<Folder[]>(`fileTree_${userId}`);
    if (!fileTree) {
      // This case handles users registered before the default file system was added on registration
      fileTree = defaultFileSystem;
      await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    }
    return fileTree;
  }
  async addNote(userId: string, folderId: string, title: string): Promise<Note | null> {
    const fileTree = await this.getFileTree(userId);
    const folder = findFolder(fileTree, folderId);
    if (!folder) return null;
    const newNote: Note = {
      id: `note-${crypto.randomUUID()}`,
      title,
      content: `<h2>${title}</h2><p>Start writing here...</p>`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folder.notes.unshift(newNote);
    await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    return newNote;
  }
  async addFolder(userId: string, parentFolderId: string | null, name: string): Promise<Folder> {
    const fileTree = await this.getFileTree(userId);
    const newFolder: Folder = {
      id: `folder-${crypto.randomUUID()}`,
      name,
      notes: [],
      folders: [],
    };
    if (parentFolderId) {
      const parentFolder = findFolder(fileTree, parentFolderId);
      parentFolder?.folders.push(newFolder);
    } else {
      fileTree.push(newFolder);
    }
    await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    return newFolder;
  }
  async updateNoteContent(userId: string, noteId: string, content: string): Promise<Note | null> {
    const fileTree = await this.getFileTree(userId);
    const result = findNote(fileTree, noteId);
    if (!result) return null;
    result.note.content = content;
    result.note.updatedAt = new Date().toISOString();
    await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    return result.note;
  }
  async deleteNote(userId: string, noteId: string): Promise<boolean> {
    const fileTree = await this.getFileTree(userId);
    const wasRemoved = removeNoteFromTree(fileTree, noteId);
    if (wasRemoved) {
      await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    }
    return wasRemoved;
  }
  async deleteFolder(userId: string, folderId: string): Promise<boolean> {
    const fileTree = await this.getFileTree(userId);
    const wasRemoved = removeFolderFromTree(fileTree, folderId);
    if (wasRemoved) {
      await this.ctx.storage.put(`fileTree_${userId}`, fileTree);
    }
    return wasRemoved;
  }
}