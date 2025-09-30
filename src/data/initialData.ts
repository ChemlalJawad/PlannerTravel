import type { Destination, Activity, Person, Budget, TripData } from '../types';

export const initialDestinations: Destination[] = [];

export const initialActivities: Activity[] = [];

export const initialPeople: Person[] = [
  {
    id: 'person-1',
    name: 'Vous',
    role: 'organizer'
  }
];

export const initialBudget: Budget = {
  totalBudget: 0,
  currency: 'EUR',
  spent: 0,
  remaining: 0,
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