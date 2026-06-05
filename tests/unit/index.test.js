import { jest } from '@jest/globals';

describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Târgu Mureș'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Târgu Mureș']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'codespring.ro',
        company: 'softech srl',
        cif: '11358358',
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', company: 'softech', cif: '11358358' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('SOFTECH SRL');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'on-site' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://www.codespring.ro/jobs/ux-ui-designer',
        title: 'UX/UI Designer',
        location: ['Cluj-Napoca'],
        workmode: 'remote',
        pubDate: 'Mon, 16 Dec 2024 13:26:20 +0000'
      };

      const COMPANY_NAME = 'SOFTECH SRL';
      const COMPANY_CIF = '11358358';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should remove undefined fields', () => {
      const rawJob = {
        url: 'https://test.com/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '11358358');

      expect(result.location).toBeUndefined();
      expect(result.workmode).toBeUndefined();
    });
  });

  describe('parseRssJobs', () => {
    it('should parse RSS feed XML into job objects', () => {
      const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>UX/UI Designer</title>
      <link>https://www.codespring.ro/jobs/ux-ui-designer</link>
      <pubDate>Mon, 16 Dec 2024 13:26:20 +0000</pubDate>
      <description>UX/UI designer jobs available</description>
    </item>
    <item>
      <title>English Teacher</title>
      <link>https://www.codespring.ro/jobs/english-teacher</link>
      <pubDate>Wed, 28 Feb 2024 14:47:50 +0000</pubDate>
      <description>[The position has been filled]</description>
    </item>
  </channel>
</rss>`;

      const result = index.parseRssJobs(xml);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('UX/UI Designer');
      expect(result[0].isFilled).toBe(false);
      expect(result[0].location).toContain('Cluj-Napoca');
      expect(result[1].isFilled).toBe(true);
    });

    it('should detect filled positions from description', () => {
      const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Job</title>
      <link>https://test.com/job</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate>
      <description>[This position has been closed]</description>
    </item>
  </channel>
</rss>`;

      const result = index.parseRssJobs(xml);
      expect(result[0].isFilled).toBe(true);
    });

    it('should set location based on title keywords', () => {
      const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Developer - Târgu Mureș</title>
      <link>https://test.com/job</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 +0000</pubDate>
      <description>Job description</description>
    </item>
  </channel>
</rss>`;

      const result = index.parseRssJobs(xml);
      expect(result[0].location).toContain('Târgu Mureș');
    });
  });
});
