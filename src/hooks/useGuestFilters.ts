import { useMemo, useState, useCallback } from 'react';
import { Guest } from '../types/guest';
import { FilterOptions } from '../components/FilterModal';

export const useGuestFilters = (guests: Guest[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    companions: 'all',
    table: 'all'
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Get unique tables for filter options
  const availableTables = useMemo(() => {
    const tables = new Set(guests.map(guest => guest.tableName));
    return Array.from(tables).sort();
  }, [guests]);

  // Apply filters and search
  const filteredGuests = useMemo(() => {
    let result = guests;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(guest =>
        guest.fullName.toLowerCase().includes(query) ||
        guest.tableName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(guest => {
        if (filters.status === 'present') return guest.isPresent;
        if (filters.status === 'absent') return !guest.isPresent;
        return true;
      });
    }

    // Apply companions filter
    if (filters.companions !== 'all') {
      result = result.filter(guest => {
        if (filters.companions === '0') return guest.companions === 0;
        if (filters.companions === '1+') return guest.companions >= 1;
        if (filters.companions === '2+') return guest.companions >= 2;
        return true;
      });
    }

    // Apply table filter
    if (filters.table !== 'all') {
      result = result.filter(guest => guest.tableName === filters.table);
    }

    return result;
  }, [guests, filters, searchQuery]);

  // Get active filter count for UI badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.companions !== 'all') count++;
    if (filters.table !== 'all') count++;
    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0 || searchQuery.trim().length > 0;
  }, [activeFilterCount, searchQuery]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      companions: 'all',
      table: 'all'
    });
    setSearchQuery('');
  }, []);

  // Get filter summary text for UI
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    
    if (filters.status === 'present') parts.push('Présents');
    if (filters.status === 'absent') parts.push('Absents');
    
    if (filters.companions === '0') parts.push('Sans accompagnant');
    if (filters.companions === '1+') parts.push('1+ accompagnant');
    if (filters.companions === '2+') parts.push('2+ accompagnants');
    
    if (filters.table !== 'all') parts.push(`Table ${filters.table}`);
    
    if (searchQuery.trim()) parts.push(`"${searchQuery.trim()}"`);
    
    return parts.length > 0 ? parts.join(' • ') : null;
  }, [filters, searchQuery]);

  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    filteredGuests,
    availableTables,
    activeFilterCount,
    hasActiveFilters,
    resetFilters,
    filterSummary
  };
};