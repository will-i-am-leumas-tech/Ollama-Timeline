import { Router } from 'express';
import { searchRecentWork } from '../services/search.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await searchRecentWork(req.query.q || ''));
});

export default router;
