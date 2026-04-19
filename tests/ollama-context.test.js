import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'fs';
import path from 'path';
import { buildRecentWorkContext } from '../server/services/ollama.js';

const storePath = path.resolve(process.cwd(), 'data/index.json');
const original = await fs.readFile(storePath, 'utf8');

test('builds compact recent work context', async () => {
  await fs.writeFile(storePath, JSON.stringify({
    rootPath: '/tmp',
    folders: [{ folderName: 'alpha', folderPath: '/tmp/alpha', lastModifiedAt: new Date().toISOString(), topExtensions: ['.js'] }],
    files: [],
    events: [{ summary: 'Recent project activity in alpha', folderPath: '/tmp/alpha', detectedAt: new Date().toISOString() }],
    lastScanAt: new Date().toISOString()
  }, null, 2));

  const result = await buildRecentWorkContext('What did I work on?');
  assert.match(result.contextText, /alpha/);
  assert.equal(result.referencedFolders[0], '/tmp/alpha');
});

test.after(async () => {
  await fs.writeFile(storePath, original);
});
