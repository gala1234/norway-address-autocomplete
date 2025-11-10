import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { loadAndIndexAddresses, searchAddresses } from './services/addressService';

// --- Initial Setup ---
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Data Loading ---
// Load and index data on server startup
loadAndIndexAddresses();

// --- API Routes ---

/**
 * Test route to verify that the server is running.
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running!');
});

/**
 * Address search endpoint
 * Example: /search/rod
 */
app.get('/search/:query', (req: Request, res: Response) => {
  const query = req.params.query;

  // 1. Validate the 3-character requirement
  if (!query || query.length < 3) {
    return res.status(400).json({
      error: 'Search query must be at least 3 characters long.',
    });
  }

  try {
    // 2. Perform the search
    const results = searchAddresses(query);
    
    // 3. Return the results in JSON format
    res.json(results);

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Export the configured app for testing and for index.ts
export default app;