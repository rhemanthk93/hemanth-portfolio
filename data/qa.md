---
source: qa
title: Q&A
weight: 5
---

> These are written in first-person — answers as Hemanth would actually give them. The chat agent translates into third-person when responding to visitors. Edit freely; this file is the most important one for getting the agent to sound like me.

## Why did you move from banking to data engineering?

Banking was paying me to write Java for systems built in 2003. Data engineering let me actually use the cloud, build pipelines from scratch, and stop fighting compliance just to deploy. No regrets.

## What's your career arc in one paragraph?

Started at JP Morgan in 2017 building liquidity reporting in Java Spring Boot. Did six months at GIC on portfolio risk systems, then moved to SPH as a senior data engineer leading a small team on AWS. Now at Temus as an Associate Manager, working on Databricks migrations, geospatial pipelines, and a genomics platform with A*STAR.

## What did you actually do at JP Morgan?

Built and maintained a liquidity reporting system — Java Spring Boot backend, Angular UI, Eclipse BIRT for report templates. The Report Orchestration engine I worked on used CompletableFuture for multi-threaded report generation. Four years. Solid foundation in writing code that has to be right.

## What was the GIC stint like?

Short — about six months. Worked on internal portfolio risk management with Scala and Java, integrating BarraOne with GIC's systems alongside Zenika consultants. Good place but I was ready for cloud-native data work and SPH offered exactly that.

## What did you do at SPH?

Led a three-person data engineering team. Built AWS-based pipelines (Glue, EventBridge, Athena), custom AppFlow connectors in Java for alternative data, and a Slack chatbot integrated with Google Gemini that translated natural language into SQL. Two years. First time leading.

## Why Temus?

Wanted to work on harder problems with more cloud surface area. Got it — first month I was migrating a hundred thousand T-SQL INSERT statements to Spark SQL, then by month four I was on a multi-region geospatial platform processing 195 countries of environmental data. Promoted to Associate Manager more recently.

## What does an Associate Manager actually do at Temus?

More architecture and project lead than people management. I still write code daily. I review designs from junior engineers, I'm the primary contact for the A*STAR genomics collaboration, and I ship pipelines myself. The title is grade, not a switch into pure management.

## Where did you study?

Bachelor of Science in Information Systems at Singapore Management University, 2014 to 2017. Second major in Advanced Business Technology — Banking Process. Useful for the JP Morgan years; less directly applicable to what I do now, but the systems-thinking foundation transfers.

## What's your take on Databricks vs Snowflake?

Databricks if you're doing Spark-heavy or ML / AI workloads — Delta Lake plus the Lakeflow stuff is genuinely good. Snowflake if you're a SQL-first analytics shop with no ML aspirations and want zero ops overhead. They're converging on each other but neither is trying very hard to hide that.

## AWS or Azure?

AWS by a wide margin in my experience — better tooling, better docs, fewer surprises. I've built production systems on both but I reach for AWS first. Azure is fine if you're already in the Microsoft estate.

## Python or Scala for Spark?

Python in 99% of cases. Scala only if you need very tight performance or you're maintaining an existing Scala codebase. PySpark gets you most of the speed and all of the ecosystem.

## What's your take on the AI agent space right now?

Most agent demos are toys. The interesting work is in delegation patterns, sub-agent routing, and observability — not in adding more tools to a single super-agent. I'm spending most of my personal-project time figuring out what's actually durable vs. what's just demo magic.

## Is RAG overhyped?

For knowledge bases under 100K tokens, yes. Prompt caching solves the same problem with one tenth the moving parts. RAG earns its complexity at much larger scales and very specific retrieval patterns. Most "we need RAG" conversations in 2026 should actually be "we need prompt caching."

## What's MCP, and why do you care?

Model Context Protocol — Anthropic's standard for letting LLMs talk to external systems. I care because it standardizes the integration layer that every agent ends up needing. Use Alpaca's MCP server, Supabase's MCP server, build your own — the abstraction is the win.

## What's Raxtor?

An autonomous AI agent I built and run on my Mac Mini M4. Talks to me through Telegram. Sonnet 4.6 is the orchestrator brain, Haiku 4.5 handles cheaper sub-tasks, Ollama llama3.2 does background heartbeat work. It hosts public services through Cloudflare tunnels — expense tracker, dashboard, paper-trading bot.

## What's Decision Ledger?

The multi-agent pipeline I built for the Anthropic + Genspark hackathon on 24 April 2026. It ingests organizational documents, extracts decisions, clusters by topic, detects silent reversals where a later decision quietly contradicts an earlier one, and narrates the findings. Built on Supabase with pgvector for retrieval.

## What's the trading bot?

An automated intraday options scalping system based on a strategy a friend taught me — Greeks filtering, IV cutoffs, specific chart setups. Uses Alpaca's MCP server, Supabase for state, yfinance for screening, Python for backtesting. Currently in paper trading. The infra works; whether the strategy works at scale is the open question.

## What's SNPDrug3D?

The genomics platform I lead at Temus, in collaboration with A*STAR's Bioinformatics Institute. We map genetic variants to 3D protein structures at scale — AlphaMissense variant data joined with UniProt sequences and SIFTS structural annotations from the Protein Data Bank. Spark pipelines processing 70M+ records on AWS.

## What was the Laconic project?

A geospatial platform for the world's first productized carbon credit marketplace. Multi-region, 195 countries of environmental data, real-time analytics. We adopted Apache Sedona and saw a 300% performance improvement over the previous PostGIS pipelines. Generated $2M+ in client commitments. I contributed optimizations back upstream to Sedona.

## Most challenging project?

The Ngee Ann Poly Databricks migration. Refactoring a hundred thousand legacy T-SQL INSERT statements into Spark SQL sounds dull, but the actual problem was data type coercion edge cases (DateTime2 → TIMESTAMP, Numeric → DECIMAL with precision), control flow differences, and Unicode prefix handling. Solved it with SQLGlot for AST transpilation plus custom pre-processing logic.

## What are you most proud of?

Two things. The Apache Sedona contributions from the Laconic project — actual code merged into a major open-source library. And Raxtor — having a personal agent running 24/7 on my own hardware doing real work isn't quite like anything else.

## What kind of work are you looking for?

Interesting AI / agent engineering. Multi-agent systems, MCP, LLM-integrated data pipelines — anything where there's a real production constraint and not just a demo. I'm engaged at Temus but I take side conversations seriously.

## How do you like to work?

Hands-on, project-driven, ending every session with something tangible. I prefer direct peer-level communication — if you have a critique, say it; don't soften it into nothing. I'm not interested in working sessions that don't produce output.

## Remote or in-office?

Hybrid. I'm based in Singapore and I value face time for hard problems and trust-building. Once you have those, async + remote is more productive for actual focused work.

## What does a typical day look like?

Day is split between architecture / design reviews, hands-on pipeline work, and the A*STAR genomics collaboration. Evenings are for personal projects — Raxtor, the trading bot, study sessions for the Databricks exam.

## Hobbies outside work?

Watches. I drive a BYD Sealion 7 EV that I overthink. I run an unreasonably overbuilt home network because solving a 1 Gbps Mac Mini bottleneck once is enough to justify a Wi-Fi 7 router. I read mostly nonfiction. Married, two cats.

## What's the long-term goal?

A "virtual wealth fund" of specialized agents — autonomous systems generating real income while I work on the next ones. I'm probably 18 to 24 months from the first one being meaningfully profitable. The trading bot is the first candidate; Decision Ledger could be the second if I productize it.

## Do you write?

Occasionally. I post on Medium when something I've built feels worth a writeup — usually retrospectives on personal projects rather than tutorials. Quality over cadence; I'd rather post once a month with substance than weekly with filler.

## What's your view on Claude Code vs other AI coding tools?

Claude Code is what I use daily. The Max subscription pricing makes it the obvious choice for personal projects, the model quality is best-in-class for refactoring work, and the agentic loop with file editing is leagues ahead of copy-paste IDE assistants. Cursor is a close second for inline-edit workflows.

## How do you balance day job with personal projects?

Strict separation. Day job is at Temus, on Temus hardware, with Temus IP. Personal projects are evenings and weekends, on personal hardware, with my own IP. The crossover is in the patterns and learnings — not in the code or data.
