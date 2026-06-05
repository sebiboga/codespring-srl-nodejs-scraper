import { jest } from '@jest/globals';

const mockFetch = jest.fn();

jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch
}));

function solrResponse(numFound, docs) {
  return {
    ok: true,
    json: async () => ({ response: { numFound, docs } })
  };
}

describe('solr.js', () => {
  let solr;

  beforeAll(async () => {
    solr = await import('../../solr.js');
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('querySOLR', () => {
    it('should throw if SOLR_AUTH not set', async () => {
      delete process.env.SOLR_AUTH;
      await expect(solr.querySOLR('11358358')).rejects.toThrow('SOLR_AUTH not set');
    });

    it('should query SOLR by CIF', async () => {
      process.env.SOLR_AUTH = 'test:test';

      mockFetch.mockResolvedValueOnce(solrResponse(3, [
        { url: 'https://test.com/1', title: 'Job 1' },
        { url: 'https://test.com/2', title: 'Job 2' }
      ]));

      const result = await solr.querySOLR('11358358');

      expect(result.numFound).toBe(3);
      expect(result.docs).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cif%3A11358358'),
        expect.any(Object)
      );
    });
  });
});
