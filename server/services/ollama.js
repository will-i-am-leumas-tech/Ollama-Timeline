import { buildRecentWorkSummary, getRecentFolders, getTimelineFeed } from './timeline.js';
import { getAppConfig } from './config.js';

export async function buildRecentWorkContext(question, { limit = 8 } = {}) {
  const folders = await getRecentFolders({ limit });
  const events = await getTimelineFeed({ limit });
  const summary = await buildRecentWorkSummary({ limit });

  const contextText = [
    'You are answering questions about recent local development activity.',
    `Question: ${question}`,
    '',
    `Summary: ${summary.summaryText}`,
    '',
    'Recent folders:',
    ...folders.map((folder, index) => `${index + 1}. ${folder.folderName} | ${folder.folderPath} | ${folder.lastModifiedAt || 'unknown'}`),
    '',
    'Recent events:',
    ...events.map((event, index) => `${index + 1}. ${event.detectedAt} | ${event.summary}`)
  ].join('\n');

  return {
    contextText,
    referencedFolders: folders.map((folder) => folder.folderPath)
  };
}

export async function getAvailableModels() {
  const config = await getAppConfig();
  const baseUrl = config.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models || [];
  } catch {
    return [];
  }
}

export async function askOllamaAboutRecentWork(question) {
  const context = await buildRecentWorkContext(question);
  const config = await getAppConfig();
  const fallback = {
    answer: context.referencedFolders.length
      ? `Based on the current index, your most recent work appears to involve ${context.referencedFolders.slice(0, 3).join(', ')}.`
      : 'There is no indexed work yet. Run a scan first.',
    referencedFolders: context.referencedFolders
  };

  const baseUrl = config.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = config.ollamaModel || process.env.OLLAMA_MODEL || 'llama3';
  if (!baseUrl) return fallback;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${context.contextText}\n\nAnswer briefly and only using the provided context.`,
        stream: false
      })
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return {
      answer: data.response || fallback.answer,
      referencedFolders: context.referencedFolders
    };
  } catch {
    return fallback;
  }
}
