---
slug: alpaca-bot
title: Algorithmic Options Scalping Bot
year: 2026
company: Personal
stack: [Python, Alpaca MCP Server v2, Supabase, yfinance, Cloudflare R2, Parquet]
status: paper-trading
links:
  github: 
cover: /projects/alpaca-bot/cover.png
weight: 7
---

## Summary

Automated intraday options scalping system based on a trading strategy a friend taught me — Greeks filtering, implied volatility cutoffs, specific chart setups. Currently in paper trading mode while I validate signal quality before any real money goes in.

## Stack

- **Execution** — Alpaca MCP Server V2 (67 tools, all working): order placement, position management
- **Data** — Alpaca's free tier already provides Greeks and IV via MCP, which collapsed what I'd planned as a multi-source pipeline
- **Screening** — yfinance for liquid options universe filtering
- **State** — Supabase, 11-table schema in `001_trading_schema.sql`
- **Historical archive** — Cloudflare R2 with Parquet for backtest data
- **Orchestration** — scheduled ETL jobs in Python

## Where I am

Infrastructure is solid. The MCP server integration was the biggest unknown going in and it's working cleanly. I've also explored crypto as a sandbox to validate the infrastructure before committing fully to US equity options — same shape, fewer regulatory edge cases for personal testing.

Live signal quality is the open question. Paper trading lets me see real fills and slippage assumptions without exposure.

## What I learned

The MCP-first design choice paid off. I started this thinking I'd write custom Alpaca SDK wrappers; the MCP server does that and more, and Claude can drive it directly. Less code to maintain.

Building infrastructure for someone else's strategy is a different exercise than designing your own. The strategy logic is opinionated and I'm executing it faithfully — the architecture has to enforce the discipline that I personally would relax.
