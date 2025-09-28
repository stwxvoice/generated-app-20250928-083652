import type { Folder, Note } from '../../worker/types';
export const fileSystemTree: Folder[] = [
  {
    id: 'folder-1',
    name: 'Project Synapse',
    notes: [
      {
        id: 'note-1-1',
        title: 'Phase 1: UI/UX Foundation',
        content: '<h2>Phase 1: UI/UX Foundation</h2><p>Focus on building a visually stunning and fully interactive frontend. Implement the three-panel layout, mock authentication, and integrate the TipTap rich text editor. All UI components will be styled according to the minimalist design system.</p>',
        createdAt: '2024-08-15T10:00:00Z',
        updatedAt: '2024-08-15T11:30:00Z',
      },
      {
        id: 'note-1-2',
        title: 'Component Library',
        content: '<h2>Component Library</h2><p>Utilize <strong>shadcn/ui</strong> for core components. Ensure all components are responsive and adhere to the design system. Key components include: ResizablePanelGroup, Buttons, Icons, and Cards.</p>',
        createdAt: '2024-08-15T12:00:00Z',
        updatedAt: '2024-08-15T12:45:00Z',
      },
    ],
    folders: [
      {
        id: 'folder-1-1',
        name: 'Meeting Notes',
        notes: [
          {
            id: 'note-1-1-1',
            title: 'Kickoff Meeting',
            content: '<h2>Kickoff Meeting Notes</h2><p><strong>Attendees:</strong> Senior Architect, Lead Engineer</p><ul><li>Discussed project goals and timeline.</li><li>Finalized tech stack: React, Vite, Cloudflare Workers, TipTap.</li><li>Agreed on minimalist design philosophy.</li></ul>',
            createdAt: '2024-08-14T09:00:00Z',
            updatedAt: '2024-08-14T09:45:00Z',
          },
        ],
        folders: [],
      },
    ],
  },
  {
    id: 'folder-2',
    name: 'Personal Notes',
    notes: [
      {
        id: 'note-2-1',
        title: 'Ideas for Weekend Project',
        content: '<h2>Weekend Project Ideas</h2><ol><li>Build a custom mechanical keyboard.</li><li>Learn a new programming language like Rust.</li><li>Contribute to an open-source project.</li></ol>',
        createdAt: '2024-08-16T14:00:00Z',
        updatedAt: '2024-08-16T14:00:00Z',
      },
    ],
    folders: [],
  },
];