import { useState } from 'react';
import { Check, X, Plus, ChevronLeft, ChevronRight, Calendar, List, Edit2, Trash2, Clock, MapPin, Camera } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Activity } from '../types';
import { v4 as uuidv4 } from 'uuid';
import PhotoUpload from './PhotoUpload';

export default function ActivityCalendar() {
  const { tripData, updateActivity, addActivity, deleteActivity } = useTrip();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedDayForEvents, setSelectedDayForEvents] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  // Trouver Pékin et utiliser sa date de début comme défaut
  const beijingDestination = tripData.destinations.find(dest => dest.name === 'Pékin');
  const defaultDate = beijingDestination ? new Date(beijingDestination.startDate) : new Date();
  
  const [newActivity, setNewActivity] = useState({
    destinationId: beijingDestination?.id || '',
    title: '',
    description: '',
    date: defaultDate,
    time: '',
    category: 'other' as Activity['category'],
    cost: undefined as number | undefined,
    currency: 'EUR' as Activity['currency'],
    isCompleted: false,
    googleMapsUrl: ''
  });

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getActivitiesForDate = (date: Date) => {
    return tripData.activities.filter(activity => isSameDay(activity.date, date));
  };

  const toggleActivityCompletion = async (activityId: string, isCompleted: boolean) => {
    try {
      await updateActivity(activityId, { isCompleted: !isCompleted });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDayForEvents(day);
  };

  const getCategoryColors = (category: Activity['category']) => {
    const colors = {
      transport: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
      accommodation: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
      sightseeing: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
      food: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200' },
      shopping: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-200' },
      other: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' }
    };
    return colors[category] || colors.other;
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim() || !newActivity.destinationId) return;

    const activity: Activity = {
      id: uuidv4(),
      destinationId: newActivity.destinationId,
      title: newActivity.title,
      description: newActivity.description,
      date: newActivity.date,
      time: newActivity.time,
      category: newActivity.category,
      cost: newActivity.cost,
      currency: newActivity.currency,
      isCompleted: false,
      googleMapsUrl: newActivity.googleMapsUrl || undefined
    };

    try {
      await addActivity(activity);
      setNewActivity({
        destinationId: beijingDestination?.id || '',
        title: '',
        description: '',
        date: defaultDate,
        time: '',
        category: 'other',
        cost: undefined,
        currency: 'EUR',
        isCompleted: false,
        googleMapsUrl: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const openAddModal = (date?: Date) => {
    setNewActivity({
      ...newActivity,
      date: date || defaultDate,
      destinationId: beijingDestination?.id || tripData.destinations[0]?.id || ''
    });
    setEditingActivity(null);
    setShowAddModal(true);
  };

  const openEditModal = (activity: Activity) => {
    setNewActivity({
      destinationId: activity.destinationId,
      title: activity.title,
      description: activity.description,
      date: activity.date,
      time: activity.time || '',
      category: activity.category,
      cost: activity.cost,
      currency: activity.currency,
      isCompleted: activity.isCompleted,
      googleMapsUrl: activity.googleMapsUrl || ''
    });
    setEditingActivity(activity);
    setShowAddModal(true);
  };

  const handleEditActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim() || !newActivity.destinationId || !editingActivity) return;

    try {
      await updateActivity(editingActivity.id, {
        destinationId: newActivity.destinationId,
        title: newActivity.title,
        description: newActivity.description,
        date: newActivity.date,
        time: newActivity.time,
        category: newActivity.category,
        cost: newActivity.cost,
        currency: newActivity.currency,
        isCompleted: newActivity.isCompleted,
        googleMapsUrl: newActivity.googleMapsUrl || undefined
      });
      
      setNewActivity({
        destinationId: beijingDestination?.id || '',
        title: '',
        description: '',
        date: defaultDate,
        time: '',
        category: 'other',
        cost: undefined,
        currency: 'EUR',
        isCompleted: false,
        googleMapsUrl: ''
      });
      setEditingActivity(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
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

  const getAllActivitiesSorted = () => {
    return [...tripData.activities].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      // Si même date, trier par heure
      return (a.time || '00:00').localeCompare(b.time || '00:00');
    });
  };

  const handlePhotoAnalyzed = (analysis: any) => {
    // Créer l'URL Google Maps si on a des coordonnées GPS
    let googleMapsUrl = '';
    if (analysis.latitude && analysis.longitude) {
      googleMapsUrl = `https://www.google.com/maps?q=${analysis.latitude},${analysis.longitude}`;
    }

    setNewActivity(prev => ({
      ...prev,
      title: analysis.title || '',
      description: analysis.description || '',
      date: analysis.date || defaultDate,
      category: analysis.category || 'other',
      cost: analysis.estimatedPrice,
      currency: analysis.currency || 'EUR',
      googleMapsUrl
    }));

    // Fermer PhotoUpload et ouvrir le formulaire d'activité
    setShowPhotoUpload(false);
    setShowAddModal(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* En-tête avec onglets */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex-shrink-0">
        {/* Barre de navigation avec onglets */}
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">Planning</h1>
            
            {/* Onglets */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Calendrier</span>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">Liste</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden md:inline">Photo</span>
            </button>
            <button
              onClick={() => openAddModal()}
              data-add-activity
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Ajouter activité</span>
            </button>
          </div>
        </div>

        {/* Navigation du calendrier (uniquement en vue calendrier) */}
        {activeTab === 'calendar' && (
          <div className="flex items-center justify-center px-3 md:px-4 pb-3">
            <div className="flex items-center space-x-1 md:space-x-2">
              <button
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="px-2 md:px-4 py-2 text-center min-w-[100px] md:min-w-[140px]">
                <div className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
                  {format(selectedDate, 'MMM yyyy', { locale: fr })}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal - Vue conditionnelle */}
      {activeTab === 'calendar' ? (
        // Vue Calendrier
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
          {/* En-têtes des jours de la semaine */}
          <div className="grid grid-cols-7 border-b dark:border-gray-700 flex-shrink-0">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div
                key={day + index}
                className="p-2 md:p-3 text-center text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900"
              >
                <span className="hidden md:inline">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][index]}
                </span>
                <span className="md:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Grille calendrier - Style Google Calendar */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-0 overflow-hidden">
            {calendarDays.map((day) => {
              const activitiesForDay = getActivitiesForDate(day);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isSelectedDay = selectedDayForEvents && isSameDay(day, selectedDayForEvents);
              
              return (
                <div
                  key={day.toString()}
                  className={`border-r border-b dark:border-gray-700 flex flex-col relative min-h-[60px] md:min-h-[120px] overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    isSelectedDay ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="p-1 md:p-2 flex-shrink-0">
                    <div className={`text-xs md:text-sm font-medium w-5 h-5 md:w-7 md:h-7 rounded-full flex items-center justify-center ${
                      isCurrentDay 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : isCurrentMonth
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  <div className="flex-1 px-1 md:px-2 pb-1 space-y-1 overflow-y-auto">
                    {activitiesForDay.slice(0, 3).map((activity) => {
                      const categoryColors = getCategoryColors(activity.category);
                      return (
                        <div
                          key={activity.id}
                          className={`text-xs p-1 rounded ${categoryColors.bg} ${categoryColors.text} ${
                            activity.isCompleted ? 'opacity-60 line-through' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActivityCompletion(activity.id, activity.isCompleted);
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            {activity.time && (
                              <span className="font-bold text-xs">
                                {activity.time.slice(0, 5)}
                              </span>
                            )}
                            <span className="truncate text-xs flex-1">
                              {activity.title}
                            </span>
                            {activity.isCompleted && (
                              <Check className="w-2 h-2" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {activitiesForDay.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                        +{activitiesForDay.length - 3} autre{activitiesForDay.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Vue Liste
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-4">
            {(() => {
              const sortedActivities = getAllActivitiesSorted();
              
              if (sortedActivities.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Aucune activité planifiée
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Commencez par ajouter votre première activité
                    </p>
                    <button
                      onClick={() => openAddModal()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Ajouter une activité
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Toutes les activités ({sortedActivities.length})
                    </h2>
                  </div>
                  
                  {sortedActivities.map((activity) => {
                    const categoryColors = getCategoryColors(activity.category);
                    const destination = tripData.destinations.find(d => d.id === activity.destinationId);
                    
                    return (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-lg border-l-4 ${categoryColors.bg} ${
                          activity.isCompleted 
                            ? 'border-l-green-500 opacity-75' 
                            : 'border-l-blue-500'
                        } hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <button
                                onClick={() => toggleActivityCompletion(activity.id, activity.isCompleted)}
                                className={`p-1 rounded-full transition-colors ${
                                  activity.isCompleted 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              
                              <h4 className={`font-medium text-lg ${categoryColors.text} ${
                                activity.isCompleted ? 'line-through' : ''
                              }`}>
                                {activity.title}
                              </h4>
                              
                              {activity.time && (
                                <span className="flex items-center space-x-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  <span>{activity.time}</span>
                                </span>
                              )}
                            </div>
                            
                            {activity.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-3">
                                {activity.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(activity.date, 'dd MMM yyyy', { locale: fr })}</span>
                              </span>
                              
                              {destination && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{destination.name}</span>
                                </span>
                              )}
                              
                              <span className="capitalize">
                                {activity.category === 'sightseeing' ? '🏛️ Visites' :
                                 activity.category === 'transport' ? '🚌 Transport' :
                                 activity.category === 'accommodation' ? '🏨 Hébergement' :
                                 activity.category === 'food' ? '🍽️ Restauration' :
                                 activity.category === 'shopping' ? '🛍️ Shopping' :
                                 '📌 Autre'}
                              </span>
                              
                              {activity.cost && (
                                <span>💰 {activity.cost} {activity.currency}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => openEditModal(activity)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Modifier l'activité"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Supprimer l'activité"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Section des événements de la date sélectionnée */}
      {selectedDayForEvents && (
        <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4 max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📅 {format(selectedDayForEvents, 'dd MMMM yyyy', { locale: fr })}
            </h3>
            <button
              onClick={() => setSelectedDayForEvents(null)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {(() => {
            const dayActivities = getActivitiesForDate(selectedDayForEvents);
            
            if (dayActivities.length === 0) {
              return (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>Aucun événement prévu pour cette date</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {dayActivities.map((activity) => {
                  const categoryColors = getCategoryColors(activity.category);
                  const destination = tripData.destinations.find(d => d.id === activity.destinationId);
                  
                  return (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border-l-4 ${categoryColors.bg} ${
                        activity.isCompleted 
                          ? 'border-l-green-500 opacity-75' 
                          : 'border-l-blue-500'
                      } hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => toggleActivityCompletion(activity.id, activity.isCompleted)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {activity.isCompleted && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                            <h4 className={`font-medium ${categoryColors.text} ${
                              activity.isCompleted ? 'line-through' : ''
                            }`}>
                              {activity.title}
                            </h4>
                            {activity.time && (
                              <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                ⏰ {activity.time}
                              </span>
                            )}
                          </div>
                          
                          {activity.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {activity.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            {destination && (
                              <span>📍 {destination.name}</span>
                            )}
                            <span className="capitalize">
                              {activity.category === 'sightseeing' ? '🏛️ Visites' :
                               activity.category === 'transport' ? '🚌 Transport' :
                               activity.category === 'accommodation' ? '🏨 Hébergement' :
                               activity.category === 'food' ? '🍽️ Restauration' :
                               activity.category === 'shopping' ? '🛍️ Shopping' :
                               '📌 Autre'}
                            </span>
                            {activity.cost && (
                              <span>💰 {activity.cost} {activity.currency}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {activity.isCompleted ? (
                            <span className="text-green-600 text-sm font-medium">✅ Terminé</span>
                          ) : (
                            <span className="text-gray-500 text-sm">⏳ À faire</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal d'ajout/modification d'activité */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[85vh] overflow-y-auto relative z-[61]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingActivity ? '✏️ Modifier l\'activité' : '📅 Nouvelle activité'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Date :</strong> {format(newActivity.date, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              
              <form onSubmit={editingActivity ? handleEditActivity : handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Destination *
                  </label>
                  <select
                    value={newActivity.destinationId}
                    onChange={(e) => setNewActivity({ ...newActivity, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.7rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Visite du temple..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Détails de l'activité..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    🗺️ Lien Google Maps (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newActivity.googleMapsUrl}
                    onChange={(e) => setNewActivity({ ...newActivity, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Ajoutez un lien Google Maps pour afficher ce lieu sur la carte
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={format(newActivity.date, 'yyyy-MM-dd')}
                      onChange={(e) => setNewActivity({ ...newActivity, date: new Date(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={newActivity.category}
                      onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value as Activity['category'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coût (optionnel)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newActivity.cost || ''}
                      onChange={(e) => setNewActivity({ 
                        ...newActivity, 
                        cost: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Devise
                    </label>
                    <select
                      value={newActivity.currency}
                      onChange={(e) => setNewActivity({ ...newActivity, currency: e.target.value as Activity['currency'] })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem center',
                        backgroundSize: '1.5em 1.5em'
                      }}
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="CNY">CNY (¥)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    {editingActivity ? '✅ Modifier l\'activité' : '✅ Ajouter l\'activité'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    ❌ Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          onActivityCreated={handlePhotoAnalyzed}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  );
}