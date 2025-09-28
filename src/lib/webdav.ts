import { createClient, type WebDAVClient as WebDAVClientInstance, AuthType } from 'webdav';
import { Folder } from 'worker/types';
interface WebDAVConfig {
  url: string;
  username?: string;
  password?: string;
}
const SYNC_FILENAME = 'synapse-scribe-backup.json';
export class WebDAVClient {
  private client: WebDAVClientInstance;
  constructor(config: WebDAVConfig) {
    if (!config.url) {
      throw new Error('WebDAV URL is not configured.');
    }
    this.client = createClient(config.url, {
      authType: config.username ? AuthType.Digest : undefined,
      username: config.username,
      password: config.password,
    });
  }
  async checkConnection(): Promise<boolean> {
    try {
      await this.client.getDirectoryContents('/');
      return true;
    } catch (error) {
      console.error('WebDAV connection check failed:', error);
      throw new Error('Failed to connect to WebDAV server. Check credentials and URL.');
    }
  }
  async uploadFileTree(fileTree: Folder[]): Promise<void> {
    const content = JSON.stringify(fileTree, null, 2);
    await this.client.putFileContents(SYNC_FILENAME, content, { overwrite: true });
  }
  async downloadFileTree(): Promise<Folder[]> {
    const exists = await this.client.exists(SYNC_FILENAME);
    if (!exists) {
      throw new Error(`Backup file '${SYNC_FILENAME}' not found on WebDAV server.`);
    }
    const content = await this.client.getFileContents(SYNC_FILENAME, { format: 'text' });
    return JSON.parse(content as string) as Folder[];
  }
}