# 📸 Analyse de Photos - Guide d'utilisation

## Vue d'ensemble

La fonctionnalité d'analyse de photos permet d'extraire automatiquement des informations d'une image pour créer des activités dans votre planning de voyage.

## 🎯 Que peut-on extraire d'une photo ?

### 1. **Métadonnées EXIF** (données de la photo)
- **📍 Coordonnées GPS** (latitude, longitude)
  - Automatiquement extraites si la photo a été prise avec un smartphone récent
  - Crée un lien Google Maps cliquable
  - Affiche le point sur la carte interactive

- **📅 Date et heure de prise**
  - Date exacte de la photo
  - Utilisée pour associer automatiquement à la bonne destination
  - Pré-remplit le formulaire d'activité

### 2. **Analyse par IA** (à implémenter avec Claude Vision API)
Actuellement en mode simulation, mais peut être intégrée pour :
- **Identifier le contenu** : Restaurant, temple, monument, plat, etc.
- **Catégoriser** : Food, Sightseeing, Shopping, etc.
- **Estimer le prix** : Pour les photos de plats ou menus
- **Générer une description** : Texte descriptif du lieu/plat
- **Détecter la langue** : Texte sur panneaux, menus, etc.

### 3. **Détection automatique de la devise**
Basé sur les coordonnées GPS :
- **Chine** (lat: 20-50, lng: 100-125) → CNY (Yuan)
- **Japon** (lat: 30-46, lng: 128-146) → JPY (Yen)
- **Défaut** → EUR (Euro)

## 📱 Comment utiliser

### Depuis la page **Planning** (📅)

1. Cliquez sur le bouton **📸 Photo** (violet)
2. Sélectionnez une photo depuis votre appareil
3. Attendez l'analyse (2-3 secondes)
4. Vérifiez les informations extraites :
   - 📍 GPS si disponible
   - 📅 Date de prise
   - 🏛️ Catégorie suggérée
5. Cliquez sur **"✓ Créer l'activité"**
6. Le formulaire se pré-remplit automatiquement
7. Ajustez/complétez les informations si besoin
8. Enregistrez l'activité

### Depuis la page **Carte** (🗺️)

1. Cliquez sur le bouton **"Ajouter une photo"** (en haut à droite)
2. Sélectionnez une photo
3. L'analyse s'effectue automatiquement
4. L'activité est créée immédiatement
5. Elle apparaît sur la carte si GPS disponible
6. Un marqueur coloré selon la catégorie

## 📊 Résultats de l'analyse

### Exemple : Photo d'un restaurant avec GPS

```
📸 Photo analysée avec succès !

📍 Localisation GPS
   39.912345, 116.456789
   → Voir sur Google Maps

📅 Date de prise
   15 mai 2026 à 18:30

🍽️ Catégorie suggérée
   Restaurant

💰 Prix estimé (si disponible)
   ~150 CNY
```

### Ce qui se passe ensuite

**Dans Planning** :
- Formulaire pré-rempli avec toutes les infos
- Vous pouvez modifier avant d'enregistrer

**Dans Carte** :
- Activité créée automatiquement
- Petit point orange sur la carte (restaurant)
- Cliquez dessus pour voir les détails

## ⚠️ Limitations actuelles

### 1. Photos sans GPS
De nombreuses photos n'ont pas de coordonnées GPS :
- Photos téléchargées depuis Internet
- Photos prises avec GPS désactivé
- Screenshots
- Photos partagées via réseaux sociaux (métadonnées supprimées)

**Solution** : Ajoutez manuellement le lien Google Maps après création

### 2. Analyse IA en simulation
L'analyse du contenu est actuellement simulée. Pour une vraie implémentation :

```typescript
// À remplacer dans PhotoUpload.tsx
const analyzePhotoWithAI = async (imageBase64: string) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'YOUR_API_KEY',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: `Analyse cette photo de voyage :
            - Type de lieu (restaurant, temple, monument, etc.)
            - Catégorie (food, sightseeing, shopping, etc.)
            - Description du lieu
            - Si c'est un plat, estime le prix
            - Pays probable (Chine ou Japon)

            Réponds en JSON format :
            {
              "title": "...",
              "description": "...",
              "category": "...",
              "estimatedPrice": number or null,
              "isFood": boolean
            }`
          }
        ]
      }]
    })
  });

  const data = await response.json();
  return JSON.parse(data.content[0].text);
};
```

## 🔐 Confidentialité

- Les photos sont analysées **localement** pour les métadonnées EXIF
- Aucune photo n'est envoyée à un serveur (sauf si vous activez l'API Vision)
- Les coordonnées GPS restent sur votre appareil
- Si vous activez Claude Vision API, les photos sont envoyées à Anthropic selon leur politique de confidentialité

## 💡 Cas d'usage

### 1. **Après le repas au restaurant** 🍜
- Prenez une photo du plat ou du restaurant
- Upload → GPS + Date automatiques
- Catégorie "Restaurant" + prix estimé
- Apparaît sur la carte à l'emplacement exact

### 2. **Devant un monument** 🏛️
- Photo selfie devant le temple
- GPS + Date extraits
- Catégorie "Visite"
- Marqueur vert sur la carte

### 3. **Import de photos de voyage** 📱
- Après le voyage, uploadez vos photos
- Créez automatiquement votre journal de voyage
- Toutes les activités apparaissent sur la carte
- Dates et lieux corrects

### 4. **Planification pré-voyage** 🗺️
- Trouvez un restaurant sur Google Maps
- Screenshot avec GPS visible
- Upload → Crée l'activité pour votre voyage futur
- (Note : les screenshots n'ont généralement pas de GPS)

## 🚀 Fonctionnalités futures possibles

1. **Reconnaissance de texte (OCR)**
   - Lire les menus en chinois/japonais
   - Extraire les prix des menus
   - Traduire automatiquement

2. **Reconnaissance de monuments**
   - Identifier automatiquement : Temple du Ciel, Tour de Tokyo, etc.
   - Pré-remplir le titre avec le nom exact

3. **Estimation de prix améliorée**
   - Analyser les photos de menus
   - Calculer le coût total du repas
   - Convertir automatiquement en EUR

4. **Détection de groupe**
   - Compter le nombre de personnes
   - Diviser le coût automatiquement

5. **Recherche Google Lens intégrée**
   - Trouver des infos sur le lieu
   - Obtenir les horaires d'ouverture
   - Voir les avis

## ⚙️ Configuration technique

### Format de photos supportés
- **JPG/JPEG** ✅ (le plus courant, avec EXIF)
- **PNG** ✅ (peut avoir EXIF mais rare)
- **HEIC** ✅ (format iPhone, avec EXIF)
- **WebP** ⚠️ (support partiel EXIF)

### Taille max
- **10 MB** par photo
- Résolution optimale : 1920x1080 ou inférieure
- Photos trop lourdes sont automatiquement compressées côté navigateur

### Permissions requises
- **Aucune** - L'analyse est locale
- Si API Vision activée : clé API Anthropic requise

## 🐛 Dépannage

### ❌ "Aucune donnée GPS trouvée"
**Causes** :
- La photo n'a pas de métadonnées GPS
- GPS désactivé lors de la prise
- Photo téléchargée depuis Internet
- Screenshot

**Solution** :
- Ajoutez manuellement le lien Google Maps
- Ou prenez une nouvelle photo avec GPS activé

### ❌ "Erreur lors de l'analyse"
**Causes** :
- Photo corrompue
- Format non supporté
- Fichier trop lourd

**Solution** :
- Essayez avec une autre photo
- Compressez la photo d'abord
- Convertissez en JPG

### ⚠️ "Date incorrecte"
**Cause** :
- L'horloge de l'appareil était mal réglée lors de la prise

**Solution** :
- Modifiez manuellement la date dans le formulaire

## 📚 Ressources

- [EXIF.js Documentation](https://github.com/exif-js/exif-js)
- [Exifr Library](https://github.com/MikeKovarik/exifr)
- [Claude Vision API](https://docs.anthropic.com/claude/docs/vision)
- [Google Cloud Vision API](https://cloud.google.com/vision)

## 🎓 Pour les développeurs

### Architecture

```
PhotoUpload.tsx
├── extractExifData()      → Extraction GPS + Date
├── analyzePhotoWithAI()   → Analyse IA (simulation)
└── handlePhotoUpload()    → Orchestration

ActivityCalendar.tsx
└── handlePhotoAnalyzed()  → Pré-remplit le formulaire

MapView.tsx
└── handlePhotoAnalyzed()  → Crée l'activité directement
```

### Intégration Claude Vision API

Voir le code commenté dans `PhotoUpload.tsx` ligne 33-50 pour remplacer la simulation par une vraie analyse IA.

Coût estimé : ~$0.003 par image (modèle Claude 3.5 Sonnet)

---

**Bon voyage et bonnes photos ! 📸✈️**
