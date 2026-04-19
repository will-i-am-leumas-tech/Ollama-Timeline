import { Router } from 'express';
import { scanRootDirectory } from '../services/scanner/scan.js';

const router = Router();

router.post('/', async (req, res) => {
  res.json(await scanRootDirectory(req.body || {}));
});

export default router;
