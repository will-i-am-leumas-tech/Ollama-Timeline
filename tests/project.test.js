import test from 'node:test';
import assert from 'node:assert/strict';
import { detectProjectMarkers } from '../server/services/scanner/project.js';

test('detects likely project root markers', () => {
  const result = detectProjectMarkers(['package.json', 'README.md', 'src']);
  assert.equal(result.isProjectRoot, true);
  assert.deepEqual(result.markers, ['package.json', 'README.md']);
});
