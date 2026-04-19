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
  let baseUrl = config.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  
  // Normalize localhost to 127.0.0.1 for more reliable Node.js fetch
  baseUrl = baseUrl.replace('localhost', '127.0.0.1').replace(/\/$/, '');
  
  try {
    console.log(`[Ollama] Fetching models from ${baseUrl}/api/tags...`);
    const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      console.error(`[Ollama] Failed to fetch models: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    console.log(`[Ollama] Found ${data.models?.length || 0} models.`);
    return data.models || [];
  } catch (err) {
    console.error(`[Ollama] Error connecting to Ollama at ${baseUrl}:`, err.message);
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

  let baseUrl = config.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  baseUrl = baseUrl.replace('localhost', '127.0.0.1').replace(/\/$/, '');
  
  const model = config.ollamaModel || process.env.OLLAMA_MODEL || 'llama3';
  if (!baseUrl) return fallback;

  try {
    console.log(`[Ollama] Sending prompt to ${baseUrl}/api/generate using model ${model}...`);
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${context.contextText}\n\nAnswer briefly and only using the provided context.`,
        stream: false
      }),
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      console.error(`[Ollama] Generation failed: ${response.status} ${response.statusText}`);
      return fallback;
    }
    const data = await response.json();
    return {
      answer: data.response || fallback.answer,
      referencedFolders: context.referencedFolders
    };
  } catch (err) {
    console.error(`[Ollama] Error during generation:`, err.message);
    return fallback;
  }
}
