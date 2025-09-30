import { useState } from 'react';
import { Calendar, MapPin, PieChart, Plus, DollarSign, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import Dashboard from './Dashboard';
import DestinationList from './DestinationList';
import ActivityCalendar from './ActivityCalendar';
import PeopleManager from './PeopleManager';
import BudgetManager from './BudgetManager';
import ExpenseTracker from './ExpenseTracker';
import DatabaseSetup from './DatabaseSetup';
import SyncStatus from './SyncStatus';

type Tab = 'dashboard' | 'destinations' | 'calendar' | 'people' | 'budget' | 'expenses' | 'dbtest';

export default function Navigation() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Masquer DB Test et Équipe de la navigation normale (accessible seulement par URL)
  const visibleTabs = [
    { id: 'dashboard' as Tab, label: 'Accueil', icon: PieChart, color: 'from-blue-500 to-blue-600' },
    { id: 'destinations' as Tab, label: 'Lieux', icon: MapPin, color: 'from-emerald-500 to-emerald-600' },
    { id: 'calendar' as Tab, label: 'Planning', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'budget' as Tab, label: 'Budget', icon: DollarSign, color: 'from-green-500 to-green-600' },
  ];

  // Fonctions pour ouvrir les modales d'ajout
  const handleAddExpense = () => {
    setActiveTab('expenses');
    setShowAddMenu(false);
    // Déclencher l'ouverture de la modale d'ajout de dépense
    setTimeout(() => {
      const addExpenseButton = document.querySelector('[data-add-expense]') as HTMLButtonElement;
      if (addExpenseButton) {
        addExpenseButton.click();
      }
    }, 100);
  };

  const handleAddActivity = () => {
    setActiveTab('calendar');
    setShowAddMenu(false);
    // Déclencher l'ouverture de la modale d'ajout d'activité
    setTimeout(() => {
      const addActivityButton = document.querySelector('[data-add-activity]') as HTMLButtonElement;
      if (addActivityButton) {
        addActivityButton.click();
      }
    }, 100);
  };

  const handleAddDestination = () => {
    setActiveTab('destinations');
    setShowAddMenu(false);
    // Déclencher l'ouverture de la modale d'ajout de destination
    setTimeout(() => {
      const addDestinationButton = document.querySelector('[data-add-destination]') as HTMLButtonElement;
      if (addDestinationButton) {
        addDestinationButton.click();
      }
    }, 100);
  };

  // Permet l'accès direct via URL pour DB Test
  const handleTabAccess = () => {
    const url = new URL(window.location.href);
    if (url.pathname === '/db-test' && activeTab !== 'dbtest') {
      setActiveTab('dbtest');
    }
  };

  // Vérifie l'URL au chargement
  useState(() => {
    handleTabAccess();
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'destinations':
        return <DestinationList />;
      case 'calendar':
        return <ActivityCalendar />;
      case 'people':
        return <PeopleManager />;
      case 'budget':
        return <BudgetManager />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'dbtest':
        return <DatabaseSetup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen pb-20 md:pb-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Indicateur de synchronisation */}
      <SyncStatus />
      
      {/* Header mobile simplifié */}
      <header className={`shadow-sm border-b sticky top-0 z-30 md:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className={`text-lg font-bold text-center flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              🌏 Chine & Japon
            </h1>
            {/* Toggle mode sombre mobile */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-300'
              }`}
              title={`Basculer en mode ${darkMode ? 'clair' : 'sombre'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Header desktop */}
      <header className="hidden md:block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
                🌏 Voyage Chine & Japon
              </h1>
              <div className="ml-8 flex items-center space-x-2">
                {/* Toggle mode sombre global */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
                  title={`Basculer en mode ${darkMode ? 'clair' : 'sombre'}`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                
                {/* Onglets de navigation */}
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg transition-all duration-150 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm ${
                        activeTab === tab.id
                          ? 'bg-white text-blue-700 shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:text-blue-100'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding mobile optimisé */}
      <main className={`px-4 py-4 md:max-w-7xl md:mx-auto md:px-6 lg:px-8 md:py-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {renderContent()}
      </main>

      {/* Tab bar mobile en bas - plus accessible avec le pouce */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t md:hidden z-40 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          {/* Menu d'ajout flottant */}
          {showAddMenu && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-2 min-w-[200px]`}>
                <button
                  onClick={handleAddExpense}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouvelle dépense</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ajouter un coût
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={handleAddActivity}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouvelle activité</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Planifier un événement
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleAddDestination}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-white' 
                      : 'hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Nouvelle destination</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Ajouter un lieu
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Overlay pour fermer le menu */}
          {showAddMenu && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowAddMenu(false)}
            />
          )}

          {/* Barre de navigation */}
          <div className="flex items-center h-20 safe-area-inset-bottom relative">
            {/* Onglets à gauche */}
            <div className="flex-1 flex">
              {visibleTabs.slice(0, 2).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 px-1 ${
                      isActive 
                        ? 'text-blue-600' 
                        : darkMode ? 'text-gray-400 active:text-gray-300' : 'text-gray-400 active:text-gray-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} shadow-lg shadow-blue-500/25` 
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                    </div>
                    <span className={`text-xs font-medium truncate max-w-full px-1 ${
                      isActive ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bouton central d'ajout */}
            <div className="flex-shrink-0 px-4">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  showAddMenu ? 'rotate-45' : 'hover:shadow-xl'
                }`}
              >
                <Plus className="w-7 h-7 text-white" />
              </button>
            </div>

            {/* Onglets à droite */}
            <div className="flex-1 flex">
              {visibleTabs.slice(2, 4).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 px-1 ${
                      isActive 
                        ? 'text-blue-600' 
                        : darkMode ? 'text-gray-400 active:text-gray-300' : 'text-gray-400 active:text-gray-600'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? `bg-gradient-to-r ${tab.color} shadow-lg shadow-blue-500/25` 
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                    </div>
                    <span className={`text-xs font-medium truncate max-w-full px-1 ${
                      isActive ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}