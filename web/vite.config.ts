import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Nombre del repositorio publicado en GitHub Pages.
const repositoryName = 'PC2';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? `/${repositoryName}/` : '/',
});
