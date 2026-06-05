# Job Model Schema

## Required Fields

| Field  | Type   | Description |
|--------|--------|-------------|
| url    | string | Full URL to job detail page. Unique. Must be valid HTTP/HTTPS URL, canonical job detail page |
| title  | string | Position title. Max 200 chars, no HTML, trimmed whitespace. DIACRITICS ACCEPTED (ăâîșțĂÂÎȘȚ) |

## Optional Fields

| Field            | Type     | Description |
|------------------|----------|-------------|
| company          | string   | Hiring company name. Legal name, uppercase, must match Company.name exactly |
| cif              | string   | CIF/CUI (8 digits, no RO prefix) |
| location         | string[] | Romanian cities/addresses. DIACRITICS ACCEPTED. Multi-valued array |
| tags             | string[] | Skills/education/experience. Lowercase, max 20 entries, standardized values only, NO DIACRITICS |
| workmode         | string   | "remote", "on-site", or "hybrid" |
| date             | date     | Scrape date. ISO8601 UTC timestamp (ex: "2026-01-18T10:00:00Z") |
| status           | string   | "scraped", "tested", "published", or "verified". Default: "scraped". Progression: scraped → (tested OR verified) → published |
| vdate            | date     | Verified date. ISO8601. Set only when status="tested" or "verified" |
| expirationdate   | date     | Estimated job expiration. ISO8601. vdate + 30 days max, or extract from job page |
| salary           | string   | Salary range + currency. Format: "MIN-MAX CURRENCY" |

## Status Flow

`scraped` → (`tested` OR `verified`) → `published`

| Status     | Meaning                              |
|------------|--------------------------------------|
| scraped    | Newly scraped, not validated yet    |
| tested     | URL works, job exists but incomplete details |
| verified   | Fully scraped with all details      |
| published  | Imported from jobs core             |

## Notes

- Fields marked `string[]` are multi-valued arrays
- tags must be lowercase with NO diacritics
- location accepts diacritics
- company must be uppercase
