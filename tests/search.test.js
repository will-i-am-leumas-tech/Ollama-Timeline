import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'fs';
import path from 'path';
import { searchRecentWork } from '../server/services/search.js';

const storePath = path.resolve(process.cwd(), 'data/index.json');
const original = await fs.readFile(storePath, 'utf8');

test('searches folders and events', async () => {
  await fs.writeFile(storePath, JSON.stringify({
    rootPath: '/tmp',
    folders: [{ folderName: 'demo-app', folderPath: '/tmp/demo-app', lastModifiedAt: new Date().toISOString(), topExtensions: ['.js'] }],
    files: [],
    events: [{ summary: 'Recent project activity in demo-app', folderPath: '/tmp/demo-app', detectedAt: new Date().toISOString() }],
    lastScanAt: new Date().toISOString()
  }, null, 2));

  const result = await searchRecentWork('demo');
  assert.equal(result.folders.length, 1);
  assert.equal(result.events.length, 1);
});

test.after(async () => {
  await fs.writeFile(storePath, original);
});
