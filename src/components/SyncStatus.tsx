import { Loader2, AlertCircle } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export default function SyncStatus() {
  const { isLoading, error, syncToDatabase } = useTrip();

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Erreur</span>
        <button
          onClick={syncToDatabase}
          className="text-xs underline hover:no-underline ml-2"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return null; // Pas d'indicateur quand tout va bien
}