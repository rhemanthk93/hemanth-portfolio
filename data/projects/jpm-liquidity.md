---
slug: jpm-liquidity
title: Liquidity Reporting at JP Morgan Chase
year: 2017-2021
company: JP Morgan Chase, Singapore
stack: [Java, Spring Boot, Eclipse BIRT, Angular, CompletableFuture]
status: completed
weight: 5
---

## Summary

Four years as Associate Software Engineer on JP Morgan's liquidity reporting platform in Singapore. Built and maintained the Java Spring Boot application that operations teams used to configure and manage end-of-day liquidity reports for global clients.

## What I built

- **Spring Boot backend** — configuration UI, report definition layer, scheduling primitives
- **Report Orchestration Service** — engine for triggering high-volume reports based on Eclipse BIRT templates, using multi-threading and `CompletableFuture` for performance
- **Angular UI** — liquidity report retrieval interfaces for the operations team
- **Production support** — client onboarding, on-call rotation, ensuring report delivery SLAs across JP Morgan's global client base

## What I learned

This was where I learned to write code for compliance environments. Audit trails, deterministic outputs, exact timing windows — banking constraints are real and not optional.

Multi-threaded report generation with `CompletableFuture` taught me concurrent Java the painful way. Worth it. Almost everything I've written since benefits from understanding the JVM thread model from the inside.

Production support shifts you to a different mindset. After two years on call I had a much sharper sense of what makes systems debuggable in 3 AM conditions versus in design review.

It also taught me when to leave. By year four, the rate of new technical learning was diminishing — the systems were stable, the patterns repeated. Time to find a steeper curve, which is what led me to GIC and then to data engineering full-time.
