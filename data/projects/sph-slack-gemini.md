---
slug: sph-slack-gemini
title: Data Pipelines + Slack Chatbot at SPH
year: 2022-2024
company: Singapore Press Holdings (Media)
stack: [AWS Glue, EventBridge, S3, Athena, AppFlow, Java, Slack API, Google Gemini]
status: completed
weight: 6
---

## Summary

Senior Data Engineer at Singapore Press Holdings (Media). Led a three-person data engineering team. Built API-driven data pipelines on AWS, custom AppFlow connectors in Java for alternative data, and a Slack chatbot integrated with Google Gemini that translated natural language queries into SQL for live business reporting.

## What I built

- **Data pipelines** — AWS Glue, EventBridge, S3, Athena, Data Catalog: pulling from multiple platforms via API integrations into a unified analytics layer
- **Custom AppFlow connectors** — written in Java, enabling efficient large-scale API-based data retrieval where the standard AWS connectors fell short
- **Slack chatbot with Gemini** — real-time natural language → SQL → Athena query pipeline, automating report generation for business stakeholders
- **ETL transformations** — turning raw datasets into live dashboards with actionable insights for product and editorial teams

## Team lead notes

First role with formal team leadership — three direct reports. Spent meaningful time on collaboration patterns, project delivery cadence, and code review culture. The technical work was the easier half.

## What I learned

Custom AppFlow connectors are worth writing when the off-the-shelf options force you into bad query patterns. The Java SDK isn't fun, but it's well-documented enough.

Natural-language-to-SQL chatbots in 2023 were genuinely novel — Gemini could do it, but the schema awareness layer had to be hand-built. The win was that non-technical stakeholders could finally get answers without filing a ticket. The lesson: most of the value of an LLM-powered tool is what you pre-load it with about your specific data.

Leading a team while staying technical is a discipline. I shipped less personally; the team shipped more in aggregate.
