import { Router } from 'express';
import { askOllamaAboutRecentWork, buildRecentWorkContext, getAvailableModels } from '../services/ollama.js';

const router = Router();

router.get('/models', async (_req, res) => {
  res.json(await getAvailableModels());
});

router.post('/ask', async (req, res) => {
  const question = req.body?.question || 'What did I work on recently?';
  const result = await askOllamaAboutRecentWork(question);
  res.json(result);
});

router.post('/context', async (req, res) => {
  const question = req.body?.question || 'What did I work on recently?';
  res.json(await buildRecentWorkContext(question));
});

export default router;
