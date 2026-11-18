import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import type { EventCategory } from '../models/category.model';

import { EventService } from './event.service';
import { SqliteService } from './sqlite.service';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [EventService],
    });
    service = TestBed.inject(EventService);
  });

  it('should contain seed events covering all RF-05 required categories', () => {
    const requiredCategories: EventCategory[] = [
      'musica',
      'cine',
      'gastronomia',
      'deportes',
      'arte',
      'cultura',
      'entretenimiento',
      'actividad_fisica',
    ];
    const present = new Set(service.allEvents().map((e) => e.category));
    for (const cat of requiredCategories) {
      expect(present.has(cat)).toBe(true);
    }
  });

  it('should sort upcoming events chronologically and exclude finished or cancelled events', () => {
    const upcoming = service.upcomingEvents();
    expect(upcoming.every((e) => e.status !== 'finalizado' && e.status !== 'cancelado')).toBe(true);
    for (let i = 1; i < upcoming.length; i++) {
      const prev = new Date(upcoming[i - 1].schedule.startDate).getTime();
      const curr = new Date(upcoming[i].schedule.startDate).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  it('should filter events by free only and price ceiling', () => {
    service.setFilterOptions({ onlyFree: true });
    expect(service.filteredEvents().every((e) => e.pricing.isFree)).toBe(true);

    service.setFilterOptions({ onlyFree: false, maxPrice: 25000 });
    expect(service.filteredEvents().every((e) => e.pricing.priceCOP <= 25000)).toBe(true);
  });

  it('should filter events by category and exclude finished events', () => {
    service.setFilterOptions({ category: 'musica' });
    const filtered = service.filteredEvents();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((e) => e.category === 'musica' && e.status !== 'finalizado')).toBe(true);
  });

  it('should search events by name, organizer, and venue ignoring accents', () => {
    service.setFilterOptions({ searchTerm: 'Bacata' });
    expect(service.filteredEvents().some((e) => e.title.includes('Bacatá'))).toBe(true);

    service.setFilterOptions({ searchTerm: 'Cundeportes' });
    expect(service.filteredEvents().some((e) => e.id === 'evt-carrera-atletica')).toBe(true);

    service.setFilterOptions({ searchTerm: 'Humedal Guali' });
    expect(service.filteredEvents().some((e) => e.id === 'evt-humedal-guali')).toBe(true);
  });

  it('should apply weekend and custom date range filters combined with distance', () => {
    service.setFilterOptions({ dateFilter: 'weekend', maxDistanceKm: 15 });
    const weekendEvents = service.filteredEvents();
    expect(weekendEvents.length).toBeGreaterThan(0);
    expect(
      weekendEvents.every((e) => {
        const day = new Date(e.schedule.startDate).getDay();
        return day === 5 || day === 6 || day === 0;
      })
    ).toBe(true);

    service.setFilterOptions({
      dateFilter: 'custom',
      startDate: '2026-11-28',
      endDate: '2026-11-30',
      maxDistanceKm: 25,
    });
    const customEvents = service.filteredEvents();
    expect(customEvents.some((e) => e.id === 'evt-feria-gastronomica')).toBe(true);
    expect(customEvents.some((e) => e.id === 'evt-tunjo-facatativa')).toBe(true);

    service.setFilterOptions({ maxDistanceKm: 15 });
    expect(service.filteredEvents().some((e) => e.id === 'evt-tunjo-facatativa')).toBe(false);
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

  it('should set and restore favorites via setFavorite and sync SQLite ids', async () => {
    const sqlite = TestBed.inject(SqliteService);
    const targetId = 'evt-feria-gastronomica';

    service.setFavorite(targetId, true);
    expect(service.getEventById(targetId)?.isFavorite).toBe(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(await sqlite.getFavoriteIds()).toContain(targetId);

    service.setFavorite(targetId, false);
    expect(service.getEventById(targetId)?.isFavorite).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(await sqlite.getFavoriteIds()).not.toContain(targetId);
  });

  it('should detect cancelled events inside user favorites', () => {
    const cancelledId = 'evt-obra-teatro-cancelada';
    service.setFavorite(cancelledId, true);

    const cancelledFavs = service.cancelledFavoriteEvents();
    expect(cancelledFavs.some((e) => e.id === cancelledId && e.status === 'cancelado')).toBe(true);
  });

  it('should track sold-out events with zero available tickets', () => {
    const soldOut = service.getEventById('evt-entretenimiento-mosquera');
    expect(soldOut).toBeTruthy();
    expect(soldOut?.status).toBe('agotado');
    expect(soldOut?.availableTickets).toBe(0);
  });

  it('should start with zero favorites and toggle attendance state', () => {
    expect(service.favoriteEvents().length).toBe(0);

    const eventId = 'evt-bacata-urbano';
    expect(service.isAttending(eventId)).toBe(false);
    expect(service.toggleAttendance(eventId)).toBe(true);
    expect(service.isAttending(eventId)).toBe(true);
    expect(service.toggleAttendance(eventId)).toBe(false);
    expect(service.isAttending(eventId)).toBe(false);
  });
});
