export interface Destination {
  id: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

export interface Activity {
  id: string;
  destinationId: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  category: 'transport' | 'accommodation' | 'sightseeing' | 'food' | 'shopping' | 'other';
  cost?: number;
  currency: 'EUR' | 'CNY' | 'JPY';
  isCompleted: boolean;
}

export interface Expense {
  id: string;
  destinationId: string;
  title: string;
  amount: number;
  currency: 'EUR' | 'CNY' | 'JPY';
  category: 'transport' | 'accommodation' | 'food' | 'shopping' | 'activities' | 'other';
  date: Date;
  description?: string;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'traveler' | 'organizer';
}

export interface Budget {
  totalBudget: number;
  currency: 'EUR';
  spent: number;
  remaining: number;
  byCategory: {
    transport: number;
    accommodation: number;
    food: number;
    shopping: number;
    activities: number;
    other: number;
  };
}

export interface TripData {
  destinations: Destination[];
  activities: Activity[];
  expenses: Expense[];
  people: Person[];
  budget: Budget;
}