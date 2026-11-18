import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'planazo_theme';
  private isDarkSignal = signal<boolean>(this.resolveInitialDarkMode());

  readonly isDark = this.isDarkSignal.asReadonly();

  constructor() {
    this.applyTheme(this.isDarkSignal());
  }

  toggleTheme(): boolean {
    const nextDark = !this.isDarkSignal();
    this.setTheme(nextDark ? 'dark' : 'light');
    return nextDark;
  }

  setTheme(mode: 'dark' | 'light'): void {
    const isDark = mode === 'dark';
    this.isDarkSignal.set(isDark);
    this.applyTheme(isDark);
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch {
      // Ignora fallo de cuota o acceso a localStorage.
    }
  }

  private resolveInitialDarkMode(): boolean {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'light') {
        return false;
      }
      if (saved === 'dark') {
        return true;
      }
    } catch {
      // Continúa con la preferencia del sistema si localStorage falla.
    }

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return !window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    return true;
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    const addClass = isDark ? 'dark' : 'light';
    const removeClass = isDark ? 'light' : 'dark';

    document.documentElement.classList.remove(removeClass);
    document.documentElement.classList.add(addClass);
    document.body.classList.remove(removeClass);
    document.body.classList.add(addClass);
  }
}
