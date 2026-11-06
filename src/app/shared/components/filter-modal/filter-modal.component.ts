import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterOptions } from '../../../core/models/filter.model';
import { EventCategory } from '../../../core/models/event.model';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity"
      (click)="closeModal()"
    >
      <div
        class="w-full sm:max-w-md bg-[#16181f] rounded-t-3xl sm:rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-center justify-between pb-2 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#e11d48]">tune</span>
            <h2 class="font-headline font-bold text-lg text-white">Filtros Avanzados</h2>
          </div>
          <button
            type="button"
            (click)="closeModal()"
            class="w-8 h-8 rounded-full bg-[#1f222c] flex items-center justify-center text-slate-300 hover:text-white"
          >
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Categoría</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              *ngFor="let cat of categories"
              type="button"
              (click)="tempFilters.category = cat.id"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              [ngClass]="tempFilters.category === cat.id ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Fecha</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="tempFilters.dateFilter = 'all'"
              class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
              [ngClass]="tempFilters.dateFilter === 'all' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
            >
              Cualquier fecha
            </button>
            <button
              type="button"
              (click)="tempFilters.dateFilter = 'today'"
              class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
              [ngClass]="tempFilters.dateFilter === 'today' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
            >
              Hoy
            </button>
            <button
              type="button"
              (click)="tempFilters.dateFilter = 'weekend'"
              class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
              [ngClass]="tempFilters.dateFilter === 'weekend' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
            >
              Este fin de semana
            </button>
            <button
              type="button"
              (click)="tempFilters.dateFilter = 'this_month'"
              class="py-2 px-3 rounded-xl text-xs font-medium transition-all"
              [ngClass]="tempFilters.dateFilter === 'this_month' ? 'bg-[#e11d48] text-white font-bold' : 'bg-[#1f222c] text-slate-300 border border-white/5'"
            >
              Este mes
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl bg-[#1f222c] border border-white/5">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-white">🎉 Solo Eventos Gratuitos</span>
            <span class="text-xs text-slate-400">Mostrar únicamente planes con entrada libre</span>
          </div>
          <input
            type="checkbox"
            [(ngModel)]="tempFilters.onlyFree"
            class="w-5 h-5 accent-[#e11d48] rounded cursor-pointer"
          />
        </div>

        <div *ngIf="!tempFilters.onlyFree" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Precio Máximo</label>
            <span class="text-xs font-bold text-[#e11d48]">Hasta $ {{ tempFilters.maxPrice | number }} COP</span>
          </div>
          <input
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
  `,
})
export class FilterModalComponent {
  @Input() isOpen = false;
  @Input() currentFilters!: FilterOptions;
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<FilterOptions>();

  tempFilters: FilterOptions = {
    searchTerm: '',
    category: 'todos',
    dateFilter: 'all',
    onlyFree: false,
    maxPrice: 100000,
    maxDistanceKm: 15,
    city: 'Funza',
  };

  categories: { id: EventCategory; label: string }[] = [
    { id: 'todos', label: 'Todas' },
    { id: 'musica', label: 'Música' },
    { id: 'gastronomia', label: 'Gastronomía' },
    { id: 'teatro', label: 'Teatro' },
    { id: 'cultura', label: 'Cultura' },
    { id: 'deportes', label: 'Deportes' },
    { id: 'ecologia', label: 'Ecología' },
    { id: 'cine', label: 'Cine' },
    { id: 'arte', label: 'Arte' },
  ];

  ngOnChanges() {
    if (this.currentFilters) {
      this.tempFilters = { ...this.currentFilters };
    }
  }

  closeModal() {
    this.close.emit();
  }

  resetFilters() {
    this.tempFilters = {
      searchTerm: '',
      category: 'todos',
      dateFilter: 'all',
      onlyFree: false,
      maxPrice: 150000,
      maxDistanceKm: 15,
      city: 'Funza',
    };
  }

  applyFilters() {
    this.apply.emit(this.tempFilters);
    this.closeModal();
  }
}
