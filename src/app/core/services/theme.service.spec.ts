import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
  });

  it('should initialize in dark mode by default and toggle to light mode', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);

    const next = service.toggleTheme();
    expect(next).toBe(false);
    expect(service.isDark()).toBe(false);
    expect(document.body.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('planazo_theme')).toBe('light');
  });

  it('should restore saved light preference from localStorage', () => {
    localStorage.setItem('planazo_theme', 'light');
    const service = TestBed.inject(ThemeService);

    expect(service.isDark()).toBe(false);
    expect(document.body.classList.contains('light')).toBe(true);

    service.setTheme('dark');
    expect(service.isDark()).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('planazo_theme')).toBe('dark');
  });
});
