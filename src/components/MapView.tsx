import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useTrip } from '../context/TripContext';
import { useDarkMode } from '../context/DarkModeContext';
import { MapPin, Calendar, Activity as ActivityIcon, AlertCircle, Utensils, Eye, Hotel, ShoppingBag, Plane, Camera } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Activity } from '../types';
import PhotoUpload from './PhotoUpload';
import { v4 as uuidv4 } from 'uuid';

// Fix pour les icônes Leaflet par défaut
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

interface DestinationWithCoords {
  id: string;
  name: string;
  country: string;
  startDate: Date;
  endDate: Date;
  coordinates?: [number, number];
  activitiesCount: number;
}

interface ActivityWithCoords extends Activity {
  coordinates?: [number, number];
  destinationName?: string;
}

// Coordonnées approximatives des villes principales
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Chine
  'pékin': [39.9042, 116.4074],
  'beijing': [39.9042, 116.4074],
  'shanghai': [31.2304, 121.4737],
  'chongqing': [29.4316, 106.9123],
  'zhangjiajie': [29.1167, 110.4792],
  'guangzhou': [23.1291, 113.2644],
  'shenzhen': [22.5431, 114.0579],
  'xi\'an': [34.2667, 108.9000],
  'xian': [34.2667, 108.9000],

  // Japon
  'tokyo': [35.6762, 139.6503],
  'tōkyō': [35.6762, 139.6503],
  'kyoto': [35.0116, 135.7681],
  'osaka': [34.6937, 135.5023],
  'nikko': [36.7500, 139.6000],
  'yokohama': [35.4437, 139.6380],
  'nara': [34.6851, 135.8050],
  'hiroshima': [34.3853, 132.4553],
  'fukuoka': [33.5904, 130.4017],
  'sapporo': [43.0642, 141.3469],
  'nagoya': [35.1815, 136.9066],
  'kobe': [34.6901, 135.1955],
  'takasaki': [36.3228, 139.0036],
  'maebashi': [36.3911, 139.0608],
  'ikaho': [36.4889, 138.9142],
  'utsunomiya': [36.5656, 139.8835]
};

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Icône personnalisée pour la Chine (rouge)
const ChinaIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="45" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C8.4 0 3 5.4 3 12c0 9 12 33 12 33s12-24 12-33c0-6.6-5.4-12-12-12z" fill="#ef4444"/>
      <circle cx="15" cy="12" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
});

// Icône personnalisée pour le Japon (bleu)
const JapanIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="30" height="45" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C8.4 0 3 5.4 3 12c0 9 12 33 12 33s12-24 12-33c0-6.6-5.4-12-12-12z" fill="#3b82f6"/>
      <circle cx="15" cy="12" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [0, -45],
});

// Icônes pour les activités (plus petites, colorées par catégorie)
const createActivityIcon = (category: string) => {
  const colors: Record<string, string> = {
    food: '#f97316',      // orange
    sightseeing: '#10b981', // vert
    shopping: '#ec4899',   // rose
    accommodation: '#8b5cf6', // violet
    transport: '#6366f1',  // indigo
    other: '#6b7280'       // gris
  };

  const color = colors[category] || colors.other;

  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Parser une URL Google Maps pour extraire lat/lng
const parseGoogleMapsUrl = (url: string): [number, number] | null => {
  if (!url) return null;

  try {
    // Format: https://maps.google.com/?q=lat,lng
    // ou https://www.google.com/maps/place/.../@lat,lng,zoom
    // ou https://goo.gl/maps/...
    // ou https://maps.app.goo.gl/...

    // Méthode 1: Chercher @lat,lng,zoom dans l'URL (format standard)
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];
    }

    // Méthode 2: Chercher !3d (latitude) et !4d (longitude) - format embed/data
    const latMatch = url.match(/!3d(-?\d+\.\d+)/);
    const lngMatch = url.match(/!4d(-?\d+\.\d+)/);
    if (latMatch && lngMatch) {
      return [parseFloat(latMatch[1]), parseFloat(lngMatch[1])];
    }

    // Méthode 3: Chercher ?q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];
    }

    // Méthode 4: Chercher /ll=lat,lng
    const llMatch = url.match(/[/?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return [parseFloat(llMatch[1]), parseFloat(llMatch[2])];
    }

    // Méthode 5: Chercher center=lat,lng
    const centerMatch = url.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (centerMatch) {
      return [parseFloat(centerMatch[1]), parseFloat(centerMatch[2])];
    }

    // Si c'est un lien raccourci (goo.gl ou maps.app.goo.gl), log pour debug
    if (url.includes('goo.gl') || url.includes('maps.app.goo.gl')) {
      console.warn('URL raccourcie détectée:', url, '- Ouvrez le lien dans votre navigateur et copiez l\'URL complète après redirection');
    }

    return null;
  } catch (e) {
    console.error('Erreur parsing Google Maps URL:', e);
    return null;
  }
};

export default function MapView() {
  const { tripData, addActivity } = useTrip();
  const { darkMode } = useDarkMode();
  const [destinationsWithCoords, setDestinationsWithCoords] = useState<DestinationWithCoords[]>([]);
  const [activitiesWithCoords, setActivitiesWithCoords] = useState<ActivityWithCoords[]>([]);
  const [missingCoords, setMissingCoords] = useState<string[]>([]);
  const [activitiesWithBadUrls, setActivitiesWithBadUrls] = useState<Activity[]>([]);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  useEffect(() => {
    // Mapper les destinations avec leurs coordonnées
    const mapped: DestinationWithCoords[] = [];
    const missing: string[] = [];

    tripData.destinations.forEach(dest => {
      const normalizedName = dest.name.toLowerCase().trim();
      const coords = CITY_COORDINATES[normalizedName];

      const activitiesCount = tripData.activities.filter(
        act => act.destinationId === dest.id
      ).length;

      if (coords) {
        mapped.push({
          id: dest.id,
          name: dest.name,
          country: dest.country,
          startDate: dest.startDate,
          endDate: dest.endDate,
          coordinates: coords,
          activitiesCount
        });
      } else {
        missing.push(dest.name);
      }
    });

    setDestinationsWithCoords(mapped);
    setMissingCoords(missing);

    // Mapper les activités avec Google Maps URLs
    const activitiesWithCoords: ActivityWithCoords[] = [];
    const badUrls: Activity[] = [];

    tripData.activities.forEach(activity => {
      if (activity.googleMapsUrl) {
        const coords = parseGoogleMapsUrl(activity.googleMapsUrl);
        if (coords) {
          const destination = tripData.destinations.find(d => d.id === activity.destinationId);
          activitiesWithCoords.push({
            ...activity,
            coordinates: coords,
            destinationName: destination?.name
          });
        } else {
          // URL non parsable (probablement un lien raccourci)
          badUrls.push(activity);
        }
      }
    });

    setActivitiesWithCoords(activitiesWithCoords);
    setActivitiesWithBadUrls(badUrls);
  }, [tripData]);

  // Centre de la carte (milieu entre toutes les destinations)
  const centerMap = (): LatLngExpression => {
    if (destinationsWithCoords.length === 0) {
      return [35.6762, 139.6503]; // Tokyo par défaut
    }

    const avgLat = destinationsWithCoords.reduce((sum, d) => sum + d.coordinates![0], 0) / destinationsWithCoords.length;
    const avgLng = destinationsWithCoords.reduce((sum, d) => sum + d.coordinates![1], 0) / destinationsWithCoords.length;

    return [avgLat, avgLng];
  };

  // Calculer le niveau de zoom approprié
  const calculateZoom = (): number => {
    if (destinationsWithCoords.length <= 1) return 10;

    // Calculer la distance entre les points les plus éloignés
    let maxDistance = 0;
    for (let i = 0; i < destinationsWithCoords.length; i++) {
      for (let j = i + 1; j < destinationsWithCoords.length; j++) {
        const [lat1, lng1] = destinationsWithCoords[i].coordinates!;
        const [lat2, lng2] = destinationsWithCoords[j].coordinates!;
        const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
        maxDistance = Math.max(maxDistance, distance);
      }
    }

    // Ajuster le zoom en fonction de la distance
    if (maxDistance > 20) return 4;
    if (maxDistance > 10) return 5;
    if (maxDistance > 5) return 6;
    return 7;
  };

  // Créer une ligne reliant les destinations (itinéraire)
  const createRoute = (): LatLngExpression[] => {
    return destinationsWithCoords
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(d => d.coordinates!);
  };

  const getIcon = (country: string) => {
    const normalizedCountry = country.toLowerCase().trim();
    if (normalizedCountry === 'chine') return ChinaIcon;
    if (normalizedCountry === 'japon') return JapanIcon;
    return DefaultIcon;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return Utensils;
      case 'sightseeing': return Eye;
      case 'accommodation': return Hotel;
      case 'shopping': return ShoppingBag;
      case 'transport': return Plane;
      default: return ActivityIcon;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      food: 'Restaurant',
      sightseeing: 'Visite',
      accommodation: 'Hébergement',
      shopping: 'Shopping',
      transport: 'Transport',
      other: 'Autre'
    };
    return labels[category] || category;
  };

  const handlePhotoAnalyzed = async (analysis: any) => {
    // Créer automatiquement une activité depuis la photo
    let destinationId = tripData.destinations[0]?.id || '';

    // Trouver la destination basée sur la date si disponible
    if (analysis.date) {
      const matchingDest = tripData.destinations.find(dest => {
        const startDate = new Date(dest.startDate);
        const endDate = new Date(dest.endDate);
        const photoDate = new Date(analysis.date);
        return photoDate >= startDate && photoDate <= endDate;
      });
      if (matchingDest) destinationId = matchingDest.id;
    }

    const googleMapsUrl = analysis.latitude && analysis.longitude
      ? `https://www.google.com/maps?q=${analysis.latitude},${analysis.longitude}`
      : undefined;

    const activity: Activity = {
      id: uuidv4(),
      destinationId,
      title: analysis.title || 'Lieu depuis photo',
      description: analysis.description || '',
      date: analysis.date || new Date(),
      time: '',
      category: analysis.category || 'other',
      cost: analysis.estimatedPrice,
      currency: analysis.currency || 'EUR',
      isCompleted: false,
      googleMapsUrl
    };

    try {
      await addActivity(activity);
      setShowPhotoUpload(false);
      alert('✅ Activité créée avec succès depuis la photo !');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('❌ Erreur lors de la création de l\'activité');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Carte du voyage
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Visualisez votre itinéraire sur la carte interactive
          </p>
        </div>
        <button
          onClick={() => setShowPhotoUpload(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>Ajouter une photo</span>
        </button>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Destinations Chine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Destinations Japon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-purple-500"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Itinéraire</span>
        </div>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Restaurant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Visite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">Shopping</span>
        </div>
        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {destinationsWithCoords.length} destinations • {activitiesWithCoords.length} POIs
        </div>
      </div>

      {/* Avertissement pour destinations manquantes */}
      {missingCoords.length > 0 && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-200 mb-1">
                Destinations non géolocalisées
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Les destinations suivantes n'ont pas pu être placées sur la carte : {missingCoords.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement pour URLs raccourcies */}
      {activitiesWithBadUrls.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                ⚠️ Activités avec URLs raccourcies non affichées ({activitiesWithBadUrls.length})
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Les liens raccourcis (goo.gl, maps.app.goo.gl) ne peuvent pas être affichés sur la carte.
                Pour les voir, ouvrez le lien dans votre navigateur et copiez l'URL complète après redirection.
              </p>
              <div className="space-y-2">
                {activitiesWithBadUrls.map(activity => (
                  <div key={activity.id} className="flex items-start gap-2 text-sm bg-white dark:bg-gray-800 p-2 rounded">
                    <span className="font-medium text-blue-900 dark:text-blue-200">
                      {activity.title}
                    </span>
                    <a
                      href={activity.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline ml-auto"
                    >
                      Ouvrir →
                    </a>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/40 rounded text-xs text-blue-900 dark:text-blue-200">
                <strong>Comment corriger :</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Cliquez sur "Ouvrir →" ci-dessus</li>
                  <li>Google Maps va rediriger vers l'URL complète</li>
                  <li>Copiez l'URL depuis la barre d'adresse (elle contiendra @latitude,longitude)</li>
                  <li>Modifiez l'activité et remplacez l'ancien lien par le nouveau</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg h-[600px]">
        {destinationsWithCoords.length > 0 ? (
          <MapContainer
            center={centerMap()}
            zoom={calculateZoom()}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            {/* Tuile OpenStreetMap */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={darkMode
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />

            {/* Ligne d'itinéraire */}
            {destinationsWithCoords.length > 1 && (
              <Polyline
                positions={createRoute()}
                color="#9333ea"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
            )}

            {/* Markers pour chaque destination */}
            {destinationsWithCoords.map(dest => (
              <Marker
                key={dest.id}
                position={dest.coordinates!}
                icon={getIcon(dest.country)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2 text-gray-900">
                      {dest.name}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(dest.startDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <ActivityIcon className="w-4 h-4" />
                        <span>
                          {dest.activitiesCount} activité{dest.activitiesCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      {dest.country && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-600">
                            {dest.country === 'Chine' ? '🇨🇳' : dest.country === 'Japon' ? '🇯🇵' : '🌍'} {dest.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Markers pour les activités avec Google Maps URL */}
            {activitiesWithCoords.map(activity => {
              const Icon = getCategoryIcon(activity.category);
              return (
                <Marker
                  key={activity.id}
                  position={activity.coordinates!}
                  icon={createActivityIcon(activity.category)}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-gray-700" />
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {getCategoryLabel(activity.category)}
                        </span>
                      </div>

                      <h3 className="font-bold text-base mb-2 text-gray-900">
                        {activity.title}
                      </h3>

                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {activity.description}
                        </p>
                      )}

                      <div className="space-y-1 text-sm">
                        {activity.destinationName && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4" />
                            <span>{activity.destinationName}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(activity.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {activity.time && ` à ${activity.time}`}
                          </span>
                        </div>

                        {activity.cost && (
                          <div className="text-gray-700 font-medium">
                            {activity.cost} {activity.currency}
                          </div>
                        )}
                      </div>

                      {activity.googleMapsUrl && (
                        <a
                          href={activity.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 block text-center py-2 px-3 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Ouvrir dans Google Maps
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune destination à afficher sur la carte
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Ajoutez des destinations pour les voir apparaître ici
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total destinations</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {destinationsWithCoords.length}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chine</div>
          <div className="text-2xl font-bold text-red-500">
            {destinationsWithCoords.filter(d => d.country.toLowerCase() === 'chine').length}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Japon</div>
          <div className="text-2xl font-bold text-blue-500">
            {destinationsWithCoords.filter(d => d.country.toLowerCase() === 'japon').length}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload
          onActivityCreated={handlePhotoAnalyzed}
          onClose={() => setShowPhotoUpload(false)}
        />
      )}
    </div>
  );
}
