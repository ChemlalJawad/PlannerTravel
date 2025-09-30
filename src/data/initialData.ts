import type { Destination, Activity, Person, Budget, TripData } from '../types';

export const initialDestinations: Destination[] = [
  {
    id: '1',
    name: 'Pékin',
    country: 'Chine',
    startDate: new Date('2026-05-02'),
    endDate: new Date('2026-05-05'),
    description: 'Capitale de la Chine, riche en histoire et culture'
  },
  {
    id: '2',
    name: 'Chongqing',
    country: 'Chine',
    startDate: new Date('2026-05-05'),
    endDate: new Date('2026-05-09'),
    description: 'Ville moderne avec des paysages spectaculaires'
  },
  {
    id: '3',
    name: 'Zhangjiajie',
    country: 'Chine',
    startDate: new Date('2026-05-09'),
    endDate: new Date('2026-05-11'),
    description: 'Parc national aux formations rocheuses uniques'
  },
  {
    id: '4',
    name: 'Shanghai',
    country: 'Chine',
    startDate: new Date('2026-05-11'),
    endDate: new Date('2026-05-16'),
    description: 'Centre économique et financier de la Chine'
  },
  {
    id: '5',
    name: 'Tokyo',
    country: 'Japon',
    startDate: new Date('2026-05-16'),
    endDate: new Date('2026-05-21'),
    description: 'Capitale du Japon, mélange de tradition et modernité'
  },
  {
    id: '6',
    name: 'Nikko',
    country: 'Japon',
    startDate: new Date('2026-05-21'),
    endDate: new Date('2026-05-23'),
    description: 'Ville historique avec des temples et la nature'
  },
  {
    id: '7',
    name: 'Takaragawa Onsen',
    country: 'Japon',
    startDate: new Date('2026-05-23'),
    endDate: new Date('2026-05-24'),
    description: 'Sources chaudes traditionnelles'
  },
  {
    id: '8',
    name: 'Hakone',
    country: 'Japon',
    startDate: new Date('2026-05-24'),
    endDate: new Date('2026-05-25'),
    description: 'Resort de montagne avec vue sur le Mont Fuji'
  },
  {
    id: '9',
    name: 'Kyoto & Osaka',
    country: 'Japon',
    startDate: new Date('2026-05-25'),
    endDate: new Date('2026-05-29'),
    description: 'Ancienne capitale et centre gastronomique'
  }
];

export const initialActivities: Activity[] = [
  // Vol vers la Chine
  {
    id: 'act-1',
    destinationId: '1',
    title: 'Vol vers Pékin',
    description: 'Départ le 1er mai, arrivée le 2 mai',
    date: new Date('2026-05-01'),
    time: '10:00',
    category: 'transport',
    cost: 800,
    currency: 'EUR',
    isCompleted: false
  },
  // Pékin
  {
    id: 'act-2',
    destinationId: '1',
    title: 'Visite de la Cité Interdite',
    description: 'Exploration du palais impérial',
    date: new Date('2026-05-03'),
    time: '09:00',
    category: 'sightseeing',
    cost: 60,
    currency: 'CNY',
    isCompleted: false
  },
  {
    id: 'act-3',
    destinationId: '1',
    title: 'Grande Muraille de Chine',
    description: 'Visite de la section de Mutianyu',
    date: new Date('2026-05-04'),
    time: '08:00',
    category: 'sightseeing',
    cost: 45,
    currency: 'CNY',
    isCompleted: false
  },
  // Vol Tokyo
  {
    id: 'act-4',
    destinationId: '5',
    title: 'Vol Shanghai - Tokyo',
    description: 'Vol vers le Japon',
    date: new Date('2026-05-16'),
    time: '14:00',
    category: 'transport',
    cost: 300,
    currency: 'EUR',
    isCompleted: false
  },
  // Activités pour septembre 2025 (pour tester l'affichage)
  {
    id: 'act-demo-1',
    destinationId: '1',
    title: 'Réunion de préparation',
    description: 'Planification du prochain voyage',
    date: new Date('2025-09-30'),
    time: '14:00',
    category: 'other',
    cost: undefined,
    currency: 'EUR',
    isCompleted: false
  },
  {
    id: 'act-demo-2',
    destinationId: '5',
    title: 'Réservation hôtel Tokyo',
    description: 'Recherche et réservation d\'hébergement',
    date: new Date('2025-10-01'),
    time: '10:00',
    category: 'accommodation',
    cost: 150,
    currency: 'EUR',
    isCompleted: false
  },
  {
    id: 'act-demo-3',
    destinationId: '2',
    title: 'Achat billets train',
    description: 'TGV Shanghai-Chongqing',
    date: new Date('2025-10-02'),
    time: '09:30',
    category: 'transport',
    cost: 80,
    currency: 'EUR',
    isCompleted: true
  },
  {
    id: 'act-demo-4',
    destinationId: '3',
    title: 'Restaurant traditionnel',
    description: 'Dîner dans un restaurant local',
    date: new Date('2025-10-02'),
    time: '19:00',
    category: 'food',
    cost: 35,
    currency: 'EUR',
    isCompleted: false
  },
  {
    id: 'act-demo-5',
    destinationId: '4',
    title: 'Shopping souvenirs',
    description: 'Achats dans les boutiques locales',
    date: new Date('2025-10-03'),
    time: '15:00',
    category: 'shopping',
    cost: 50,
    currency: 'EUR',
    isCompleted: false
  }
];

export const initialPeople: Person[] = [
  {
    id: 'person-1',
    name: 'Vous',
    role: 'organizer'
  }
];

export const initialBudget: Budget = {
  totalBudget: 5000,
  currency: 'EUR',
  spent: 0,
  remaining: 5000,
  byCategory: {
    transport: 0,
    accommodation: 0,
    food: 0,
    shopping: 0,
    activities: 0,
    other: 0
  }
};

export const initialTripData: TripData = {
  destinations: initialDestinations,
  activities: initialActivities,
  expenses: [],
  people: initialPeople,
  budget: initialBudget
};