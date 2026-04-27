---
slug: ngee-ann-poly-databricks
title: SQL Server → Databricks Lakehouse Migration
year: 2024-2025
company: "Temus (Client: Ngee Ann Polytechnic)"
stack: [Databricks, Delta Lake, Spark SQL, Python, SQLGlot, Unity Catalog]
status: completed
cover: /projects/ngee-ann-poly-databricks/cover.png
weight: 8
---

## Summary

Large-scale legacy SQL Server to Databricks Lakehouse migration. Refactored complex T-SQL schemas, DDLs, DMLs, views, and stored-procedure logic into Databricks Spark SQL to support a Delta Lake medallion architecture.

## The hard part

100,000+ T-SQL `INSERT` statements to convert, by hand if you're a sucker. Manual refactoring would have taken months and produced bugs. The interesting work was building automation that did 99% of it correctly and let humans focus on the actual edge cases.

## Approach

- **SQL transpilation** — SQLGlot for AST manipulation, programmatically transforming SQL Server dialects into Spark SQL while preserving data fidelity
- **Type coercion** — non-trivial type mappings: DateTime2 → TIMESTAMP, Numeric → DECIMAL with precision control
- **Pre-processing** — stripped legacy SQL artefacts (`GO` batch separators, Unicode `N''` prefixes) and detected file encoding (UTF-8 vs UTF-16) automatically to prevent data loss in bulk ingestion
- **Delta Lake target** — standardized ingestion into Delta Lake tables aligned with medallion architecture, governed by Unity Catalog
- **Resilience** — file I/O and error handling for batch processing large SQL files, dynamic schema target redirection, validation, and ready-to-execute Databricks SQL artefact generation

Migration time reduced by ~99% versus a manual refactor. Schema and data consistency was 100% across the migrated tables.

## What I learned

T-SQL → Spark SQL has more sharp edges than you'd expect. Control flow (`IF`, `WHILE`), transaction semantics, string literal handling, and identifier quoting are all subtly different. Catching them required a real test corpus from production.

SQLGlot is a great tool for this category of problem. Having an AST in hand made the transformations principled rather than regex-based. Lesson: regex on SQL is a trap.

Modernizing legacy data platforms is more about data discipline than tooling. The Databricks migration was the trigger; the actual win was finally having a governance layer (Unity Catalog) and a maintainable schema definition pattern.
