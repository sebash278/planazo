import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as L from 'leaflet';
import type { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { EventCategory } from '../../../core/models/category.model';
import type { PlanazoEvent } from '../../../core/models/event.model';
import type { FilterOptions } from '../../../core/models/filter.model';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { EventCardComponent } from '../../../shared/components/event-card/event-card.component';
import { FilterModalComponent } from '../../../shared/components/filter-modal/filter-modal.component';
import { PlanazoHeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-search-map',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    IonContent,
    PlanazoHeaderComponent,
    EventCardComponent,
    FilterModalComponent,
  ],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <app-planazo-header></app-planazo-header>

      <div class="pt-20 pb-20 max-w-lg mx-auto flex flex-col min-h-screen">
        <section class="sticky top-16 z-30 px-4 py-3 bg-[#0d0e12]/95 backdrop-blur-xl border-b border-white/10 flex flex-col gap-2.5">
          <div class="flex items-center gap-2">
            <div class="relative flex-1 flex items-center bg-[#1f222c] rounded-2xl px-3.5 py-2.5 border border-white/10 shadow-md">
              <span class="material-symbols-outlined text-[#e11d48] text-[20px] mr-2">search</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                aria-label="Buscar eventos por nombre, artista o lugar"
                placeholder="Buscar por evento, artista o lugar..."
                class="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  aria-label="Limpiar búsqueda"
                  class="text-slate-400 hover:text-white"
                >
                  <span class="material-symbols-outlined text-[18px]">cancel</span>
                </button>
              }
            </div>

            <button
              type="button"
              (click)="openFilterModal()"
              class="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#1f222c] text-white border border-white/10 active:scale-95 transition-all shadow-md"
              aria-label="Filtros avanzados"
            >
              <span class="material-symbols-outlined text-[20px]">tune</span>
              @if (activeFiltersCount() > 0) {
                <span class="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  {{ activeFiltersCount() }}
                </span>
              }
            </button>
          </div>

          <div class="grid grid-cols-2 bg-[#0d0e12] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              (click)="switchView('list')"
              class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              [class]="activeView() === 'list' ? 'bg-[#1f222c] text-white shadow-md border border-[#e11d48]/40' : 'text-slate-400 hover:text-white'"
            >
              <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span>Lista ({{ filteredList().length }})</span>
            </button>

            <button
              type="button"
              (click)="switchView('map')"
              class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              [class]="activeView() === 'map' ? 'bg-[#1f222c] text-white shadow-md border border-[#e11d48]/40' : 'text-slate-400 hover:text-white'"
            >
              <span class="material-symbols-outlined text-[18px] text-[#e11d48]">map</span>
              <span>Mapa</span>
            </button>
          </div>

          <div class="-mx-4 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              (click)="toggleQuickFree()"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              [class]="eventService.activeFilters().onlyFree ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span>🎉 Solo Gratis</span>
            </button>

            <button
              type="button"
              (click)="setQuickDate('weekend')"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              [class]="eventService.activeFilters().dateFilter === 'weekend' ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span class="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>Fin de semana</span>
            </button>

            <button
              type="button"
              (click)="setQuickPrice(30000)"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              [class]="eventService.activeFilters().maxPrice === 30000 ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span>&lt; $30.000 COP</span>
            </button>

            @if (activeFiltersCount() > 0) {
              <button
                type="button"
                (click)="resetAllFilters()"
                class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40"
              >
                <span class="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>Limpiar filtros</span>
              </button>
            }
          </div>
        </section>

        @if (activeView() === 'list') {
          <section class="p-4 flex flex-col gap-4 flex-1">
            @if (filteredList().length > 0) {
              <div class="flex flex-col gap-4">
                @for (event of filteredList(); track event.id) {
                  <app-event-card
                    [event]="event"
                    [distanceKm]="eventService.calculateDistanceFromCenter(event.location.lat, event.location.lng)"
                    (toggleFavorite)="handleToggleFavorite($event)"
                  ></app-event-card>
                }
              </div>
            } @else {
              <div class="my-6 p-6 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3">
                <span class="material-symbols-outlined text-slate-500 text-[52px]">search_off</span>
                <h3 class="font-headline font-bold text-lg text-white">No encontramos resultados</h3>
                <p class="text-xs text-slate-400 max-w-xs">
                  No hay planes que coincidan con
                  {{ searchQuery ? '"' + searchQuery + '"' : 'los filtros actuales' }}.
                  Prueba limpiar los filtros o explorar una categoría popular:
                </p>

                <div class="flex flex-wrap items-center justify-center gap-2 mt-1">
                  @for (cat of popularCategories; track cat.id) {
                    <button
                      type="button"
                      (click)="selectSuggestedCategory(cat.id)"
                      class="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1f222c] hover:bg-[#282c38] text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>{{ cat.icon }}</span>
                      <span>{{ cat.label }}</span>
                    </button>
                  }
                </div>

                <button
                  type="button"
                  (click)="resetAllFilters()"
                  class="mt-2 px-4 py-2 rounded-xl bg-[#e11d48] text-white text-xs font-bold shadow-md shadow-[#e11d48]/30"
                >
                  Restablecer filtros
                </button>
              </div>
            }
          </section>
        }

        @if (activeView() === 'map') {
          <section class="relative w-full flex-1 flex flex-col min-h-[550px]">
            <div #mapContainer class="w-full flex-1 min-h-[500px] z-10"></div>

            @if (selectedEventOnMap(); as selectedEvt) {
              <div class="absolute bottom-4 left-4 right-4 z-20 bg-[#16181f]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-white/15 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-4 duration-200">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] font-bold text-[#e11d48] uppercase tracking-wider">
                      {{ selectedEvt.categoryLabel }}
                    </span>
                    <h4 class="font-headline font-bold text-sm text-white truncate">
                      {{ selectedEvt.title }}
                    </h4>
                    <p class="text-xs text-slate-300 truncate">
                      {{ selectedEvt.location.venueName }} • {{ selectedEvt.pricing.displayPrice }}
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="selectedEventOnMap.set(null)"
                    aria-label="Cerrar tarjeta del mapa"
                    class="w-7 h-7 rounded-full bg-[#1f222c] flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <div class="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                  <button
                    type="button"
                    (click)="openGoogleMapsRoute(selectedEvt)"
                    class="py-2 px-2 rounded-xl bg-[#1f222c] hover:bg-[#282c38] text-[11px] font-semibold text-white flex items-center justify-center gap-1 border border-white/10"
                  >
                    <span class="material-symbols-outlined text-[#e11d48] text-[15px]">navigation</span>
                    <span>Google Maps</span>
                  </button>

                  <button
                    type="button"
                    (click)="openAppleMapsRoute(selectedEvt)"
                    class="py-2 px-2 rounded-xl bg-[#1f222c] hover:bg-[#282c38] text-[11px] font-semibold text-white flex items-center justify-center gap-1 border border-white/10"
                  >
                    <span class="material-symbols-outlined text-[#38bdf8] text-[15px]">map</span>
                    <span>Apple Maps</span>
                  </button>

                  <button
                    type="button"
                    [routerLink]="['/event', selectedEvt.id]"
                    class="py-2 px-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-[11px] font-bold text-white flex items-center justify-center gap-1 shadow-md shadow-[#e11d48]/30"
                  >
                    <span>Detalle</span>
                    <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            }
          </section>
        }
      </div>

      <app-filter-modal
        [isOpen]="isFilterModalOpen()"
        [currentFilters]="eventService.activeFilters()"
        (modalClose)="isFilterModalOpen.set(false)"
        (apply)="onApplyFilters($event)"
      ></app-filter-modal>
    </ion-content>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class SearchMapPage implements OnInit, OnDestroy {
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  mapContainer = viewChild<ElementRef>('mapContainer');
  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private searchSubject = new Subject<string>();
  private searchSub: Subscription | null = null;

  activeView = signal<'list' | 'map'>('list');
  searchQuery = '';
  isFilterModalOpen = signal(false);
  selectedEventOnMap = signal<PlanazoEvent | null>(null);

  filteredList = this.eventService.filteredEvents;

  readonly popularCategories: { id: EventCategory; label: string; icon: string }[] = [
    { id: 'musica', label: 'Música', icon: '🎵' },
    { id: 'gastronomia', label: 'Gastronomía', icon: '🥘' },
    { id: 'cine', label: 'Cine', icon: '🎬' },
    { id: 'deportes', label: 'Deportes', icon: '⚽' },
    { id: 'entretenimiento', label: 'Entretenimiento', icon: '🎡' },
  ];

  readonly activeFiltersCount = computed(() => {
    const f = this.eventService.activeFilters();
    let count = 0;
    if (f.searchTerm.trim()) count++;
    if (f.category !== 'todos') count++;
    if (f.dateFilter !== 'all') count++;
    if (f.onlyFree) count++;
    if (!f.onlyFree && f.maxPrice < 150000) count++;
    if (f.maxDistanceKm !== 15) count++;
    return count;
  });

  constructor() {
    effect(() => {
      this.filteredList();
      if (this.activeView() === 'map' && this.map) {
        this.renderMapMarkers();
      }
    });
  }

  ngOnInit(): void {
    this.searchQuery = this.eventService.activeFilters().searchTerm;
    this.searchSub = this.searchSubject
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((term) => {
        this.eventService.setFilterOptions({ searchTerm: term });
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  switchView(view: 'list' | 'map'): void {
    this.activeView.set(view);
    if (view === 'map') {
      setTimeout(() => this.initMap(), 150);
    }
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.eventService.setFilterOptions({ searchTerm: '' });
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  onApplyFilters(newFilters: FilterOptions): void {
    this.eventService.setFilterOptions(newFilters);
  }

  toggleQuickFree(): void {
    const curr = this.eventService.activeFilters().onlyFree;
    this.eventService.setFilterOptions({ onlyFree: !curr });
  }

  setQuickDate(date: 'weekend' | 'all'): void {
    const curr = this.eventService.activeFilters().dateFilter;
    this.eventService.setFilterOptions({ dateFilter: curr === date ? 'all' : date });
  }

  setQuickPrice(price: number): void {
    const curr = this.eventService.activeFilters().maxPrice;
    this.eventService.setFilterOptions({ maxPrice: curr === price ? 150000 : price });
  }

  selectSuggestedCategory(catId: EventCategory): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.eventService.resetFilters();
    this.eventService.setFilterOptions({ category: catId });
  }

  resetAllFilters(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.eventService.resetFilters();
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

  openGoogleMapsRoute(event: PlanazoEvent): void {
    const { lat, lng, venueName, city } = event.location;
    const query = encodeURIComponent(`${venueName}, ${city}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&query=${query}`;
    window.open(url, '_system');
  }

  openAppleMapsRoute(event: PlanazoEvent): void {
    const { lat, lng, venueName, city } = event.location;
    const query = encodeURIComponent(`${venueName}, ${city}`);
    const url = `https://maps.apple.com/?daddr=${lat},${lng}&q=${query}`;
    window.open(url, '_system');
  }

  private initMap(): void {
    const container = this.mapContainer()?.nativeElement as HTMLElement | undefined;
    if (!container) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([4.7161, -74.212], 14);

    const tileUrl = environment.cartoApiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${environment.cartoApiKey}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderMapMarkers();
  }

  private renderMapMarkers(): void {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();
    const events = this.filteredList();

    events.forEach((evt) => {
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="background-color: #e11d48; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(225,29,72,0.8); border: 2px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size: 18px;">${evt.categoryIcon}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([evt.location.lat, evt.location.lng], { icon: customIcon });

      marker.on('click', () => {
        this.selectedEventOnMap.set(evt);
        this.map?.panTo([evt.location.lat, evt.location.lng]);
      });

      this.markersLayer!.addLayer(marker);
    });
  }
}
