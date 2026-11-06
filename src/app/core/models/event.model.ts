export type EventCategory =
  | 'todos'
  | 'musica'
  | 'cine'
  | 'gastronomia'
  | 'deportes'
  | 'arte'
  | 'cultura'
  | 'teatro'
  | 'ecologia';

export type EventStatus =
  | 'normal'
  | 'proximo_a_comenzar'
  | 'ultimos_cupos'
  | 'agotado'
  | 'cancelado'
  | 'finalizado';

export interface EventLocation {
  venueName: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export interface EventSchedule {
  startDate: string; // ISO format e.g., '2026-11-20T18:00:00'
  endDate: string;
  displayDate: string;
  displayTime: string;
  doorsOpen?: string;
}

export interface EventPricing {
  isFree: boolean;
  priceCOP: number;
  displayPrice: string;
  ticketUrl?: string;
}

export interface PlanazoEvent {
  id: string;
  title: string;
  subtitle?: string;
  category: EventCategory;
  categoryLabel: string;
  categoryIcon: string;
  status: EventStatus;
  statusMessage?: string;
  imageUrl: string;
  description: string;
  organizer: string;
  organizerVerified?: boolean;
  schedule: EventSchedule;
  location: EventLocation;
  pricing: EventPricing;
  availableTickets?: number;
  totalTickets?: number;
  tags: string[];
  additionalInfo?: {
    ageRestriction?: string;
    dressCode?: string;
    weatherNotes?: string;
    parkingAvailable?: boolean;
  };
  isFeatured?: boolean;
  isFavorite?: boolean;
}
