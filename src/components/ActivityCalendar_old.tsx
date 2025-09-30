import { useState } from 'react';
import { Calendar, Clock, MapPin, Check, X, Plus } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Activity } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function ActivityCal          )}
        </div>
      </div>

      {/* Modal d'ajout d'activité */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Ajouter une activité - {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </h3>
              
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <select
                    value={newActivity.destinationId}
                    onChange={(e) => setNewActivity({ ...newActivity, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionner une destination</option>
                    {tripData.destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>
                        {dest.name} ({dest.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Visite du temple..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Détails de l'activité..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={newActivity.category}
                      onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value as Activity['category'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="transport">Transport</option>
                      <option value="accommodation">Hébergement</option>
                      <option value="sightseeing">Visites</option>
                      <option value="food">Restauration</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coût
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newActivity.cost || ''}
                      onChange={(e) => setNewActivity({ 
                        ...newActivity, 
                        cost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Devise
                    </label>
                    <select
                      value={newActivity.currency}
                      onChange={(e) => setNewActivity({ ...newActivity, currency: e.target.value as Activity['currency'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="CNY">CNY</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter l'activité
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}) {
  const { tripData, updateActivity, addActivity } = useTrip();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    destinationId: '',
    title: '',
    description: '',
    date: new Date(),
    time: '',
    category: 'other',
    cost: undefined,
    currency: 'EUR',
    isCompleted: false
  });

  // Générer les jours du mois
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtenir les activités pour une date donnée
  const getActivitiesForDate = (date: Date) => {
    return tripData.activities.filter(activity => isSameDay(activity.date, date));
  };

  // Obtenir la destination pour une activité
  const getDestinationForActivity = (destinationId: string) => {
    return tripData.destinations.find(dest => dest.id === destinationId);
  };

  // Toggle completion d'une activité
  const toggleActivityCompletion = async (activityId: string, isCompleted: boolean) => {
    try {
      await updateActivity(activityId, { isCompleted: !isCompleted });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Ajouter une nouvelle activité
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim() || !newActivity.destinationId) return;

    const activity: Activity = {
      id: uuidv4(),
      ...newActivity,
      date: selectedDate, // Utilise la date sélectionnée dans le calendrier
    };

    try {
      await addActivity(activity);
      setNewActivity({
        destinationId: '',
        title: '',
        description: '',
        date: new Date(),
        time: '',
        category: 'other',
        cost: undefined,
        currency: 'EUR',
        isCompleted: false
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  // Ouvrir le modal d'ajout avec la date sélectionnée
  const openAddModal = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setNewActivity(prev => ({
      ...prev,
      date: date || selectedDate,
      destinationId: tripData.destinations[0]?.id || ''
    }));
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier des activités</h1>
        <button
          onClick={() => openAddModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une activité
        </button>
      </div>

      {/* Navigation du mois */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            →
          </button>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Cases vides pour aligner le premier jour */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2 min-h-[120px] border border-gray-200"></div>
          ))}
          
          {/* Jours du mois */}
          {days.map(day => {
            const activitiesForDay = getActivitiesForDate(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`p-2 min-h-[120px] border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isCurrentDay ? 'bg-blue-50 border-blue-300' : 'bg-white'
                }`}
                onClick={() => setSelectedDate(day)}
                onDoubleClick={() => openAddModal(day)}
                title="Double-cliquez pour ajouter une activité"
              >
                {/* Numéro du jour */}
                <div className={`text-sm font-medium mb-2 flex justify-center items-center w-6 h-6 rounded-full ${
                  isCurrentDay 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Activités du jour */}
                <div className="space-y-1">
                  {activitiesForDay.slice(0, 3).map((activity) => {
                    const destination = getDestinationForActivity(activity.destinationId);
                    const categoryColors = {
                      transport: 'bg-blue-500',
                      accommodation: 'bg-purple-500',
                      sightseeing: 'bg-green-500',
                      food: 'bg-yellow-500',
                      shopping: 'bg-pink-500',
                      other: 'bg-gray-500'
                    };
                    
                    return (
                      <div
                        key={activity.id}
                        className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${
                          activity.isCompleted ? 'opacity-60 line-through' : ''
                        }`}
                        style={{ backgroundColor: categoryColors[activity.category as keyof typeof categoryColors] || '#6B7280' }}
                        title={`${activity.title} - ${destination?.name} ${activity.time ? `à ${activity.time}` : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActivityCompletion(activity.id, activity.isCompleted);
                        }}
                      >
                        <div className="flex items-center">
                          {activity.time && (
                            <span className="font-medium mr-1">{activity.time}</span>
                          )}
                          <span className="truncate">{activity.title}</span>
                          {activity.isCompleted && (
                            <Check className="w-3 h-3 ml-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Indicateur s'il y a plus d'activités */}
                  {activitiesForDay.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium pl-1">
                      +{activitiesForDay.length - 3} autre{activitiesForDay.length - 3 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende des couleurs */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Légende des catégories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'transport', label: 'Transport', color: 'bg-blue-500' },
            { key: 'accommodation', label: 'Hébergement', color: 'bg-purple-500' },
            { key: 'sightseeing', label: 'Visites', color: 'bg-green-500' },
            { key: 'food', label: 'Restauration', color: 'bg-yellow-500' },
            { key: 'shopping', label: 'Shopping', color: 'bg-pink-500' },
            { key: 'other', label: 'Autre', color: 'bg-gray-500' },
          ].map(category => (
            <div key={category.key} className="flex items-center">
              <div className={`w-3 h-3 rounded ${category.color} mr-2`}></div>
              <span className="text-xs text-gray-600">{category.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activités du jour sélectionné */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Activités du {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
        </h3>
        
        {(() => {
          const selectedDayActivities = getActivitiesForDate(selectedDate);
          
          if (selectedDayActivities.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune activité prévue ce jour</p>
              </div>
            );
          }
          
          return (
            <div className="space-y-3">
              {selectedDayActivities.map(activity => {
                const destination = getDestinationForActivity(activity.destinationId);
                const categoryColors = {
                  transport: 'border-blue-500 bg-blue-50',
                  accommodation: 'border-purple-500 bg-purple-50',
                  sightseeing: 'border-green-500 bg-green-50',
                  food: 'border-yellow-500 bg-yellow-50',
                  shopping: 'border-pink-500 bg-pink-50',
                  other: 'border-gray-500 bg-gray-50'
                };
                
                return (
                  <div
                    key={activity.id}
                    className={`border-l-4 p-4 rounded-r-lg ${
                      categoryColors[activity.category as keyof typeof categoryColors] || 'border-gray-500 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleActivityCompletion(activity.id, activity.isCompleted)}
                          className={`p-2 rounded-full mr-3 transition-colors ${
                            activity.isCompleted
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                          }`}
                        >
                          {activity.isCompleted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-medium text-lg ${
                            activity.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {activity.title}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            {activity.time && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </span>
                            )}
                            
                            {destination && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {destination.name}
                              </span>
                            )}
                            
                            {activity.cost && (
                              <span className="font-medium">
                                {activity.cost} {activity.currency}
                              </span>
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Liste des activités par destination (vue générale) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Toutes les activités par destination
        </h3>
        
        {/* Afficher toutes les activités avec filtrage par voyage */}
        <div className="space-y-4">
          {tripData.destinations.map(destination => {
            const destActivities = tripData.activities.filter(
              activity => activity.destinationId === destination.id
            );
            
            if (destActivities.length === 0) return null;
            
            return (
              <div key={destination.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900 flex items-center mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  {destination.name} ({destination.country})
                </h4>
                
                <div className="space-y-2">
                  {destActivities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center flex-1">
                        <button
                          onClick={() => toggleActivityCompletion(activity.id, activity.isCompleted)}
                          className={`p-1 rounded-full mr-3 ${
                            activity.isCompleted
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {activity.isCompleted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className={`font-medium ${
                            activity.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {activity.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {format(activity.date, 'dd MMMM yyyy', { locale: fr })}
                            {activity.time && (
                              <span className="ml-2 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.time}
                              </span>
                            )}
                          </div>
                          {activity.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {activity.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.category === 'transport' ? 'bg-blue-100 text-blue-800' :
                          activity.category === 'accommodation' ? 'bg-purple-100 text-purple-800' :
                          activity.category === 'sightseeing' ? 'bg-green-100 text-green-800' :
                          activity.category === 'food' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.category}
                        </span>
                        
                        {activity.cost && (
                          <span className="text-sm font-medium text-gray-700">
                            {activity.cost}€
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}