import { EventCategory } from './event.model';

export type DateFilterOption = 'all' | 'today' | 'weekend' | 'this_month';

export interface FilterOptions {
  searchTerm: string;
  category: EventCategory;
  dateFilter: DateFilterOption;
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
