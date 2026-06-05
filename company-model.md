# Company Model Schema

## Required Fields

| Field    | Type   | Description |
|----------|--------|-------------|
| id       | string | CIF/CUI as string (8 digits, no RO prefix) |
| company  | string | Official company name. Uppercase, DIACRITICS ACCEPTED |
| status   | string | Must be one of: "activ", "suspendat", "inactiv", "radiat" |

## Optional Fields

| Field        | Type     | Description |
|-------------|----------|-------------|
| brand       | string   | Marketing brand name |
| group       | string   | Corporate group |
| location    | string[] | Office locations |
| website     | string[] | Company website URLs |
| career      | string[] | Career page URLs |
| lastScraped | string   | Last scrape timestamp (ISO8601 date) |
| scraperFile | string   | Link to scraper source code |
