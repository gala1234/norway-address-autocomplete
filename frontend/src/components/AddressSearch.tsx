import { useState, useCallback } from "react";
import type { Address } from "../types";
import { useAddressSearch } from "../hooks/useAddressSearch";
import "./AddressSearch.css";

export function AddressSearch() {
  // Read only fields state
  const [postNumber, setPostNumber] = useState("");
  const [city, setCity] = useState("");

  // Callback when an address is selected
  const handleSelectAddress = useCallback((address: Address) => {
    setPostNumber(String(address.postNumber));
    setCity(address.city);
  }, []);

  // Hook for address search
  const { state, listRef, handleQueryChange, handleKeyDown, handleSelect } =
    useAddressSearch(handleSelectAddress);

  // Clear the form if the user deletes the search input
  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 0) {
      setPostNumber("");
      setCity("");
    }
    handleQueryChange(e);
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
            value={state.query}
            onChange={onQueryChange}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={Boolean(state.results.length) && !state.isLoading}
            aria-controls="address-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              state.activeIndex >= 0
                ? `address-item-${state.activeIndex}`
                : undefined
            }
          />
        </div>
      </div>

      {(state.isLoading ||
        state.error ||
        (state.hasSearched && state.query.length >= 3)) && (
        <div className="results-dropdown">
          {state.isLoading && (
            <div className="dropdown-message" aria-live="polite">
              Loading...
            </div>
          )}
          {state.error && (
            <div className="dropdown-message error">Error: {state.error}</div>
          )}
          {!state.isLoading &&
            !state.error &&
            state.hasSearched &&
            state.results.length === 0 && (
              <div className="dropdown-message no-results" aria-live="polite">
                No results found for "{state.query}".
              </div>
            )}

          {!state.isLoading && !state.error && state.results.length > 0 && (
            <ul
              className="results-list"
              ref={listRef}
              role="listbox"
              id="address-listbox"
            >
              {state.results.map((address, index) => (
                <li
                  key={`${address.postNumber}-${address.street}`}
                  className={`result-item ${
                    index === state.activeIndex ? "active" : ""
                  }`}
                  onClick={() => handleSelect(address)}
                  role="option"
                  aria-selected={index === state.activeIndex}
                  id={`address-item-${index}`}
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
            className="form-input read-only"
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
            className="form-input read-only"
            value={city}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}