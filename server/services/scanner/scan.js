import { promises as fs } from 'fs';
import path from 'path';
import { getAppConfig } from '../config.js';
import { readStore, writeStore } from '../store.js';
import { normalizePath } from '../../utils/paths.js';
import { basenameSafe } from '../../utils/paths.js';
import { compileIgnoreMatchers, shouldIgnorePath } from './ignore.js';
import { detectProjectMarkers } from './project.js';

async function getFileMetadata(filePath) {
  const stats = await fs.stat(filePath);
  return {
    absolutePath: normalizePath(filePath),
    name: path.basename(filePath),
    extension: path.extname(filePath),
    sizeBytes: stats.size,
    mtime: stats.mtime.toISOString(),
    ctime: stats.ctime.toISOString()
  };
}

function summarizeFolder(folderPath, files = [], entryNames = []) {
  const markers = detectProjectMarkers(entryNames);
  const extensionCounts = new Map();

  for (const file of files) {
    const ext = file.extension || '[none]';
    extensionCounts.set(ext, (extensionCounts.get(ext) || 0) + 1);
  }

  const topExtensions = [...extensionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ext]) => ext);

  const latestMtime = files
    .map((file) => file.mtime)
    .sort()
    .at(-1) || null;

  return {
    folderPath: normalizePath(folderPath),
    folderName: basenameSafe(folderPath),
    fileCount: files.length,
    lastModifiedAt: latestMtime,
    isProjectRoot: markers.isProjectRoot,
    markers: markers.markers,
    topExtensions
  };
}

async function walkDirectoryRecursive(rootPath, options = {}) {
  const { matchers = [], maxDepth = -1 } = options;
  const files = [];
  const folders = [];
  let foldersIgnored = 0;

  async function walk(currentDir, currentDepth = 0) {
    const normalizedDir = normalizePath(currentDir);
    if (shouldIgnorePath(normalizedDir, matchers)) {
      foldersIgnored += 1;
      return;
    }

    let entries = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    const entryNames = entries.map((entry) => entry.name);
    const localFiles = [];

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const normalizedFullPath = normalizePath(fullPath);

      if (entry.isDirectory()) {
        const isIgnored = shouldIgnorePath(normalizedFullPath, matchers) || shouldIgnorePath(entry.name, matchers);
        if (isIgnored) {
          foldersIgnored += 1;
          continue;
        }
        
        if (maxDepth === -1 || currentDepth < maxDepth) {
          await walk(fullPath, currentDepth + 1);
        }
      } else if (entry.isFile()) {
        try {
          const meta = await getFileMetadata(fullPath);
          files.push(meta);
          localFiles.push(meta);
        } catch {
          // Skip unreadable file
        }
      }
    }

    folders.push(summarizeFolder(currentDir, localFiles, entryNames));
  }

  await walk(rootPath);
  return { folders, files, foldersIgnored };
}

function buildEvents(previousStore, nextFolders) {
  const previousByPath = new Map((previousStore.folders || []).map((folder) => [folder.folderPath, folder]));
  const now = new Date().toISOString();
  const events = [];

  for (const folder of nextFolders) {
    const previous = previousByPath.get(folder.folderPath);
    if (!previous) {
      events.push({
        id: `${folder.folderPath}:${now}:new`,
        eventType: 'folder_discovered',
        folderPath: folder.folderPath,
        summary: `New folder indexed: ${folder.folderName}`,
        detectedAt: now
      });
      continue;
    }

    if (previous.lastModifiedAt !== folder.lastModifiedAt || previous.fileCount !== folder.fileCount) {
      const projectLabel = folder.isProjectRoot ? 'project' : 'folder';
      events.push({
        id: `${folder.folderPath}:${now}:changed`,
        eventType: 'folder_changed',
        folderPath: folder.folderPath,
        summary: `Recent ${projectLabel} activity in ${folder.folderName} (${folder.fileCount} direct files)` ,
        detectedAt: now
      });
    }
  }

  return events;
}

export async function scanRootDirectory(options = {}) {
  const config = await getAppConfig();
  const rootPath = options.rootPath || config.rootPath;
  const ignorePatterns = options.ignorePatterns || config.ignorePatterns || [];
  const scanDepth = options.scanDepth !== undefined ? options.scanDepth : (config.scanDepth !== undefined ? config.scanDepth : -1);
  const matchers = compileIgnoreMatchers(ignorePatterns);

  const started = Date.now();
  const previousStore = await readStore();
  const { folders, files, foldersIgnored } = await walkDirectoryRecursive(rootPath, { matchers, maxDepth: scanDepth });
  const events = buildEvents(previousStore, folders);

  const nextStore = {
    rootPath: normalizePath(rootPath),
    folders,
    files,
    events: [...events, ...(previousStore.events || [])].slice(0, 500),
    lastScanAt: new Date().toISOString()
  };

  await writeStore(nextStore);

  return {
    rootPath: normalizePath(rootPath),
    foldersScanned: folders.length,
    filesScanned: files.length,
    foldersIgnored,
    eventsCreated: events.length,
    durationMs: Date.now() - started
  };
}

export { getFileMetadata, summarizeFolder, walkDirectoryRecursive };
