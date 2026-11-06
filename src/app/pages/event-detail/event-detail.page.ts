import { Component, OnInit, inject, signal, ElementRef, viewChild, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as L from 'leaflet';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { PlanazoEvent } from '../../core/models/event.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="bg-[#0d0e12]">
      <header class="fixed top-0 w-full z-50 pt-safe bg-[#0d0e12]/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div class="h-16 px-4 flex items-center justify-between max-w-lg mx-auto">
          <button
            type="button"
            (click)="goBack()"
            class="w-10 h-10 rounded-full bg-[#1f222c] border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <span class="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
          </button>

          <span class="font-headline font-bold text-sm text-white truncate max-w-[200px]">
            {{ event()?.title || 'Detalle del Evento' }}
          </span>

          <button
            type="button"
            (click)="shareEvent()"
            class="w-10 h-10 rounded-full bg-[#1f222c] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="Compartir"
          >
            <span class="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </header>

      <div *ngIf="event() as e" class="pt-16 pb-28 max-w-lg mx-auto flex flex-col">
        <div class="relative w-full aspect-[4/3] max-h-[360px] overflow-hidden bg-[#0d0e12]">
          <img
            [src]="e.imageUrl"
            [alt]="e.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0d0e12] via-[#0d0e12]/30 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent"></div>

          <div class="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e11d48] text-white text-[11px] font-bold tracking-wider uppercase shadow-md border border-white/20">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {{ e.categoryLabel }}
            </span>

            <button
              type="button"
              (click)="toggleFavorite()"
              class="w-11 h-11 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform border border-white/10"
              aria-label="Añadir a favoritos"
            >
              <span
                class="material-symbols-outlined text-[22px] transition-colors"
                [class.text-[#e11d48]]="e.isFavorite"
                [class.material-symbols-filled]="e.isFavorite"
                [class.text-white]="!e.isFavorite"
              >
                favorite
              </span>
            </button>
          </div>

          <div class="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
            <div
              *ngIf="e.status === 'proximo_a_comenzar'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-amber-950 text-xs font-bold shadow-md"
            >
              <span class="material-symbols-outlined text-[14px]">hourglass_top</span>
              <span>{{ e.statusMessage || 'Próximo a comenzar' }}</span>
            </div>

            <div
              *ngIf="e.status === 'ultimos_cupos'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e11d48] text-white text-xs font-bold shadow-md border border-white/20"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>{{ e.statusMessage || 'Últimos cupos disponibles' }}</span>
            </div>

            <div
              *ngIf="e.status === 'cancelado'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md"
            >
              <span class="material-symbols-outlined text-[14px]">cancel</span>
              <span>{{ e.statusMessage || 'Evento Cancelado' }}</span>
            </div>

            <div
              *ngIf="e.status === 'finalizado'"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-bold shadow-md"
            >
              <span class="material-symbols-outlined text-[14px]">event_available</span>
              <span>{{ e.statusMessage || 'Evento Finalizado' }}</span>
            </div>
          </div>
        </div>

        <div class="px-4 flex flex-col gap-4 mt-3">
          <div class="flex flex-col gap-1">
            <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight leading-tight">
              {{ e.title }}
            </h1>
            <p class="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
              <span class="material-symbols-outlined text-[#e11d48] text-[18px]">verified_user</span>
              <span>Organizado por <strong class="text-white">{{ e.organizer }}</strong></span>
            </p>
          </div>

          <div class="grid grid-cols-1 gap-2.5">
            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#16181f] border border-white/10">
              <div class="w-10 h-10 rounded-xl bg-[#e11d48]/20 flex items-center justify-center text-[#e11d48] flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">calendar_month</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white">{{ e.schedule.displayDate }}</span>
                <span class="text-xs text-slate-400">{{ e.schedule.displayTime }} • Apertura: {{ e.schedule.doorsOpen || 'Previo al inicio' }}</span>
              </div>
            </div>

            <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#16181f] border border-white/10">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">location_on</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white">{{ e.location.venueName }}</span>
                <span class="text-xs text-slate-400">{{ e.location.address }}, {{ e.location.city }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Ubicación y Mapa</span>
              <button
                type="button"
                (click)="openRouteExternal()"
                class="text-xs font-bold text-[#e11d48] flex items-center gap-1 hover:underline"
              >
                <span>Cómo llegar</span>
                <span class="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            </div>

            <div class="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-md">
              <div #detailMap class="w-full h-full z-10"></div>
              <div class="absolute bottom-2 left-2 z-20">
                <button
                  type="button"
                  (click)="openRouteExternal()"
                  class="py-1.5 px-3 rounded-full bg-[#e11d48] text-white text-xs font-bold shadow-lg flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span class="material-symbols-outlined text-[16px]">navigation</span>
                  <span>Abrir en Google Maps / Waze</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2 mt-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Acerca del Planazo</span>
            <p class="text-sm text-slate-300 leading-relaxed bg-[#16181f] p-4 rounded-2xl border border-white/10">
              {{ e.description }}
            </p>
          </div>

          <div *ngIf="e.additionalInfo" class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Información Adicional</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-3 rounded-xl bg-[#16181f] border border-white/10 flex flex-col gap-0.5">
                <span class="text-slate-400 text-[10px]">Restricción de edad</span>
                <span class="font-bold text-white">{{ e.additionalInfo.ageRestriction || 'Sin restricción' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-[#16181f] border border-white/10 flex flex-col gap-0.5">
                <span class="text-slate-400 text-[10px]">Código de vestimenta</span>
                <span class="font-bold text-white">{{ e.additionalInfo.dressCode || 'Libre / Casual' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-[#16181f] border border-white/10 flex flex-col gap-0.5">
                <span class="text-slate-400 text-[10px]">Condiciones climáticas</span>
                <span class="font-bold text-white">{{ e.additionalInfo.weatherNotes || 'Zona protegida' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-[#16181f] border border-white/10 flex flex-col gap-0.5">
                <span class="text-slate-400 text-[10px]">Parqueadero</span>
                <span class="font-bold text-white">{{ e.additionalInfo.parkingAvailable ? 'Disponible' : 'En vías aledañas' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer *ngIf="event() as e" class="fixed bottom-0 w-full z-50 pb-safe bg-[#121317]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div class="h-16 px-4 flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Precio por persona</span>
            <span class="font-headline font-extrabold text-base text-white">
              {{ e.pricing.displayPrice }}
            </span>
          </div>

          <button
            type="button"
            (click)="handleBooking(e)"
            [disabled]="e.status === 'cancelado' || e.status === 'finalizado' || e.status === 'agotado'"
            class="flex-1 max-w-[220px] py-3 px-5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            [ngClass]="(e.status === 'cancelado' || e.status === 'finalizado' || e.status === 'agotado') ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-[#e11d48] hover:bg-[#be123c] shadow-[#e11d48]/40'"
          >
            <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>{{ getBookingButtonLabel(e) }}</span>
          </button>
        </div>
      </footer>
    </ion-content>
  `,
})
export class EventDetailPage implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  eventService = inject(EventService);
  authService = inject(AuthService);

  event = signal<PlanazoEvent | null>(null);
  detailMapRef = viewChild<ElementRef>('detailMap');
  private map: L.Map | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.eventService.getEventById(id);
      if (found) {
        this.event.set(found);
        setTimeout(() => this.initMiniMap(found), 200);
      } else {
        this.router.navigate(['/tabs/explorar']);
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  goBack() {
    this.location.back();
  }

  toggleFavorite() {
    const e = this.event();
    if (!e) return;

    if (this.authService.isGuest()) {
      // valida si tiene cuenta
      this.router.navigate(['/auth/login'], {
        queryParams: { message: 'Inicia sesión para guardar este planazo en favoritos' },
      });
      return;
    }

    const newState = this.eventService.toggleFavorite(e.id);
    this.event.set({ ...e, isFavorite: newState });
  }

  openRouteExternal() {
    const e = this.event();
    if (!e) return;
    const lat = e.location.lat;
    const lng = e.location.lng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_system');
  }

  shareEvent() {
    const e = this.event();
    if (!e) return;
    if (navigator.share) {
      navigator.share({
        title: e.title,
        text: `¡Mira este planazo en Funza: ${e.title}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('¡Enlace del evento copiado al portapapeles!');
    }
  }

  handleBooking(e: PlanazoEvent) {
    if (e.pricing.ticketUrl) {
      window.open(e.pricing.ticketUrl, '_blank');
    } else {
      alert(`¡Entrada Libre! Presenta tu app en el ingreso de ${e.location.venueName}.`);
    }
  }

  getBookingButtonLabel(e: PlanazoEvent): string {
    if (e.status === 'cancelado') return 'Cancelado';
    if (e.status === 'finalizado') return 'Finalizado';
    if (e.status === 'agotado') return 'Agotado';
    return e.pricing.isFree ? 'Asistir gratis' : 'Reservar boleta';
  }

  // mini mapa coqueto
  private initMiniMap(e: PlanazoEvent) {
    const container = this.detailMapRef()?.nativeElement;
    if (!container || this.map) return;

    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([e.location.lat, e.location.lng], 15);

    const tileUrl = environment.cartoApiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${environment.cartoApiKey}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    // el pin rojito de siempre
    const pinIcon = L.divIcon({
      className: 'detail-pin',
      html: `
        <div style="background-color: #e11d48; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(225,29,72,0.8); border: 2px solid white;">
          <span class="material-symbols-outlined" style="font-size: 18px; color: white;">location_on</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([e.location.lat, e.location.lng], { icon: pinIcon }).addTo(this.map);
  }
}
