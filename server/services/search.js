import { readStore } from './store.js';

export async function searchRecentWork(query = '') {
  const q = String(query).trim().toLowerCase();
  const store = await readStore();
  if (!q) {
    return { folders: [], events: [] };
  }

  const folders = (store.folders || []).filter((folder) =>
    folder.folderName.toLowerCase().includes(q) || folder.folderPath.toLowerCase().includes(q)
  ).slice(0, 25);

  const events = (store.events || []).filter((event) =>
    event.summary.toLowerCase().includes(q) || event.folderPath.toLowerCase().includes(q)
  ).slice(0, 25);

  return { folders, events };
}
