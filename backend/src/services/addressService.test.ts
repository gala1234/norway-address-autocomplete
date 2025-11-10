// Mock the 'trie-search' and 'fs' libraries
const mockTrieGet = jest.fn();
const mockTrieAddAll = jest.fn();
jest.mock('trie-search', () => {
  return jest.fn().mockImplementation(() => {
    return {
      addAll: mockTrieAddAll,
      get: mockTrieGet,
    };
  });
});

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => '[]'), // Return an empty JSON array by default
}));
jest.mock('path', () => ({
  join: jest.fn(() => '/fake/path/data.json'),
}));

// Import the service AFTER mocking
import { searchAddresses, loadAndIndexAddresses } from './addressService';

describe('AddressService Unit Tests', () => {

  beforeEach(() => {
    mockTrieGet.mockClear();
    mockTrieAddAll.mockClear();
    (require('fs').readFileSync as jest.Mock).mockClear();
  });

  test('loadAndIndexAddresses should read file and add to trie', () => {
    const mockData = [{ street: 'Test', city: 'Test' }];
    (require('fs').readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData));

    loadAndIndexAddresses();

    expect(require('fs').readFileSync).toHaveBeenCalled();
    expect(mockTrieAddAll).toHaveBeenCalledWith(mockData);
  });

  test('searchAddresses should return exactly 20 results if trie returns more', () => {
    // Create an array of 25 mock items
    const largeMockResults = Array.from({ length: 25 }, (_, i) => ({
      street: `Street ${i + 1}`,
    }));
    
    mockTrieGet.mockReturnValue(largeMockResults);
    
    const results = searchAddresses('many');

    expect(mockTrieGet).toHaveBeenCalledWith('many');
    expect(results).toHaveLength(20); // The key test
    expect(results?.[0]?.street).toBe('Street 1'); // Ensure it's the first 20
  });

  test('searchAddresses should return all results if 20 or less', () => {
    const smallMockResults = [{ street: 'Street 1' }, { street: 'Street 2' }];
    mockTrieGet.mockReturnValue(smallMockResults);
    
    const results = searchAddresses('few');

    expect(results).toHaveLength(2);
    expect(results).toEqual(smallMockResults);
  });
});