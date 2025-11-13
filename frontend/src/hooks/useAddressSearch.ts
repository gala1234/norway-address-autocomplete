import { useReducer, useEffect, useRef, useCallback } from "react";
import type { Address } from "../types";
import { searchAddresses } from "../services/api";

// State y Actions for the reducer
interface AutocompleteState {
  query: string;
  results: Address[];
  isLoading: boolean;
  error: string | null;
  activeIndex: number;
  hasSearched: boolean;
}

type AutocompleteAction =
  | { type: "SEARCH_START"; payload: string }
  | { type: "SEARCH_SUCCESS"; payload: Address[] }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "SELECT_ITEM"; payload: Address }
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: "CLEAR" };

const initialState: AutocompleteState = {
  query: "",
  results: [],
  isLoading: false,
  error: null,
  activeIndex: -1,
  hasSearched: false,
};

// Reducer function
function autocompleteReducer(
  state: AutocompleteState,
  action: AutocompleteAction
): AutocompleteState {
  switch (action.type) {
    case "SEARCH_START":
      return {
        ...state,
        isLoading: true,
        hasSearched: false,
        error: null,
        query: action.payload,
        activeIndex: -1,
      };
    case "SEARCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        hasSearched: true,
        results: action.payload,
      };
    case "SEARCH_ERROR":
      return {
        ...state,
        isLoading: false,
        hasSearched: true,
        error: action.payload,
        results: [],
      };
    case "SELECT_ITEM":
      return {
        ...state,
        query: action.payload.street,
        results: [],
        hasSearched: false,
        activeIndex: -1,
      };
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload };
    case "CLEAR":
      return {
        ...state,
        results: [],
        hasSearched: false,
        activeIndex: -1,
      };
    default:
      return state;
  }
}

// Custom hook
export function useAddressSearch(
  onSelect: (address: Address) => void // Callback for parent component
) {
  const [state, dispatch] = useReducer(autocompleteReducer, initialState);
  const selectionRef = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);

    // Debounce and search effect
  useEffect(() => {
    if (selectionRef.current) {
      selectionRef.current = false;
      return;
    }
    if (state.query.length < 3) {
      dispatch({ type: "CLEAR" });
      return;
    }

    const controller = new AbortController();
    const timerId = setTimeout(() => {
      dispatch({ type: "SEARCH_START", payload: state.query });
      searchAddresses(state.query, controller.signal)
        .then((data) => {
          dispatch({ type: "SEARCH_SUCCESS", payload: data });
        })
        .catch((e) => {
          if (e.name === "AbortError") return; // Petición cancelada
          dispatch({ type: "SEARCH_ERROR", payload: e.message });
        });
    }, 300);

    return () => {
      clearTimeout(timerId);
      controller.abort();
    };
  }, [state.query]);

  // --- Efecto para el Scroll ---
  useEffect(() => {
    if (state.activeIndex < 0 || !listRef.current) return;
    const activeItem = listRef.current.children[
      state.activeIndex
    ] as HTMLLIElement;
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [state.activeIndex]);

  // --- Manejadores (envueltos en useCallback) ---
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      selectionRef.current = false;
      dispatch({ type: "SEARCH_START", payload: e.target.value });
    },
    []
  );

  const handleSelect = useCallback(
    (address: Address) => {
      selectionRef.current = true;
      dispatch({ type: "SELECT_ITEM", payload: address });
      onSelect(address); // Llama al callback del padre
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          dispatch({
            type: "SET_ACTIVE_INDEX",
            payload:
              state.activeIndex >= state.results.length - 1
                ? 0
                : state.activeIndex + 1,
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          dispatch({
            type: "SET_ACTIVE_INDEX",
            payload:
              state.activeIndex <= 0
                ? state.results.length - 1
                : state.activeIndex - 1,
          });
          break;
        case "Enter":
          if (state.activeIndex >= 0) {
            e.preventDefault();
            handleSelect(state.results[state.activeIndex]);
          }
          break;
        case "Escape":
          dispatch({ type: "CLEAR" });
          break;
      }
    },
    [state.activeIndex, state.results, handleSelect]
  );

  return { state, listRef, handleQueryChange, handleKeyDown, handleSelect };
}