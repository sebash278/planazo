import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { PlanazoEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isNative = Capacitor.isNativePlatform();
  private dbReady = false;

  constructor() {
    this.initDatabase();
  }

  async initDatabase() {
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

      const schema = `
        CREATE TABLE IF NOT EXISTS cached_events (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          data TEXT NOT NULL,
          is_favorite INTEGER DEFAULT 0,
          cached_at INTEGER NOT NULL
        );
      `;
      await this.db.execute(schema);
      this.dbReady = true;
    } catch (err) {
      console.warn('SQLite native connection fallback to web storage:', err);
      this.dbReady = true;
    }
  }

  async cacheEvents(events: PlanazoEvent[]) {
    if (this.isNative && this.db && this.dbReady) {
      try {
        for (const evt of events) {
          const sql = `
            INSERT OR REPLACE INTO cached_events (id, title, category, data, is_favorite, cached_at)
            VALUES (?, ?, ?, ?, ?, ?);
          `;
          await this.db.run(sql, [
            evt.id,
            evt.title,
            evt.category,
            JSON.stringify(evt),
            evt.isFavorite ? 1 : 0,
            Date.now(),
          ]);
        }
      } catch (err) {
        console.error('Error caching events to SQLite:', err);
      }
    } else {
      try {
        localStorage.setItem('planazo_offline_cache', JSON.stringify(events));
      } catch {
        // si la memoria se llenó f
      }
    }
  }

  async getCachedEvents(): Promise<PlanazoEvent[]> {
    if (this.isNative && this.db && this.dbReady) {
      try {
        const res = await this.db.query('SELECT data FROM cached_events;');
        if (res.values) {
          return res.values.map((row: { data: string }) => JSON.parse(row.data));
        }
      } catch (err) {
        console.error('Error fetching from SQLite:', err);
      }
    }

    try {
      const saved = localStorage.getItem('planazo_offline_cache');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}
