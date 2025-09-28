import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController } from "./core-utils";
import { handleAIGeneration } from "./ai-handler";
import { AIGenerationRequest } from "./types";
import { MiddlewareHandler } from "hono/types";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // This API is for the template's chat functionality, not used by Synapse Scribe.
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- Public Authentication Routes ---
    const authRoutes = new Hono<{ Bindings: Env }>();
    authRoutes.post('/register', async (c) => {
        const { username, password } = await c.req.json();
        if (!username || !password) return c.json({ success: false, error: 'Username and password are required' }, 400);
        const controller = getAppController(c.env);
        const result = await controller.registerUser(username, password);
        if (!result.success) return c.json(result, 409);
        return c.json({ success: true, data: { user: { username } } });
    });
    authRoutes.post('/login', async (c) => {
        const { username, password } = await c.req.json();
        if (!username || !password) return c.json({ success: false, error: 'Username and password are required' }, 400);
        const controller = getAppController(c.env);
        const result = await controller.loginUser(username, password);
        if (!result.success) return c.json(result, 401);
        return c.json({ success: true, data: { user: { username } } });
    });
    app.route('/api/auth', authRoutes);
    // --- Protected Routes ---
    const protectedRoutes = new Hono<{ Bindings: Env, Variables: { userId: string } }>();
    // Authentication Middleware
    protectedRoutes.use('*', async (c, next) => {
        const userId = c.req.header('X-User-Id');
        if (!userId) {
            return c.json({ success: false, error: 'Unauthorized' }, 401);
        }
        c.set('userId', userId);
        await next();
    });
    // Synapse Scribe Data Routes
    protectedRoutes.get('/file-tree', async (c) => {
        const userId = c.get('userId');
        const controller = getAppController(c.env);
        const fileTree = await controller.getFileTree(userId);
        return c.json({ success: true, data: fileTree });
    });
    protectedRoutes.post('/notes', async (c) => {
        const userId = c.get('userId');
        const { folderId, title } = await c.req.json();
        if (!folderId || !title) return c.json({ success: false, error: 'Missing folderId or title' }, 400);
        const controller = getAppController(c.env);
        const newNote = await controller.addNote(userId, folderId, title);
        if (!newNote) return c.json({ success: false, error: 'Folder not found' }, 404);
        return c.json({ success: true, data: newNote });
    });
    protectedRoutes.post('/folders', async (c) => {
        const userId = c.get('userId');
        const { parentFolderId, name } = await c.req.json();
        if (!name) return c.json({ success: false, error: 'Missing folder name' }, 400);
        const controller = getAppController(c.env);
        const newFolder = await controller.addFolder(userId, parentFolderId, name);
        return c.json({ success: true, data: newFolder });
    });
    protectedRoutes.put('/notes/:noteId', async (c) => {
        const userId = c.get('userId');
        const noteId = c.req.param('noteId');
        const { content } = await c.req.json();
        if (typeof content !== 'string') return c.json({ success: false, error: 'Content must be a string' }, 400);
        const controller = getAppController(c.env);
        const updatedNote = await controller.updateNoteContent(userId, noteId, content);
        if (!updatedNote) return c.json({ success: false, error: 'Note not found' }, 404);
        return c.json({ success: true, data: updatedNote });
    });
    protectedRoutes.delete('/notes/:noteId', async (c) => {
        const userId = c.get('userId');
        const noteId = c.req.param('noteId');
        const controller = getAppController(c.env);
        const deleted = await controller.deleteNote(userId, noteId);
        if (!deleted) return c.json({ success: false, error: 'Note not found' }, 404);
        return c.json({ success: true, data: { deleted: true } });
    });
    protectedRoutes.delete('/folders/:folderId', async (c) => {
        const userId = c.get('userId');
        const folderId = c.req.param('folderId');
        const controller = getAppController(c.env);
        const deleted = await controller.deleteFolder(userId, folderId);
        if (!deleted) return c.json({ success: false, error: 'Folder not found' }, 404);
        return c.json({ success: true, data: { deleted: true } });
    });
    // AI Generation Route
    protectedRoutes.post('/ai/generate', async (c) => {
        try {
            const body = await c.req.json<AIGenerationRequest>();
            const stream = await handleAIGeneration(body, c.env);
            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } catch (error) {
            console.error('AI Generation route error:', error);
            return c.json({ success: false, error: 'Failed to generate text' }, 500);
        }
    });
    // Mount the protected routes under the main app router with the /api prefix
    app.route('/api', protectedRoutes);
}