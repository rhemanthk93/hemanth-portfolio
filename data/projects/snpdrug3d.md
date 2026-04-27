---
slug: snpdrug3d
title: SNPDrug3D — Genomics Variant Mapping
year: 2025-present
company: Temus / A*STAR Bioinformatics Institute
stack: [Apache Spark, PySpark, AWS S3, AWS Glue, Athena, Hadoop-AWS, BioPython, pyarrow, pandas]
status: active
cover: /projects/snpdrug3d/cover.png
weight: 9
---

## Summary

Cloud-native genomic variant-to-protein-structure mapping platform built at Temus in collaboration with A*STAR's Bioinformatics Institute. Maps genetic variants to 3D protein structures at scale, integrating multiple biological data sources to support drug discovery research.

## Problem

Variant interpretation requires linking genomic variants (single nucleotide polymorphisms, missense mutations) to the 3D protein structures they affect. The data lives in fundamentally different formats and scales:

- **AlphaMissense variant predictions** — tabular, billions of rows
- **UniProt sequence records** — semi-structured, millions of entries
- **SIFTS structural annotations** — XML, hundreds of thousands of compressed files
- **AlphaFill structural models** — JSON + mmCIF, thousands of files

Joining them at scale is the whole problem.

## Architecture

- **Ingestion** — automated pipelines pulling from REST APIs and S3 sources
- **Transformation** — Spark jobs processing 70M+ records, with custom key-matching logic on nested fields and array elements (canonical UniProt accessions)
- **SIFTS XML parsing** — 230,000+ compressed XML files transformed into optimized Parquet
- **AlphaFill processing** — 5,000+ JSON files plus corresponding mmCIF structure files, parsed with BioPython's `MMCIF2Dict` and `pandas.json_normalize` for nested JSON flattening
- **Storage** — partitioned Parquet on S3, partitioned by `uniprot_id` for downstream query performance
- **Query layer** — Hive-compatible schemas exposed via AWS Glue Crawlers and Athena

Reduced query response times by ~85% versus the legacy approach. Concurrent access for 15+ research teams.

## What I learned

mmCIF parsing is genuinely hard. BioPython's `MMCIF2Dict` is the right tool, but the data is deeply nested with structural and functional annotations interleaved. Flat-record output requires careful schema design.

Schema-on-read with Glue + Athena is the right pattern when multiple research teams need different views of the same data. We avoided pre-joining everything into one massive table.

Data architecture standards (lineage tracking, schema evolution policy, metadata governance) gave us 60% faster onboarding for new research projects. The value of these standards is mostly invisible until the third or fourth project, when you suddenly skip weeks of "what is this column?" archaeology.
