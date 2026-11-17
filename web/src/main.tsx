import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/source-serif-4/600.css';
import 'katex/dist/katex.min.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/globals.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
