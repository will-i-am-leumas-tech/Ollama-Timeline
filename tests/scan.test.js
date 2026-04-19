import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { scanRootDirectory } from '../server/services/scanner/scan.js';

const configPath = path.resolve(process.cwd(), 'config/app.config.json');
const storePath = path.resolve(process.cwd(), 'data/index.json');
const originalConfig = await fs.readFile(configPath, 'utf8');
const originalStore = await fs.readFile(storePath, 'utf8');

test('scan indexes folders and skips ignored directories', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'folder-timeline-'));
  await fs.mkdir(path.join(tempRoot, 'project-a'));
  await fs.writeFile(path.join(tempRoot, 'project-a', 'package.json'), '{"name":"a"}');
  await fs.mkdir(path.join(tempRoot, 'node_modules'));
  await fs.writeFile(path.join(tempRoot, 'node_modules', 'big.js'), 'x');

  await fs.writeFile(configPath, JSON.stringify({
    rootPath: tempRoot,
    ignorePatterns: ['node_modules', '.git', 'dist'],
    watchEnabled: false,
    maxTimelineResults: 100,
    recentWindowDays: 7,
    ollamaModel: 'llama3'
  }, null, 2));

  const result = await scanRootDirectory();
  assert.equal(result.foldersScanned >= 2, true);
  assert.equal(result.foldersIgnored >= 1, true);

  const store = JSON.parse(await fs.readFile(storePath, 'utf8'));
  assert.equal(store.folders.some((folder) => folder.folderName === 'project-a'), true);
  assert.equal(store.folders.some((folder) => folder.folderName === 'node_modules'), false);
});

test.after(async () => {
  await fs.writeFile(configPath, originalConfig);
  await fs.writeFile(storePath, originalStore);
});
