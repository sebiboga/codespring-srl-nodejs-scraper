# Company Model Schema

## Required Fields

| Field    | Type   | Description |
|----------|--------|-------------|
| id       | string | CIF/CUI as string (8 digits, no RO prefix) |
| company  | string | Official company name. Uppercase, DIACRITICS REQUIRED (ăâîșțĂÂÎȘȚ) |
| status   | string | Must be one of: "activ", "suspendat", "inactiv", "radiat". If company is not active, remove jobs |

## Optional Fields

| Field        | Type     | Description |
|-------------|----------|-------------|
| brand       | string   | Marketing brand name |
| group       | string   | Corporate group |
| location    | string[] | Office locations |
| website     | string[] | Company website URLs. Must be valid HTTP/HTTPS URL, without trailing slash |
| career      | string[] | Career page URLs. Must be valid HTTP/HTTPS URL, without trailing slash |
| lastScraped | string   | Last scrape timestamp (ISO8601 date). Format: "2026-02-20" |
| scraperFile | string   | Name of the scraper file used (e.g. "codespring.md"). Used for reference |
