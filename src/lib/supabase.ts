import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client Supabase sans types stricts pour éviter les erreurs de build
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions pour les opérations de base
export const supabaseHelpers = {
  // Destinations
  async getDestinations() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('start_date');
    
    if (error) throw error;
    return data;
  },

  async saveDestination(destination: any) {
    const { data, error } = await supabase
      .from('destinations')
      .upsert({
        id: destination.id,
        name: destination.name,
        country: destination.country,
        start_date: destination.startDate,
        end_date: destination.endDate,
        description: destination.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteDestination(id: string) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Activities
  async getActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date');
    
    if (error) throw error;
    return data;
  },

  async saveActivity(activity: any) {
    const { data, error} = await supabase
      .from('activities')
      .upsert({
        id: activity.id,
        destination_id: activity.destinationId,
        title: activity.title,
        description: activity.description,
        date: activity.date,
        time: activity.time,
        category: activity.category,
        cost: activity.cost,
        currency: activity.currency,
        is_completed: activity.isCompleted,
        google_maps_url: activity.googleMapsUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(id: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Expenses
  async getExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async saveExpense(expense: any) {
    const { data, error } = await supabase
      .from('expenses')
      .upsert({
        id: expense.id,
        destination_id: expense.destinationId,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        date: expense.date,
        description: expense.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // People
  async getPeople() {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async savePerson(person: any) {
    const { data, error } = await supabase
      .from('people')
      .upsert({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone,
        role: person.role,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePerson(id: string) {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Budget
  async getBudget() {
    const { data, error } = await supabase
      .from('budget')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async saveBudget(budget: any) {
    const { data, error } = await supabase
      .from('budget')
      .upsert({
        id: 1, // Budget unique
        total_budget: budget.totalBudget,
        currency: budget.currency,
        spent: budget.spent,
        remaining: budget.remaining,
        by_category: budget.byCategory,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};