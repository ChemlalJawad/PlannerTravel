import { useState } from 'react';
import { Calendar, MapPin, PieChart, Plus, DollarSign, Moon, Sun, Sparkles, Map, Camera } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import Dashboard from './Dashboard';
import DestinationList from './DestinationList';
import ActivityCalendar from './ActivityCalendar';
import PeopleManager from './PeopleManager';
import BudgetManager from './BudgetManager';
import ExpenseTracker from './ExpenseTracker';
import DatabaseSetup from './DatabaseSetup';
import SyncStatus from './SyncStatus';
import IdeasToVisit from './IdeasToVisit';
import MapView from './MapView';

type Tab = 'dashboard' | 'destinations' | 'calendar' | 'people' | 'budget' | 'expenses' | 'ideas' | 'map' | 'dbtest';

export default function Navigation() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Masquer DB Test et Équipe de la navigation normale (accessible seulement par URL)
  const visibleTabs = [
    { id: 'dashboard' as Tab, label: 'Accueil', icon: PieChart, color: 'from-blue-500 to-blue-600' },
    { id: 'destinations' as Tab, label: 'Lieux', icon: MapPin, color: 'from-emerald-500 to-emerald-600' },
    { id: 'calendar' as Tab, label: 'Planning', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    { id: 'ideas' as Tab, label: 'Idées', icon: Sparkles, color: 'from-pink-500 to-pink-600' },
    { id: 'map' as Tab, label: 'Carte', icon: Map, color: 'from-amber-500 to-amber-600' },
    { id: 'budget' as Tab, label: 'Budget', icon: DollarSign, color: 'from-green-500 to-green-600' },
  ];

  // Fonctions pour ouvrir les modales d'ajout
  const handleAddExpense = () => {
    if (activeTab !== 'budget') {
      setActiveTab('budget');
    }
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

  const handleAddPhoto = () => {
    setActiveTab('calendar');
    setShowAddMenu(false);
    // Déclencher l'ouverture de la modale photo
    setTimeout(() => {
      const addPhotoButton = document.querySelector('[data-add-photo]') as HTMLButtonElement;
      if (addPhotoButton) {
        addPhotoButton.click();
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
      case 'ideas':
        return <IdeasToVisit />;
      case 'map':
        return <MapView />;
      case 'dbtest':
        return <DatabaseSetup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen pb-24 md:pb-0 ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      {/* Indicateur de synchronisation */}
      <SyncStatus />

      {/* Header mobile minimaliste */}
      <header className={`backdrop-blur-xl border-b sticky top-0 z-20 md:hidden ${
        darkMode
          ? 'bg-[#0a0a0a]/90 border-[#1f1f1f]'
          : 'bg-white/90 border-gray-100'
      }`}>
        <div className="px-6 py-5 safe-area-inset-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✈️</span>
              <div>
                <h1 className={`text-xl font-semibold tracking-tight ${darkMode ? 'text-gray-50' : 'text-black'}`}>
                  TravelPlanner
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Chine & Japon 2026
                </p>
              </div>
            </div>
            {/* Toggle mode sombre mobile */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-[#1a1a1a]'
                  : 'hover:bg-gray-100'
              }`}
              title={`Basculer en mode ${darkMode ? 'clair' : 'sombre'}`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-gray-50" /> : <Moon className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </header>

      {/* Header desktop minimaliste */}
      <header className={`hidden md:block border-b ${
        darkMode ? 'bg-[#0a0a0a] border-[#1f1f1f]' : 'bg-white border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✈️</span>
              <h1 className={`text-2xl font-semibold tracking-tight ${darkMode ? 'text-gray-50' : 'text-black'}`}>
                TravelPlanner
              </h1>
            </div>

            <div className="flex items-center gap-1">
              {/* Onglets de navigation minimalistes */}
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? darkMode
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-black text-white shadow-lg'
                        : darkMode
                          ? 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a]'
                          : 'text-gray-500 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}

              <div className={`w-px h-6 mx-2 ${darkMode ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />

              {/* Toggle mode sombre global */}
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                  darkMode
                    ? 'hover:bg-[#1a1a1a]'
                    : 'hover:bg-gray-100'
                }`}
                title={`Basculer en mode ${darkMode ? 'clair' : 'sombre'}`}
              >
                {darkMode ? <Sun className="w-4 h-4 text-gray-50" /> : <Moon className="w-4 h-4 text-black" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding Revolut-style */}
      <main className={`px-6 py-8 md:max-w-7xl md:mx-auto md:px-8 md:py-12 animate-fade-in ${
        darkMode ? 'bg-[#0a0a0a]' : 'bg-white'
      }`}>
        {renderContent()}
      </main>

      {/* Footer copyright */}
      <footer className={`py-6 text-center border-t ${
        darkMode ? 'bg-[#0a0a0a] border-[#1f1f1f] text-gray-500' : 'bg-white border-gray-100 text-gray-400'
      }`}>
        <p className="text-sm">
          © 2025 TravelPlanner - Développé par <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jawad Chemlal</span>
        </p>
      </footer>

      {/* Tab bar mobile minimaliste */}
      <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl md:hidden z-40 border-t ${
        darkMode ? 'bg-[#0a0a0a]/90 border-[#1f1f1f]' : 'bg-white/90 border-gray-100'
      }`}>
        <div className="relative">
          {/* Menu d'ajout minimaliste */}
          {showAddMenu && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-scale-in">
              <div className={`${
                darkMode ? 'bg-[#141414]' : 'bg-white'
              } rounded-3xl shadow-2xl border ${
                darkMode ? 'border-[#1f1f1f]' : 'border-gray-100'
              } p-2 min-w-[260px] backdrop-blur-xl ${
                darkMode ? 'bg-[#141414]/95' : 'bg-white/95'
              }`}>
                <button
                  onClick={handleAddPhoto}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 ${
                    darkMode
                      ? 'hover:bg-[#1a1a1a] text-gray-50'
                      : 'hover:bg-gray-50 text-black'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}>
                    <Camera className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Photo</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Analyser une photo
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleAddExpense}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 ${
                    darkMode
                      ? 'hover:bg-[#1a1a1a] text-gray-50'
                      : 'hover:bg-gray-50 text-black'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                  }`}>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Dépense</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Ajouter un coût
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleAddActivity}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 ${
                    darkMode
                      ? 'hover:bg-[#1a1a1a] text-gray-50'
                      : 'hover:bg-gray-50 text-black'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Activité</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Planifier un événement
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleAddDestination}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-98 ${
                    darkMode
                      ? 'hover:bg-[#1a1a1a] text-gray-50'
                      : 'hover:bg-gray-50 text-black'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">Destination</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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

          {/* Barre de navigation minimaliste */}
          <div className="flex items-center h-20 safe-area-inset-bottom relative px-4">
            {/* Onglets à gauche (3 onglets) */}
            <div className="flex-1 flex gap-2">
              {visibleTabs.slice(0, 3).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 py-2"
                  >
                    <div className={`p-2 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? darkMode ? 'bg-white shadow-lg' : 'bg-black shadow-lg'
                        : darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive
                          ? darkMode ? 'text-black' : 'text-white'
                          : darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className={`text-xs font-medium truncate max-w-full ${
                      isActive
                        ? darkMode ? 'text-gray-50' : 'text-black'
                        : darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bouton central minimaliste */}
            <div className="flex-shrink-0 px-4 -mt-8">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  darkMode ? 'bg-white shadow-white/20' : 'bg-black shadow-black/20'
                } ${showAddMenu ? 'rotate-45' : ''}`}
              >
                <Plus className={`w-6 h-6 ${darkMode ? 'text-black' : 'text-white'}`} strokeWidth={2} />
              </button>
            </div>

            {/* Onglets à droite (3 onglets) */}
            <div className="flex-1 flex gap-2">
              {visibleTabs.slice(3, 6).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 py-2"
                  >
                    <div className={`p-2 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? darkMode ? 'bg-white shadow-lg' : 'bg-black shadow-lg'
                        : darkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isActive
                          ? darkMode ? 'text-black' : 'text-white'
                          : darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <span className={`text-xs font-medium truncate max-w-full ${
                      isActive
                        ? darkMode ? 'text-gray-50' : 'text-black'
                        : darkMode ? 'text-gray-600' : 'text-gray-400'
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