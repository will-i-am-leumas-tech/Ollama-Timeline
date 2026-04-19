import { promises as fs } from 'fs';
import path from 'path';

const STORE_PATH = path.resolve(process.cwd(), 'data/index.json');

export async function readStore() {
  const raw = await fs.readFile(STORE_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function writeStore(data) {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2));
  return data;
}
