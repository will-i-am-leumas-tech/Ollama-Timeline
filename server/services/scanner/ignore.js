import { normalizePath } from '../../utils/paths.js';

export function compileIgnoreMatchers(ignorePatterns = []) {
  return ignorePatterns
    .map((value) => normalizePath(String(value).trim()).toLowerCase())
    .filter(Boolean);
}

export function shouldIgnorePath(targetPath, matchers = []) {
  const normalized = normalizePath(targetPath).toLowerCase();
  return matchers.some((pattern) => {
    if (normalized === pattern) return true;
    if (normalized.endsWith('/' + pattern)) return true;
    if (normalized.includes('/' + pattern + '/')) return true;
    return false;
  });
}
