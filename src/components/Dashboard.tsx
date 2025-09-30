import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { MapPin, Calendar, Users, DollarSign, Plane } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
  const { tripData } = useTrip();

  // Calcul des statistiques
  const totalActivities = tripData.activities.length;
  const completedActivities = tripData.activities.filter(a => a.isCompleted).length;
  const totalDestinations = tripData.destinations.length;
  const totalPeople = tripData.people.length;

  // Données pour le graphique des dépenses par catégorie
  const expensesByCategory = Object.entries(tripData.budget.byCategory)
    .map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
      color: COLORS[Object.keys(tripData.budget.byCategory).indexOf(category)]
    }))
    .filter(item => item.value > 0);

  // Données pour le graphique des destinations
  const destinationData = tripData.destinations.map(dest => {
    const destExpenses = tripData.expenses
      .filter(expense => expense.destinationId === dest.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: dest.name,
      expenses: destExpenses,
      activities: tripData.activities.filter(act => act.destinationId === dest.id).length
    };
  });

  // Prochaines activités
  const upcomingActivities = tripData.activities
    .filter(activity => !activity.isCompleted && activity.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header avec titre mobile-optimized */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Voyage 2024</h1>
        <p className="text-blue-100 text-sm md:text-base">
          1-29 mai • {tripData.destinations.length} destinations • {tripData.activities.length} activités
        </p>
      </div>

      {/* Cartes de statistiques mobile-first */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Destinations</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDestinations}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mb-3">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Activités</h3>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {completedActivities}/{totalActivities}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Voyageurs</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPeople}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-3">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Restant</h3>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {tripData.budget.remaining.toLocaleString()}€
            </p>
          </div>
        </div>
      </div>

      {/* Graphiques mobile-optimized */}
      <div className="space-y-6">
        {/* Répartition des dépenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Répartition des dépenses</h3>
          {expensesByCategory.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={true}
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}€`, 'Montant']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>Aucune dépense enregistrée</p>
              </div>
            </div>
          )}
        </div>

        {/* Dépenses par destination - Mobile stack */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Dépenses par destination</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                  interval={0}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="expenses" fill="#8884d8" name="Dépenses (€)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Prochaines activités mobile-optimized */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Prochaines activités</h3>
        {upcomingActivities.length > 0 ? (
          <div className="space-y-3">
            {upcomingActivities.map((activity) => {
              const destination = tripData.destinations.find(d => d.id === activity.destinationId);
              return (
                <div key={activity.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 active:scale-[0.98] transition-transform">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4 flex-shrink-0">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{activity.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {destination?.name} • {format(activity.date, 'dd MMM', { locale: fr })}
                      {activity.time && ` à ${activity.time}`}
                    </p>
                  </div>
                  {activity.cost && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {activity.cost}€
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Aucune activité à venir</p>
          </div>
        )}
      </div>
    </div>
  );
}