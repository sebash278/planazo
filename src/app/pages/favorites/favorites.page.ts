import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';
import { PlanazoHeaderComponent } from '../../shared/components/header/header.component';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { SqliteService } from '../../core/services/sqlite.service';
import { PlanazoEvent } from '../../core/models/event.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
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

      <div class="pt-20 pb-24 px-4 max-w-lg mx-auto flex flex-col gap-4">
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
            aria-label="Sincronizar"
          >
            <span class="material-symbols-outlined text-[#e11d48] text-[20px]" [class.animate-spin]="isSyncing()">sync</span>
          </button>
        </div>

        <div class="p-1 rounded-xl bg-[#16181f] flex items-center gap-1 border border-white/10">
          <button
            type="button"
            (click)="activeTab.set('upcoming')"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            [ngClass]="activeTab() === 'upcoming' ? 'bg-[#e11d48] text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>Próximos</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold" [ngClass]="activeTab() === 'upcoming' ? 'bg-white text-[#e11d48]' : 'bg-[#1f222c] text-slate-300'">
              {{ upcomingFavorites().length }}
            </span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('past')"
            class="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
            [ngClass]="activeTab() === 'past' ? 'bg-[#e11d48] text-white shadow-md' : 'text-slate-400 hover:text-white'"
          >
            <span>Eventos Pasados</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold" [ngClass]="activeTab() === 'past' ? 'bg-white text-[#e11d48]' : 'bg-[#1f222c] text-slate-300'">
              {{ pastFavorites().length }}
            </span>
          </button>
        </div>

        <div class="flex items-center justify-between text-xs text-slate-300">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16181f] border border-white/10">
            <span class="material-symbols-outlined text-[#e11d48] text-[16px]">swap_vert</span>
            <span>Orden: Por fecha más próxima</span>
          </div>

          <span class="text-slate-400 text-[11px]">
            {{ displayedList().length }} mostrados
          </span>
        </div>

        <div *ngIf="displayedList().length > 0" class="flex flex-col gap-4">
          <app-event-card
            *ngFor="let event of displayedList()"
            [event]="event"
            (toggleFavorite)="removeFavorite($event)"
          ></app-event-card>
        </div>

        <div
          *ngIf="displayedList().length === 0"
          class="my-8 p-8 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3"
        >
          <span class="material-symbols-outlined text-slate-500 text-[52px]">favorite_border</span>
          <h3 class="font-headline font-bold text-lg text-white">No tienes favoritos en esta sección</h3>
          <p class="text-xs text-slate-400 max-w-xs">
            {{ activeTab() === 'upcoming' ? 'Explora eventos y presiona el icono de corazón para guardarlos aquí.' : 'Aún no tienes historial de eventos favoritos que ya hayan concluido.' }}
          </p>
          <button
            type="button"
            routerLink="/tabs/explorar"
            class="mt-2 px-5 py-2.5 rounded-xl bg-[#e11d48] text-white text-xs font-bold shadow-md shadow-[#e11d48]/30 active:scale-95 transition-all"
          >
            Descubrir eventos
          </button>
        </div>
      </div>
    </ion-content>
  `,
})
export class FavoritesPage {
  eventService = inject(EventService);
  authService = inject(AuthService);
  sqliteService = inject(SqliteService);
  router = inject(Router);

  activeTab = signal<'upcoming' | 'past'>('upcoming');
  isSyncing = signal(false);

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

  // chau favorito
  removeFavorite(eventId: string) {
    this.eventService.toggleFavorite(eventId);
    this.sqliteService.cacheEvents(this.eventService.favoriteEvents());
  }

  syncFavorites() {
    this.isSyncing.set(true);
    setTimeout(() => {
      this.sqliteService.cacheEvents(this.eventService.favoriteEvents());
      this.isSyncing.set(false);
    }, 600);
  }

  handleRefresh(event: any) {
    this.syncFavorites();
    setTimeout(() => {
      event.target.complete();
    }, 700);
  }
}
