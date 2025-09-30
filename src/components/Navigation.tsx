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
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Masquer DB Test et Équipe de la navigation normale (accessible seulement par URL)
  const visibleTabs = [
    { id: 'dashboard' as Tab, label: 'Accueil', icon: PieChart, color: 'from-blue-500 to-blue-600' },
    { id: 'destinations' as Tab, label: 'Lieux', icon: MapPin, color: 'from-emerald-500 to-emerald-600' },
    { id: 'calendar' as Tab, label: 'Planning', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'budget' as Tab, label: 'Budget', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { id: 'expenses' as Tab, label: 'Dépenses', icon: Plus, color: 'from-red-500 to-red-600' },
  ];

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
      <header className={`shadow-sm border-b sticky top-0 z-40 md:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
      <nav className={`fixed bottom-0 left-0 right-0 border-t md:hidden z-50 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-6 h-20 safe-area-inset-bottom">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 active:scale-95 px-1 ${
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
      </nav>
    </div>
  );
}