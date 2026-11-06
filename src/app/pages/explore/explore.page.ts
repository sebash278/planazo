import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular';
import { PlanazoHeaderComponent } from '../../shared/components/header/header.component';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { EventCategory, PlanazoEvent } from '../../core/models/event.model';

@Component({
  selector: 'app-explore',
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

      <div class="pt-20 pb-24 px-4 max-w-lg mx-auto flex flex-col gap-5">
        <section class="mt-2 flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-[#e11d48] animate-pulse"></span>
            <span class="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              En directo en {{ eventService.selectedCity() }}, Cundinamarca
            </span>
          </div>

          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">
            ¡Hola, {{ authService.currentUser().fullName.split(' ')[0] }}!
          </h1>
          <p class="text-sm text-slate-400">
            ¿Qué planazo te apetece vivir en la Sabana hoy?
          </p>

          <div class="relative w-full mt-3">
            <div
              (click)="navigateToSearch()"
              class="flex items-center bg-[#1f222c] rounded-2xl px-4 py-3 shadow-md border border-white/10 cursor-pointer active:scale-[0.99] transition-all"
            >
              <span class="material-symbols-outlined text-[#e11d48] text-[22px] mr-3">search</span>
              <span class="text-sm text-slate-400 flex-1 truncate">
                Buscar ferias, Zaquesazipa, teatro, deportes...
              </span>
              <button
                type="button"
                class="w-8 h-8 rounded-xl bg-[#282c38] flex items-center justify-center text-[#e11d48]"
                aria-label="Filtros"
              >
                <span class="material-symbols-outlined text-[18px]">tune</span>
              </button>
            </div>
          </div>
        </section>

        <section class="-mx-4 px-4 overflow-x-auto no-scrollbar py-1">
          <div class="flex items-center gap-2">
            <button
              *ngFor="let cat of categoryPills"
              type="button"
              (click)="onSelectCategory(cat.id)"
              class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
              [ngClass]="activeCategory() === cat.id ? 'bg-[#e11d48] text-white shadow-md shadow-[#e11d48]/30 font-bold' : 'bg-[#16181f] text-slate-300 border border-white/10 hover:bg-[#1f222c]'"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </section>

        <section *ngIf="eventService.featuredEvents().length > 0" class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#e11d48] text-[20px]">local_fire_department</span>
              <h2 class="font-headline font-bold text-lg text-white">Planes Destacados</h2>
            </div>
            <span class="text-xs font-semibold text-[#e11d48] cursor-pointer" (click)="navigateToSearch()">Ver todos</span>
          </div>

          <div *ngIf="eventService.featuredEvents()[0] as topEvent">
            <app-event-card
              [event]="topEvent"
              (toggleFavorite)="handleToggleFavorite($event)"
            ></app-event-card>
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-400 text-[20px]">schedule</span>
              <h2 class="font-headline font-bold text-lg text-white">Próximos en Funza</h2>
            </div>
            <span class="text-xs text-slate-400">
              {{ displayedEvents().length }} disponibles
            </span>
          </div>

          <div class="flex flex-col gap-4">
            <app-event-card
              *ngFor="let event of displayedEvents()"
              [event]="event"
              (toggleFavorite)="handleToggleFavorite($event)"
            ></app-event-card>
          </div>

          <div
            *ngIf="displayedEvents().length === 0"
            class="p-8 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3"
          >
            <span class="material-symbols-outlined text-slate-500 text-[48px]">event_busy</span>
            <h3 class="font-headline font-bold text-base text-white">No hay eventos en esta categoría</h3>
            <p class="text-xs text-slate-400 max-w-xs">
              Actualmente no tenemos eventos programados en esta sección para {{ eventService.selectedCity() }}.
            </p>
            <button
              type="button"
              (click)="onSelectCategory('todos')"
              class="mt-2 px-4 py-2 rounded-xl bg-[#e11d48] text-white text-xs font-bold"
            >
              Ver todos los planes
            </button>
          </div>
        </section>
      </div>
    </ion-content>
  `,
})
export class ExplorePage {
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  activeCategory = signal<EventCategory>('todos');

  categoryPills: { id: EventCategory; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todas', icon: '✨' },
    { id: 'musica', label: 'Música', icon: '🎵' },
    { id: 'teatro', label: 'Zaquesazipa & Teatro', icon: '🎭' },
    { id: 'gastronomia', label: 'Gastronomía', icon: '🥘' },
    { id: 'deportes', label: 'Deportes', icon: '⚽' },
    { id: 'ecologia', label: 'Humedal & Naturaleza', icon: '🌾' },
    { id: 'cine', label: 'Cine', icon: '🎬' },
    { id: 'arte', label: 'Arte & Cultura', icon: '🎨' },
  ];

  displayedEvents = signal<PlanazoEvent[]>([]);

  constructor() {
    this.updateDisplayed();
  }

  onSelectCategory(cat: EventCategory) {
    this.activeCategory.set(cat);
    this.updateDisplayed();
  }

  private updateDisplayed() {
    const cat = this.activeCategory();
    const all = this.eventService.upcomingEvents();
    if (cat === 'todos') {
      this.displayedEvents.set(all);
    } else {
      this.displayedEvents.set(all.filter((e) => e.category === cat));
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.updateDisplayed();
      event.target.complete();
    }, 600);
  }

  navigateToSearch() {
    this.router.navigate(['/tabs/buscar']);
  }

  handleToggleFavorite(eventId: string) {
    if (this.authService.isGuest()) {
      // si es invitado lo mandamos pal login
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Inicia sesión para guardar tus eventos favoritos' },
      });
      return;
    }
    this.eventService.toggleFavorite(eventId);
    this.updateDisplayed();
  }
}
