import type { EventCategory } from './event.model';

export type DateFilterOption = 'all' | 'today' | 'weekend' | 'this_month' | 'custom';

export interface FilterOptions {
  searchTerm: string;
  category: EventCategory;
  dateFilter: DateFilterOption;
  startDate?: string;
  endDate?: string;
  onlyFree: boolean;
  maxPrice: number;
  maxDistanceKm: number;
  city: string;
}

export const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  searchTerm: '',
  category: 'todos',
  dateFilter: 'all',
  onlyFree: false,
  maxPrice: 150000,
  maxDistanceKm: 15,
  city: 'Funza',
};
