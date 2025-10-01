import { useState } from 'react';
import { Camera, Upload, X, Loader, MapPin, Calendar, DollarSign, Utensils, Eye } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import exifr from 'exifr';
import type { Activity } from '../types';

interface PhotoAnalysis {
  latitude?: number;
  longitude?: number;
  date?: Date;
  description?: string;
  category?: Activity['category'];
  estimatedPrice?: number;
  currency?: 'EUR' | 'CNY' | 'JPY';
  title?: string;
  isFood?: boolean;
  isAttraction?: boolean;
  destinationId?: string;
}

interface PhotoUploadProps {
  onActivityCreated?: (analysis: PhotoAnalysis) => void;
  onClose?: () => void;
  destinations?: Array<{ id: string; name: string; country: string }>;
}

export default function PhotoUpload({ onActivityCreated, onClose, destinations = [] }: PhotoUploadProps) {
  const { darkMode } = useDarkMode();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [editedPrice, setEditedPrice] = useState<number | undefined>(undefined);
  const [editedCurrency, setEditedCurrency] = useState<'EUR' | 'CNY' | 'JPY'>('EUR');

  const analyzePhotoWithAI = async (imageBase64: string): Promise<Partial<PhotoAnalysis>> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase non configuré, utilisation du mode simulation');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            description: "Photo analysée en mode simulation - Configurez Supabase Edge Function",
            category: 'sightseeing',
            title: "Lieu de la photo",
            isFood: false,
            isAttraction: true
          });
        }, 2000);
      });
    }

    try {
      // Appel à Supabase Edge Function (proxy sécurisé pour Claude Vision)
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          imageBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur Edge Function:', errorData);
        console.error('📊 Status:', response.status);
        console.error('📝 Details:', errorData.details || 'No details');
        throw new Error(`Edge Function Error (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Extraire le JSON de la réponse
      const responseText = data.content[0]?.type === 'text' ? data.content[0].text : '';
      console.log('📸 Claude Vision réponse brute:', responseText);

      // Parser le JSON (gérer les cas où Claude ajoute des backticks)
      const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
                        responseText.match(/(\{[\s\S]*?\})/);

      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      const parsed = JSON.parse(jsonMatch[1]);
      console.log('✅ Claude Vision analyse:', parsed);

      // Mapper vers notre format
      return {
        title: parsed.title || 'Lieu de la photo',
        description: parsed.description || '',
        category: parsed.category || 'other',
        isFood: parsed.isFood || false,
        estimatedPrice: parsed.estimatedPrice || undefined,
        currency: parsed.currency || 'EUR',
        isAttraction: parsed.category === 'sightseeing'
      };

    } catch (error) {
      console.error('❌ Erreur Claude Vision:', error);
      // Fallback en mode simulation si erreur
      return {
        description: "Erreur d'analyse IA - Mode simulation activé",
        category: 'other',
        title: "Lieu de la photo",
        isFood: false,
        isAttraction: false
      };
    }
  };

  const extractExifData = async (file: File): Promise<Partial<PhotoAnalysis>> => {
    try {
      const exifData = await exifr.parse(file, {
        gps: true,
        exif: true,
        iptc: true,
        icc: true,
      });

      const result: Partial<PhotoAnalysis> = {};

      // Extraire coordonnées GPS
      if (exifData?.latitude && exifData?.longitude) {
        result.latitude = exifData.latitude;
        result.longitude = exifData.longitude;
        console.log('📍 GPS trouvé:', result.latitude, result.longitude);
      }

      // Extraire date de prise
      if (exifData?.DateTimeOriginal || exifData?.DateTime) {
        result.date = new Date(exifData.DateTimeOriginal || exifData.DateTime);
        console.log('📅 Date trouvée:', result.date);
      }

      return result;
    } catch (error) {
      console.error('Erreur extraction EXIF:', error);
      return {};
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);

    try {
      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Extraire EXIF
      const exifData = await extractExifData(file);

      // Analyser avec IA (simulation pour l'instant)
      const readerForAI = new FileReader();
      readerForAI.onloadend = async () => {
        const base64 = (readerForAI.result as string).split(',')[1];
        const aiAnalysis = await analyzePhotoWithAI(base64);

        // Combiner les résultats
        const combinedAnalysis: PhotoAnalysis = {
          ...exifData,
          ...aiAnalysis,
          // Deviner la devise selon la localisation GPS (si pas de GPS, garder celle de Claude)
          currency: exifData.latitude && exifData.longitude
            ? (exifData.latitude > 20 && exifData.latitude < 50 && exifData.longitude > 100 && exifData.longitude < 125
              ? 'CNY' // Chine
              : exifData.latitude > 30 && exifData.latitude < 46 && exifData.longitude > 128 && exifData.longitude < 146
              ? 'JPY' // Japon
              : aiAnalysis.currency || 'EUR')
            : aiAnalysis.currency || 'EUR' // Priorité à Claude si pas de GPS
        };

        setAnalysis(combinedAnalysis);
        setEditedPrice(combinedAnalysis.estimatedPrice);
        setEditedCurrency(combinedAnalysis.currency || 'EUR');
        setIsAnalyzing(false);
      };
      readerForAI.readAsDataURL(file);

    } catch (err) {
      setError('Erreur lors de l\'analyse de la photo');
      setIsAnalyzing(false);
      console.error(err);
    }
  };

  const getCategoryIcon = (category?: Activity['category']) => {
    switch (category) {
      case 'food': return Utensils;
      case 'sightseeing': return Eye;
      case 'shopping': return DollarSign;
      default: return MapPin;
    }
  };

  const getCategoryLabel = (category?: Activity['category']) => {
    const labels: Record<string, string> = {
      food: '🍽️ Restaurant',
      sightseeing: '🏛️ Visite',
      shopping: '🛍️ Shopping',
      accommodation: '🏨 Hébergement',
      transport: '🚌 Transport',
      other: '📌 Autre'
    };
    return category ? labels[category] : 'Non déterminé';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } max-h-[90vh] overflow-y-auto relative`} style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <Camera className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📸 Analyser une photo
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload zone */}
          {!photoPreview && (
            <div className="space-y-4">
              {/* Prendre une photo (mobile) */}
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                darkMode
                  ? 'border-purple-600 hover:border-purple-500 bg-purple-900/20 hover:bg-purple-900/30'
                  : 'border-purple-400 hover:border-purple-500 bg-purple-50 hover:bg-purple-100'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className={`w-12 h-12 mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <p className={`mb-1 text-lg font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                    📸 Prendre une photo
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                    (Recommandé sur mobile - GPS automatique)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                />
              </label>

              {/* Uploader depuis galerie */}
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                darkMode
                  ? 'border-gray-600 hover:border-blue-500 bg-gray-700/50 hover:bg-gray-700'
                  : 'border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-gray-100'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-12 h-12 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <p className={`mb-1 text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    📂 Uploader depuis la galerie
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    JPG, PNG ou HEIC (Max. 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>

              <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                💡 L'app extraira automatiquement : GPS, date, et analysera le contenu avec Claude Vision
              </p>
            </div>
          )}

          {/* Photo preview */}
          {photoPreview && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-900"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
                      <p className="text-white font-medium">Analyse en cours...</p>
                      <p className="text-white/70 text-sm mt-1">Extraction GPS et analyse IA</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              {analysis && !isAnalyzing && (
                <div className={`p-5 rounded-xl border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    📊 Résultats de l'analyse
                  </h3>

                  {/* Title & Description from Claude */}
                  {analysis.title && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                        {analysis.title}
                      </h4>
                      {analysis.description && (
                        <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                          {analysis.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* GPS */}
                    {analysis.latitude && analysis.longitude && (
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            📍 Localisation GPS
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {analysis.latitude.toFixed(6)}, {analysis.longitude.toFixed(6)}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${analysis.latitude},${analysis.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Voir sur Google Maps →
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    {analysis.date && (
                      <div className="flex items-start gap-3">
                        <Calendar className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            📅 Date de prise
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {analysis.date.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {analysis.category && (
                      <div className="flex items-start gap-3">
                        {(() => {
                          const Icon = getCategoryIcon(analysis.category);
                          return <Icon className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />;
                        })()}
                        <div className="flex-1">
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Catégorie suggérée
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {getCategoryLabel(analysis.category)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price estimate - Editable */}
                    <div className="flex items-start gap-3">
                      <DollarSign className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <div className="flex-1">
                        <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          💰 Prix estimé (modifiable)
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editedPrice || ''}
                            onChange={(e) => setEditedPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Prix"
                            className={`flex-1 px-3 py-2 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          <select
                            value={editedCurrency}
                            onChange={(e) => setEditedCurrency(e.target.value as 'EUR' | 'CNY' | 'JPY')}
                            className={`px-3 py-2 pr-8 rounded-lg border ${
                              darkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="EUR">EUR €</option>
                            <option value="CNY">CNY ¥</option>
                            <option value="JPY">JPY ¥</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* No GPS warning */}
                    {!analysis.latitude && !analysis.longitude && (
                      <div className={`p-3 rounded-lg ${
                        darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                          ⚠️ Aucune donnée GPS trouvée dans cette photo.
                          Vous devrez ajouter manuellement la localisation.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sélecteur de destination */}
                  <div className={`mt-4 p-4 rounded-lg border-2 ${
                    darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-300'
                  }`}>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-indigo-200' : 'text-indigo-900'}`}>
                      🗺️ Destination (optionnel)
                    </label>
                    <select
                      value={selectedDestinationId}
                      onChange={(e) => setSelectedDestinationId(e.target.value)}
                      className={`w-full p-3 pr-10 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Aucune destination</option>
                      {destinations.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.name} ({dest.country})
                        </option>
                      ))}
                    </select>
                    <p className={`text-xs mt-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      💡 Associez cette activité à une ville/destination spécifique
                    </p>
                  </div>

                  {/* Note IA */}
                  <div className={`mt-4 p-3 rounded-lg text-xs ${
                    darkMode ? 'bg-blue-900/20 text-blue-200 border border-blue-800' : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}>
                    <strong>⚡ Claude Vision via Supabase :</strong> L'analyse utilise Supabase Edge Functions comme proxy sécurisé.
                    {' '}Déployez la fonction <code className="bg-black/20 px-1 rounded">analyze-photo</code> pour activer l'analyse IA réelle.
                    {' '}<a href="#" className="underline" onClick={(e) => { e.preventDefault(); alert('Voir CLAUDE-VISION-SETUP.md pour les instructions de déploiement'); }}>Instructions →</a>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                    ❌ {error}
                  </p>
                </div>
              )}

              {/* Confirmation Actions */}
              {analysis && !isAnalyzing && (
                <div className={`p-5 rounded-xl border-2 ${
                  darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                }`}>
                  <p className={`text-center font-semibold mb-4 ${darkMode ? 'text-green-200' : 'text-green-800'}`}>
                    Voulez-vous enregistrer cette activité ?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPhotoPreview(null);
                        setAnalysis(null);
                        setError(null);
                      }}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      ✗ Non, analyser une autre photo
                    </button>
                    <button
                      onClick={() => {
                        const analysisWithDestination = {
                          ...analysis,
                          destinationId: selectedDestinationId || undefined,
                          estimatedPrice: editedPrice,
                          currency: editedCurrency
                        };
                        onActivityCreated?.(analysisWithDestination);
                        onClose?.();
                      }}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        darkMode
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      ✓ Oui, créer l'activité
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
