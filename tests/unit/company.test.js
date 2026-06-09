import { jest } from '@jest/globals';
import fs from 'fs';

const mockFetch = jest.fn();

jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch
}));

const COMPANY_JSON_PATH = 'tmp/company.json';

function backupCompanyJson() {
  if (fs.existsSync(COMPANY_JSON_PATH)) {
    const content = fs.readFileSync(COMPANY_JSON_PATH, 'utf-8');
    fs.renameSync(COMPANY_JSON_PATH, `${COMPANY_JSON_PATH}.bak`);
    return content;
  }
  return null;
}

function restoreCompanyJson() {
  if (fs.existsSync(`${COMPANY_JSON_PATH}.bak`)) {
    fs.renameSync(`${COMPANY_JSON_PATH}.bak`, COMPANY_JSON_PATH);
  }
  return null;
}

function anafSearchResponse(results) {
  return {
    ok: true,
    json: async () => ({ data: results, success: true })
  };
}

function anafCompanyResponse(data) {
  return {
    ok: true,
    json: async () => ({ data, success: true })
  };
}

function peviitorResponse(companies) {
  return {
    ok: true,
    json: async () => ({ companies })
  };
}

function solrResponse(numFound, docs) {
  return {
    ok: true,
    json: async () => ({ response: { numFound, docs } })
  };
}

const SOFTECH_ANAF_RECORD = {
  cui: 11358358,
  name: 'SOFTECH SRL',
  address: 'Constantin Brâncuşi, 69-71, Municipiul Cluj-Napoca, Cluj',
  caenCode: '6201',
  inactive: false,
  registrationNumber: 'J12/1914/1998',
  vatRegistered: true,
  eFacturaRegistered: false,
  onrcStatusLabel: 'Funcțiune',
  legalForm: 'SRL',
  headquartersAddress: { locality: 'Municipiul Cluj-Napoca' },
  administrators: [{ name: 'SZELYES ERZSEBET EVA', role: 'administrator' }],
  authorizedCaenCodes: ['2620', '6201', '6202', '6203', '6209', '6311', '7021', '7022', '8559']
};

describe('company.js', () => {
  let company;
  let savedCompanyJson;

  beforeAll(async () => {
    process.env.SOLR_AUTH = 'test:test';
    fs.mkdirSync('tmp', { recursive: true });
    savedCompanyJson = backupCompanyJson();
    company = await import('../../company.js');
  });

  afterAll(() => {
    delete process.env.SOLR_AUTH;
    restoreCompanyJson();
  });

  beforeEach(() => {
    mockFetch.mockReset();
    if (fs.existsSync(COMPANY_JSON_PATH)) {
      fs.unlinkSync(COMPANY_JSON_PATH);
    }
  });

  describe('getCompanyBrand', () => {
    it('should return the company brand', () => {
      const brand = company.getCompanyBrand();
      expect(typeof brand).toBe('string');
      expect(brand).toBe('SOFTECH SRL');
    });
  });

  describe('getCompanyData (no cache)', () => {
    it('should find SOFTECH via ANAF search and return company data', async () => {
      mockFetch
        .mockResolvedValueOnce(anafSearchResponse([
          { cui: 11358358, name: 'SOFTECH SRL', statusLabel: 'Funcțiune' }
        ]))
        .mockResolvedValueOnce(anafCompanyResponse(SOFTECH_ANAF_RECORD));

      const result = await company.getCompanyData();

      expect(result).toHaveProperty('company', 'SOFTECH SRL');
      expect(result).toHaveProperty('cif', '11358358');
      expect(result).toHaveProperty('active', true);
      expect(result).toHaveProperty('anafData');
    });

    it('should throw when no companies found', async () => {
      mockFetch.mockResolvedValueOnce(anafSearchResponse([]));
      await expect(company.getCompanyData()).rejects.toThrow('No companies found');
    });
  });

  describe('getCompanyData (with cache)', () => {
    const cachedData = {
      anaf: SOFTECH_ANAF_RECORD,
      summary: {
        company: 'SOFTECH SRL',
        cif: '11358358',
        active: true
      }
    };

    beforeEach(() => {
      fs.mkdirSync('tmp', { recursive: true });
      fs.writeFileSync(COMPANY_JSON_PATH, JSON.stringify(cachedData), 'utf-8');
    });

    it('should use cached company data when available', async () => {
      const result = await company.getCompanyData();

      expect(result.company).toBe('SOFTECH SRL');
      expect(result.cif).toBe('11358358');
      expect(result.active).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('validateAndGetCompany', () => {
    afterEach(() => {
      if (fs.existsSync(COMPANY_JSON_PATH)) {
        fs.unlinkSync(COMPANY_JSON_PATH);
      }
    });

    it('should return company data with status active', async () => {
      mockFetch
        .mockResolvedValueOnce(anafSearchResponse([
          { cui: 11358358, name: 'SOFTECH SRL', statusLabel: 'Funcțiune' }
        ]))
        .mockResolvedValueOnce(anafCompanyResponse(SOFTECH_ANAF_RECORD))
        .mockResolvedValueOnce(solrResponse(3, [
          { url: 'https://test.com/1', title: 'Job 1' }
        ]))
        .mockResolvedValueOnce(peviitorResponse([{ company: 'SOFTECH SRL' }]));

      const result = await company.validateAndGetCompany();

      expect(result).toHaveProperty('status', 'active');
      expect(result).toHaveProperty('company', 'SOFTECH SRL');
      expect(result).toHaveProperty('cif', '11358358');
    });

    it('should return inactive status when company is inactive', async () => {
      const inactiveRecord = { ...SOFTECH_ANAF_RECORD, inactive: true };

      mockFetch
        .mockResolvedValueOnce(anafSearchResponse([
          { cui: 11358358, name: 'SOFTECH SRL', statusLabel: 'Funcțiune' }
        ]))
        .mockResolvedValueOnce(anafCompanyResponse(inactiveRecord))
        .mockResolvedValueOnce(solrResponse(0, []));

      const result = await company.validateAndGetCompany();

      expect(result).toHaveProperty('status', 'inactive');
    });
  });
});
