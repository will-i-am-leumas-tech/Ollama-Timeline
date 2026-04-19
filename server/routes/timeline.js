import { Router } from 'express';
import { buildRecentWorkSummary, getTimelineFeed } from '../services/timeline.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await getTimelineFeed({ limit: req.query.limit || 50 }));
});

router.get('/recent-work', async (req, res) => {
  res.json(await buildRecentWorkSummary({ limit: req.query.limit || 10 }));
});

export default router;
