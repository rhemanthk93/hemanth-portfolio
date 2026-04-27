---
slug: natural-capital-monetisation
title: Natural Capital Monetisation Platform (Laconic)
year: 2024-2025
company: "Temus (Client: Laconic Inc.)"
stack: [Apache Sedona, PostGIS, GDAL, AWS EC2, Bash, Spark, MBTiles, GeoTIFF]
status: completed
cover: /projects/natural-capital-monetisation/cover.png
weight: 8
---

## Summary

Multi-region geospatial data architecture supporting real-time environmental analytics for 195 countries. Powered Laconic's first productized carbon credit marketplace, generating $2M+ in client commitments. Scope included land-use / land-cover analysis, forest carbon computation, deforestation tracking, and a tiling server for visualization.

## Architecture

- **Compute** — Apache Sedona on Spark, replacing legacy PostGIS workflows after a technology evaluation. 300% performance improvement for the geospatial pipelines
- **Tiling server** — GeoTIFF → RGB-coloured MBTiles using GDAL, with automated bash + GDAL conversion pipelines processing tens of thousands of geospatial images
- **Deployment** — AWS EC2, optimised instance types for raster-heavy workloads
- **Pipelines** — deforestation tracking, land value computation, summary statistics across massive geospatial datasets (tens of thousands of polygons each invoking 445+ method calls in some flows)
- **Legacy bridge** — kept PostGIS workflows alive for urgent client deliverables under tight deadlines while the Sedona migration proceeded

## Open-source contribution

Raised issues in Apache Sedona during the project and contributed optimizations back upstream — DataFrame caching, batch processing improvements. Contributing back was both the right thing to do and selfishly useful: any future Sedona deployment now starts with my fixes already in.

## What I learned

Adopting a new technology in a client engagement is a leadership exercise as much as a technical one. The Sedona evaluation involved training the team, establishing best practices, and writing documentation that would survive after I rotated off. The 300% performance number was the easy part; the harder part was building organizational muscle for it.

Geospatial Spark at scale has different failure modes than tabular Spark. Spatial joins explode if you're not careful with partitioning. Bounding-box partitioning and a careful broadcast strategy mattered more than any single algorithmic optimization.

Working under client deadline pressure with a legacy + new system in parallel is genuinely hard. The PostGIS bridge was the right call — it kept us shipping while we built the future.
