import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanazoEvent } from '../../../core/models/event.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article
      class="group relative rounded-2xl bg-[#16181f] overflow-hidden shadow-lg border border-white/10 hover:border-[#e11d48]/40 transition-all duration-200 flex flex-col cursor-pointer active:scale-[0.99]"
      [routerLink]="['/event', event.id]"
    >
      <div class="relative w-full h-48 overflow-hidden bg-[#0d0e12]">
        <img
          [src]="event.imageUrl"
          [alt]="event.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#16181f] via-black/30 to-black/60"></div>

        <div class="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#e11d48] text-white shadow-md border border-white/20"
          >
            {{ event.categoryLabel }}
          </span>

          <button
            type="button"
            (click)="onFavoriteClick($event)"
            class="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform border border-white/10"
            [attr.aria-label]="event.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
          >
            <span
              class="material-symbols-outlined text-[20px] transition-colors"
              [class.text-[#e11d48]]="event.isFavorite"
              [class.material-symbols-filled]="event.isFavorite"
              [class.text-white]="!event.isFavorite"
            >
              favorite
            </span>
          </button>
        </div>

        <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1 z-10">
          <div
            *ngIf="event.status === 'proximo_a_comenzar'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/90 text-amber-950 text-[11px] font-bold shadow-md"
          >
            <span class="material-symbols-outlined text-[13px]">hourglass_top</span>
            <span>Próximo a comenzar</span>
          </div>

          <div
            *ngIf="event.status === 'ultimos_cupos'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e11d48] text-white text-[11px] font-bold shadow-md"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Últimos cupos</span>
          </div>

          <div
            *ngIf="event.status === 'cancelado'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-md"
          >
            <span class="material-symbols-outlined text-[13px]">block</span>
            <span>Cancelado</span>
          </div>

          <div
            *ngIf="event.status === 'finalizado'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 text-[11px] font-bold shadow-md"
          >
            <span class="material-symbols-outlined text-[13px]">event_available</span>
            <span>Finalizado</span>
          </div>

          <span class="ml-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
            {{ event.pricing.displayPrice }}
          </span>
        </div>
      </div>

      <div class="p-4 flex flex-col gap-2">
        <h3 class="font-headline font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-[#fb7185] transition-colors">
          {{ event.title }}
        </h3>

        <div class="flex items-center gap-2 text-xs text-slate-300">
          <span class="material-symbols-outlined text-[#e11d48] text-[16px]">calendar_today</span>
          <span>{{ event.schedule.displayDate }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="material-symbols-outlined text-slate-400 text-[16px]">location_on</span>
          <span class="truncate">{{ event.location.venueName }}, {{ event.location.city }}</span>
        </div>

        <div class="mt-1 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span class="truncate">Por {{ event.organizer }}</span>
          <span *ngIf="distanceKm !== undefined" class="text-[#38bdf8] font-semibold">
            a {{ distanceKm }} km
          </span>
        </div>
      </div>
    </article>
  `,
})
export class EventCardComponent {
  @Input({ required: true }) event!: PlanazoEvent;
  @Input() distanceKm?: number;
  @Output() toggleFavorite = new EventEmitter<string>();

  authService = inject(AuthService);

  onFavoriteClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.toggleFavorite.emit(this.event.id);
  }
}
