import { Router } from 'express';
import { getFolderDetails, getRecentFolders } from '../services/timeline.js';

const router = Router();

router.get('/recent', async (req, res) => {
  res.json(await getRecentFolders({ limit: req.query.limit || 20 }));
});

router.get('/details', async (req, res) => {
  res.json(await getFolderDetails(req.query.path || ''));
});

export default router;
