import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Edit3, Save, X } from 'lucide-react';
import { useTrip } from '../context/TripContext';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion du budget</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Voyage Chine & Japon 2024
        </div>
      </div>

      {/* Vue d'ensemble du budget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget total</h3>
                <div className="flex items-center">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-lg font-bold border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      />
                      <span className="text-lg font-bold text-gray-900 dark:text-white">€</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tripData.budget.totalBudget.toLocaleString()}€
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateBudget}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewBudget(tripData.budget.totalBudget);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dépensé</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tripData.budget.spent.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}`}>
              <TrendingDown className={`w-6 h-6 ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Restant</h3>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {tripData.budget.remaining.toLocaleString()}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">% utilisé</h3>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {budgetPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression du budget */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Progression du budget</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full ${
              isOverBudget ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>0€</span>
          <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
            {tripData.budget.spent.toLocaleString()}€ / {tripData.budget.totalBudget.toLocaleString()}€
          </span>
          <span>{tripData.budget.totalBudget.toLocaleString()}€</span>
        </div>
        {isOverBudget && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              ⚠️ Attention : Vous avez dépassé votre budget de{' '}
              {Math.abs(tripData.budget.remaining).toLocaleString()}€
            </p>
          </div>
        )}
      </div>

      {/* Répartition par catégorie */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Répartition par catégorie</h3>
        <div className="space-y-4">
          {categoryData.map(({ category, amount, percentage }) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`w-4 h-4 rounded-full mr-3 ${getCategoryColor(category)}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                  {category}
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(category)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {amount.toLocaleString()}€
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conseils et recommandations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommandations</h3>
        <div className="space-y-3">
          {budgetPercentage > 90 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">
                🚨 Vous approchez de votre limite budgétaire. Surveillez vos dépenses.
              </p>
            </div>
          )}
          
          {budgetPercentage > 70 && budgetPercentage <= 90 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                ⚠️ Vous avez utilisé plus de 70% de votre budget. Attention aux prochaines dépenses.
              </p>
            </div>
          )}
          
          {budgetPercentage <= 50 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-300 text-sm">
                ✅ Excellente gestion ! Vous êtes dans les temps pour votre budget.
              </p>
            </div>
          )}
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              💡 Budget quotidien recommandé : {Math.round(tripData.budget.remaining / 28)}€ pour les {28 - Math.floor((Date.now() - new Date('2024-05-01').getTime()) / (1000 * 60 * 60 * 24))} jours restants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}