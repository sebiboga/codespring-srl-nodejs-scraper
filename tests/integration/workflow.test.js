/**
 * Integration tests requiring SOLR_AUTH.
 * Auto-skipped when SOLR_AUTH is not set.
 */

function itIfSolr(description, testFn) {
  const hasSolr = !!process.env.SOLR_AUTH;
  if (hasSolr) {
    it(description, testFn);
  } else {
    it.skip(`[SKIP] ${description} (SOLR_AUTH not set)`, testFn);
  }
}

describe('ANAF Integration Tests', () => {
  it('should fetch SOFTECH SRL company data from ANAF', async () => {
    const { getCompanyFromANAF } = await import('../src/anaf.js');
    const data = await getCompanyFromANAF('11358358');

    expect(data).toBeDefined();
    expect(data.name).toBe('SOFTECH SRL');
    expect(data.cui).toBe(11358358);
    expect(data.inactive).toBe(false);
  });
});

describe('SOLR Integration Tests', () => {
  let solr;

  beforeAll(async () => {
    solr = await import('../solr.js');
  });

  itIfSolr('should query SOLR for existing jobs by CIF', async () => {
    const result = await solr.querySOLR('11358358');
    expect(result).toHaveProperty('numFound');
    expect(result).toHaveProperty('docs');
    expect(Array.isArray(result.docs)).toBe(true);
  });
});
