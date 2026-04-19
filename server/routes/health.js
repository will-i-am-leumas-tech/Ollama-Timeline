import { Router } from 'express';
import { getAppConfig } from '../services/config.js';

const router = Router();

router.get('/', async (_req, res) => {
  const config = await getAppConfig();
  res.json({ ok: true, rootPath: config.rootPath });
});

export default router;
