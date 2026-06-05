# job_seeker_ro_spider — Codespring (SOFTECH SRL) Romania Scraper

[![WebScraper Codespring to Peviitor](https://github.com/sebiboga/codespring-srl-nodejs-scraper/actions/workflows/scrape.yml/badge.svg)](https://github.com/sebiboga/codespring-srl-nodejs-scraper/actions/workflows/scrape.yml)
[![Test Scraper](https://github.com/sebiboga/codespring-srl-nodejs-scraper/actions/workflows/test.yml/badge.svg)](https://github.com/sebiboga/codespring-srl-nodejs-scraper/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ESM-F7DF1E?logo=javascript&logoColor=black)](https://ecma-international.org/)

**job_seeker_ro_spider** — un scraper pentru job-urile Codespring (SOFTECH SRL) din România. Extrage anunțurile de pe [codespring.ro/category/jobs](https://www.codespring.ro/category/jobs) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul SOLR.

## Features

- Extrage job-uri din RSS feed-ul WordPress (`/category/jobs/feed`)
- Identifică joburile închise (filled/closed) din descriere
- Validează compania via ANAF (CUI, status activ/inactiv)
- Cross-validează cu Peviitor API
- Stochează în SOLR (job core + company core)
- GitHub Actions: scrape zilnic + testare automată

## Project Structure

```
├── index.js           # Main scraper entry point
├── company.js         # Company validation via ANAF + Peviitor + SOLR
├── solr.js            # SOLR operations module
├── src/anaf.js        # ANAF API core module
├── tests/
│   ├── unit/          # Unit tests (mock everything)
│   ├── integration/   # Integration tests (ANAF public API)
│   └── e2e/           # End-to-end tests (real website)
└── .github/workflows/ # CI/CD automation
```

## Quick Start

```bash
npm install
echo "SOLR_AUTH=your-solr-credentials" > .env.local
npm run scrape          # Run full scraper
npm test                # Run all tests
npm run test:unit       # Unit tests only
```

## Test Modes

```bash
node index.js --test    # Scrape first page only (RSS feed)
```

## Company Info

| Field | Value |
|-------|-------|
| Company | SOFTECH SRL |
| Brand | Codespring |
| CIF/CUI | 11358358 |
| Registration | J12/1914/1998 |
| Website | codespring.ro, softech.ro |
| Status | Activ |
