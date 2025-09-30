import React, { useState } from 'react';
import { Users, Plus, Mail, Phone, UserCheck, Trash2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import type { Person } from '../types';
import { v4 as uuidv4 } from 'uuid';

export default function PeopleManager() {
  const { tripData, addPerson, deletePerson, updatePerson } = useTrip();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState<Omit<Person, 'id'>>({
    name: '',
    email: '',
    phone: '',
    role: 'traveler'
  });

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name.trim()) return;

    const person: Person = {
      id: uuidv4(),
      ...newPerson
    };

    try {
      await addPerson(person);
      setNewPerson({ name: '', email: '', phone: '', role: 'traveler' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
      try {
        await deletePerson(personId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleUpdateRole = async (personId: string, role: Person['role']) => {
    try {
      await updatePerson(personId, { role });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des voyageurs</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une personne
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total voyageurs</h3>
              <p className="text-2xl font-bold text-gray-900">{tripData.people.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Organisateurs</h3>
              <p className="text-2xl font-bold text-gray-900">
                {tripData.people.filter(p => p.role === 'organizer').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Participants</h3>
              <p className="text-2xl font-bold text-gray-900">
                {tripData.people.filter(p => p.role === 'traveler').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Ajouter une nouvelle personne</h3>
          <form onSubmit={handleAddPerson} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={newPerson.role}
                  onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value as Person['role'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="traveler">Voyageur</option>
                  <option value="organizer">Organisateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des personnes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Liste des voyageurs</h3>
          
          {tripData.people.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun voyageur ajouté</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tripData.people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          person.role === 'organizer'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {person.role === 'organizer' ? 'Organisateur' : 'Voyageur'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        {person.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {person.email}
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {person.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={person.role}
                      onChange={(e) => handleUpdateRole(person.id, e.target.value as Person['role'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="traveler">Voyageur</option>
                      <option value="organizer">Organisateur</option>
                    </select>
                    
                    <button
                      onClick={() => handleDeletePerson(person.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}