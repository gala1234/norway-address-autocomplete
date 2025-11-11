import { useState, useEffect } from "react";
import type { Address } from "../types";
import "./AddressSearch.css";

export function AddressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (query.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timerId = setTimeout(() => {
      if (query.length >= 3) {
        performSearch(query);
      }
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/search/${searchQuery}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: Address[] = await response.json();

      setResults(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
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
            <span className="location">
              {address.postNumber} {address.city}
            </span>
          </li>
        ))}
      </ul>

      {!isLoading && !error && query.length >= 3 && results.length === 0 && (
        <div className="no-results">No results found for "{query}".</div>
      )}
    </div>
  );
}
