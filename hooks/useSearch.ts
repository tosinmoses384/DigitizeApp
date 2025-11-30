import { useState, useCallback, useMemo } from 'react';

interface UseSearchProps {
  debounceMs?: number;
  minSearchLength?: number;
}

export const useSearch = ({ debounceMs = 300, minSearchLength = 0 }: UseSearchProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Optimized search handler with built-in validation
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Clear debounced query immediately if below minimum length
    if (query.length < minSearchLength) {
      setDebouncedQuery('');
      return;
    }

    // Debounce the search query
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [debounceMs, minSearchLength]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Memoized search state
  const searchState = useMemo(() => ({
    isSearching: searchQuery.length > 0,
    hasValidSearch: debouncedQuery.length >= minSearchLength,
    isEmpty: searchQuery.length === 0
  }), [searchQuery, debouncedQuery, minSearchLength]);

  return {
    searchQuery,
    debouncedQuery,
    searchState,
    handleSearchChange,
    clearSearch
  };
};
