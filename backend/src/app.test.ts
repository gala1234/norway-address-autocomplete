import request from 'supertest';
import app from './app';

// Mock the address service to avoid dependency on the real JSON file
// and to control the data it returns.
jest.mock('./services/addressService', () => ({
  loadAndIndexAddresses: jest.fn(), // Does nothing
  searchAddresses: jest.fn(),     // We mock this to control it
}));

// Import the mocked version
import { searchAddresses } from './services/addressService';

// Create a type-cast so TypeScript lets us use .mockReturnValue
const mockedSearchAddresses = searchAddresses as jest.Mock;

describe('API Integration Tests', () => {
  
  beforeEach(() => {
    // Clear mocks before each test
    mockedSearchAddresses.mockClear();
  });

  test('GET /search/:query - should return 400 if query is too short', async () => {
    const res = await request(app).get('/search/ro');
    
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Search query must be at least 3 characters long.');
  });

  test('GET /search/:query - should return 200 and results if found', async () => {
    const mockData = [{ street: 'Test Street', postNumber: 1234, city: 'OSLO' }];
    mockedSearchAddresses.mockReturnValue(mockData);

    const res = await request(app).get('/search/test');

    expect(res.statusCode).toBe(200);
    expect(res.type).toEqual(expect.stringContaining('json'));
    expect(res.body).toEqual(mockData);
    expect(mockedSearchAddresses).toHaveBeenCalledWith('test'); // Verify the service was called
  });

  test('GET /search/:query - should return 200 and empty array if not found', async () => {
    mockedSearchAddresses.mockReturnValue([]);

    const res = await request(app).get('/search/nonexisting');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});