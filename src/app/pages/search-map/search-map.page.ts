import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as L from 'leaflet';
import { PlanazoHeaderComponent } from '../../shared/components/header/header.component';
import { EventCardComponent } from '../../shared/components/event-card/event-card.component';
import { FilterModalComponent } from '../../shared/components/filter-modal/filter-modal.component';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanazoEvent } from '../../core/models/event.model';
import { FilterOptions } from '../../core/models/filter.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search-map',
  standalone: true,
  imports: [
    CommonModule,
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
                placeholder="Buscar por evento, artista o lugar..."
                class="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                *ngIf="searchQuery"
                type="button"
                (click)="clearSearch()"
                class="text-slate-400 hover:text-white"
              >
                <span class="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            </div>

            <button
              type="button"
              (click)="openFilterModal()"
              class="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#1f222c] text-white border border-white/10 active:scale-95 transition-all shadow-md"
              aria-label="Filtros avanzados"
            >
              <span class="material-symbols-outlined text-[20px]">tune</span>
              <span
                *ngIf="activeFiltersCount() > 0"
                class="absolute -top-1 -right-1 bg-[#e11d48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
              >
                {{ activeFiltersCount() }}
              </span>
            </button>
          </div>

          <div class="grid grid-cols-2 bg-[#0d0e12] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              (click)="switchView('list')"
              class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              [ngClass]="activeView() === 'list' ? 'bg-[#1f222c] text-white shadow-md border border-[#e11d48]/40' : 'text-slate-400 hover:text-white'"
            >
              <span class="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              <span>Lista ({{ filteredList().length }})</span>
            </button>

            <button
              type="button"
              (click)="switchView('map')"
              class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
              [ngClass]="activeView() === 'map' ? 'bg-[#1f222c] text-white shadow-md border border-[#e11d48]/40' : 'text-slate-400 hover:text-white'"
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
              [ngClass]="eventService.activeFilters().onlyFree ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span>🎉 Solo Gratis</span>
            </button>

            <button
              type="button"
              (click)="setQuickDate('weekend')"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              [ngClass]="eventService.activeFilters().dateFilter === 'weekend' ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span class="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>Fin de semana</span>
            </button>

            <button
              type="button"
              (click)="setQuickPrice(30000)"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              [ngClass]="eventService.activeFilters().maxPrice === 30000 ? 'bg-[#e11d48] text-white border-transparent' : 'bg-[#16181f] text-slate-300 border-white/10'"
            >
              <span>&lt; $30.000 COP</span>
            </button>

            <button
              *ngIf="activeFiltersCount() > 0"
              type="button"
              (click)="resetAllFilters()"
              class="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40"
            >
              <span class="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Limpiar filtros</span>
            </button>
          </div>
        </section>

        <section *ngIf="activeView() === 'list'" class="p-4 flex flex-col gap-4 flex-1">
          <div *ngIf="filteredList().length > 0" class="flex flex-col gap-4">
            <app-event-card
              *ngFor="let event of filteredList()"
              [event]="event"
              [distanceKm]="eventService.calculateDistanceFromCenter(event.location.lat, event.location.lng)"
              (toggleFavorite)="handleToggleFavorite($event)"
            ></app-event-card>
          </div>

          <div
            *ngIf="filteredList().length === 0"
            class="my-10 p-8 text-center bg-[#16181f] rounded-2xl border border-white/10 flex flex-col items-center gap-3"
          >
            <span class="material-symbols-outlined text-slate-500 text-[52px]">search_off</span>
            <h3 class="font-headline font-bold text-lg text-white">No encontramos resultados</h3>
            <p class="text-xs text-slate-400 max-w-xs">
              No hay planes que coincidan con "{{ searchQuery }}" y los filtros seleccionados.
            </p>
            <button
              type="button"
              (click)="resetAllFilters()"
              class="mt-2 px-4 py-2 rounded-xl bg-[#e11d48] text-white text-xs font-bold"
            >
              Restablecer filtros
            </button>
          </div>
        </section>

        <section *ngIf="activeView() === 'map'" class="relative w-full flex-1 flex flex-col min-h-[550px]">
          <div #mapContainer class="w-full flex-1 min-h-[500px] z-10"></div>

          <div
            *ngIf="selectedEventOnMap()"
            class="absolute bottom-4 left-4 right-4 z-20 bg-[#16181f]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-white/15 shadow-2xl flex flex-col gap-2.5 animate-in slide-in-from-bottom-4 duration-200"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 min-w-0">
                <span class="text-[10px] font-bold text-[#e11d48] uppercase tracking-wider">
                  {{ selectedEventOnMap()!.categoryLabel }}
                </span>
                <h4 class="font-headline font-bold text-sm text-white truncate">
                  {{ selectedEventOnMap()!.title }}
                </h4>
                <p class="text-xs text-slate-300 truncate">
                  {{ selectedEventOnMap()!.location.venueName }} • {{ selectedEventOnMap()!.pricing.displayPrice }}
                </p>
              </div>

              <button
                type="button"
                (click)="selectedEventOnMap.set(null)"
                class="w-7 h-7 rounded-full bg-[#1f222c] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                type="button"
                (click)="openExternalRoute(selectedEventOnMap()!)"
                class="py-2 px-3 rounded-xl bg-[#1f222c] hover:bg-[#282c38] text-xs font-semibold text-white flex items-center justify-center gap-1.5 border border-white/10"
              >
                <span class="material-symbols-outlined text-[#e11d48] text-[16px]">navigation</span>
                <span>Cómo llegar</span>
              </button>

              <button
                type="button"
                [routerLink]="['/event', selectedEventOnMap()!.id]"
                class="py-2 px-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#e11d48]/30"
              >
                <span>Ver detalle</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <app-filter-modal
        [isOpen]="isFilterModalOpen()"
        [currentFilters]="eventService.activeFilters()"
        (close)="isFilterModalOpen.set(false)"
        (apply)="onApplyFilters($event)"
      ></app-filter-modal>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
})
export class SearchMapPage implements OnInit, OnDestroy {
  eventService = inject(EventService);
  authService = inject(AuthService);
  router = inject(Router);

  mapContainer = viewChild<ElementRef>('mapContainer');
  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;

  activeView = signal<'list' | 'map'>('list');
  searchQuery = '';
  isFilterModalOpen = signal(false);
  selectedEventOnMap = signal<PlanazoEvent | null>(null);

  filteredList = this.eventService.filteredEvents;

  activeFiltersCount = signal(0);

  constructor() {
    effect(() => {
      // refrescamos los pines del mapa si cambia la lista
      if (this.activeView() === 'map' && this.map) {
        this.renderMapMarkers();
      }
      this.calculateActiveFiltersCount();
    });
  }

  ngOnInit() {
    this.searchQuery = this.eventService.activeFilters().searchTerm;
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  switchView(view: 'list' | 'map') {
    this.activeView.set(view);
    if (view === 'map') {
      setTimeout(() => this.initMap(), 150);
    }
  }

  onSearchChange(value: string) {
    this.eventService.setFilterOptions({ searchTerm: value });
  }

  clearSearch() {
    this.searchQuery = '';
    this.eventService.setFilterOptions({ searchTerm: '' });
  }

  openFilterModal() {
    this.isFilterModalOpen.set(true);
  }

  onApplyFilters(newFilters: FilterOptions) {
    this.eventService.setFilterOptions(newFilters);
  }

  toggleQuickFree() {
    const curr = this.eventService.activeFilters().onlyFree;
    this.eventService.setFilterOptions({ onlyFree: !curr });
  }

  setQuickDate(date: 'weekend' | 'all') {
    const curr = this.eventService.activeFilters().dateFilter;
    this.eventService.setFilterOptions({ dateFilter: curr === date ? 'all' : date });
  }

  setQuickPrice(price: number) {
    const curr = this.eventService.activeFilters().maxPrice;
    this.eventService.setFilterOptions({ maxPrice: curr === price ? 150000 : price });
  }

  resetAllFilters() {
    this.searchQuery = '';
    this.eventService.resetFilters();
  }

  private calculateActiveFiltersCount() {
    const f = this.eventService.activeFilters();
    let count = 0;
    if (f.searchTerm) count++;
    if (f.category !== 'todos') count++;
    if (f.dateFilter !== 'all') count++;
    if (f.onlyFree) count++;
    if (f.maxPrice < 150000) count++;
    this.activeFiltersCount.set(count);
  }

  handleToggleFavorite(eventId: string) {
    if (this.authService.isGuest()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Inicia sesión para guardar tus eventos favoritos' },
      });
      return;
    }
    this.eventService.toggleFavorite(eventId);
  }

  // montando el mapita en Funza
  private initMap() {
    const container = this.mapContainer()?.nativeElement;
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

  private renderMapMarkers() {
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

  // sacar pa google maps o waze
  openExternalRoute(event: PlanazoEvent) {
    const lat = event.location.lat;
    const lng = event.location.lng;
    const query = encodeURIComponent(`${event.location.venueName}, ${event.location.city}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${query}`;
    window.open(url, '_system');
  }
}
