# Leumas Folder Timeline 📡

A premium, HUD-inspired local development console that turns your project activity into a searchable, AI-aware timeline.

## 🧠 The Problem It Solves

As developers, we often jump between dozens of projects, microservices, and experiments. Standard file explorers are static, and IDE "recent" lists only show files—not the **activity pulse** of the project itself.

**Leumas Folder Timeline** solves this by:
- **Bridging the Context Gap:** It tracks "heat" in your directories, showing you exactly where you've been working.
- **Powering Local AI:** It builds lightweight metadata of your recent work to give **Ollama** (or other local LLMs) real-world context about your day.
- **Reducing Search Fatigue:** It filters out the noise (`node_modules`, `dist`, `.git`) so you only see the projects that matter.

---

## ✨ Features

- **Futuristic HUD Interface:** A dark, minimalistic, high-density dashboard designed for developers.
- **Smart Activity Feed:** Groups recent folder changes into a rhythmic timeline of "events."
- **Shallow vs. Deep Scanning:** 
  - 🎯 **Shallow Mode:** Only scans immediate children (perfect for a high-level overview of your `projects/` folder).
  - 🔄 **Deep Mode:** Full recursive indexing for detailed activity tracking.
- **Local Intelligence (Ollama):** Ask questions like *"What did I work on this morning?"* and get answers grounded in your actual folder metadata.
- **Advanced Filtering:** Dynamic ignore patterns to keep your index clean and fast.
- **Project Detection:** Automatically identifies project roots by looking for markers like `package.json`, `.git`, or `Cargo.toml`.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v20 or higher)
- **Ollama** (Optional, for "Intelligence" features)

### 2. Installation
```bash
git clone <repo-url>
cd timeline-folder
npm install
```

### 3. Launch
```bash
npm start
```
Open [http://localhost:3027](http://localhost:3027) in your browser.

---

## ⚙️ Usage Guide

### Configuring Your Root
1. Click the **Settings (⚙️)** icon in the top bar.
2. Enter the **Root Directory** you want to monitor (e.g., `C:\Users\You\Projects`).
3. Add any **Ignore Patterns** (comma-separated) like `tmp, logs, build`.
4. Save to trigger an initial scan.

### Navigating the HUD
- **Timeline (🕒):** Your main feed of recent "folder discovered" or "folder changed" events.
- **Folders (📂):** A directory of all indexed projects with metadata (file counts, last modified).
- **Intelligence (🧠):** Type a question in the sidebar and click **Ask Ollama** to query your local work context.
- **Search (🔍):** Quickly filter events or folders by name or path.
- **Depth Toggle (🎯):** Toggle between Shallow (children only) and Deep (recursive) scanning.

---

## 🛠️ Technical Details
- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS + CSS (Custom HUD Theme)
- **Persistence:** Lightweight JSON store (`data/index.json`)
- **AI Integration:** Local Ollama API (defaulting to `llama3`)

---

## 📜 License
MIT
