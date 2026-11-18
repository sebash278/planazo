import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import type {
  SQLiteDBConnection} from '@capacitor-community/sqlite';
import {
  CapacitorSQLite,
  SQLiteConnection
} from '@capacitor-community/sqlite';

import type { PlanazoEvent } from '../models/event.model';

export const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS cached_events (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TEXT NOT NULL,
    price_cop INTEGER NOT NULL DEFAULT 0,
    is_free INTEGER NOT NULL DEFAULT 0,
    city TEXT NOT NULL,
    data TEXT NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    cached_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS favorite_events (
    event_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'guest',
    saved_at INTEGER NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_events_category ON cached_events(category);
  CREATE INDEX IF NOT EXISTS idx_events_start_date ON cached_events(start_date);
  CREATE INDEX IF NOT EXISTS idx_events_favorite ON cached_events(is_favorite);
`;

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private readonly CACHE_STORAGE_KEY = 'planazo_offline_cache';
  private readonly FAVORITES_STORAGE_KEY = 'planazo_favorites';

  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isNative = Capacitor.isNativePlatform();
  private dbReady = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initDatabase();
  }

  async initDatabase(): Promise<void> {
    if (!this.isNative) {
      this.dbReady = true;
      return;
    }

    try {
      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
      this.db = await this.sqliteConnection.createConnection(
        'planazo_db',
        false,
        'no-encryption',
        1,
        false
      );
      await this.db.open();
      await this.db.execute(SQLITE_SCHEMA);
      this.dbReady = true;
    } catch (err) {
      // Fallback a almacenamiento web cuando el runtime nativo no está disponible.
      console.warn('SQLite native connection fallback to web storage:', err);
      this.dbReady = true;
    }
  }

  private async ensureReady(): Promise<void> {
    await this.initPromise;
  }

  async cacheEvents(events: PlanazoEvent[]): Promise<void> {
    await this.ensureReady();

    if (this.isNative && this.db && this.dbReady) {
      try {
        for (const evt of events) {
          const sql = `
            INSERT OR REPLACE INTO cached_events (
              id, title, category, status, start_date, price_cop, is_free, city, data, is_favorite, cached_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          `;
          await this.db.run(sql, [
            evt.id,
            evt.title,
            evt.category,
            evt.status,
            evt.schedule.startDate,
            evt.pricing.priceCOP,
            evt.pricing.isFree ? 1 : 0,
            evt.location.city,
            JSON.stringify(evt),
            evt.isFavorite ? 1 : 0,
            Date.now(),
          ]);
        }
        return;
      } catch (err) {
        console.error('Error caching events to SQLite:', err);
      }
    }

    try {
      localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Ignora error si la cuota de localStorage se agota.
    }
  }

  async getCachedEvents(): Promise<PlanazoEvent[]> {
    await this.ensureReady();

    if (this.isNative && this.db && this.dbReady) {
      try {
        const res = await this.db.query(
          'SELECT data FROM cached_events ORDER BY start_date ASC;'
        );
        if (res.values) {
          return res.values.map((row: { data: string }) => JSON.parse(row.data) as PlanazoEvent);
        }
      } catch (err) {
        console.error('Error fetching from SQLite:', err);
      }
    }

    try {
      const saved = localStorage.getItem(this.CACHE_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as PlanazoEvent[]) : [];
    } catch {
      return [];
    }
  }

  async saveFavorite(
    eventId: string,
    isFavorite: boolean,
    userId = 'local'
  ): Promise<void> {
    await this.ensureReady();

    if (this.isNative && this.db && this.dbReady) {
      try {
        await this.db.run('UPDATE cached_events SET is_favorite = ? WHERE id = ?;', [
          isFavorite ? 1 : 0,
          eventId,
        ]);

        if (isFavorite) {
          await this.db.run(
            `INSERT OR REPLACE INTO favorite_events (event_id, user_id, saved_at, synced)
             VALUES (?, ?, ?, ?);`,
            [eventId, userId, Date.now(), 0]
          );
        } else {
          await this.db.run('DELETE FROM favorite_events WHERE event_id = ?;', [eventId]);
        }
        return;
      } catch (err) {
        console.error('Error saving favorite in SQLite:', err);
      }
    }

    try {
      const savedIds = await this.getFavoriteIds();
      const updatedIds = isFavorite
        ? Array.from(new Set([...savedIds, eventId]))
        : savedIds.filter((id) => id !== eventId);

      localStorage.setItem(this.FAVORITES_STORAGE_KEY, JSON.stringify(updatedIds));

      const cachedRaw = localStorage.getItem(this.CACHE_STORAGE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw) as PlanazoEvent[];
        const syncedCache = cached.map((evt) =>
          evt.id === eventId ? { ...evt, isFavorite } : evt
        );
        localStorage.setItem(this.CACHE_STORAGE_KEY, JSON.stringify(syncedCache));
      }
    } catch {
      // Ignora errores de acceso a almacenamiento web.
    }
  }

  async getFavoriteIds(): Promise<string[]> {
    await this.ensureReady();

    if (this.isNative && this.db && this.dbReady) {
      try {
        const res = await this.db.query(
          'SELECT event_id FROM favorite_events ORDER BY saved_at ASC;'
        );
        if (res.values) {
          return res.values.map((row: { event_id: string }) => row.event_id);
        }
      } catch (err) {
        console.error('Error reading favorites from SQLite:', err);
      }
    }

    try {
      const saved = localStorage.getItem(this.FAVORITES_STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
}
