# GOAL.md — Leumas Folder Timeline

Build a lightweight, fast, attractive local app that scans a configurable root directory and presents recent folder/project activity as a clean timeline.

## Primary outcomes
- see what folders changed most recently
- see what projects have been active lately
- search indexed recent work
- inspect folder details quickly
- ask Ollama simple questions about recent work context

## Requirements
- configurable root path
- dynamic ignore list
- efficient recursive scanning
- folder-first timeline UI
- lightweight persistence
- simple local AI hook

## Current starter implementation already included
This repo already contains:
- Express server
- static frontend
- config system
- recursive scanner
- ignore logic
- project root detection
- JSON persistence layer
- timeline/search/folder APIs
- lightweight Ollama context builder
- Node test suite

## What Codex should improve, not reinvent
- tighten UI polish
- add stronger summaries
- optionally swap JSON persistence to SQLite
- add watcher mode
- expand tests
- optimize large-tree scanning

## Definition of done
- app runs locally
- scan works on chosen root path
- ignored folders are skipped
- timeline shows recent activity
- details view works
- search works
- Ollama ask route returns grounded answers from indexed context
- tests pass
