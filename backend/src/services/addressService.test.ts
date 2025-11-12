const mockTrieGet = jest.fn();
const mockTrieAddAll = jest.fn();

jest.mock('trie-search', () => {
  return jest.fn().mockImplementation(() => ({
    addAll: mockTrieAddAll,
    get: mockTrieGet,
  }));
});

// Mock fs.promises.readFile
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(async () => '[]'),
  },
}));

import { resolveDataPath, loadAndIndexAddresses, searchAddressesWithMeta } from './addressService';

describe('addressService (DATA_PATH + async load)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.DATA_PATH;
  });

  test('resolveDataPath usa DATA_PATH y fallback ./data/addresses.json', () => {
    const p1 = resolveDataPath();
    expect(p1.endsWith('data/addresses.json')).toBe(true);

    process.env.DATA_PATH = './my-data.json';
    const p2 = resolveDataPath();
    expect(p2.endsWith('my-data.json')).toBe(true);

    process.env.DATA_PATH = '/abs/data.json';
    const p3 = resolveDataPath();
    expect(p3).toBe('/abs/data.json');
  });

  test('loadAndIndexAddresses lee y añade al trie', async () => {
    const valid = JSON.stringify([
      {
        street: 'Test',
        postNumber: 1,
        city: 'C',
        county: 'Co',
        district: 'D',
        municipality: 'M',
        municipalityNumber: 11,
        type: 't',
        typeCode: 0,
      },
    ]);
    (require('fs').promises.readFile as jest.Mock).mockResolvedValueOnce(valid);

    await expect(loadAndIndexAddresses()).resolves.toBeUndefined();
    expect(require('fs').promises.readFile).toHaveBeenCalledTimes(1);
    expect(mockTrieAddAll).toHaveBeenCalledWith(JSON.parse(valid));
  });

  test('loadAndIndexAddresses lanza si el JSON es inválido', async () => {
    (require('fs').promises.readFile as jest.Mock).mockResolvedValueOnce('{"bad"');
    await expect(loadAndIndexAddresses()).rejects.toThrow(/Invalid JSON/);
    expect(mockTrieAddAll).not.toHaveBeenCalled();
  });

  test('searchAddressesWithMeta limita items y expone total/limit', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      street: `S${i + 1}`,
      postNumber: i,
      city: 'C',
      county: 'Co',
      district: 'D',
      municipality: 'M',
      municipalityNumber: 11,
      type: 't',
      typeCode: 0,
    }));
    mockTrieGet.mockReturnValue(many);

    const payload = searchAddressesWithMeta('ro', 20);
    expect(payload.total).toBe(25);
    expect(payload.limit).toBe(20);
    expect(payload.items).toHaveLength(20);
    expect(payload?.items[0]?.street).toBe('S1');
  });
});
