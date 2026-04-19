import { readStore } from './store.js';

export async function getTimelineFeed({ limit = 50 } = {}) {
  const store = await readStore();
  return (store.events || []).slice(0, Number(limit));
}

export async function getRecentFolders({ limit = 20 } = {}) {
  const store = await readStore();
  return [...(store.folders || [])]
    .sort((a, b) => String(b.lastModifiedAt || '').localeCompare(String(a.lastModifiedAt || '')))
    .slice(0, Number(limit));
}

export async function getFolderDetails(folderPath) {
  const store = await readStore();
  const folder = (store.folders || []).find((item) => item.folderPath === folderPath);
  const files = (store.files || []).filter((item) => item.absolutePath.startsWith(folderPath + '/')).slice(0, 100);
  return { folder, files };
}

export async function buildRecentWorkSummary({ limit = 10 } = {}) {
  const folders = await getRecentFolders({ limit });
  const extensionCounts = new Map();
  for (const folder of folders) {
    for (const ext of folder.topExtensions || []) {
      extensionCounts.set(ext, (extensionCounts.get(ext) || 0) + 1);
    }
  }
  const dominantExtensions = [...extensionCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ext]) => ext);
  return {
    totalActiveFolders: folders.length,
    dominantExtensions,
    mostActiveFolders: folders.slice(0, 5).map((folder) => folder.folderPath),
    summaryText: folders.length
      ? `Recent work is concentrated in ${folders.slice(0, 3).map((folder) => folder.folderName).join(', ')}.`
      : 'No indexed work yet. Run a scan first.'
  };
}
