import { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import type { Destination, Activity } from '../types';

interface CSVRow {
  id: string;
  date: string;
  destination: string;
  activities: string[];
}

export default function ImportCSV() {
  const { tripData, addDestination, addActivity } = useTrip();
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const rows: CSVRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Format: id;date;destination;activiteA;activiteB;activiteC...
      const parts = line.split(';').map(p => p.trim());

      if (parts.length < 4) {
        throw new Error(`Ligne ${i + 1}: Format invalide. Attendu: id;date;destination;activite1;activite2...`);
      }

      const [id, date, destination, ...activities] = parts;

      // Valider la date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Ligne ${i + 1}: Date invalide "${date}". Format attendu: YYYY-MM-DD`);
      }

      rows.push({
        id,
        date,
        destination,
        activities: activities.filter(a => a.length > 0)
      });
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCSV(text);
        setPreview(parsed);
        // Sélectionner toutes les lignes par défaut
        setSelectedRows(new Set(parsed.map((_, idx) => idx)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de lecture du fichier');
        setPreview([]);
        setSelectedRows(new Set());
      }
    };
    reader.readAsText(selectedFile);
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === preview.length) {
      // Tout désélectionner
      setSelectedRows(new Set());
    } else {
      // Tout sélectionner
      setSelectedRows(new Set(preview.map((_, idx) => idx)));
    }
  };

  const findExistingDestination = (name: string, date: Date): Destination | null => {
    // Normaliser le nom pour la comparaison (insensible à la casse, sans espaces superflus)
    const normalizedName = name.toLowerCase().trim();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // Ignorer l'heure

    return tripData.destinations.find(dest => {
      const destName = dest.name.toLowerCase().trim();
      const destDate = new Date(dest.startDate);
      destDate.setHours(0, 0, 0, 0);

      // Correspondance si même nom ET même date
      return destName === normalizedName && destDate.getTime() === targetDate.getTime();
    }) || null;
  };

  const findNearbyDestination = (name: string, date: Date, dayRange: number = 3): Destination | null => {
    const normalizedName = name.toLowerCase().trim();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return tripData.destinations.find(dest => {
      const destName = dest.name.toLowerCase().trim();
      if (destName !== normalizedName) return false;

      const destDate = new Date(dest.startDate);
      destDate.setHours(0, 0, 0, 0);

      // Calculer la différence en jours
      const diffTime = Math.abs(destDate.getTime() - targetDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Retourner true si dans la plage de jours
      return diffDays > 0 && diffDays <= dayRange;
    }) || null;
  };

  const handleImport = async () => {
    if (preview.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      let stats = {
        destinationsCreated: 0,
        destinationsUpdated: 0,
        activitiesAdded: 0,
        destinationsAdjusted: 0
      };

      // Filtrer uniquement les lignes sélectionnées
      const rowsToImport = preview.filter((_, idx) => selectedRows.has(idx));

      if (rowsToImport.length === 0) {
        setError('Aucune ligne sélectionnée pour l\'import');
        setIsProcessing(false);
        return;
      }

      // Pour chaque ligne sélectionnée du CSV
      for (const row of rowsToImport) {
        const importDate = new Date(row.date);

        // 1. Chercher si une destination existe déjà pour ce nom et cette date exacte
        let existingDestination = findExistingDestination(row.destination, importDate);
        let nearbyDestination: Destination | null = null;
        let destinationId: string;
        let shouldUseExistingDate = false;

        if (existingDestination) {
          // Destination existe déjà avec la même date, on utilise son ID
          destinationId = existingDestination.id;
          stats.destinationsUpdated++;
        } else {
          // 2. Chercher des destinations proches (dans les 3 jours)
          nearbyDestination = findNearbyDestination(row.destination, importDate);

          if (nearbyDestination) {
            // On a trouvé une destination proche, demander confirmation
            const nearbyDate = new Date(nearbyDestination.startDate);
            const diffDays = Math.ceil(Math.abs(nearbyDate.getTime() - importDate.getTime()) / (1000 * 60 * 60 * 24));

            const confirmUseExisting = window.confirm(
              `📍 Destination proche détectée !\n\n` +
              `Vous importez "${row.destination}" pour le ${importDate.toLocaleDateString('fr-FR')}\n` +
              `Une destination "${nearbyDestination.name}" existe déjà le ${nearbyDate.toLocaleDateString('fr-FR')} (${diffDays} jour${diffDays > 1 ? 's' : ''} d'écart)\n\n` +
              `Voulez-vous utiliser la date existante et ajouter les activités à cette destination ?\n\n` +
              `- OUI : Les activités seront ajoutées à la destination existante\n` +
              `- NON : Une nouvelle destination sera créée pour la date ${importDate.toLocaleDateString('fr-FR')}`
            );

            if (confirmUseExisting) {
              // Utiliser la destination existante
              destinationId = nearbyDestination.id;
              stats.destinationsAdjusted++;
              shouldUseExistingDate = true;
            } else {
              // Créer une nouvelle destination avec la date du CSV
              destinationId = `dest-${row.id}-${Date.now()}`;
              const destination: Destination = {
                id: destinationId,
                name: row.destination,
                startDate: importDate,
                endDate: importDate,
                country: '',
                description: `Importé depuis CSV - ID: ${row.id}`
              };
              await addDestination(destination);
              stats.destinationsCreated++;
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          } else {
            // Pas de destination proche, créer une nouvelle destination
            destinationId = `dest-${row.id}-${Date.now()}`;
            const destination: Destination = {
              id: destinationId,
              name: row.destination,
              startDate: importDate,
              endDate: importDate,
              country: '',
              description: `Importé depuis CSV - ID: ${row.id}`
            };
            await addDestination(destination);
            stats.destinationsCreated++;
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // Créer les activités pour cette destination
        for (let i = 0; i < row.activities.length; i++) {
          const activityName = row.activities[i];

          // Utiliser la date de la destination existante si on a fusionné
          const activityDate = shouldUseExistingDate && existingDestination
            ? new Date(existingDestination.startDate)
            : (shouldUseExistingDate && nearbyDestination
              ? new Date(nearbyDestination.startDate)
              : importDate);

          const activity: Activity = {
            id: `activity-${destinationId}-${i}-${Date.now()}-${Math.random()}`,
            destinationId: destinationId,
            title: activityName,
            date: activityDate,
            time: '09:00',
            category: 'sightseeing',
            description: `Importé depuis CSV`,
            cost: 0,
            currency: 'EUR',
            isCompleted: false
          };

          await addActivity(activity);
          stats.activitiesAdded++;

          // Petit délai pour éviter les collisions d'IDs
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      // Message de succès personnalisé avec toutes les statistiques
      let successParts = [];
      if (stats.destinationsCreated > 0) {
        successParts.push(`${stats.destinationsCreated} destination(s) créée(s)`);
      }
      if (stats.destinationsUpdated > 0) {
        successParts.push(`${stats.destinationsUpdated} destination(s) mise(s) à jour`);
      }
      if (stats.destinationsAdjusted > 0) {
        successParts.push(`${stats.destinationsAdjusted} destination(s) fusionnée(s)`);
      }
      successParts.push(`${stats.activitiesAdded} activité(s) ajoutée(s)`);

      setError(null);
      setSuccess(true);

      // Afficher le message plus longtemps pour laisser le temps de lire
      setTimeout(() => {
        setShowModal(false);
        resetState();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setPreview([]);
    setSelectedRows(new Set());
    setError(null);
    setSuccess(false);
  };

  const closeModal = () => {
    setShowModal(false);
    resetState();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Upload className="w-4 h-4" />
        Importer CSV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Importer depuis CSV
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Format: id;date;destination;activité1;activité2...
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Format du fichier CSV
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <p>• Séparateur: point-virgule (;)</p>
                  <p>• Format de ligne: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">id;YYYY-MM-DD;destination;activité1;activité2;activité3</code></p>
                  <p>• Date au format: YYYY-MM-DD (exemple: 2026-05-15)</p>
                  <p>• Exemple: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">1;2026-05-15;Tokyo;Shibuya Crossing;TeamLab;Senso-ji</code></p>
                </div>
              </div>

              {/* File input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fichier CSV
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900/20 dark:file:text-blue-400
                    dark:hover:file:bg-blue-900/30
                    cursor-pointer"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    {error}
                  </div>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    Import réussi ! Les destinations et activités ont été ajoutées.
                  </div>
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Aperçu ({selectedRows.size}/{preview.length} ligne{preview.length > 1 ? 's' : ''} sélectionnée{selectedRows.size > 1 ? 's' : ''})
                    </h3>
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedRows.size === preview.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {preview.map((row, idx) => {
                      const existingDest = findExistingDestination(row.destination, new Date(row.date));
                      const isExisting = !!existingDest;
                      const isSelected = selectedRows.has(idx);

                      return (
                        <div
                          key={idx}
                          onClick={() => toggleRowSelection(idx)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                              : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 opacity-50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 flex items-center gap-3">
                              {/* Checkbox visuel */}
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium text-sm">
                                {row.id}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                📅 {new Date(row.date).toLocaleDateString('fr-FR', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="mb-2 flex items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${
                                  isExisting
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                }`}>
                                  {isExisting ? '🔄' : '📍'} {row.destination}
                                </span>
                                {isExisting && (
                                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    Existe déjà
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {row.activities.map((activity, actIdx) => (
                                  <span
                                    key={actIdx}
                                    className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm border border-gray-200 dark:border-gray-600"
                                  >
                                    ✓ {activity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={selectedRows.size === 0 || isProcessing || success}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Importer {selectedRows.size} ligne{selectedRows.size > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
