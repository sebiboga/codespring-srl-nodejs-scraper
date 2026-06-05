/**
 * End-to-end tests that hit the live Codespring website.
 * No SOLR auth required - these only test scraping capability.
 */

describe('E2E: Codespring Website Scraping', () => {
  it('should fetch and parse RSS feed', async () => {
    const res = await fetch('https://www.codespring.ro/category/jobs/feed', {
      headers: { 'User-Agent': 'job_seeker_ro_spider' }
    });
    expect(res.ok).toBe(true);

    const xml = await res.text();
    expect(xml).toContain('<rss');
    expect(xml).toContain('<item>');
  });

  it('should detect at least one job in RSS feed', async () => {
    const res = await fetch('https://www.codespring.ro/category/jobs/feed', {
      headers: { 'User-Agent': 'job_seeker_ro_spider' }
    });
    const xml = await res.text();

    const itemCount = (xml.match(/<item>/g) || []).length;
    expect(itemCount).toBeGreaterThan(0);
  });

  it('should access individual job page', async () => {
    const res = await fetch('https://www.codespring.ro/jobs/ux-ui-designer', {
      headers: { 'User-Agent': 'job_seeker_ro_spider' }
    });
    expect(res.ok).toBe(true);

    const html = await res.text();
    expect(html).toContain('UX/UI Designer');
  });

  it('should fetch SOFTECH SRL from ANAF', async () => {
    const res = await fetch('https://demoanaf.ro/api/company/11358358', {
      headers: { 'User-Agent': 'job_seeker_ro_spider' }
    });
    expect(res.ok).toBe(true);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.name).toBe('SOFTECH SRL');
    expect(json.data.inactive).toBe(false);
  });
});
