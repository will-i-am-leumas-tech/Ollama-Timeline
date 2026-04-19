import express from 'express';
import path from 'path';
import healthRoutes from './routes/health.js';
import configRoutes from './routes/config.js';
import scanRoutes from './routes/scan.js';
import timelineRoutes from './routes/timeline.js';
import foldersRoutes from './routes/folders.js';
import searchRoutes from './routes/search.js';
import ollamaRoutes from './routes/ollama.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/api/health', healthRoutes);
  app.use('/api/config', configRoutes);
  app.use('/api/scan', scanRoutes);
  app.use('/api/timeline', timelineRoutes);
  app.use('/api/folders', foldersRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/ollama', ollamaRoutes);

  app.use(express.static(path.resolve(process.cwd(), 'client')));
  return app;
}
