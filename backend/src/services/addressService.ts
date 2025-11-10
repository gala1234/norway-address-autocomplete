import TrieSearch from 'trie-search';
import fs from 'fs';
import path from 'path';

// 1. Define the structure of an address object
export interface Address {
  street: string;
  postNumber: number;
  city: string;
  county: string;
  district: string;
  municipality: string;
  municipalityNumber: number;
  type: string;
  typeCode: number;
}

// 2. Create an instance of TrieSearch
const trie = new TrieSearch<Address>(
  'street',
  {
    ignoreCase: true,
    min: 3, 
  }
);

// 3. Function to load and index the data
export function loadAndIndexAddresses() {
  try {
    console.log('Loading address data...');
    
    // Path: From 'dist' (where code runs), go up to 'backend', then into 'data'
    const dataPath = path.join(__dirname, '..', 'data', 'adresses.json');
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const addresses: Address[] = JSON.parse(rawData);

    trie.addAll(addresses);

    console.log(`Successfully indexed ${addresses.length} addresses.`);
    
  } catch (error) {
    console.error('Failed to load or index address data:', error);
    process.exit(1); 
  }
}

// 4. Function to execute the search
export function searchAddresses(query: string): Address[] {
  const results = trie.get(query);
  
  // Return only the first 20 results
  return results.slice(0, 20);
}