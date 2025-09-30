import { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, MapPin, Filter } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import type { Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ExpenseTracker() {
  const { tripData, addExpense, deleteExpense, updateExpense } = useTrip();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDestination, setFilterDestination] = useState<string>('all');

  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    destinationId: tripData.destinations[0]?.id || '',
    title: '',
    amount: 0,
    currency: 'EUR',
    category: 'other',
    date: new Date(),
    description: ''
  });

  const categories = [
    { value: 'transport', label: 'Transport', color: 'bg-blue-100 text-blue-800' },
    { value: 'accommodation', label: 'Hébergement', color: 'bg-purple-100 text-purple-800' },
    { value: 'food', label: 'Nourriture', color: 'bg-green-100 text-green-800' },
    { value: 'shopping', label: 'Shopping', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'activities', label: 'Activités', color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Autre', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim() || newExpense.amount <= 0) return;

    const expense: Expense = {
      id: uuidv4(),
      ...newExpense
    };

    try {
      await addExpense(expense);
      setNewExpense({
        destinationId: tripData.destinations[0]?.id || '',
        title: '',
        amount: 0,
        currency: 'EUR',
        category: 'other',
        date: new Date(),
        description: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, updates);
      setEditingExpense(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Filtrer les dépenses
  const filteredExpenses = tripData.expenses.filter(expense => {
    const categoryMatch = filterCategory === 'all' || expense.category === filterCategory;
    const destinationMatch = filterDestination === 'all' || expense.destinationId === filterDestination;
    return categoryMatch && destinationMatch;
  });

  // Trier par date (plus récent en premier)
  const sortedExpenses = filteredExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryStyle = (category: string) => {
    return categories.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suivi des dépenses</h1>
        <button
          onClick={() => setShowAddForm(true)}
          data-add-expense
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg flex items-center hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          💰 Nouvelle dépense
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Total des dépenses</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {totalExpenses.toLocaleString()}€
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Nombre de dépenses</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{filteredExpenses.length}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border dark:border-gray-700">
          <h3 className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Dépense moyenne</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {filteredExpenses.length > 0 ? Math.round(totalExpenses / filteredExpenses.length) : 0}€
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destination
            </label>
            <select
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.7rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">Toutes les destinations</option>
              {tripData.destinations.map(destination => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout - Popup */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative z-[61]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">💰 Nouvelle dépense</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Section d'aide */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <div className="text-blue-600 dark:text-blue-400 mr-2">💡</div>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Astuce :</span> Utilisez des titres descriptifs comme "Restaurant Sushi Zen" ou "Train Tokyo-Kyoto" pour un meilleur suivi.
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Ex: Restaurant Tokyo, Train JR..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-2 text-gray-600 dark:text-gray-400">€</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination
                </label>
                <select
                  value={newExpense.destinationId}
                  onChange={(e) => setNewExpense({ ...newExpense, destinationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  {tripData.destinations.map(destination => (
                    <option key={destination.id} value={destination.id}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={format(newExpense.date, 'yyyy-MM-dd')}
                  onChange={(e) => setNewExpense({ ...newExpense, date: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Devise
                </label>
                <select
                  value={newExpense.currency}
                  onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value as Expense['currency'] })}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                rows={3}
                placeholder="Ajoutez des détails sur cette dépense (optionnel)..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                ✅ Ajouter la dépense
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
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

      {/* Liste des dépenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Liste des dépenses ({filteredExpenses.length})
          </h3>
          
          {sortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Plus className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>Aucune dépense enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExpenses.map((expense) => {
                const destination = tripData.destinations.find(d => d.id === expense.destinationId);
                const isEditing = editingExpense === expense.id;
                
                return (
                  <div
                    key={expense.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="w-full">
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Titre */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Titre
                              </label>
                              <input
                                type="text"
                                defaultValue={expense.title}
                                onChange={(e) => handleUpdateExpense(expense.id, { title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Titre de la dépense"
                              />
                            </div>
                            
                            {/* Montant */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Montant
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                defaultValue={expense.amount}
                                onChange={(e) => handleUpdateExpense(expense.id, { amount: Number(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                            
                            {/* Catégorie */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Catégorie
                              </label>
                              <select
                                defaultValue={expense.category}
                                onChange={(e) => handleUpdateExpense(expense.id, { category: e.target.value as Expense['category'] })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 0.7rem center',
                                  backgroundSize: '1.5em 1.5em'
                                }}
                              >
                                {categories.map(category => (
                                  <option key={category.value} value={category.value}>
                                    {category.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Destination */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Destination
                              </label>
                              <select
                                defaultValue={expense.destinationId}
                                onChange={(e) => handleUpdateExpense(expense.id, { destinationId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'/%3e%3c/svg%3e")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 0.7rem center',
                                  backgroundSize: '1.5em 1.5em'
                                }}
                              >
                                {tripData.destinations.map(destination => (
                                  <option key={destination.id} value={destination.id}>
                                    {destination.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Date */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                defaultValue={format(expense.date, 'yyyy-MM-dd')}
                                onChange={(e) => handleUpdateExpense(expense.id, { date: new Date(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            {/* Devise */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Devise
                              </label>
                              <select
                                defaultValue={expense.currency}
                                onChange={(e) => handleUpdateExpense(expense.id, { currency: e.target.value as Expense['currency'] })}
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
                            
                            {/* Description */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Description
                              </label>
                              <textarea
                                defaultValue={expense.description || ''}
                                onChange={(e) => handleUpdateExpense(expense.id, { description: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Description optionnelle..."
                              />
                            </div>
                            
                            {/* Boutons d'action */}
                            <div className="sm:col-span-2 flex space-x-2 pt-2">
                              <button
                                onClick={() => setEditingExpense(null)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                              >
                                ✅ Valider
                              </button>
                              <button
                                onClick={() => setEditingExpense(null)}
                                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                              >
                                ❌ Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{expense.title}</h4>
                              <span className={`mt-1 sm:mt-0 sm:ml-2 px-2 py-1 text-xs rounded-full ${getCategoryStyle(expense.category)} inline-block w-fit`}>
                                {categories.find(cat => cat.value === expense.category)?.label}
                              </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-1 sm:space-y-0">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {format(expense.date, 'dd MMMM yyyy', { locale: fr })}
                              </div>
                              {destination && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {destination.name}
                                </div>
                              )}
                            </div>
                            
                            {expense.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {expense.description}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          {expense.amount.toLocaleString()}€
                        </div>
                        {expense.currency !== 'EUR' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ({expense.currency})
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => setEditingExpense(isEditing ? null : expense.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}