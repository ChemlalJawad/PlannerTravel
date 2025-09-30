import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TripData, Activity, Expense, Person, Destination } from '../types';
import { initialTripData } from '../data/initialData';
import { useSupabaseSync } from '../hooks/useSupabaseSync';

type TripAction =
  | { type: 'LOAD_DATA'; payload: TripData }
  | { type: 'ADD_DESTINATION'; payload: Destination }
  | { type: 'UPDATE_DESTINATION'; payload: { id: string; destination: Partial<Destination> } }
  | { type: 'DELETE_DESTINATION'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; activity: Partial<Activity> } }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Partial<Expense> } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_PERSON'; payload: Person }
  | { type: 'UPDATE_PERSON'; payload: { id: string; person: Partial<Person> } }
  | { type: 'DELETE_PERSON'; payload: string }
  | { type: 'UPDATE_BUDGET'; payload: { totalBudget: number } };

interface TripContextType {
  tripData: TripData;
  dispatch: React.Dispatch<TripAction>;
  isLoading: boolean;
  error: string | null;
  syncToDatabase: () => Promise<void>;
  // Actions avec sync automatique
  addDestination: (destination: Destination) => Promise<void>;
  updateDestination: (id: string, destination: Partial<Destination>) => Promise<void>;
  deleteDestination: (id: string) => Promise<void>;
  addActivity: (activity: Activity) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addPerson: (person: Person) => Promise<void>;
  updatePerson: (id: string, person: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  updateBudget: (budget: { totalBudget: number }) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

function tripReducer(state: TripData, action: TripAction): TripData {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.payload;
    
    case 'ADD_DESTINATION':
      return {
        ...state,
        destinations: [...state.destinations, action.payload]
      };
    
    case 'UPDATE_DESTINATION':
      return {
        ...state,
        destinations: state.destinations.map(destination =>
          destination.id === action.payload.id
            ? { ...destination, ...action.payload.destination }
            : destination
        )
      };
    
    case 'DELETE_DESTINATION':
      return {
        ...state,
        destinations: state.destinations.filter(destination => destination.id !== action.payload),
        // Supprimer aussi les activités et dépenses liées à cette destination
        activities: state.activities.filter(activity => activity.destinationId !== action.payload),
        expenses: state.expenses.filter(expense => expense.destinationId !== action.payload)
      };
    
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [...state.activities, action.payload]
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id
            ? { ...activity, ...action.payload.activity }
            : activity
        )
      };
    
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload)
      };
    
    case 'ADD_EXPENSE':
      const newExpense = action.payload;
      const updatedBudgetAfterAdd = {
        ...state.budget,
        spent: state.budget.spent + newExpense.amount,
        remaining: state.budget.totalBudget - (state.budget.spent + newExpense.amount),
        byCategory: {
          ...state.budget.byCategory,
          [newExpense.category]: state.budget.byCategory[newExpense.category] + newExpense.amount
        }
      };
      
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        budget: updatedBudgetAfterAdd
      };
    
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.expense }
            : expense
        )
      };
    
    case 'DELETE_EXPENSE':
      const expenseToDelete = state.expenses.find(exp => exp.id === action.payload);
      if (!expenseToDelete) return state;
      
      const updatedBudgetAfterDelete = {
        ...state.budget,
        spent: state.budget.spent - expenseToDelete.amount,
        remaining: state.budget.totalBudget - (state.budget.spent - expenseToDelete.amount),
        byCategory: {
          ...state.budget.byCategory,
          [expenseToDelete.category]: state.budget.byCategory[expenseToDelete.category] - expenseToDelete.amount
        }
      };
      
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        budget: updatedBudgetAfterDelete
      };
    
    case 'ADD_PERSON':
      return {
        ...state,
        people: [...state.people, action.payload]
      };
    
    case 'UPDATE_PERSON':
      return {
        ...state,
        people: state.people.map(person =>
          person.id === action.payload.id
            ? { ...person, ...action.payload.person }
            : person
        )
      };
    
    case 'DELETE_PERSON':
      return {
        ...state,
        people: state.people.filter(person => person.id !== action.payload)
      };
    
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budget: {
          ...state.budget,
          totalBudget: action.payload.totalBudget,
          remaining: action.payload.totalBudget - state.budget.spent
        }
      };
    
    default:
      return state;
  }
}

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [tripData, dispatch] = useReducer(tripReducer, initialTripData);
  const { 
    loadFromSupabase, 
    syncToSupabase, 
    saveDestination: saveDestinationToDb,
    deleteDestination: deleteDestinationFromDb,
    saveActivity: saveActivityToDb,
    deleteActivity: deleteActivityFromDb,
    saveExpense: saveExpenseToDb,
    deleteExpense: deleteExpenseFromDb,
    savePerson: savePersonToDb,
    deletePerson: deletePersonFromDb,
    saveBudget: saveBudgetToDb,
    isLoading, 
    error 
  } = useSupabaseSync();

  // Load data from Supabase on mount (une seule fois)
  useEffect(() => {
    const loadData = async () => {
      const data = await loadFromSupabase();
      dispatch({ type: 'LOAD_DATA', payload: data });
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionnellement vide pour charger une seule fois

  // Actions avec sync automatique vers DB
  const addDestination = async (destination: Destination) => {
    dispatch({ type: 'ADD_DESTINATION', payload: destination });
    await saveDestinationToDb(destination);
  };

  const updateDestination = async (id: string, destination: Partial<Destination>) => {
    dispatch({ type: 'UPDATE_DESTINATION', payload: { id, destination } });
    const fullDestination = { ...tripData.destinations.find(d => d.id === id)!, ...destination };
    await saveDestinationToDb(fullDestination);
  };

  const deleteDestination = async (id: string) => {
    dispatch({ type: 'DELETE_DESTINATION', payload: id });
    await deleteDestinationFromDb(id);
  };

  const addActivity = async (activity: Activity) => {
    dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    await saveActivityToDb(activity);
  };

  const updateActivity = async (id: string, activity: Partial<Activity>) => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: { id, activity } });
    const fullActivity = { ...tripData.activities.find(a => a.id === id)!, ...activity };
    await saveActivityToDb(fullActivity);
  };

  const deleteActivity = async (id: string) => {
    dispatch({ type: 'DELETE_ACTIVITY', payload: id });
    await deleteActivityFromDb(id);
  };

  const addExpense = async (expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    await saveExpenseToDb(expense);
    // Sync le budget mis à jour
    const newState = tripReducer(tripData, { type: 'ADD_EXPENSE', payload: expense });
    await saveBudgetToDb(newState.budget);
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense } });
    const fullExpense = { ...tripData.expenses.find(e => e.id === id)!, ...expense };
    await saveExpenseToDb(fullExpense);
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    await deleteExpenseFromDb(id);
    // Sync le budget mis à jour
    const newState = tripReducer(tripData, { type: 'DELETE_EXPENSE', payload: id });
    await saveBudgetToDb(newState.budget);
  };

  const addPerson = async (person: Person) => {
    dispatch({ type: 'ADD_PERSON', payload: person });
    await savePersonToDb(person);
  };

  const updatePerson = async (id: string, person: Partial<Person>) => {
    dispatch({ type: 'UPDATE_PERSON', payload: { id, person } });
    const fullPerson = { ...tripData.people.find(p => p.id === id)!, ...person };
    await savePersonToDb(fullPerson);
  };

  const deletePerson = async (id: string) => {
    dispatch({ type: 'DELETE_PERSON', payload: id });
    await deletePersonFromDb(id);
  };

  const updateBudget = async (budget: { totalBudget: number }) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
    const newState = tripReducer(tripData, { type: 'UPDATE_BUDGET', payload: budget });
    await saveBudgetToDb(newState.budget);
  };

  const syncToDatabase = async () => {
    await syncToSupabase(tripData);
  };

  return (
    <TripContext.Provider value={{ 
      tripData, 
      dispatch, 
      isLoading, 
      error, 
      syncToDatabase,
      addDestination,
      updateDestination,
      deleteDestination,
      addActivity,
      updateActivity,
      deleteActivity,
      addExpense,
      updateExpense,
      deleteExpense,
      addPerson,
      updatePerson,
      deletePerson,
      updateBudget,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}