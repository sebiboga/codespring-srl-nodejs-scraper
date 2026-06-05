# Project Files

## JavaScript Files

| File | Description |
|------|-------------|
| `index.js` | Main scraper - full workflow: validate company → scrape RSS → transform → upsert |
| `company.js` | Validates company via ANAF + Peviitor APIs, checks if company is active/inactive |
| `solr.js` | SOLR operations module - exports querySOLR, deleteJobByUrl, upsertJobs + standalone verify command |
| `src/anaf.js` | ANAF API core module - exports getCompanyFromANAF(cif), getCompanyFromANAFWithFallback(cif, cached), searchCompany(brandName) |
| `demoanaf.js` | CLI entry point for ANAF module (thin wrapper around src/anaf.js) |
| `validate-jobs.js` | Job URL validator - checks if Solr job URLs are still active or expired |

## Data Files

| File | Description |
|------|-------------|
| `codespring_response.xml` | Sample RSS feed response from Codespring WordPress site |

## Markdown Files

| File | Description |
|------|-------------|
| `instructions.md` | Project documentation - workflow, technologies, API endpoints, how to update models |
| `job-model.md` | Job schema definition (Peviitor Core) - fields, types, validation rules |
| `company-model.md` | Company schema definition (Peviitor Core) - fields, types, validation rules |
| `files.md` | This file - documents role of each project file |
| `BRANCH.md` | Policy — default branch must be `main` |
| `PUBLIC.md` | Policy — repository must be public |
| `CHANGELOG.md` | Version history and changelog |
| `CONTRIBUTING.md` | Contribution guidelines for developers |
| `ISSUES.md` | Issue tracking policy (every code change needs an issue) |
| `ROBOTS.md` | Robots.txt analysis for codespring.ro |
| `SECURITY.md` | Security policy and vulnerability reporting |
| `TOPICS.md` | GitHub repo topics documentation |
| `UPDATE-REPO-ABOUT.md` | Instructions for updating repo About section on GitHub |

## Configuration Files

| File | Description |
|------|-------------|
| `package.json` | Node.js project config - dependencies (node-fetch, cheerio), scripts |
| `package-lock.json` | Locked dependency versions |
| `.gitignore` | Ignores node_modules/, jobs.json, jobs_existing.json, .env.local, test-report.html |
| `.env.local` | Local environment variables (SOLR_AUTH) - NOT committed |
| `.npmrc` | npm security settings |
| `delete_request.json` | SOLR delete query for CIF 11358358 (used for manual cleanup) |

## Documentation

| File | Description |
|------|-------------|
| `docs/README.md` | Extended documentation |
| `docs/index.html` | GitHub Pages dashboard showing live job stats |

## CI/CD

| File | Description |
|------|-------------|
| `.github/workflows/scrape.yml` | Daily scraper run at 6 AM |
| `.github/workflows/test.yml` | Test runner on push/PR |

## Meta

| File | Description |
|------|-------------|
| `AGENTS.md` | Rules for AI agents (OpenCode) working on this project |
| `README.md` | Project overview |
| `LICENSE` | MIT License |

## Dependencies (node_modules/)

Installed via npm:
- `node-fetch` - HTTP requests
- `cheerio` - HTML/XML parsing

## Notes

- All `.md` files contain dynamic schemas that may change over time
- Check peviitor_core README.md for latest model definitions
- Full workflow: check count → validate company (ANAF+Peviitor) → scrape Codespring RSS → transform (fix locations) → upsert → log summary
