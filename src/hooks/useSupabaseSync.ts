import { useState } from 'react';
import { supabaseHelpers } from '../lib/supabase';
import type { TripData } from '../types';
import type { Database } from '../lib/database.types';
import { initialTripData } from '../data/initialData';

type DestinationRow = Database['public']['Tables']['destinations']['Row'];
type ActivityRow = Database['public']['Tables']['activities']['Row'];
type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type PersonRow = Database['public']['Tables']['people']['Row'];

export function useSupabaseSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from Supabase
  const loadFromSupabase = async (): Promise<TripData> => {
    try {
      setIsLoading(true);
      setError(null);

      const [destinations, activities, expenses, people, budget] = await Promise.all([
        supabaseHelpers.getDestinations(),
        supabaseHelpers.getActivities(),
        supabaseHelpers.getExpenses(),
        supabaseHelpers.getPeople(),
        supabaseHelpers.getBudget(),
      ]);

      // Transform Supabase data to app format
      const tripData: TripData = {
        destinations: destinations?.map((d: DestinationRow) => ({
          id: d.id,
          name: d.name,
          country: d.country,
          startDate: new Date(d.start_date),
          endDate: new Date(d.end_date),
          description: d.description || undefined,
        })) || initialTripData.destinations,

        activities: activities?.map((a: ActivityRow) => ({
          id: a.id,
          destinationId: a.destination_id,
          title: a.title,
          description: a.description,
          date: new Date(a.date),
          time: a.time || undefined,
          category: a.category,
          cost: a.cost || undefined,
          currency: a.currency,
          isCompleted: a.is_completed,
        })) || initialTripData.activities,

        expenses: expenses?.map((e: ExpenseRow) => ({
          id: e.id,
          destinationId: e.destination_id,
          title: e.title,
          amount: e.amount,
          currency: e.currency,
          category: e.category,
          date: new Date(e.date),
          description: e.description || undefined,
        })) || [],

        people: people?.map((p: PersonRow) => ({
          id: p.id,
          name: p.name,
          email: p.email || undefined,
          phone: p.phone || undefined,
          role: p.role,
        })) || initialTripData.people,

        budget: budget ? {
          totalBudget: budget.total_budget || 0,
          currency: budget.currency || 'EUR',
          spent: budget.spent || 0,
          remaining: budget.remaining || 0,
          byCategory: budget.by_category || {
            transport: 0,
            accommodation: 0,
            food: 0,
            shopping: 0,
            activities: 0,
            other: 0,
          },
        } : initialTripData.budget,
      };

      return tripData;
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      return initialTripData;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data to Supabase (appelé manuellement)
  const syncToSupabase = async (tripData: TripData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Sync destinations
      await Promise.all(
        tripData.destinations.map(dest => supabaseHelpers.saveDestination(dest))
      );

      // Sync activities
      await Promise.all(
        tripData.activities.map(activity => supabaseHelpers.saveActivity(activity))
      );

      // Sync expenses
      await Promise.all(
        tripData.expenses.map(expense => supabaseHelpers.saveExpense(expense))
      );

      // Sync people
      await Promise.all(
        tripData.people.map(person => supabaseHelpers.savePerson(person))
      );

      // Sync budget
      await supabaseHelpers.saveBudget(tripData.budget);

      console.log('Data synced to Supabase successfully');
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonctions CRUD individuelles
  const saveActivity = async (activity: any) => {
    try {
      setError(null);
      await supabaseHelpers.saveActivity(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save activity');
      throw err;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setError(null);
      await supabaseHelpers.deleteActivity(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      throw err;
    }
  };

  const saveExpense = async (expense: any) => {
    try {
      setError(null);
      await supabaseHelpers.saveExpense(expense);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense');
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setError(null);
      await supabaseHelpers.deleteExpense(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  };

  const savePerson = async (person: any) => {
    try {
      setError(null);
      await supabaseHelpers.savePerson(person);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save person');
      throw err;
    }
  };

  const deletePerson = async (id: string) => {
    try {
      setError(null);
      await supabaseHelpers.deletePerson(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete person');
      throw err;
    }
  };

  const saveBudget = async (budget: any) => {
    try {
      setError(null);
      await supabaseHelpers.saveBudget(budget);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget');
      throw err;
    }
  };

  return {
    loadFromSupabase,
    syncToSupabase,
    saveDestination: async (destination: any) => {
      try {
        setError(null);
        return await supabaseHelpers.saveDestination(destination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save destination');
        throw err;
      }
    },
    deleteDestination: async (id: string) => {
      try {
        setError(null);
        await supabaseHelpers.deleteDestination(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete destination');
        throw err;
      }
    },
    saveActivity,
    deleteActivity,
    saveExpense,
    deleteExpense,
    savePerson,
    deletePerson,
    saveBudget,
    isLoading,
    error,
  };
}