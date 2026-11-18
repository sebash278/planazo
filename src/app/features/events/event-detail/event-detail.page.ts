import { Location } from '@angular/common';
import type { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as L from 'leaflet';

import { environment } from '../../../../environments/environment';
import type { PlanazoEvent } from '../../../core/models/event.model';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { OfflineService } from '../../../core/services/offline.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterModule, IonContent],
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

        @if (offlineService.isOffline()) {
          <div
            role="status"
            class="bg-amber-950/90 border-t border-amber-500/30 px-4 py-1 text-[11px] text-amber-200 flex items-center justify-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[14px] text-amber-400">wifi_off</span>
            <span>Sin conexión a Internet</span>
          </div>
        }
      </header>

      @if (event(); as e) {
        <div class="pt-16 pb-32 max-w-lg mx-auto flex flex-col">
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
                [attr.aria-label]="e.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
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
              @if (e.status === 'proximo_a_comenzar') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/95 text-amber-950 text-xs font-bold shadow-md">
                  <span class="material-symbols-outlined text-[14px]">hourglass_top</span>
                  <span>Empieza pronto • {{ getUrgencyLabel(e) }}</span>
                </div>
              }

              @if (e.status === 'ultimos_cupos') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e11d48] text-white text-xs font-bold shadow-md border border-white/20">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  <span>{{ e.statusMessage || 'Últimos cupos disponibles' }}</span>
                </div>
              }

              @if (e.status === 'agotado') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-bold shadow-md">
                  <span class="material-symbols-outlined text-[14px]">production_quantity_limits</span>
                  <span>Agotado / Sin cupos</span>
                </div>
              }

              @if (e.status === 'cancelado') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-md">
                  <span class="material-symbols-outlined text-[14px]">cancel</span>
                  <span>Cancelado</span>
                </div>
              }

              @if (e.status === 'finalizado') {
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-slate-200 text-xs font-bold shadow-md">
                  <span class="material-symbols-outlined text-[14px]">event_available</span>
                  <span>Finalizado</span>
                </div>
              }
            </div>
          </div>

          <div class="px-4 flex flex-col gap-4 mt-3">
            @if (e.status === 'cancelado') {
              <div
                role="alert"
                class="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-start gap-3 text-xs text-red-100"
              >
                <span class="material-symbols-outlined text-red-400 text-[22px] flex-shrink-0">warning</span>
                <div class="flex flex-col gap-1">
                  <strong class="text-sm text-white">Evento Cancelado</strong>
                  <span>{{ e.statusMessage || 'Este evento fue cancelado por el organizador.' }}</span>
                  @if (e.isFavorite) {
                    <span class="text-rose-300 font-semibold">
                      Aviso: este evento estaba guardado en tu lista de favoritos.
                    </span>
                  }
                </div>
              </div>
            }

            @if (e.status === 'agotado') {
              <div
                role="status"
                class="p-3.5 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex items-start gap-3 text-xs text-orange-100"
              >
                <span class="material-symbols-outlined text-orange-400 text-[20px] flex-shrink-0">info</span>
                <div>
                  <strong class="block text-white">Sin cupos disponibles</strong>
                  <span>Las entradas se agotaron, pero puedes consultar toda la información del evento.</span>
                </div>
              </div>
            }

            @if (e.status === 'finalizado') {
              <div
                role="status"
                class="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-600/40 flex items-start gap-3 text-xs text-slate-300"
              >
                <span class="material-symbols-outlined text-slate-400 text-[20px] flex-shrink-0">history</span>
                <div>
                  <strong class="block text-white">Evento Finalizado</strong>
                  <span>{{ e.statusMessage || 'Este evento ya concluyó y no admite nuevas reservas.' }}</span>
                </div>
              </div>
            }

            <div class="flex flex-col gap-1">
              <h1 class="font-headline font-extrabold text-2xl text-white tracking-tight leading-tight">
                {{ e.title }}
              </h1>
              @if (e.subtitle) {
                <p class="text-xs text-slate-400">{{ e.subtitle }}</p>
              }
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
                  <span class="text-xs text-slate-400">
                    {{ e.schedule.displayTime }} • Apertura: {{ e.schedule.doorsOpen || 'Previo al inicio' }}
                  </span>
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

              <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#16181f] border border-white/10">
                <div class="w-10 h-10 rounded-xl bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                  <span class="material-symbols-outlined text-[22px]">confirmation_number</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold text-white">Boletería y Disponibilidad</span>
                  <span class="text-xs text-slate-400">{{ getTicketAvailabilityLabel(e) }}</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2 mt-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Ubicación y Mapa</span>
                <button
                  type="button"
                  (click)="openGoogleMapsRoute()"
                  class="text-xs font-bold text-[#e11d48] flex items-center gap-1 hover:underline"
                >
                  <span>Cómo llegar</span>
                  <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
              </div>

              <div class="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                <div #detailMap class="w-full h-full z-10"></div>
                <div class="absolute bottom-2 left-2 right-2 z-20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="openGoogleMapsRoute()"
                    class="py-1.5 px-3 rounded-full bg-[#e11d48] text-white text-xs font-bold shadow-lg flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span class="material-symbols-outlined text-[15px]">navigation</span>
                    <span>Google Maps</span>
                  </button>
                  <button
                    type="button"
                    (click)="openAppleMapsRoute()"
                    class="py-1.5 px-3 rounded-full bg-[#16181f]/95 text-white text-xs font-bold shadow-lg border border-white/20 flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span class="material-symbols-outlined text-[15px] text-[#38bdf8]">map</span>
                    <span>Apple Maps</span>
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

            @if (e.additionalInfo) {
              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Información Adicional
                </span>
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
                    <span class="font-bold text-white">
                      {{ e.additionalInfo.parkingAvailable ? 'Disponible' : 'En vías aledañas' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (showUndoToast()) {
          <div
            role="status"
            aria-live="polite"
            class="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#1f222c] border border-white/15 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
          >
            <span class="text-xs text-white font-medium">Eliminado de tus favoritos</span>
            <button
              type="button"
              (click)="undoRemoveFavorite()"
              class="px-3 py-1 rounded-lg bg-[#e11d48] text-white text-xs font-bold active:scale-95 transition-transform"
            >
              Deshacer
            </button>
          </div>
        }

        @if (actionNotice()) {
          <div
            role="status"
            aria-live="polite"
            class="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-[#16181f] border border-[#e11d48]/40 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between gap-3"
          >
            <span class="text-xs text-white font-medium">{{ actionNotice() }}</span>
            <button
              type="button"
              (click)="actionNotice.set(null)"
              class="text-xs text-[#e11d48] font-bold"
            >
              Cerrar
            </button>
          </div>
        }

        <footer class="fixed bottom-0 w-full z-50 pb-safe bg-[#121317]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <div class="h-16 px-4 flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Precio por persona
              </span>
              <span class="font-headline font-extrabold text-base text-white">
                {{ e.pricing.displayPrice }}
              </span>
            </div>

            <button
              type="button"
              (click)="handleBooking(e)"
              [disabled]="e.status === 'cancelado' || e.status === 'finalizado' || e.status === 'agotado'"
              class="flex-1 max-w-[220px] py-3 px-5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              [class]="(e.status === 'cancelado' || e.status === 'finalizado' || e.status === 'agotado') ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-[#e11d48] hover:bg-[#be123c] shadow-[#e11d48]/40'"
            >
              <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
              <span>{{ getBookingButtonLabel(e) }}</span>
            </button>
          </div>
        </footer>
      }
    </ion-content>
  `,
})
export class EventDetailPage implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  location = inject(Location);
  eventService = inject(EventService);
  authService = inject(AuthService);
  offlineService = inject(OfflineService);

  event = signal<PlanazoEvent | null>(null);
  showUndoToast = signal(false);
  actionNotice = signal<string | null>(null);
  detailMapRef = viewChild<ElementRef>('detailMap');
  private map: L.Map | null = null;
  private undoTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  goBack(): void {
    this.location.back();
  }

  toggleFavorite(): void {
    const e = this.event();
    if (!e) return;

    if (this.authService.isGuest()) {
      this.router.navigate(['/auth/login'], {
        queryParams: {
          returnUrl: `/event/${e.id}`,
          message: 'Inicia sesión para guardar este planazo en favoritos',
        },
        replaceUrl: true,
      });
      return;
    }

    const newState = this.eventService.toggleFavorite(e.id);
    this.event.set({ ...e, isFavorite: newState });

    if (!newState) {
      this.triggerUndoToast();
    } else {
      this.showUndoToast.set(false);
    }
  }

  undoRemoveFavorite(): void {
    const e = this.event();
    if (!e) return;

    this.eventService.setFavorite(e.id, true);
    this.event.set({ ...e, isFavorite: true });
    this.showUndoToast.set(false);
  }

  openGoogleMapsRoute(): void {
    const e = this.event();
    if (!e) return;
    const { lat, lng, venueName, city } = e.location;
    const query = encodeURIComponent(`${venueName}, ${city}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&query=${query}`;
    window.open(url, '_system');
  }

  openAppleMapsRoute(): void {
    const e = this.event();
    if (!e) return;
    const { lat, lng, venueName, city } = e.location;
    const query = encodeURIComponent(`${venueName}, ${city}`);
    const url = `https://maps.apple.com/?daddr=${lat},${lng}&q=${query}`;
    window.open(url, '_system');
  }

  shareEvent(): void {
    const e = this.event();
    if (!e) return;
    if (navigator.share) {
      navigator
        .share({
          title: e.title,
          text: `¡Mira este planazo en ${e.location.city}: ${e.title}!`,
          url: window.location.href,
        })
        .catch(() => {
          this.showTemporaryNotice('No se pudo abrir el diálogo de compartir.');
        });
    } else {
      void navigator.clipboard?.writeText(window.location.href);
      this.showTemporaryNotice('Enlace del evento copiado al portapapeles.');
    }
  }

  handleBooking(e: PlanazoEvent): void {
    if (this.authService.isGuest()) {
      this.router.navigate(['/auth/register'], {
        queryParams: {
          returnUrl: `/event/${e.id}`,
          message: 'Regístrate o inicia sesión para asistir o reservar tu entrada a este evento',
        },
        replaceUrl: true,
      });
      return;
    }

    const confirmed = this.eventService.toggleAttendance(e.id);
    if (!confirmed) {
      this.showTemporaryNotice('Has cancelado tu asistencia a este evento.');
      return;
    }

    if (e.pricing.ticketUrl) {
      this.showTemporaryNotice('¡Cupo confirmado! Abriendo boletería...');
      window.open(e.pricing.ticketUrl, '_blank');
    } else {
      this.showTemporaryNotice(
        `¡Tu asistencia ha sido registrada para ${e.location.venueName}!`
      );
    }
  }

  getBookingButtonLabel(e: PlanazoEvent): string {
    if (e.status === 'cancelado') return 'Evento Cancelado';
    if (e.status === 'finalizado') return 'Evento Finalizado';
    if (e.status === 'agotado') return 'Agotado / Sin cupos';
    if (!this.authService.isGuest() && this.eventService.isAttending(e.id)) {
      return 'Asistencia confirmada ✓';
    }
    return e.pricing.isFree ? 'Asistir gratis' : 'Reservar boleta';
  }

  getUrgencyLabel(e: PlanazoEvent): string {
    const startMs = new Date(e.schedule.startDate).getTime();
    const diffHours = Math.ceil((startMs - Date.now()) / (1000 * 60 * 60));
    if (diffHours > 0 && diffHours <= 72) {
      return `Comienza en ${diffHours} h`;
    }
    return e.statusMessage || 'Comienza muy pronto';
  }

  getTicketAvailabilityLabel(e: PlanazoEvent): string {
    if (e.status === 'agotado' || e.availableTickets === 0) {
      return 'Sin cupos disponibles';
    }
    if (e.availableTickets !== undefined && e.totalTickets !== undefined) {
      return `${e.availableTickets} cupos disponibles de ${e.totalTickets}`;
    }
    return e.pricing.isFree ? 'Entrada libre hasta completar aforo' : 'Boletería disponible';
  }

  private triggerUndoToast(): void {
    if (this.undoTimer) {
      clearTimeout(this.undoTimer);
    }
    this.showUndoToast.set(true);
    this.undoTimer = setTimeout(() => {
      this.showUndoToast.set(false);
    }, 5000);
  }

  private showTemporaryNotice(msg: string): void {
    this.actionNotice.set(msg);
    setTimeout(() => {
      if (this.actionNotice() === msg) {
        this.actionNotice.set(null);
      }
    }, 3500);
  }

  private initMiniMap(e: PlanazoEvent): void {
    const container = this.detailMapRef()?.nativeElement as HTMLElement | undefined;
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
