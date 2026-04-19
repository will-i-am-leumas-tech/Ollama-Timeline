# GOAL.functions.md — Functional Companion

## Core functions already scaffolded

### Config
- `getAppConfig()`
- `updateAppConfig(partial)`
- `normalizePath(inputPath)`

### Ignore system
- `compileIgnoreMatchers(ignorePatterns)`
- `shouldIgnorePath(targetPath, matchers)`

### Scanner
- `scanRootDirectory(options)`
- `walkDirectoryRecursive(rootPath, options)`
- `getFileMetadata(filePath)`
- `detectProjectMarkers(entryNames)`
- `summarizeFolder(folderPath, files, entryNames)`

### Timeline + recent work
- `getTimelineFeed({ limit })`
- `getRecentFolders({ limit })`
- `buildRecentWorkSummary({ limit })`

### Search
- `searchRecentWork(query)`

### Ollama
- `buildRecentWorkContext(question, { limit })`
- `askOllamaAboutRecentWork(question)`

## Codex focus
Codex should preserve the existing service boundaries and improve internals only where useful.
