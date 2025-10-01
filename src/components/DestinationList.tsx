import { MapPin, Calendar, Clock, Trash2, Check, Plus, Edit2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useDarkMode } from '../context/DarkModeContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Activity } from '../types';
import ImportCSV from './ImportCSV';

export default function DestinationList() {
  const { tripData, addDestination, updateDestination, deleteDestination, updateActivity, deleteActivity, updateExpense } = useTrip();
  const { darkMode } = useDarkMode();
  
  // États pour la gestion des destinations
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<string | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  });

  // Fonctions de gestion des destinations
  const handleAddDestination = () => {
    setNewDestination({
      name: '',
      country: '',
      startDate: new Date(),
      endDate: new Date(),
      description: ''
    });
    setEditingDestination(null);
    setShowDestinationModal(true);
  };

  const handleEditDestination = (destination: any) => {
    setEditingDestination(destination.id);
    setNewDestination({
      name: destination.name,
      country: destination.country,
      startDate: new Date(destination.startDate || destination.arrivalDate),
      endDate: new Date(destination.endDate || destination.departureDate),
      description: destination.description || ''
    });
    setShowDestinationModal(true);
  };

  const findDuplicateDestination = (name: string, startDate: Date, excludeId?: string): any | null => {
    const normalizedName = name.toLowerCase().trim();
    const targetDate = new Date(startDate);
    targetDate.setHours(0, 0, 0, 0);

    return tripData.destinations.find(dest => {
      if (excludeId && dest.id === excludeId) return false; // Exclure la destination en cours d'édition

      const destName = dest.name.toLowerCase().trim();
      const destDate = new Date(dest.startDate);
      destDate.setHours(0, 0, 0, 0);

      return destName === normalizedName && destDate.getTime() === targetDate.getTime();
    }) || null;
  };

  const handleSaveDestination = async () => {
    if (!newDestination.name.trim()) return;

    try {
      // Vérifier s'il existe déjà une destination avec le même nom et la même date
      const duplicate = findDuplicateDestination(
        newDestination.name,
        newDestination.startDate,
        editingDestination || undefined
      );

      if (duplicate && editingDestination && duplicate.id !== editingDestination) {
        // On a trouvé un doublon avec une autre destination
        const confirmMerge = window.confirm(
          `Une destination "${duplicate.name}" existe déjà pour cette date (${new Date(duplicate.startDate).toLocaleDateString('fr-FR')}).\n\n` +
          `Voulez-vous fusionner les activités de ces deux destinations ?\n\n` +
          `- OUI : Les activités seront combinées et la destination actuelle sera supprimée\n` +
          `- NON : La modification sera annulée`
        );

        if (confirmMerge) {
          // Fusionner : transférer toutes les activités vers la destination existante
          const activitiesToMove = tripData.activities.filter(
            activity => activity.destinationId === editingDestination
          );

          // Déplacer chaque activité vers la destination de destination
          for (const activity of activitiesToMove) {
            await updateActivity(activity.id, {
              destinationId: duplicate.id
            });
          }

          // Déplacer les dépenses aussi
          const expensesToMove = tripData.expenses.filter(
            expense => expense.destinationId === editingDestination
          );

          for (const expense of expensesToMove) {
            await updateExpense(expense.id, {
              destinationId: duplicate.id
            });
          }

          // Supprimer la destination actuelle (maintenant vide)
          await deleteDestination(editingDestination);

          alert(`✅ Fusion réussie ! Les activités et dépenses ont été transférées vers "${duplicate.name}".`);
        }
      } else if (editingDestination) {
        // Pas de doublon, mise à jour normale
        await updateDestination(editingDestination, {
          ...newDestination,
          startDate: newDestination.startDate,
          endDate: newDestination.endDate
        });
      } else {
        // Création d'une nouvelle destination
        if (duplicate) {
          alert(`⚠️ Une destination "${duplicate.name}" existe déjà pour cette date. Veuillez choisir un autre nom ou une autre date.`);
          return;
        }

        const destinationWithId = {
          ...newDestination,
          id: uuidv4()
        };
        await addDestination(destinationWithId);
      }

      setShowDestinationModal(false);
      setEditingDestination(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleDeleteDestination = async (destinationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette destination ? Toutes les activités et dépenses associées seront également supprimées.')) {
      try {
        await deleteDestination(destinationId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const cancelDestinationEdit = () => {
    setShowDestinationModal(false);
    setEditingDestination(null);
    setNewDestination({
      name: '',
      country: '',
      startDate: new Date(),
      endDate: new Date(),
      description: ''
    });
  };

  const handleToggleCompleted = async (activity: Activity) => {
    try {
      await updateActivity(activity.id, {
        ...activity,
        isCompleted: !activity.isCompleted
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      try {
        await deleteActivity(activityId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      transport: darkMode ? 'bg-blue-800 border-blue-600 text-blue-200' : 'bg-blue-100 border-blue-300 text-blue-800',
      accommodation: darkMode ? 'bg-green-800 border-green-600 text-green-200' : 'bg-green-100 border-green-300 text-green-800',
      food: darkMode ? 'bg-orange-800 border-orange-600 text-orange-200' : 'bg-orange-100 border-orange-300 text-orange-800',
      sightseeing: darkMode ? 'bg-purple-800 border-purple-600 text-purple-200' : 'bg-purple-100 border-purple-300 text-purple-800',
      shopping: darkMode ? 'bg-red-800 border-red-600 text-red-200' : 'bg-red-100 border-red-300 text-red-800',
      other: darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getDestinationActivities = (destinationId: string) => {
    return tripData.activities.filter((activity: Activity) => activity.destinationId === destinationId);
  };

  const getDestinationExpenses = (destinationId: string) => {
    // Somme des dépenses explicites
    const expensesTotal = tripData.expenses
      .filter((expense: any) => expense.destinationId === destinationId)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);

    // Somme des coûts des activités
    const activitiesTotal = tripData.activities
      .filter((activity: Activity) => activity.destinationId === destinationId && activity.cost)
      .reduce((sum: number, activity: Activity) => sum + (activity.cost || 0), 0);

    return expensesTotal + activitiesTotal;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="section-title">Lieux & Destinations</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <ImportCSV />
          <button
            onClick={handleAddDestination}
            data-add-destination
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une destination
          </button>
        </div>
      </div>
        
      <div className="space-y-6">
        {tripData.destinations.map((destination: any, index: number) => {
          const activities = getDestinationActivities(destination.id);
          const expenses = getDestinationExpenses(destination.id);
          const duration = differenceInDays(destination.endDate || destination.departureDate, destination.startDate || destination.arrivalDate);
          const isChina = destination.country === 'Chine';

          return (
            <div
              key={destination.id}
              className="card overflow-hidden hover-lift"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-3">
                      {isChina ? '🇨🇳' : '🇯🇵'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'} truncate`}>
                        {destination.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{destination.country || 'Destination'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-center sm:text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-500">Étape {index + 1}</div>
                      <div className={`text-lg font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                        {duration > 0 ? duration : 1} jour{duration > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDestination(destination)}
                        className="btn-outline p-2"
                        title="Modifier la destination"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(destination.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          darkMode
                            ? 'bg-[#1a1a1a] hover:bg-red-900/20 text-red-400 border-[#2a2a2a] hover:border-red-900'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300'
                        }`}
                        title="Supprimer la destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="order-2 lg:order-1">
                    {/* Dates */}
                    <div className="flex items-center text-gray-500 dark:text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {format(destination.startDate || destination.arrivalDate, 'dd MMM', { locale: fr })} - {format(destination.endDate || destination.departureDate, 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>

                    {/* Description */}
                    {destination.description && (
                      <p className={`mb-4 leading-relaxed text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {destination.description}
                      </p>
                    )}
                    
                    {/* Statistiques mobile-friendly */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className={`rounded-xl p-2 sm:p-3 text-center border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-blue-50 border-blue-100'}`}>
                        <Clock className={`w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Activités</div>
                        <div className={`text-sm sm:text-base font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{activities.length}</div>
                      </div>

                      <div className={`rounded-xl p-2 sm:p-3 text-center border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-green-50 border-green-100'}`}>
                        <MapPin className={`w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Dépenses</div>
                        <div className={`text-sm sm:text-base font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{expenses.toLocaleString()}€</div>
                      </div>

                      <div className={`rounded-xl p-2 sm:p-3 text-center border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-purple-50 border-purple-100'}`}>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Par jour</div>
                        <div className={`text-sm sm:text-base font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                          {duration > 0 ? Math.round(expenses / duration).toLocaleString() : 0}€
                        </div>
                      </div>
                    </div>

                    {destination.accommodation && (
                      <div className={`p-3 sm:p-4 rounded-xl border ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-blue-50 border-blue-100'}`}>
                        <span className="font-medium text-gray-500 dark:text-gray-500 text-sm">Logement:</span>
                        <div className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                          {destination.accommodation}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                        Activités ({activities.length})
                      </h4>
                    </div>

                    {activities.length === 0 ? (
                      <div className={`p-4 sm:p-6 text-center rounded-xl border-2 border-dashed ${
                        darkMode ? 'border-[#2a2a2a] bg-[#1a1a1a]' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <Calendar className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Aucune activité planifiée
                        </p>
                        <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                          Utilisez l'onglet Planning pour ajouter des activités
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                        {activities.map((activity: Activity) => (
                          <div
                            key={activity.id}
                            className={`p-3 rounded-xl border transition-colors ${
                              darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleCompleted(activity)}
                                  className={`w-5 h-4 sm:h-5 rounded-full mr-3 flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                                    activity.isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : darkMode ? 'border-gray-500 hover:border-gray-400' : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {activity.isCompleted && <Check className="w-2 h-2" />}
                                </button>
                                
                                <div className="min-w-0 flex-1">
                                  <div className={`text-sm font-medium ${
                                    activity.isCompleted
                                      ? 'text-gray-400 dark:text-gray-500 line-through'
                                      : darkMode ? 'text-gray-50' : 'text-gray-900'
                                  }`}>
                                    {activity.title}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {format(activity.date, 'dd/MM', { locale: fr })}
                                    </div>

                                    {activity.time && (
                                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {activity.time}
                                      </div>
                                    )}

                                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(activity.category)}`}>
                                      {activity.category}
                                    </span>
                                  </div>

                                  {activity.description && (
                                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-500 line-clamp-2">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 ml-2">
                                {activity.cost && (
                                  <div className={`text-sm font-semibold mr-0 sm:mr-2 mb-1 sm:mb-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    {activity.cost}€
                                  </div>
                                )}

                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className={`p-1 rounded-lg transition-colors ${
                                    darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-100 text-red-500'
                                  }`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal d'ajout/édition de destination */}
      {showDestinationModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDestinationModal(false);
            }
          }}
        >
          <div className={`w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl border max-h-[90vh] sm:max-h-[80vh] overflow-y-auto animate-slide-up ${darkMode ? 'bg-[#141414] border-[#1f1f1f]' : 'bg-white border-gray-200'}`}>
            <div className="p-4 sm:p-6">
              {/* En-tête mobile */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                  {editingDestination ? 'Modifier la destination' : 'Nouvelle destination'}
                </h3>
                <button
                  onClick={cancelDestinationEdit}
                  className={`sm:hidden p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-[#1a1a1a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-500">
                    Nom de la destination *
                  </label>
                  <input
                    type="text"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                    className="input-field"
                    placeholder="Tokyo, Paris, New York..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-500">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={newDestination.country}
                    onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                    className="input-field"
                    placeholder="Japon, France, États-Unis..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-500">
                      Date d'arrivée *
                    </label>
                    <input
                      type="date"
                      value={format(newDestination.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setNewDestination({ ...newDestination, startDate: new Date(e.target.value) })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-500">
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      value={format(newDestination.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setNewDestination({ ...newDestination, endDate: new Date(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500 dark:text-gray-500">
                    Description
                  </label>
                  <textarea
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Description de la destination, points d'intérêt, notes..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
                <button
                  onClick={cancelDestinationEdit}
                  className="hidden sm:block btn-outline"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveDestination}
                  disabled={!newDestination.name.trim()}
                  className="w-full sm:w-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingDestination ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  onClick={cancelDestinationEdit}
                  className="sm:hidden w-full btn-outline"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}