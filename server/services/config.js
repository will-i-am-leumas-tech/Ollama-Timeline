import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), 'config/app.config.json');

export async function getAppConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function updateAppConfig(partial = {}) {
  const current = await getAppConfig();
  const next = { ...current, ...partial };
  await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2));
  return next;
}
