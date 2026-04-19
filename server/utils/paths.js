import path from 'path';

export function normalizePath(inputPath = '') {
  const normalized = String(inputPath).replace(/\\+/g, '/').replace(/\/+/g, '/');
  return normalized.endsWith('/') && normalized.length > 1 ? normalized.slice(0, -1) : normalized;
}

export function basenameSafe(inputPath = '') {
  return path.basename(inputPath || '');
}
