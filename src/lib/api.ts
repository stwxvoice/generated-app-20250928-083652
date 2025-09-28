import { Folder, Note, AgentConfig } from 'worker/types';
import { useAppStore } from '@/store/appStore';
export interface AuthCredentials {
  username: string;
  password: string;
}
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const username = useAppStore.getState().auth.username;
  if (username) {
    headers['X-User-Id'] = username;
  }
  return headers;
};
const handleResponse = async <T>(response: Response): Promise<T> => {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }
  return result.data;
};
export const api = {
  login: async (credentials: AuthCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ user: { username: string } }>(response);
  },
  register: async (credentials: AuthCredentials) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ user: { username: string } }>(response);
  },
  getFileTree: async (): Promise<Folder[]> => {
    const response = await fetch('/api/file-tree', { headers: getHeaders() });
    return handleResponse<Folder[]>(response);
  },
  addNote: async (folderId: string, title: string): Promise<Note> => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderId, title }),
    });
    return handleResponse<Note>(response);
  },
  addFolder: async (parentFolderId: string | null, name: string): Promise<Folder> => {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ parentFolderId, name }),
    });
    return handleResponse<Folder>(response);
  },
  updateNoteContent: async (noteId: string, content: string): Promise<Note> => {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<Note>(response);
  },
  deleteNote: async (noteId: string): Promise<{ deleted: boolean }> => {
    const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse<{ deleted: boolean }>(response);
  },
  deleteFolder: async (folderId: string): Promise<{ deleted: boolean }> => {
    const response = await fetch(`/api/folders/${folderId}`, { method: 'DELETE', headers: getHeaders() });
    return handleResponse<{ deleted: boolean }>(response);
  },
  generateText: async (configs: AgentConfig[], onChunk: (chunk: string) => void): Promise<void> => {
    const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ configs }),
    });
    if (!response.ok || !response.body) {
        throw new Error(`AI generation failed: ${response.statusText}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(decoder.decode(value));
    }
  },
};