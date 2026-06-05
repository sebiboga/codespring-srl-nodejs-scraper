# Robots.txt Analysis — Codespring

Sursa: https://www.codespring.ro/robots.txt

## Reguli

```
User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: https://www.codespring.ro/sitemap.xml
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` (landing) | ✅ Da | Pagina principală |
| `/category/jobs/` | ✅ Da | Lista job-urilor (front-end) |
| `/category/jobs/feed` | ✅ Da | RSS feed cu job-urile (sursa scraper-ului) |
| `/wp-admin/` | ❌ **Disallowed** | Zona de administrare WordPress |
| `sitemap.xml` | ✅ Da | Sitemap-ul site-ului |

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- RSS feed-ul `/category/jobs/feed` e **allowed** de robots.txt — scraperul nostru funcționează perfect.
- Paginile individuale de job (`/job/...`) sunt permise implicit (nu există disallow).
- Scraperul face o singură cerere per rulare (RSS feed-ul) — comportament rezonabil, nu agresiv.

**Concluzie**: Risc minim. RSS feed-ul e public, explicit permis în robots.txt, iar scraperul face o singură cerere.
