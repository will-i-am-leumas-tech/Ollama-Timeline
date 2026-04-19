import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIgnoreMatchers, shouldIgnorePath } from '../server/services/scanner/ignore.js';

test('should ignore nested node_modules directory', () => {
  const matchers = compileIgnoreMatchers(['node_modules', '.git', 'dist']);
  assert.equal(shouldIgnorePath('/tmp/app/node_modules/react', matchers), true);
  assert.equal(shouldIgnorePath('/tmp/app/src', matchers), false);
});
