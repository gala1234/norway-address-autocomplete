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

      {query.length >= 3 && (
        <div className="results-dropdown">
          
          {isLoading && (
            <div className="dropdown-message">Loading...</div>
          )}

          {error && (
            <div className="dropdown-message error">Error: {error}</div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="dropdown-message no-results">
              No results found for "{query}".
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <ul className="results-list">
              {results.map((address, index) => (
                <li key={index} className="result-item">
                  <span className="street">{address.street}</span>
                  <span className="location">{address.postNumber} {address.city}</span>
                </li>
              ))}
            </ul>
          )}

        </div>
      )}
    </div>
  );
}
