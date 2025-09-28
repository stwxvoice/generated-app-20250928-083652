import TurndownService from 'turndown';
import { saveAs } from 'file-saver';
const turndownService = new TurndownService();
const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
};
export const exportAsMarkdown = (title: string, htmlContent: string) => {
  try {
    const markdown = turndownService.turndown(htmlContent);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${sanitizeFilename(title)}.md`);
  } catch (error) {
    console.error('Error exporting as Markdown:', error);
    alert('Failed to export as Markdown.');
  }
};
export const exportAsHtml = (title: string, htmlContent: string) => {
  try {
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; padding: 2em; max-width: 800px; margin: 0 auto; }
          h1, h2, h3 { line-height: 1.2; }
          pre { background-color: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
          code { font-family: monospace; }
          blockquote { border-left: 4px solid #ccc; padding-left: 1em; color: #666; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${htmlContent}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${sanitizeFilename(title)}.html`);
  } catch (error) {
    console.error('Error exporting as HTML:', error);
    alert('Failed to export as HTML.');
  }
};