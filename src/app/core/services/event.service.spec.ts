import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventService],
    });
    service = TestBed.inject(EventService);
  });

  it('should be created and contain Funza seed events', () => {
    expect(service).toBeTruthy();
    expect(service.allEvents().length).toBeGreaterThan(0);
  });

  it('should filter events by free only', () => {
    service.setFilterOptions({ onlyFree: true });
    const filtered = service.filteredEvents();
    expect(filtered.every((e) => e.pricing.isFree)).toBe(true);
  });

  it('should filter events by category', () => {
    service.setFilterOptions({ category: 'musica' });
    const filtered = service.filteredEvents();
    expect(filtered.every((e) => e.category === 'musica')).toBe(true);
  });

  it('should search events by free text query', () => {
    service.setFilterOptions({ searchTerm: 'Bacatá' });
    const filtered = service.filteredEvents();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some((e) => e.title.includes('Bacatá'))).toBe(true);
  });

  it('should calculate distance from Funza center accurately', () => {
    const dist = service.calculateDistanceFromCenter(4.7165, -74.2115);
    expect(dist).toBeGreaterThanOrEqual(0);
    expect(dist).toBeLessThan(5);
  });

  it('should toggle favorite status reactively', () => {
    const firstEvent = service.allEvents()[0];
    const initialFav = firstEvent.isFavorite;

    const newFav = service.toggleFavorite(firstEvent.id);
    expect(newFav).toBe(!initialFav);

    const updated = service.getEventById(firstEvent.id);
    expect(updated?.isFavorite).toBe(!initialFav);
  });
});
