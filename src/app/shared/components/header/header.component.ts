import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { OfflineService } from '../../../core/services/offline.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-planazo-header',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="fixed top-0 w-full z-50 pt-safe bg-[#0d0e12]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_1px_16px_rgba(0,0,0,0.6)]">
      <div class="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        <a
          routerLink="/tabs/explorar"
          class="flex items-center gap-2 min-w-0 flex-shrink-0 cursor-pointer"
          aria-label="Ir a explorar eventos"
        >
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#9f1239] via-[#e11d48] to-white flex items-center justify-center shadow-md shadow-[#e11d48]/40">
            <span class="material-symbols-outlined text-white text-[20px]">explore</span>
          </div>
          <span class="font-headline font-bold text-[17px] text-white tracking-tight hidden sm:inline">
            Planazo
          </span>
        </a>

        <div class="relative">
          <button
            type="button"
            (click)="toggleCityMenu()"
            aria-label="Cambiar ciudad"
            [attr.aria-expanded]="showCityDropdown()"
            class="min-h-[40px] px-3 py-1 flex items-center gap-1.5 bg-[#1f222c] hover:bg-[#282c38] rounded-full text-white shadow-md border border-white/10 active:scale-95 transition-all"
          >
            <span class="material-symbols-outlined text-[#e11d48] text-[18px]">location_on</span>
            <span class="font-label text-xs font-semibold truncate max-w-[125px]">
              {{ eventService.selectedCity() }}
            </span>
            <span
              class="material-symbols-outlined text-slate-400 text-[16px] transition-transform duration-200"
              [class.rotate-180]="showCityDropdown()"
            >
              expand_more
            </span>
          </button>

          @if (showCityDropdown()) {
            <div class="absolute right-0 top-12 w-48 bg-[#16181f]/98 backdrop-blur-2xl rounded-xl shadow-2xl p-1.5 z-50 space-y-1 border border-white/15 animate-in fade-in zoom-in-95 duration-150">
              @for (city of availableCities; track city) {
                <button
                  type="button"
                  (click)="selectCity(city)"
                  class="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors"
                  [class]="eventService.selectedCity() === city ? 'bg-[#e11d48] text-white font-bold' : 'text-slate-300 hover:bg-[#1f222c] hover:text-white'"
                >
                  <span>{{ city }}</span>
                  @if (eventService.selectedCity() === city) {
                    <span class="material-symbols-outlined text-[16px]">check</span>
                  }
                </button>
              }
            </div>
          }
        </div>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            (click)="toggleTheme()"
            class="w-9 h-9 flex items-center justify-center rounded-full bg-[#1f222c] text-slate-300 border border-white/10 hover:text-white active:scale-95 transition-all"
            aria-label="Cambiar entre modo claro y oscuro"
            [title]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            <span class="material-symbols-outlined text-[18px]">
              {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
            </span>
          </button>

          <a
            routerLink="/tabs/favoritos"
            class="w-9 h-9 flex items-center justify-center text-slate-300 relative rounded-full bg-[#1f222c] border border-white/10 active:scale-95 transition-transform"
            aria-label="Notificaciones y alertas de favoritos"
          >
            <span class="material-symbols-outlined text-[19px]">notifications</span>
            @if (eventService.cancelledFavoriteEvents().length > 0) {
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e11d48] shadow-sm shadow-[#e11d48]"></span>
            }
          </a>

          @if (authService.isGuest()) {
            <a
              routerLink="/auth/login"
              class="min-h-[36px] px-3 py-1.5 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-[#e11d48]/30 active:scale-95 transition-all"
              aria-label="Ingresar o registrarse"
            >
              <span class="material-symbols-outlined text-[16px]">person</span>
              <span>Ingresar</span>
            </a>
          } @else {
            <a
              routerLink="/tabs/perfil"
              class="min-h-[40px] min-w-[40px] flex items-center justify-center p-0.5 rounded-full ring-2 ring-[#e11d48]/60 hover:ring-[#e11d48] transition-all"
              aria-label="Mi Perfil"
            >
              <img
                [src]="authService.currentUser().avatarUrl"
                [alt]="authService.currentUser().fullName"
                class="w-8 h-8 rounded-full object-cover"
              />
            </a>
          }
        </div>
      </div>

      @if (offlineService.isOffline()) {
        <div
          role="status"
          aria-live="polite"
          class="bg-amber-950/90 border-t border-amber-500/30 px-4 py-1.5 text-[11px] text-amber-200 flex items-center justify-center gap-1.5 max-w-lg mx-auto"
        >
          <span class="material-symbols-outlined text-[15px] text-amber-400 flex-shrink-0">wifi_off</span>
          <span>Sin conexión a Internet</span>
        </div>
      }
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PlanazoHeaderComponent {
  eventService = inject(EventService);
  authService = inject(AuthService);
  offlineService = inject(OfflineService);
  themeService = inject(ThemeService);

  showCityDropdown = signal(false);

  availableCities = ['Funza', 'Mosquera', 'Madrid, Cund.', 'Facatativá', 'Bojacá'];

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleCityMenu(): void {
    this.showCityDropdown.update((v) => !v);
  }

  selectCity(city: string): void {
    this.eventService.setSelectedCity(city);
    this.showCityDropdown.set(false);
  }
}
