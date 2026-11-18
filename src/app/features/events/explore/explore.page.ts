import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular';

import type { EventCategory } from '../../../core/models/category.model';
import { PLANAZO_CATEGORIES } from '../../../core/models/category.model';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { PlanazoHeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-explore',
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

      <div class="pt-20 pb-24 px-4 max-w-lg mx-auto flex flex-col gap-5">
        <section class="mt-2 flex flex-col gap-1">
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-[#e11d48] animate-pulse"></span>
            <span class="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              En directo en {{ eventService.selectedCity() }}, Cundinamarca
            </span>
          </div>

          <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight">
            @if (authService.isGuest()) {
              ¡Bienvenido a Planazo!
            } @else {
              ¡Hola, {{ authService.currentUser().fullName.split(' ')[0] }}!
            }
          </h1>
          <p class="text-sm text-slate-400">
            ¿Qué planazo te apetece vivir en la Sabana hoy?
          </p>

          <div class="relative w-full mt-3">
            <button
              type="button"
              (click)="navigateToSearch()"
              aria-label="Buscar eventos y abrir filtros"
              class="w-full text-left flex items-center bg-[#1f222c] rounded-2xl px-4 py-3 shadow-md border border-white/10 cursor-pointer active:scale-[0.99] transition-all"
            >
              <span class="material-symbols-outlined text-[#e11d48] text-[22px] mr-3">search</span>
              <span class="text-sm text-slate-400 flex-1 truncate">
                Buscar ferias, Zaquesazipa, teatro, deportes...
              </span>
              <span class="w-8 h-8 rounded-xl bg-[#282c38] flex items-center justify-center text-[#e11d48]">
                <span class="material-symbols-outlined text-[18px]">tune</span>
              </span>
            </button>
          </div>
        </section>

        <section class="-mx-4 px-4 overflow-x-auto no-scrollbar py-1">
          <div class="flex items-center gap-2" role="tablist" aria-label="Categorías de eventos">
            @for (cat of categoryPills; track cat.id) {
              <button
                type="button"
                (click)="onSelectCategory(cat.id)"
                class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95"
                [class]="activeCategory() === cat.id ? 'bg-[#e11d48] text-white shadow-md shadow-[#e11d48]/30 font-bold' : 'bg-[#16181f] text-slate-300 border border-white/10 hover:bg-[#1f222c]'"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
              </button>
            }
          </div>
        </section>

        @if (eventService.featuredEvents().length > 0) {
          <section class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#e11d48] text-[20px]">
                  local_fire_department
                </span>
                <h2 class="font-headline font-bold text-lg text-white">Planes Destacados</h2>
              </div>
              <button
                type="button"
                (click)="navigateToSearch()"
                class="text-xs font-semibold text-[#e11d48] hover:underline"
              >
                Ver todos
              </button>
            </div>

            @if (eventService.featuredEvents()[0]; as topEvent) {
              <app-event-card
                [event]="topEvent"
                (toggleFavorite)="handleToggleFavorite($event)"
              ></app-event-card>
            }
          </section>
        }

        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-400 text-[20px]">schedule</span>
              <h2 class="font-headline font-bold text-lg text-white">
                Próximos en {{ eventService.selectedCity() }}
              </h2>
            </div>
            <span class="text-xs text-slate-400">
              {{ displayedEvents().length }} disponibles
            </span>
          </div>

          <div class="flex flex-col gap-4">
            @for (event of displayedEvents(); track event.id) {
              <app-event-card
                [event]="event"
                (toggleFavorite)="handleToggleFavorite($event)"
              ></app-event-card>
            }
          </div>

          @if (displayedEvents().length === 0) {
            <div class="p-8 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3">
              <span class="material-symbols-outlined text-slate-500 text-[48px]">event_busy</span>
              <h3 class="font-headline font-bold text-base text-white">
                No hay eventos en esta categoría
              </h3>
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
          }
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
    ...PLANAZO_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.name,
      icon: c.icon,
    })),
  ];

  readonly displayedEvents = computed(() => {
    const cat = this.activeCategory();
    const all = this.eventService.upcomingEvents();
    return cat === 'todos' ? all : all.filter((e) => e.category === cat);
  });

  onSelectCategory(cat: EventCategory): void {
    this.activeCategory.set(cat);
  }

  handleRefresh(event: Event): void {
    setTimeout(() => {
      const target = event.target as { complete?: () => void } | null;
      target?.complete?.();
    }, 500);
  }

  navigateToSearch(): void {
    this.router.navigate(['/tabs/buscar']);
  }

  handleToggleFavorite(eventId: string): void {
    if (this.authService.isGuest()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Inicia sesión para guardar tus eventos favoritos' },
      });
      return;
    }
    this.eventService.toggleFavorite(eventId);
  }
}
