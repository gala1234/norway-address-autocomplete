import { useState, useEffect, useRef } from "react";
import type { Address } from "../types";
import "./AddressSearch.css";

export function AddressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const [postNumber, setPostNumber] = useState("");
  const [city, setCity] = useState("");

  const selectionRef = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setError(null);

    if (selectionRef.current) {
      selectionRef.current = false;
      setHasSearched(false);
      return;
    }

    if (query.length < 3) {
      cleanup();
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(false);
    setActiveIndex(-1);

    const timerId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [query]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) {
      return;
    }
    const activeItem = listRef.current.children[activeIndex] as HTMLLIElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  const cleanup = () => {
    setResults([]);
    setIsLoading(false);
    setActiveIndex(-1);
    setPostNumber("");
    setCity("");
  };

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
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleSelect = (address: Address) => {
    selectionRef.current = true;
    setHasSearched(false);

    setQuery(address.street);
    setPostNumber(String(address.postNumber));
    setCity(address.city);

    setResults([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prevIndex) =>
          prevIndex >= results.length - 1 ? 0 : prevIndex + 1
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prevIndex) =>
          prevIndex <= 0 ? results.length - 1 : prevIndex - 1
        );
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          handleSelect(results[activeIndex]);
        }
        break;
      case "Escape":
        setResults([]);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="form-container">
      <h1>Norwegian Address Search</h1>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="address-search" className="form-label">
            Street
          </label>
          <input
            type="text"
            id="address-search"
            className="form-input search"
            placeholder="Start typing an address (e.g., 'rod')..."
            value={query}
            onChange={(e) => {
              selectionRef.current = false;
              setQuery(e.target.value);
              setPostNumber("");
              setCity("");
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {(isLoading || error || (hasSearched && query.length >= 3)) && (
        <div className="results-dropdown">
          {isLoading && <div className="dropdown-message">Loading...</div>}
          {error && (
            <div className="dropdown-message error">Error: {error}</div>
          )}
          {!isLoading && !error && hasSearched && results.length === 0 && (
            <div className="dropdown-message no-results">
              No results found for "{query}".
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <ul className="results-list" ref={listRef}>
              {results.map((address, index) => (
                <li
                  key={`${address.postNumber}-${address.street}`}
                  className={`result-item ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onClick={() => handleSelect(address)}
                >
                  <span className="street">{address.street}</span>
                  <span className="location">
                    {address.postNumber} {address.city}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}  

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="postNumber" className="form-label">
            Post Number
          </label>
          <input
            type="text"
            id="postNumber"
            className="form-input"
            value={postNumber}
            readOnly
          />
        </div>
        <div className="form-group">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input
            type="text"
            id="city"
            className="form-input"
            value={city}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
