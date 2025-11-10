import { useState, useEffect } from 'react';
import type { Address } from '../types';
import './AddressSearch.css';

export function AddressSearch() {

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // This is the manual debounce logic as requested.
    // We set a timer for 300ms.
    const timerId = setTimeout(() => {
      // Only proceed if the query is 3+ chars
      if (query.length >= 3) {
        performSearch(query);
      } else {
        // Clear results if query is too short
        setResults([]);
      }
    }, 300);

    // This is the cleanup function.
    // React runs this when the 'query' state changes (before
    // running the effect again) or when the component unmounts.
    // This cancels the *previous* timer, ensuring we don't
    // send an API request for every keystroke.
    return () => {
      clearTimeout(timerId);
    };
  }, [query]);


  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/search/${searchQuery}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: Address[] = await response.json();
      setResults(data);

    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="search-container">
      <h2>Norwegian Address Search</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Start typing an address (e.g., 'rod')..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">Error: {error}</div>}

      <ul className="results-list">
        {results.map((address, index) => (
          // We use 'index' as a key here, which is fine for a simple,
          // non-mutable list. A unique ID from the data would be better.
          <li key={index} className="result-item">
            <span className="street">{address.street}</span>
            <span className="location">{address.postNumber} {address.city}</span>
          </li>
        ))}
      </ul>

      {!isLoading && !error && query.length >= 3 && results.length === 0 && (
        <div className="no-results">No results found for "{query}".</div>
      )}
    </div>
  );
}