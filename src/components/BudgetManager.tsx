import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Edit3, Save, X, Receipt, Calendar, MapPin } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function BudgetManager() {
  const { tripData, updateBudget } = useTrip();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(tripData.budget.totalBudget);

  const handleUpdateBudget = async () => {
    try {
      await updateBudget({ totalBudget: newBudget });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du budget:', error);
    }
  };

  const budgetPercentage = (tripData.budget.spent / tripData.budget.totalBudget) * 100;
  const isOverBudget = tripData.budget.spent > tripData.budget.totalBudget;

  const categoryData = Object.entries(tripData.budget.byCategory).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    percentage: tripData.budget.totalBudget > 0 ? (amount / tripData.budget.totalBudget) * 100 : 0
  }));

  const getCategoryColor = (category: string) => {
    const colors = {
      transport: 'bg-blue-500',
      accommodation: 'bg-purple-500',
      food: 'bg-green-500',
      shopping: 'bg-yellow-500',
      activities: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  // Récupérer toutes les dépenses triées par date
  const allExpenses = [...tripData.expenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      transport: '🚗',
      accommodation: '🏨',
      food: '🍜',
      shopping: '🛍️',
      activities: '🎯',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="section-title mb-0">Gestion du budget</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Voyage Chine & Japon 2026
        </div>
      </div>

      {/* Vue d'ensemble du budget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateBudget}
                      className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNewBudget(tripData.budget.totalBudget);
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Budget total</h3>
              {isEditing ? (
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="input-field py-1 text-xl font-bold"
                  />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">€</span>
                </div>
              ) : (
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  {tripData.budget.totalBudget.toLocaleString()}€
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dépensé</h3>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {tripData.budget.spent.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOverBudget
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-emerald-500 to-green-600'
            }`}>
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Restant</h3>
              <p className={`text-xl md:text-2xl font-bold ${
                isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
              }`}>
                {tripData.budget.remaining.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">% utilisé</h3>
              <p className={`text-xl md:text-2xl font-bold ${
                isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
              }`}>
                {budgetPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression du budget */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progression du budget</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 mb-3 overflow-hidden">
          <div
            className={`h-5 rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : budgetPercentage > 80
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>0€</span>
          <span className={`font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {tripData.budget.spent.toLocaleString()}€ / {tripData.budget.totalBudget.toLocaleString()}€
          </span>
          <span>{tripData.budget.totalBudget.toLocaleString()}€</span>
        </div>
        {isOverBudget && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">
              ⚠️ Attention : Vous avez dépassé votre budget de{' '}
              <span className="font-bold">{Math.abs(tripData.budget.remaining).toLocaleString()}€</span>
            </p>
          </div>
        )}
      </div>

      {/* Répartition par catégorie */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Répartition par catégorie</h3>
        <div className="space-y-4">
          {categoryData.filter(({ amount }) => amount > 0).map(({ category, amount, percentage }) => (
            <div key={category} className="flex items-center gap-3">
              <span className="text-2xl">{getCategoryIcon(category.toLowerCase())}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {amount.toLocaleString()}€
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${getCategoryColor(category)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[45px] text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          {categoryData.filter(({ amount }) => amount > 0).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune dépense enregistrée</p>
            </div>
          )}
        </div>
      </div>

      {/* Liste des dépenses récentes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dépenses récentes</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {allExpenses.length} {allExpenses.length > 1 ? 'dépenses' : 'dépense'}
          </span>
        </div>

        {allExpenses.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {allExpenses.slice(0, 10).map((expense) => {
              const destination = tripData.destinations.find(d => d.id === expense.destinationId);
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(expense.category)}`}>
                      <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {expense.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(expense.date), 'dd MMM yyyy', { locale: fr })}</span>
                      {destination && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{destination.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {expense.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {expense.currency}
                    </div>
                  </div>
                </div>
              );
            })}
            {allExpenses.length > 10 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  + {allExpenses.length - 10} autres dépenses
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune dépense enregistrée pour le moment
            </p>
          </div>
        )}
      </div>

      {/* Conseils et recommandations */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommandations</h3>
        <div className="space-y-3">
          {budgetPercentage > 90 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                🚨 Vous approchez de votre limite budgétaire. Surveillez vos dépenses.
              </p>
            </div>
          )}

          {budgetPercentage > 70 && budgetPercentage <= 90 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                ⚠️ Vous avez utilisé plus de 70% de votre budget. Attention aux prochaines dépenses.
              </p>
            </div>
          )}

          {budgetPercentage <= 50 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                ✅ Excellente gestion ! Vous êtes dans les temps pour votre budget.
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
              💡 Budget quotidien recommandé : <span className="font-bold">{Math.round(tripData.budget.remaining / 29)}€</span> pour les 29 jours du voyage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}