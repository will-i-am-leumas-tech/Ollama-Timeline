import { Router } from 'express';
import { getAppConfig, updateAppConfig } from '../services/config.js';

const router = Router();

router.get('/', async (_req, res) => {
  res.json(await getAppConfig());
});

router.put('/', async (req, res) => {
  res.json(await updateAppConfig(req.body || {}));
});

export default router;
