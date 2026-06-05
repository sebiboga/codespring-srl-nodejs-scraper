# Project Files

## JavaScript Files

| File | Description |
|------|-------------|
| `index.js` | Main scraper - full workflow: validate company → scrape RSS → transform → upsert |
| `company.js` | Validates company via ANAF + Peviitor APIs |
| `solr.js` | SOLR operations module |
| `src/anaf.js` | ANAF API core module |

## Markdown Files

| File | Description |
|------|-------------|
| `job-model.md` | Job schema definition (Peviitor Core) |
| `company-model.md` | Company schema definition (Peviitor Core) |
| `files.md` | This file - documents role of each project file |

## Configuration Files

| File | Description |
|------|-------------|
| `package.json` | Node.js project config |
| `.gitignore` | Ignores node_modules/, jobs.json, .env.local |
| `.env.local` | Local environment variables (SOLR_AUTH) - NOT committed |
| `.npmrc` | npm security settings |

## CI/CD

| File | Description |
|------|-------------|
| `.github/workflows/scrape.yml` | Daily scraper run at 6 AM |
| `.github/workflows/test.yml` | Test runner on push/PR |

## Data Files

| File | Description |
|------|-------------|
| `company.json` | Company backup - ANAF + Peviitor data (generated) |
