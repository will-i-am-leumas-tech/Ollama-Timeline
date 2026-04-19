const state = {
  view: 'timeline',
  config: {},
  timeline: [],
  folders: [],
  selectedItem: null,
  isScanning: false,
  scanDepth: -1 // -1 for deep, 1 for shallow
};

// --- DOM Selectors ---
const els = {
  feed: document.getElementById('feed'),
  viewTitle: document.querySelector('#viewTitle h2'),
  statusText: document.getElementById('statusText'),
  statusDot: document.getElementById('statusDot'),
  currentRootPath: document.getElementById('currentRootPath'),
  searchInput: document.getElementById('searchInput'),
  searchBar: document.getElementById('searchBar'),
  depthToggleBtn: document.getElementById('depthToggleBtn'),
  detailsContent: document.getElementById('detailsContent'),
  detailsPanel: document.getElementById('detailsPanel'),
  summaryBox: document.getElementById('summaryBox'),
  questionInput: document.getElementById('questionInput'),
  settingsOverlay: document.getElementById('settingsOverlay'),
  rootPathInput: document.getElementById('rootPathInput'),
  ignorePatternsInput: document.getElementById('ignorePatternsInput'),
  ollamaUrlInput: document.getElementById('ollamaUrlInput'),
  modelSelect: document.getElementById('modelSelect')
};

// --- Core API Helpers ---
async function json(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

// --- UI Rendering ---
function renderCard(title, subtitle, summary, timestamp, data, type) {
  const card = document.createElement('div');
  card.className = 'card';
  if (state.selectedItem === data) card.classList.add('selected');

  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${title}</div>
      <div class="card-time">${timestamp || ''}</div>
    </div>
    <div class="card-path">${subtitle || ''}</div>
    <div class="card-summary">${summary || ''}</div>
  `;

  card.onclick = () => selectItem(data, type);
  return card;
}

function selectItem(item, type) {
  state.selectedItem = item;
  els.detailsPanel.classList.add('open');
  
  // Update selection visually in the feed
  document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
  
  let html = '';
  if (type === 'event') {
    html = `
      <div class="detail-group">
        <label class="small muted">Event Type</label>
        <div class="card-title">${item.eventType}</div>
      </div>
      <div class="detail-group">
        <label class="small muted">Folder Path</label>
        <div class="card-path">${item.folderPath}</div>
      </div>
      <div class="detail-group">
        <label class="small muted">Detected At</label>
        <div class="card-time">${new Date(item.detectedAt).toLocaleString()}</div>
      </div>
      <div class="detail-group">
        <label class="small muted">Summary</label>
        <p>${item.summary}</p>
      </div>
    `;
  } else {
    html = `
      <div class="detail-group">
        <label class="small muted">Folder Name</label>
        <div class="card-title">${item.folderName}</div>
      </div>
      <div class="detail-group">
        <label class="small muted">Full Path</label>
        <div class="card-path">${item.folderPath}</div>
      </div>
      <div class="detail-group">
        <label class="small muted">Stats</label>
        <div class="small">Files: ${item.fileCount}</div>
        <div class="small">Last Modified: ${new Date(item.lastModifiedAt).toLocaleString()}</div>
        ${item.isProjectRoot ? '<div class="btn-accent small" style="display:inline-block; padding: 2px 6px; margin-top:8px">🚀 Project Root</div>' : ''}
      </div>
      <div class="detail-group" style="margin-top:16px">
        <label class="small muted">Markers</label>
        <div class="small">${item.markers?.join(', ') || 'none'}</div>
      </div>
      <div class="detail-group" style="margin-top:16px">
        <label class="small muted">Top Extensions</label>
        <div class="small">${item.topExtensions?.join(', ') || 'none'}</div>
      </div>
    `;
  }
  
  els.detailsContent.innerHTML = html;
}

async function updateFeed() {
  els.feed.innerHTML = '';
  
  if (state.view === 'timeline') {
    const data = await json('/api/timeline?limit=50');
    state.timeline = data;
    if (!data.length) {
      els.feed.innerHTML = '<div class="empty-state">No timeline events. Run a scan.</div>';
    } else {
      data.forEach(item => {
        els.feed.appendChild(renderCard(item.eventType, item.folderPath, item.summary, new Date(item.detectedAt).toLocaleTimeString(), item, 'event'));
      });
    }
  } else if (state.view === 'folders') {
    const data = await json('/api/folders/recent?limit=50');
    state.folders = data;
    if (!data.length) {
      els.feed.innerHTML = '<div class="empty-state">No folders indexed.</div>';
    } else {
      data.forEach(item => {
        els.feed.appendChild(renderCard(item.folderName, item.folderPath, `Contains ${item.fileCount} files`, item.lastModifiedAt ? new Date(item.lastModifiedAt).toLocaleDateString() : 'unknown', item, 'folder'));
      });
    }
  }
}

// --- Actions ---
async function runScan() {
  if (state.isScanning) return;
  state.isScanning = true;
  els.statusText.textContent = 'Scanning System...';
  els.statusDot.style.background = '#fbbf24';
  els.statusDot.style.boxShadow = '0 0 8px #fbbf24';

  try {
    const result = await json('/api/scan', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ scanDepth: state.scanDepth }) 
    });
    els.statusText.textContent = `Scanned ${result.foldersScanned} folders`;
    await updateFeed();
  } catch (err) {
    els.statusText.textContent = 'Scan Failed';
  } finally {
    state.isScanning = false;
    els.statusDot.style.background = '#10b981';
    els.statusDot.style.boxShadow = '0 0 8px #10b981';
  }
}

async function runSearch() {
  const q = els.searchInput.value.trim();
  if (!q) {
    updateFeed();
    return;
  }
  
  els.statusText.textContent = 'Searching...';
  const result = await json(`/api/search?q=${encodeURIComponent(q)}`);
  els.feed.innerHTML = '';
  
  if (state.view === 'timeline') {
    (result.events || []).forEach(item => {
      els.feed.appendChild(renderCard(item.eventType, item.folderPath, item.summary, new Date(item.detectedAt).toLocaleTimeString(), item, 'event'));
    });
  } else {
    (result.folders || []).forEach(item => {
      els.feed.appendChild(renderCard(item.folderName, item.folderPath, `Contains ${item.fileCount} files`, item.lastModifiedAt ? new Date(item.lastModifiedAt).toLocaleDateString() : 'unknown', item, 'folder'));
    });
  }
  
  els.statusText.textContent = `Found ${result.events?.length || 0} events, ${result.folders?.length || 0} folders`;
}

async function loadConfig() {
  state.config = await json('/api/config');
  state.scanDepth = state.config.scanDepth !== undefined ? state.config.scanDepth : -1;
  updateDepthUI();

  els.currentRootPath.textContent = state.config.rootPath || 'Not set';
  els.rootPathInput.value = state.config.rootPath || '';
  els.ignorePatternsInput.value = (state.config.ignorePatterns || []).join(', ');
  els.ollamaUrlInput.value = state.config.ollamaBaseUrl || '';
  
  await loadModels();
}

async function loadModels() {
  try {
    const models = await json('/api/ollama/models');
    els.modelSelect.innerHTML = '';
    if (!models || models.length === 0) {
      els.modelSelect.innerHTML = '<option value="">No models found (Check Ollama)</option>';
      return;
    }
    
    models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = m.name;
      if (m.name === state.config.ollamaModel) opt.selected = true;
      els.modelSelect.appendChild(opt);
    });
  } catch (err) {
    els.modelSelect.innerHTML = '<option value="">Error connecting to Ollama</option>';
  }
}

async function updateDepthUI() {
  if (state.scanDepth === 1) {
    els.depthToggleBtn.classList.add('active');
    els.depthToggleBtn.title = 'Shallow Scan Active (Children Only)';
  } else {
    els.depthToggleBtn.classList.remove('active');
    els.depthToggleBtn.title = 'Deep Scan Active (Recursive)';
  }
}

async function saveConfig() {
  const rootPath = els.rootPathInput.value.trim();
  const ignorePatterns = els.ignorePatternsInput.value.split(',').map(s => s.trim()).filter(Boolean);
  const ollamaBaseUrl = els.ollamaUrlInput.value.trim();
  const ollamaModel = els.modelSelect.value;
  
  await json('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rootPath, ignorePatterns, ollamaBaseUrl, ollamaModel })
  });
  
  els.settingsOverlay.classList.add('hidden');
  await loadConfig();
  await runScan();
}

async function askQuestion() {
  const question = els.questionInput.value.trim() || 'What did I work on recently?';
  els.summaryBox.textContent = 'Consulting Intelligence...';
  
  const result = await json('/api/ollama/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  
  els.summaryBox.textContent = result.answer || 'No response from intelligence.';
}

// --- Event Listeners ---
els.depthToggleBtn.onclick = async () => {
  state.scanDepth = state.scanDepth === 1 ? -1 : 1;
  updateDepthUI();
  await json('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanDepth: state.scanDepth })
  });
};

document.getElementById('scanBtn').onclick = runScan;
document.getElementById('searchBtn').onclick = runSearch;
document.getElementById('askBtn').onclick = askQuestion;

document.getElementById('searchToggleBtn').onclick = () => {
  els.searchBar.classList.toggle('hidden');
  if (!els.searchBar.classList.contains('hidden')) els.searchInput.focus();
};

document.getElementById('settingsToggleBtn').onclick = () => els.settingsOverlay.classList.remove('hidden');
document.getElementById('closeSettingsBtn').onclick = () => els.settingsOverlay.classList.add('hidden');
document.getElementById('saveConfigBtn').onclick = saveConfig;
document.getElementById('closeDetailsBtn').onclick = () => els.detailsPanel.classList.remove('open');

document.querySelectorAll('.rail-item').forEach(item => {
  item.onclick = () => {
    document.querySelectorAll('.rail-item').forEach(r => r.classList.remove('active'));
    item.classList.add('active');
    state.view = item.dataset.view;
    els.viewTitle.textContent = state.view === 'timeline' ? 'Recent Timeline' : (state.view === 'folders' ? 'Recent Folders' : 'Intelligence');
    updateFeed();
  };
});

// --- Initial Load ---
(async () => {
  await loadConfig();
  await updateFeed();
})();
