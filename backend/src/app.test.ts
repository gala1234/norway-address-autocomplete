import request from 'supertest';
import app from './app';

// Mock the service layer so tests don't depend on trie/data loading
jest.mock('./services/addressService', () => ({
  loadAndIndexAddresses: jest.fn(),
  searchAddressesWithMeta: jest.fn(),
}));

import { searchAddressesWithMeta } from './services/addressService';
const mocked = searchAddressesWithMeta as jest.Mock;

describe('API Integration', () => {
  // Reset mocks before each test to avoid cross-test pollution
  beforeEach(() => mocked.mockReset());

  test('returns 400 when query length < 3', async () => {
    const res = await request(app).get('/search/ro');
    expect(res.statusCode).toBe(400);
  });

  test('returns 200 and an array by default (no ?meta)', async () => {
    // Service returns payload; route should unwrap to .items
    mocked.mockReturnValue({
      items: [{ street: 'Test', postNumber: 1, city: 'OSLO' }],
      total: 1,
      limit: 20,
    });

    const res = await request(app).get('/search/test');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ street: 'Test', postNumber: 1, city: 'OSLO' }]);
    // The handler should call the service with (query, limit)
    expect(mocked).toHaveBeenCalledWith('test', 20);
  });

  test('returns 200 and the full payload when ?meta=1', async () => {
    const payload = {
      items: [{ street: 'Test', postNumber: 1, city: 'OSLO' }],
      total: 1,
      limit: 20,
    };
    mocked.mockReturnValue(payload);

    const res = await request(app).get('/search/test?meta=1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });
});
