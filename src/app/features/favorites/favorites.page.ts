import type { OnDestroy } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';

import type { PlanazoEvent } from '../../core/models/event.model';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { PlanazoHeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    RouterModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    PlanazoHeaderComponent,
    EventCardComponent,
  ],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <app-planazo-header></app-planazo-header>

      <div class="pt-20 pb-28 px-4 max-w-lg mx-auto flex flex-col gap-4">
        <div class="flex items-center justify-between mt-1">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">Mis Favoritos</h1>
              <span class="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#e11d48] text-white shadow-sm">
                {{ favoriteEvents().length }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ favoriteEvents().length }} eventos guardados en Funza y la Sabana
            </p>
          </div>

          <button
            type="button"
            (click)="syncFavorites()"
            class="w-10 h-10 rounded-full bg-[#1f222c] border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Actualizar favoritos"
          >
            <span
              class="material-symbols-outlined text-[#e11d48] text-[20px]"
              [class.animate-spin]="isSyncing()"
            >
              sync
            </span>
          </button>
        </div>

        @if (eventService.cancelledFavoriteEvents().length > 0) {
          <div
            role="alert"
            class="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-start gap-3 text-xs text-red-100"
          >
            <span class="material-symbols-outlined text-red-400 text-[20px] flex-shrink-0">
              notification_important
            </span>
            <div class="flex flex-col gap-1 flex-1 min-w-0">
              <strong class="text-white">
                Atención: {{ eventService.cancelledFavoriteEvents().length }} evento(s) favorito(s) cancelado(s)
              </strong>
              @for (cancelled of eventService.cancelledFavoriteEvents(); track cancelled.id) {
                <a
                  [routerLink]="['/event', cancelled.id]"
                  class="text-rose-200 underline truncate"
                >
                  {{ cancelled.title }} — {{ cancelled.statusMessage || 'Cancelado' }}
                </a>
              }
            </div>
          </div>
        }

        <div class="p-1 rounded-xl bg-[#16181f] flex items-center gap-1 border border-white/10">
          <button
            type="button"
            (click)="activeTab.set('upcoming')"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            [class]="activeTab() === 'upcoming' ? 'bg-[#e11d48] text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>Próximos</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
              [class]="activeTab() === 'upcoming' ? 'bg-white text-[#e11d48]' : 'bg-[#1f222c] text-slate-300'"
            >
              {{ upcomingFavorites().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('past')"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            [class]="activeTab() === 'past' ? 'bg-[#e11d48] text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>Eventos Pasados</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold"
              [class]="activeTab() === 'past' ? 'bg-white text-[#e11d48]' : 'bg-[#1f222c] text-slate-300'"
            >
              {{ pastFavorites().length }}
            </span>
          </button>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-300">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16181f] border border-white/10">
            <span class="material-symbols-outlined text-[#e11d48] text-[16px]">swap_vert</span>
            <span>Orden: Por fecha más próxima</span>
          </div>

          <span class="text-slate-400 text-[11px]">{{ displayedList().length }} mostrados</span>
        </div>

        @if (displayedList().length > 0) {
          <div class="flex flex-col gap-4">
            @for (event of displayedList(); track event.id) {
              <app-event-card
                [event]="event"
                (toggleFavorite)="removeFavorite($event)"
              ></app-event-card>
            }
          </div>
        } @else {
          <div class="my-8 p-8 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3">
            <span class="material-symbols-outlined text-slate-500 text-[52px]">favorite_border</span>
            <h3 class="font-headline font-bold text-lg text-white">
              No tienes favoritos en esta sección
            </h3>
            <p class="text-xs text-slate-400 max-w-xs">
              {{
                activeTab() === 'upcoming'
                  ? 'Explora eventos y presiona el icono de corazón para guardarlos aquí.'
                  : 'Aún no tienes historial de eventos favoritos que ya hayan concluido.'
              }}
            </p>
            <button
              type="button"
              routerLink="/tabs/explorar"
              class="mt-2 px-5 py-2.5 rounded-xl bg-[#e11d48] text-white text-xs font-bold shadow-md shadow-[#e11d48]/30 active:scale-95 transition-all"
            >
              Descubrir eventos
            </button>
          </div>
        }
      </div>

      @if (recentlyRemovedEvent(); as removed) {
        <div
          role="status"
          aria-live="polite"
          class="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#1f222c] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
        >
          <span class="text-xs text-white truncate">
            Eliminado de tus favoritos: <strong>{{ removed.title }}</strong>
          </span>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              (click)="undoRemove()"
              class="px-3 py-1.5 rounded-lg bg-[#e11d48] text-white text-xs font-bold active:scale-95 transition-transform"
            >
              Deshacer
            </button>
            <button
              type="button"
              (click)="dismissToast()"
              aria-label="Cerrar aviso"
              class="text-slate-400 hover:text-white"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      }
    </ion-content>
  `,
})
export class FavoritesPage implements OnDestroy {
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  activeTab = signal<'upcoming' | 'past'>('upcoming');
  isSyncing = signal(false);
  recentlyRemovedEvent = signal<PlanazoEvent | null>(null);
  private undoTimer: ReturnType<typeof setTimeout> | null = null;

  favoriteEvents = this.eventService.favoriteEvents;

  upcomingFavorites = computed(() =>
    this.favoriteEvents().filter((e) => e.status !== 'finalizado')
  );

  pastFavorites = computed(() =>
    this.favoriteEvents().filter((e) => e.status === 'finalizado')
  );

  displayedList = computed(() =>
    this.activeTab() === 'upcoming' ? this.upcomingFavorites() : this.pastFavorites()
  );

  ngOnDestroy(): void {
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
    }
  }

  removeFavorite(eventId: string): void {
    const target = this.eventService.getEventById(eventId);
    this.eventService.setFavorite(eventId, false);
    this.recentlyRemovedEvent.set(target ?? null);

    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
    }
    this.undoTimer = setTimeout(() => {
      this.recentlyRemovedEvent.set(null);
    }, 5000);
  }

  undoRemove(): void {
    const removed = this.recentlyRemovedEvent();
    if (!removed) return;

    this.eventService.setFavorite(removed.id, true);
    this.recentlyRemovedEvent.set(null);
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
    }
  }

  dismissToast(): void {
    this.recentlyRemovedEvent.set(null);
  }

  async syncFavorites(): Promise<void> {
    this.isSyncing.set(true);
    try {
      await this.eventService.syncOfflineCache();
    } finally {
      setTimeout(() => {
        this.isSyncing.set(false);
      }, 450);
    }
  }

  handleRefresh(event: Event): void {
    void this.syncFavorites();
    setTimeout(() => {
      const target = event.target as { complete?: () => void } | null;
      target?.complete?.();
    }, 600);
  }
}
