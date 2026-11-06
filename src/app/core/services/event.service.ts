import { Injectable, signal, computed } from '@angular/core';
import { PlanazoEvent, EventCategory } from '../models/event.model';
import { FilterOptions, DEFAULT_FILTER_OPTIONS } from '../models/filter.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  // el centro del universo (Funza)
  private readonly FUNZA_LAT = 4.7161;
  private readonly FUNZA_LNG = -74.212;

  // datos quemaditos con amor para que no se vea pelado
  private readonly initialEvents: PlanazoEvent[] = [
    {
      id: 'evt-bacata-urbano',
      title: 'Festival Urbano Bacatá - Escenario Principal',
      subtitle: 'El encuentro de música juvenil más esperado de la Sabana',
      category: 'musica',
      categoryLabel: 'Música en Vivo',
      categoryIcon: 'music_note',
      status: 'proximo_a_comenzar',
      statusMessage: 'Inicia en 2 horas • Puertas 17:15h',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
      description: 'Gran festival urbano con la presentación de artistas destacados de la escena nacional e internacional. Concierto al aire libre con zonas de comida sabanera, luces y pantallas gigantes.',
      organizer: 'Alcaldía de Funza / Centro Cultural Bacatá',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-20T18:00:00',
        endDate: '2026-11-21T03:00:00',
        displayDate: 'Viernes 20 de Noviembre, 2026',
        displayTime: '18:00h a 03:00h',
        doorsOpen: '17:15h',
      },
      location: {
        venueName: 'Centro Cultural Bacatá',
        address: 'Calle 13 # 12-45, Parque Principal',
        city: 'Funza',
        lat: 4.7165,
        lng: -74.2115,
      },
      pricing: {
        isFree: false,
        priceCOP: 25000,
        displayPrice: '$25.000 COP',
        ticketUrl: 'https://tuboleta.com',
      },
      availableTickets: 20,
      totalTickets: 800,
      tags: ['Concierto', 'Urbano', 'Bacatá', 'Sabana'],
      additionalInfo: {
        ageRestriction: 'Mayores de 14 años',
        dressCode: 'Ropa cómoda y abrigo para la noche',
        weatherNotes: 'Zona cubierta y zona abierta',
        parkingAvailable: true,
      },
      isFeatured: true,
      isFavorite: false,
    },
    {
      id: 'evt-zaquesazipa-danza',
      title: 'Festival Zaquesazipa: Danza y Teatro Ancestral',
      subtitle: 'Celebración cultural bicentenaria de las artes',
      category: 'teatro',
      categoryLabel: 'Danza & Teatro',
      categoryIcon: 'theater_comedy',
      status: 'normal',
      statusMessage: 'Confirmado • Entrada Libre',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=900&q=80',
      description: 'El legendario Festival Zaquesazipa rinde homenaje a la herencia muisca y la cultura cundinamarquesa con más de 20 agrupaciones teatrales y danzas folclóricas en tarima.',
      organizer: 'Dirección de Cultura de Funza',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-22T14:00:00',
        endDate: '2026-11-22T21:00:00',
        displayDate: 'Domingo 22 de Noviembre, 2026',
        displayTime: '14:00h a 21:00h',
        doorsOpen: '13:30h',
      },
      location: {
        venueName: 'Plazoleta Marqués de San Jorge',
        address: 'Carrera 9 # 14-20, Centro Histórico',
        city: 'Funza',
        lat: 4.7172,
        lng: -74.2105,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Entrada Libre',
      },
      availableTickets: 500,
      totalTickets: 500,
      tags: ['Cultura', 'Muisca', 'Zaquesazipa', 'Familia'],
      additionalInfo: {
        ageRestriction: 'Todo público',
        dressCode: 'Casual',
        weatherNotes: 'Carpa gigante protegida',
        parkingAvailable: false,
      },
      isFeatured: true,
      isFavorite: true,
    },
    {
      id: 'evt-feria-gastronomica',
      title: 'Feria Gastronómica Sabores de la Sabana',
      subtitle: 'Postres típicos, piquete sabanero y cocina de autor',
      category: 'gastronomia',
      categoryLabel: 'Gastronomía Sabanera',
      categoryIcon: 'restaurant',
      status: 'normal',
      statusMessage: 'Más de 35 restaurantes participantes',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
      description: 'Un fin de semana dedicado a la riqueza culinaria de Funza y municipios vecinos. Degustaciones de quesos sabaneros, amasijos, arepas tradicionales, postres y cerveza artesanal.',
      organizer: 'Asociación Gastronómica de Funza',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-28T10:00:00',
        endDate: '2026-11-29T19:00:00',
        displayDate: '28 y 29 de Noviembre, 2026',
        displayTime: '10:00h a 19:00h',
        doorsOpen: '10:00h',
      },
      location: {
        venueName: 'Corredor Calle 15 y Parque Principal',
        address: 'Calle 15 entre Carrera 9 y 13',
        city: 'Funza',
        lat: 4.7155,
        lng: -74.2125,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Entrada Libre',
      },
      tags: ['Gastronomía', 'Comida típica', 'Postres', 'Feria'],
      additionalInfo: {
        ageRestriction: 'Todo público / Pet Friendly',
        dressCode: 'Casual',
        weatherNotes: 'Feria al aire libre',
        parkingAvailable: true,
      },
      isFeatured: false,
      isFavorite: false,
    },
    {
      id: 'evt-carrera-atletica',
      title: 'Carrera Atlética Nocturna 10K Villa Olímpica',
      subtitle: 'El reto deportivo más rápido de la sabana',
      category: 'deportes',
      categoryLabel: 'Deporte & Salud',
      categoryIcon: 'directions_run',
      status: 'ultimos_cupos',
      statusMessage: '¡Últimos 15 kits de competición!',
      imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80',
      description: 'Recorrido nocturno plano y rápido por las principales vías de Funza con llegada en la moderna pista de la Villa Olímpica. Incluye camiseta técnica, chip y medalla de finalista.',
      organizer: 'Instituto Municipal de Recreación y Deporte (Cundeportes Funza)',
      organizerVerified: true,
      schedule: {
        startDate: '2026-12-05T19:00:00',
        endDate: '2026-12-05T22:30:00',
        displayDate: 'Sábado 5 de Diciembre, 2026',
        displayTime: '19:00h a 22:30h',
        doorsOpen: '18:00h',
      },
      location: {
        venueName: 'Villa Olímpica de Funza',
        address: 'Calle 9 # 18-02, Sector Deportivo',
        city: 'Funza',
        lat: 4.7135,
        lng: -74.218,
      },
      pricing: {
        isFree: false,
        priceCOP: 40000,
        displayPrice: '$40.000 COP',
        ticketUrl: 'https://cundeportesfunza.gov.co',
      },
      availableTickets: 15,
      totalTickets: 600,
      tags: ['10K', 'Running', 'Villa Olímpica', 'Nocturna'],
      additionalInfo: {
        ageRestriction: 'Mayores de 16 años',
        dressCode: 'Indumentaria deportiva reflectiva',
        weatherNotes: 'Evento llueva o truene',
        parkingAvailable: true,
      },
      isFeatured: true,
      isFavorite: false,
    },
    {
      id: 'evt-humedal-guali',
      title: 'Caminata Ecológica y Avistamiento en Humedal Gualí',
      subtitle: 'Descubre las aves migratorias y la biodiversidad sabanera',
      category: 'ecologia',
      categoryLabel: 'Ecología & Naturaleza',
      categoryIcon: 'nature_people',
      status: 'normal',
      statusMessage: 'Guías biólogos certificados',
      imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
      description: 'Visita guiada por el ecosistema del Humedal Gualí. Conoce la importancia de este reservorio hídrico, avistamiento de tinguas, patos canadienses y siembra simbólica de frailejones y especies nativas.',
      organizer: 'Secretaría de Medio Ambiente y CAR Cundinamarca',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-21T07:30:00',
        endDate: '2026-11-21T12:00:00',
        displayDate: 'Sábado 21 de Noviembre, 2026',
        displayTime: '07:30h a 12:00h',
        doorsOpen: '07:15h',
      },
      location: {
        venueName: 'Sendero Interpretativo Humedal Gualí',
        address: 'Sector Tres Esquinas, Límite Funza - Mosquera',
        city: 'Funza',
        lat: 4.721,
        lng: -74.205,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Gratis con inscripción previa',
      },
      availableTickets: 30,
      totalTickets: 50,
      tags: ['Naturaleza', 'Humedal Gualí', 'Aves', 'Ecológico'],
      additionalInfo: {
        ageRestriction: 'Niños mayores de 7 años acompañados',
        dressCode: 'Botas de campo y chaqueta impermeable',
        weatherNotes: 'Sujeto a condiciones climáticas seguras',
        parkingAvailable: true,
      },
      isFeatured: false,
      isFavorite: false,
    },
    {
      id: 'evt-cine-parque',
      title: 'Cine Bajo las Estrellas: Clásicos del Cine Familiar',
      subtitle: 'Proyección en pantalla gigante al aire libre',
      category: 'cine',
      categoryLabel: 'Cine Familiar',
      categoryIcon: 'movie',
      status: 'normal',
      statusMessage: 'Palomitas gratis a las primeras 100 personas',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
      description: 'Una noche mágica de cine en el Parque Principal Capitán Ernesto Esguerra. Trae tu manta o cojín para disfrutar de una velada comunitaria inolvidable.',
      organizer: 'Centro Cultural Bacatá',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-27T18:30:00',
        endDate: '2026-11-27T21:00:00',
        displayDate: 'Viernes 27 de Noviembre, 2026',
        displayTime: '18:30h a 21:00h',
        doorsOpen: '18:00h',
      },
      location: {
        venueName: 'Parque Principal Capitán Ernesto Esguerra',
        address: 'Plaza Central de Funza',
        city: 'Funza',
        lat: 4.7161,
        lng: -74.212,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Entrada Libre',
      },
      tags: ['Cine', 'Familia', 'Parque', 'Funza'],
      additionalInfo: {
        ageRestriction: 'Todo público',
        dressCode: 'Mantas y ropa de abrigo',
        weatherNotes: 'Si llueve se traslada al auditorio Bacatá',
        parkingAvailable: false,
      },
      isFeatured: false,
      isFavorite: true,
    },
    {
      id: 'evt-expo-arte-colonial',
      title: 'Exposición: "Retazos de la Historia Funzana"',
      subtitle: 'Fotografía histórica y pintura al óleo',
      category: 'arte',
      categoryLabel: 'Arte & Exposiciones',
      categoryIcon: 'palette',
      status: 'normal',
      statusMessage: 'Visitas guiadas de 10:00h a 17:00h',
      imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=80',
      description: 'Muestra curada con más de 60 piezas históricas, grabados y lienzos que narran la evolución de Funza desde la época prehispánica hasta la villa republicana.',
      organizer: 'Casa Museo de la Cultura',
      organizerVerified: true,
      schedule: {
        startDate: '2026-11-15T09:00:00',
        endDate: '2026-12-15T18:00:00',
        displayDate: 'Hasta el 15 de Diciembre, 2026',
        displayTime: 'Lunes a Sábado: 09:00h a 18:00h',
      },
      location: {
        venueName: 'Galería de Arte Museo Funza',
        address: 'Carrera 11 # 13-18',
        city: 'Funza',
        lat: 4.717,
        lng: -74.2118,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Entrada Libre',
      },
      tags: ['Arte', 'Historia', 'Pintura', 'Patrimonio'],
      additionalInfo: {
        ageRestriction: 'Todo público',
        dressCode: 'Casual',
        weatherNotes: 'Recinto cerrado climatizado',
        parkingAvailable: false,
      },
      isFeatured: false,
      isFavorite: false,
    },
    {
      id: 'evt-concierto-rock-pasado',
      title: 'Rock en la Sabana - Edición Octubre',
      subtitle: 'Bandas emergentes de Cundinamarca',
      category: 'musica',
      categoryLabel: 'Música en Vivo',
      categoryIcon: 'music_note',
      status: 'finalizado',
      statusMessage: 'Evento finalizado el 15 de Octubre',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
      description: 'Festival de bandas de rock con gran acogida de público joven de la provincia sabanera.',
      organizer: 'Colectivo Musical Funza',
      organizerVerified: false,
      schedule: {
        startDate: '2026-10-15T16:00:00',
        endDate: '2026-10-15T23:00:00',
        displayDate: '15 de Octubre, 2026',
        displayTime: '16:00h a 23:00h',
      },
      location: {
        venueName: 'Parque de la Fraternidad',
        address: 'Calle 12 # 7-10',
        city: 'Funza',
        lat: 4.7145,
        lng: -74.209,
      },
      pricing: {
        isFree: true,
        priceCOP: 0,
        displayPrice: 'Entrada Libre',
      },
      tags: ['Rock', 'Música', 'Finalizado'],
      isFeatured: false,
      isFavorite: true,
    },
    {
      id: 'evt-obra-teatro-cancelada',
      title: 'Obra de Teatro: Sombras de la Niebla',
      subtitle: 'Compañía Teatral del Altiplano',
      category: 'teatro',
      categoryLabel: 'Teatro',
      categoryIcon: 'theater_comedy',
      status: 'cancelado',
      statusMessage: 'Cancelado por mantenimiento del recinto',
      imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80',
      description: 'Lamentamos informar que la función ha sido cancelada por imprevistos técnicos en la tramoya del auditorio.',
      organizer: 'Grupo Teatral Sabanero',
      schedule: {
        startDate: '2026-11-18T19:00:00',
        endDate: '2026-11-18T21:00:00',
        displayDate: 'Miércoles 18 de Noviembre, 2026',
        displayTime: '19:00h',
      },
      location: {
        venueName: 'Teatro Municipal Bacatá',
        address: 'Calle 14 # 13-02',
        city: 'Funza',
        lat: 4.7168,
        lng: -74.2125,
      },
      pricing: {
        isFree: false,
        priceCOP: 15000,
        displayPrice: '$15.000 COP',
      },
      tags: ['Teatro', 'Cancelado'],
      isFeatured: false,
      isFavorite: false,
    },
  ];

  // señales reactivas para que todo fluya
  private eventsSignal = signal<PlanazoEvent[]>(this.initialEvents);
  private filtersSignal = signal<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  private selectedCitySignal = signal<string>('Funza');

  readonly allEvents = this.eventsSignal.asReadonly();
  readonly activeFilters = this.filtersSignal.asReadonly();
  readonly selectedCity = this.selectedCitySignal.asReadonly();

  readonly featuredEvents = computed(() =>
    this.eventsSignal().filter(
      (e) => e.isFeatured && e.status !== 'cancelado' && e.status !== 'finalizado'
    )
  );

  readonly upcomingEvents = computed(() =>
    this.eventsSignal().filter(
      (e) => e.status !== 'finalizado' && e.status !== 'cancelado'
    )
  );

  readonly favoriteEvents = computed(() => {
    return this.eventsSignal()
      .filter((e) => e.isFavorite)
      .sort((a, b) => new Date(a.schedule.startDate).getTime() - new Date(b.schedule.startDate).getTime());
  });

  // filtrado express
  readonly filteredEvents = computed(() => {
    const list = this.eventsSignal();
    const filters = this.filtersSignal();
    const query = filters.searchTerm.trim().toLowerCase();

    return list.filter((event) => {
      if (filters.onlyFree && !event.pricing.isFree) {
        return false;
      }

      if (!filters.onlyFree && filters.maxPrice > 0 && event.pricing.priceCOP > filters.maxPrice) {
        return false;
      }

      if (filters.category !== 'todos' && event.category !== filters.category) {
        return false;
      }

      if (query.length > 0) {
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesOrganizer = event.organizer.toLowerCase().includes(query);
        const matchesVenue = event.location.venueName.toLowerCase().includes(query);
        const matchesTags = event.tags.some((t) => t.toLowerCase().includes(query));
        const matchesDesc = event.description.toLowerCase().includes(query);

        if (!matchesTitle && !matchesOrganizer && !matchesVenue && !matchesTags && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  });

  constructor() {
    this.restoreFavoritesFromStorage();
  }

  getEventById(id: string): PlanazoEvent | undefined {
    return this.eventsSignal().find((e) => e.id === id);
  }

  setFilterOptions(partial: Partial<FilterOptions>) {
    this.filtersSignal.update((curr) => ({ ...curr, ...partial }));
  }

  resetFilters() {
    this.filtersSignal.set(DEFAULT_FILTER_OPTIONS);
  }

  setSelectedCity(city: string) {
    this.selectedCitySignal.set(city);
    this.setFilterOptions({ city });
  }

  toggleFavorite(eventId: string): boolean {
    let newState = false;
    this.eventsSignal.update((events) =>
      events.map((e) => {
        if (e.id === eventId) {
          newState = !e.isFavorite;
          return { ...e, isFavorite: newState };
        }
        return e;
      })
    );
    this.saveFavoritesToStorage();
    return newState;
  }

  // calculo para saber que tan lejos esta
  calculateDistanceFromCenter(lat: number, lng: number): number {
    const R = 6371;
    const dLat = ((lat - this.FUNZA_LAT) * Math.PI) / 180;
    const dLon = ((lng - this.FUNZA_LNG) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((this.FUNZA_LAT * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  // guardando en local storage
  private saveFavoritesToStorage() {
    try {
      const favIds = this.eventsSignal()
        .filter((e) => e.isFavorite)
        .map((e) => e.id);
      localStorage.setItem('planazo_favorites', JSON.stringify(favIds));
    } catch {
      // si falló pailas xd
    }
  }

  private restoreFavoritesFromStorage() {
    try {
      const saved = localStorage.getItem('planazo_favorites');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids)) {
          this.eventsSignal.update((events) =>
            events.map((e) => ({
              ...e,
              isFavorite: ids.includes(e.id),
            }))
          );
        }
      }
    } catch {
    }
  }
}
