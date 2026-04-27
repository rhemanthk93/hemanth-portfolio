---
slug: raxtor
title: OpenClaw — Raxtor
year: 2025-present
company: Personal
stack: [OpenClaw, Claude Sonnet 4.6, Claude Haiku 4.5, Ollama, Telegram, Cloudflare, Mac Mini M4]
status: active
links:
  github: 
cover: /projects/raxtor/cover.png
weight: 10
---

## Summary

An always-on autonomous AI agent running on a Mac Mini M4 in my study. Communicates through Telegram. Hosts public services via Cloudflare tunnels. Built on the OpenClaw framework, originally inspired by Mani Kanasani's 10-hour OpenClaw masterclass.

## Architecture

- **Orchestrator brain** — Claude Sonnet 4.6: receives messages, plans, delegates
- **Sub-agents** — Claude Haiku 4.5: handles narrower sub-tasks (file edits, expense logging, dashboard updates)
- **Background tasks** — Ollama llama3.2:3b: heartbeats and trivial work, no API spend
- **Interface** — Telegram bot: primary I/O on the go
- **Public services** — three Cloudflare-tunneled endpoints:
  - `expenses.raxtor.xyz` — expense tracker
  - `dashboard.raxtor.xyz` — OpenClaw operational dashboard
  - paper-trading bot UI

## Operational notes

The orchestrator-first sub-agent routing pattern is documented in `AGENTS.md`. Delegation rules are explicit — what goes to Haiku, what stays with Sonnet, what gets the local Ollama model. A formal sub-agent retrospective caught two over-delegation patterns; rules tightened accordingly.

One important constraint: Anthropic's flat-rate Max plan is restricted in third-party agent frameworks like OpenClaw. Raxtor's API usage is on a separate billing account.

## What I learned

The most useful thing isn't the agent itself — it's that I now have a 24/7 process running my own infrastructure that I trust. That changes what I'm willing to attempt for personal projects. Ideas like "spin up a paper-trading bot for two weeks and see what happens" become trivial when you already have the host, the tunnels, the Telegram interface, and the orchestrator.

Sub-agent retrospectives are worth doing formally. The improvements I caught in the first one would have taken months to find through casual observation.

OpenClaw isn't perfect, but the local-first model — your data, your machine, your agent — is the right shape for a personal agent. Cloud-only agent platforms are a dead end for anyone who wants real continuity.
