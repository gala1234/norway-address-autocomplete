import request from 'supertest';
import app from './app';

jest.mock('./services/addressService', () => ({
  loadAndIndexAddresses: jest.fn().mockResolvedValue(undefined), // 👈 aquí
  searchAddressesWithMeta: jest.fn(),
}));

import { searchAddressesWithMeta, loadAndIndexAddresses } from './services/addressService';
const mockedSearch = searchAddressesWithMeta as jest.Mock;
const mockedLoad = loadAndIndexAddresses as jest.Mock;

describe('API Integration', () => {
  beforeEach(() => {
    mockedSearch.mockReset();
    mockedLoad.mockResolvedValue(undefined); // por si algún test lo sobreescribe
  });

  test('returns 400 when query length < 3', async () => {
    const res = await request(app).get('/search/ro');
    expect(res.statusCode).toBe(400);
  });

  test('returns 200 and an array by default (no ?meta)', async () => {
    mockedSearch.mockReturnValue({ items: [{ street: 'Test', postNumber: 1, city: 'OSLO' }], total: 1, limit: 20 });
    const res = await request(app).get('/search/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ street: 'Test', postNumber: 1, city: 'OSLO' }]);
    expect(mockedSearch).toHaveBeenCalledWith('test', 20);
  });

  test('returns 200 and the full payload when ?meta=1', async () => {
    const payload = { items: [{ street: 'Test', postNumber: 1, city: 'OSLO' }], total: 1, limit: 20 };
    mockedSearch.mockReturnValue(payload);
    const res = await request(app).get('/search/test?meta=1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });
});
