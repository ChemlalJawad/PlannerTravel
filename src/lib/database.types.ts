export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: string;
          name: string;
          country: string;
          start_date: string;
          end_date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country: string;
          start_date: string;
          end_date: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          start_date?: string;
          end_date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          destination_id: string;
          title: string;
          description: string;
          date: string;
          time: string | null;
          category: 'transport' | 'accommodation' | 'sightseeing' | 'food' | 'shopping' | 'other';
          cost: number | null;
          currency: 'EUR' | 'CNY' | 'JPY';
          is_completed: boolean;
          google_maps_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          destination_id: string;
          title: string;
          description: string;
          date: string;
          time?: string | null;
          category: 'transport' | 'accommodation' | 'sightseeing' | 'food' | 'shopping' | 'other';
          cost?: number | null;
          currency: 'EUR' | 'CNY' | 'JPY';
          is_completed?: boolean;
          google_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination_id?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string | null;
          category?: 'transport' | 'accommodation' | 'sightseeing' | 'food' | 'shopping' | 'other';
          cost?: number | null;
          currency?: 'EUR' | 'CNY' | 'JPY';
          is_completed?: boolean;
          google_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          destination_id: string;
          title: string;
          amount: number;
          currency: 'EUR' | 'CNY' | 'JPY';
          category: 'transport' | 'accommodation' | 'food' | 'shopping' | 'activities' | 'other';
          date: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          destination_id: string;
          title: string;
          amount: number;
          currency: 'EUR' | 'CNY' | 'JPY';
          category: 'transport' | 'accommodation' | 'food' | 'shopping' | 'activities' | 'other';
          date: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          destination_id?: string;
          title?: string;
          amount?: number;
          currency?: 'EUR' | 'CNY' | 'JPY';
          category?: 'transport' | 'accommodation' | 'food' | 'shopping' | 'activities' | 'other';
          date?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: 'traveler' | 'organizer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role: 'traveler' | 'organizer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          role?: 'traveler' | 'organizer';
          created_at?: string;
          updated_at?: string;
        };
      };
      budget: {
        Row: {
          id: number;
          total_budget: number;
          currency: 'EUR';
          spent: number;
          remaining: number;
          by_category: {
            transport: number;
            accommodation: number;
            food: number;
            shopping: number;
            activities: number;
            other: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          total_budget: number;
          currency: 'EUR';
          spent?: number;
          remaining?: number;
          by_category: {
            transport: number;
            accommodation: number;
            food: number;
            shopping: number;
            activities: number;
            other: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          total_budget?: number;
          currency?: 'EUR';
          spent?: number;
          remaining?: number;
          by_category?: {
            transport: number;
            accommodation: number;
            food: number;
            shopping: number;
            activities: number;
            other: number;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}