import { DecimalPipe } from '@angular/common';
import type { OnChanges } from '@angular/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { EventCategory } from '../../../core/models/category.model';
import { PLANAZO_CATEGORIES } from '../../../core/models/category.model';
import type { FilterOptions } from '../../../core/models/filter.model';
import { DEFAULT_FILTER_OPTIONS } from '../../../core/models/filter.model';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  template: `
    @if (isOpen) {
      <div
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity"
        (click)="onBackdropClick($event)"
        (keydown.escape)="closeModal()"
      >
        <div
          class="w-full sm:max-w-md bg-[#16181f] rounded-t-3xl sm:rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        >
          <div class="flex items-center justify-between pb-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[#e11d48]">tune</span>
              <h2 id="filter-modal-title" class="font-headline font-bold text-lg text-white">
                Filtros Avanzados
              </h2>
            </div>
            <button
              type="button"
              (click)="closeModal()"
              aria-label="Cerrar filtros"
              class="w-8 h-8 rounded-full bg-[#1f222c] flex items-center justify-center text-slate-300 hover:text-white"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Categoría</span>
            <div class="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoría">
              @for (cat of categories; track cat.id) {
                <button
                  type="button"
                  (click)="tempFilters.category = cat.id"
                  class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  [class]="tempFilters.category === cat.id ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
                >
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Fecha</span>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="tempFilters.dateFilter = 'all'"
                class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                [class]="tempFilters.dateFilter === 'all' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
              >
                Cualquier fecha
              </button>
              <button
                type="button"
                (click)="tempFilters.dateFilter = 'today'"
                class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                [class]="tempFilters.dateFilter === 'today' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
              >
                Hoy
              </button>
              <button
                type="button"
                (click)="tempFilters.dateFilter = 'weekend'"
                class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                [class]="tempFilters.dateFilter === 'weekend' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
              >
                Este fin de semana
              </button>
              <button
                type="button"
                (click)="tempFilters.dateFilter = 'this_month'"
                class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
                [class]="tempFilters.dateFilter === 'this_month' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
              >
                Este mes
              </button>
              <button
                type="button"
                (click)="tempFilters.dateFilter = 'custom'"
                class="col-span-2 py-2 px-3 rounded-xl text-xs font-medium transition-all"
                [class]="tempFilters.dateFilter === 'custom' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
              >
                Rango personalizado
              </button>
            </div>

            @if (tempFilters.dateFilter === 'custom') {
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div class="flex flex-col gap-1">
                  <label for="filter-start-date" class="text-[11px] font-semibold text-slate-400">
                    Desde
                  </label>
                  <input
                    id="filter-start-date"
                    type="date"
                    [(ngModel)]="tempFilters.startDate"
                    class="w-full rounded-xl bg-[#1f222c] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label for="filter-end-date" class="text-[11px] font-semibold text-slate-400">
                    Hasta
                  </label>
                  <input
                    id="filter-end-date"
                    type="date"
                    [(ngModel)]="tempFilters.endDate"
                    class="w-full rounded-xl bg-[#1f222c] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e11d48]"
                  />
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl bg-[#1f222c] border border-white/5">
            <label for="filter-only-free" class="flex flex-col cursor-pointer">
              <span class="text-sm font-semibold text-white">🎉 Solo Eventos Gratuitos</span>
              <span class="text-xs text-slate-400">Mostrar únicamente planes con entrada libre</span>
            </label>
            <input
              id="filter-only-free"
              type="checkbox"
              [(ngModel)]="tempFilters.onlyFree"
              class="w-5 h-5 accent-[#e11d48] rounded cursor-pointer"
            />
          </div>

          @if (!tempFilters.onlyFree) {
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label for="filter-max-price" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Precio Máximo
                </label>
                <span class="text-xs font-bold text-[#e11d48]">
                  Hasta $ {{ tempFilters.maxPrice | number }} COP
                </span>
              </div>
              <input
                id="filter-max-price"
                type="range"
                min="10000"
                max="150000"
                step="5000"
                [(ngModel)]="tempFilters.maxPrice"
                class="w-full accent-[#e11d48] cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-400">
                <span>$ 10.000</span>
                <span>$ 150.000+</span>
              </div>
            </div>
          }

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <label for="filter-max-distance" class="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Distancia Máxima
              </label>
              <span class="text-xs font-bold text-[#38bdf8]">
                Hasta {{ tempFilters.maxDistanceKm }} km
              </span>
            </div>
            <input
              id="filter-max-distance"
              type="range"
              min="1"
              max="25"
              step="1"
              [(ngModel)]="tempFilters.maxDistanceKm"
              class="w-full accent-[#e11d48] cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>1 km (Centro)</span>
              <span>25 km (Sabana)</span>
            </div>
          </div>

          <div class="pt-2 flex items-center gap-3">
            <button
              type="button"
              (click)="resetFilters()"
              class="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-300 bg-[#1f222c] hover:bg-[#282c38] transition-colors"
            >
              Restablecer
            </button>
            <button
              type="button"
              (click)="applyFilters()"
              class="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#e11d48] hover:bg-[#be123c] shadow-lg shadow-[#e11d48]/40 transition-all active:scale-95"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class FilterModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() currentFilters!: FilterOptions;
  @Output() modalClose = new EventEmitter<void>();
  @Output() apply = new EventEmitter<FilterOptions>();

  tempFilters: FilterOptions = { ...DEFAULT_FILTER_OPTIONS };

  categories: { id: EventCategory; label: string }[] = [
    { id: 'todos', label: 'Todas' },
    ...PLANAZO_CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
  ];

  ngOnChanges(): void {
    if (this.currentFilters) {
      this.tempFilters = { ...this.currentFilters };
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.modalClose.emit();
  }

  resetFilters(): void {
    this.tempFilters = { ...DEFAULT_FILTER_OPTIONS };
  }

  applyFilters(): void {
    this.apply.emit({ ...this.tempFilters });
    this.closeModal();
  }
}
