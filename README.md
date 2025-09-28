# Synapse Scribe

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/stwxvoice/generated-app-20250928-083652)

A minimalist, AI-powered online note-taking application with advanced document management, a rich text editor, and a unique multi-agent AI generation workflow.

Synapse Scribe is a sophisticated, minimalist online note-taking application designed for clarity, focus, and powerful AI-assisted content creation. The application provides a seamless writing experience with a feature-rich, Notion-style block editor. Users can organize their notes into a hierarchical structure of folders and documents, ensuring intuitive navigation and management.

## Key Features

-   **Rich Text Editor**: A feature-rich, Notion-style block editor for a seamless writing experience.
-   **Document Management**: Organize notes into a hierarchical structure of folders and documents.
-   **Local Export**: Export your notes locally to Markdown or HTML files.
-   **WebDAV Sync**: Securely synchronize your notes with a personal WebDAV server.
-   **Multi-Agent AI**: Chain up to four distinct AI agents for complex, multi-stage text generation workflows.
-   **Configurable AI**: Configure each agent with a unique prompt and model from services like Gemini or OpenRouter.
-   **Real-time Streaming**: AI-generated content is streamed directly into the editor in real-time.
-   **Minimalist Design**: A clean, distraction-free interface designed for focus and clarity.

## Technology Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **UI Components**: shadcn/ui, Radix UI
-   **State Management**: Zustand
-   **Text Editor**: TipTap
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Backend**: Cloudflare Workers, Hono
-   **Persistence**: Cloudflare Durable Objects

## Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/) package manager
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/synapse-scribe.git
    cd synapse-scribe
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**

    Create a `.dev.vars` file in the root of the project. This file is used by Wrangler for local development.

    ```ini
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```

    Replace the placeholder values with your actual Cloudflare Account ID, AI Gateway ID, and API Key.

### Running the Development Server

To start the local development server, which includes the Vite frontend and the Wrangler dev server for the backend worker, run:

```bash
bun run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

## Deployment

This project is designed for easy deployment to Cloudflare's global network.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/stwxvoice/generated-app-20250928-083652)

### Manual Deployment

1.  **Build the project:**
    This command bundles the frontend application and prepares the worker for deployment.
    ```bash
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    This command deploys your application to your Cloudflare account. Make sure you are logged in with the Wrangler CLI.
    ```bash
    bun run deploy
    ```

3.  **Configure Production Secrets:**
    After deploying, you must add your production environment variables as secrets in the Cloudflare dashboard.

    -   Navigate to your Worker in the Cloudflare dashboard.
    -   Go to `Settings` > `Variables`.
    -   Add the following secrets:
        -   `CF_AI_BASE_URL`
        -   `CF_AI_API_KEY`

## License

This project is licensed under the MIT License - see the LICENSE file for details.