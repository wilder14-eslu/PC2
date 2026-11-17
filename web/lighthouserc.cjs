const fs = require('node:fs');

// Se obtiene la base del artefacto compilado para no duplicar la constante de Vite.
const html = fs.readFileSync('./dist/index.html', 'utf8');
const match = html.match(/(?:src|href)="(\/[^"?#]*?)assets\//);
const base = match ? match[1] : '/';

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --host 127.0.0.1 --port 4174 --strictPort',
      startServerReadyPattern: 'Local:',
      url: [`http://127.0.0.1:4174${base}`],
      numberOfRuns: 3,
      settings: { preset: 'desktop', chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci/report' },
  },
};
