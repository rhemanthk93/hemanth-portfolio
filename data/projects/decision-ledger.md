---
slug: decision-ledger
title: Decision Ledger
year: 2026
company: Personal — Anthropic + Genspark hackathon
stack: [Claude Sonnet 4.6, Claude Haiku 4.5, Supabase, pgvector, Python]
status: completed
links:
  github: 
  writeup: 
cover: /projects/decision-ledger/cover.png
weight: 9
---

## Summary

A multi-agent AI pipeline that ingests organizational documents, extracts decisions, clusters them by topic, detects silent reversals — where a later decision quietly contradicts an earlier one — and narrates the findings to users. Built for the Anthropic + Genspark hackathon on 24 April 2026 in Singapore.

## Problem

Organizations make thousands of decisions across documents — meeting notes, RFCs, Slack threads, project briefs. Most never get tracked, often quietly reversed, and become impossible to audit. By the time someone asks "wait, didn't we decide X?", the original context is buried.

Decision Ledger surfaces this layer. Given a corpus, it extracts every decision, attributes it to a date and source, clusters related ones by topic, and flags the moments where the org silently changed direction.

## Architecture

Built around a fictional Singapore CDP called Meridian Labs to give the demo a concrete narrative.

- **Ingestion** — 14-document mock corpus covering board minutes, product RFCs, ops decisions, hiring notes
- **Extraction agent** (Sonnet 4.6) — pulls structured decision objects from each document: actor, decision, justification, date
- **Clustering** — pgvector with HNSW similarity over decision embeddings to group by topic
- **Reversal detection** — a separate sub-agent compares chronologically adjacent decisions in each cluster, flags contradictions
- **Narration agent** — generates a human-readable timeline summary of the findings

Schema follows medallion architecture (bronze → silver → gold) with explicit data lineage. Companion PDF reference guide documents the schema for replication.

## What I learned

The interesting failure mode wasn't extraction — Sonnet handles that well — it was clustering. Decision documents share boilerplate (preambles, attendee lists) that drown out the topical signal. Solution: extract decisions first, embed only the decision text, not the surrounding context.

Sub-agent specialization beats one super-prompt. The narration agent and the reversal detection agent had genuinely different jobs and benefited from different system prompts, temperatures, and context shapes.

The hackathon constraint forced honest scope discipline. Without it I'd have spent another week on the schema; instead, I shipped a working pipeline.
