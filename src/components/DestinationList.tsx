import { MapPin, Calendar, Clock, Trash2, Check, Plus, Edit2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useDarkMode } from '../context/DarkModeContext';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Activity, Destination } from '../types';

export default function DestinationList() {
  const { tripData, addDestination, updateDestination, deleteDestination, updateActivity, deleteActivity } = useTrip();
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

  const handleSaveDestination = async () => {
    if (!newDestination.name.trim()) return;

    try {
      if (editingDestination) {
        await updateDestination(editingDestination, {
          ...newDestination,
          startDate: newDestination.startDate,
          endDate: newDestination.endDate
        });
      } else {
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
    return tripData.expenses
      .filter((expense: any) => expense.destinationId === destinationId)
      .reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };

  return (
    <div className={`p-4 sm:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Lieux & Destinations
          </h2>
          <button
            onClick={handleAddDestination}
            className={`flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg border transition-colors w-full sm:w-auto ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une destination
          </button>
        </div>
        
        {tripData.destinations.map((destination: any, index: number) => {
          const activities = getDestinationActivities(destination.id);
          const expenses = getDestinationExpenses(destination.id);
          const duration = differenceInDays(destination.endDate || destination.departureDate, destination.startDate || destination.arrivalDate);
          const isChina = destination.country === 'Chine';
          
          return (
            <div
              key={destination.id}
              className={`mb-4 sm:mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border`}
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
                  <div className="flex items-center">
                    <span className="text-2xl sm:text-3xl mr-3">
                      {isChina ? '🇨🇳' : '🇯🇵'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                        {destination.name}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{destination.country || 'Destination'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-center sm:text-right">
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Étape {index + 1}</div>
                      <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {duration > 0 ? duration : 1} jour{duration > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDestination(destination)}
                        className={`p-2 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300'
                        }`}
                        title="Modifier la destination"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(destination.id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          darkMode 
                            ? 'bg-red-900 hover:bg-red-800 text-red-300 border-red-700' 
                            : 'bg-red-100 hover:bg-red-200 text-red-600 border-red-300'
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
                    <div className={`flex items-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {format(destination.startDate || destination.arrivalDate, 'dd MMM', { locale: fr })} - {format(destination.endDate || destination.departureDate, 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>

                    {/* Description */}
                    {destination.description && (
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed text-sm sm:text-base`}>
                        {destination.description}
                      </p>
                    )}
                    
                    {/* Statistiques mobile-friendly */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 text-center ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                        <Clock className={`w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Activités</div>
                        <div className={`text-sm sm:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activities.length}</div>
                      </div>
                      
                      <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 text-center ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
                        <MapPin className={`w-4 sm:w-5 h-4 sm:h-5 mx-auto mb-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Dépenses</div>
                        <div className={`text-sm sm:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{expenses.toLocaleString()}€</div>
                      </div>

                      <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 text-center ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Par jour</div>
                        <div className={`text-sm sm:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {duration > 0 ? Math.round(expenses / duration).toLocaleString() : 0}€
                        </div>
                      </div>
                    </div>

                    {destination.accommodation && (
                      <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} border`}>
                        <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Logement:</span>
                        <div className={`${darkMode ? 'text-white' : 'text-gray-900'} font-semibold text-sm sm:text-base`}>
                          {destination.accommodation}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-1 lg:order-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} text-sm sm:text-base`}>
                        Activités ({activities.length})
                      </h4>
                    </div>
                    
                    {activities.length === 0 ? (
                      <div className={`p-4 sm:p-6 text-center rounded-lg sm:rounded-xl border-2 border-dashed ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                      }`}>
                        <Calendar className={`w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Aucune activité planifiée
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Utilisez l'onglet Planning pour ajouter des activités
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                        {activities.map((activity: Activity) => (
                          <div
                            key={activity.id}
                            className={`p-3 rounded-lg sm:rounded-xl border ${
                              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleCompleted(activity)}
                                  className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                                    activity.isCompleted
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : darkMode ? 'border-gray-500 hover:border-gray-400' : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {activity.isCompleted && <Check className="w-3 h-3" />}
                                </button>
                                
                                <div className="min-w-0 flex-1">
                                  <div className={`text-sm font-medium ${
                                    activity.isCompleted 
                                      ? darkMode ? 'text-gray-500 line-through' : 'text-gray-400 line-through'
                                      : darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {activity.title}
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {format(activity.date, 'dd/MM', { locale: fr })}
                                    </div>
                                    
                                    {activity.time && (
                                      <div className={`flex items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Clock className="w-3 h-3 mr-1" />
                                        {activity.time}
                                      </div>
                                    )}
                                    
                                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(activity.category)}`}>
                                      {activity.category}
                                    </span>
                                  </div>
                                  
                                  {activity.description && (
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 ml-2">
                                {activity.cost && (
                                  <div className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mr-0 sm:mr-2 mb-1 sm:mb-0`}>
                                    {activity.cost}€
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className={`p-1 rounded transition-colors ${
                                    darkMode ? 'hover:bg-red-900 text-red-400 hover:text-red-300' : 'hover:bg-red-100 text-red-500 hover:text-red-700'
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className={`w-full sm:w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} sm:border max-h-[90vh] sm:max-h-[80vh] overflow-y-auto`}>
            <div className="p-4 sm:p-6">
              {/* En-tête mobile */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingDestination ? 'Modifier la destination' : 'Nouvelle destination'}
                </h3>
                <button
                  onClick={cancelDestinationEdit}
                  className={`sm:hidden p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nom de la destination *
                  </label>
                  <input
                    type="text"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                    className={`w-full px-3 py-3 sm:py-2 rounded-lg border text-base sm:text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="Tokyo, Paris, New York..."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pays
                  </label>
                  <input
                    type="text"
                    value={newDestination.country}
                    onChange={(e) => setNewDestination({ ...newDestination, country: e.target.value })}
                    className={`w-full px-3 py-3 sm:py-2 rounded-lg border text-base sm:text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    placeholder="Japon, France, États-Unis..."
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date d'arrivée *
                    </label>
                    <input
                      type="date"
                      value={format(newDestination.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setNewDestination({ ...newDestination, startDate: new Date(e.target.value) })}
                      className={`w-full px-3 py-3 sm:py-2 rounded-lg border text-base sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date de départ *
                    </label>
                    <input
                      type="date"
                      value={format(newDestination.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setNewDestination({ ...newDestination, endDate: new Date(e.target.value) })}
                      className={`w-full px-3 py-3 sm:py-2 rounded-lg border text-base sm:text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newDestination.description}
                    onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                    className={`w-full px-3 py-3 sm:py-2 rounded-lg border text-base sm:text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 resize-none`}
                    rows={4}
                    placeholder="Description de la destination, points d'intérêt, notes..."
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
                <button
                  onClick={cancelDestinationEdit}
                  className={`hidden sm:block px-4 py-2 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveDestination}
                  disabled={!newDestination.name.trim()}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {editingDestination ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  onClick={cancelDestinationEdit}
                  className={`sm:hidden w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
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