# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# 🌍 Voyage - Gestionnaire de Voyage

Une application moderne de gestion de voyages construite avec React 19, TypeScript et Vite, optimisée pour mobile et desktop.

## ✨ Fonctionnalités

### 📱 Interface Mobile-First
- **Optimisé pour iPhone 14 Pro Max** et tous les appareils mobiles
- Interface responsive avec Tailwind CSS
- Navigation intuitive avec onglets
- Mode sombre/clair automatique

### 📅 Calendrier d'Activités
- **Vue Calendrier** : Style Google Calendar avec affichage plein écran
- **Vue Liste** : Liste complète de toutes les activités planifiées
- **Gestion complète** : Ajout, modification et suppression d'activités
- **Catégorisation** : Transport, hébergement, visites, nourriture, shopping, autres

### 💰 Gestionnaire de Dépenses
- **Interface popup** pour l'ajout rapide de dépenses
- Statistiques détaillées par catégorie
- Suivi du budget en temps réel
- Support multi-devises (EUR, CNY, JPY)

### 🎯 Destinations & Planning
- Gestion des destinations de voyage
- Planning détaillé par destination
- Informations complètes (dates, descriptions, pays)

### 👥 Gestion des Participants
- Ajout et gestion des voyageurs
- Rôles : Organisateur, Voyageur
- Informations de contact

### 💾 Synchronisation Cloud
- **Supabase** pour la synchronisation en temps réel
- Données sauvegardées automatiquement
- Accès multi-appareils

## 🚀 Technologies

- **React 19** avec TypeScript
- **Vite 7.1.7** pour le build et le développement
- **Tailwind CSS** pour le styling responsive
- **Lucide React** pour les icônes
- **date-fns** pour la gestion des dates
- **Supabase** pour la base de données
- **Netlify** pour le déploiement

## 📦 Installation

### Prérequis
- Node.js 22.12.0+ (voir `.nvmrc`)
- npm ou yarn

### Développement Local

```bash
# Cloner le repository
git clone [repository-url]
cd voyage

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173/`

## 🌐 Déploiement

### Netlify (Recommandé)

L'application est préconfigurée pour Netlify :

```bash
# Build de production
npm run build

# Test local de la version de production
npm run preview
```

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions complètes de déploiement.

### Configuration Requise

1. **Variables d'environnement** :
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   ⚠️ **Sécurité** : 
   - Configurez ces variables dans Netlify uniquement
   - Ne jamais commiter de vraies clés dans Git
   - Utilisez `.env.local` pour le développement local

2. **Base de données Supabase** :
   - Créer un projet Supabase
   - Importer le schéma depuis `supabase-schema.sql`
   - Configurer les tables : destinations, activities, expenses, people, budget

## 📱 Optimisations Mobile

### iPhone 14 Pro Max
- Interface adaptée aux écrans 6.7"
- Navigation tactile optimisée
- Boutons et zones de touche adaptés
- Animations fluides et responsive

### Fonctionnalités Mobile
- **Touch-friendly** : Zones de touche de 44px minimum
- **Gestures** : Navigation par glissement
- **Viewport** : Métabalises optimisées
- **Performance** : Bundle optimisé < 250KB gzippé

## 🎨 Interface Utilisateur

### Navigation par Onglets
- **Dashboard** : Vue d'ensemble du voyage
- **Planning** : Calendrier et liste des activités
- **Destinations** : Gestion des lieux de voyage
- **Dépenses** : Suivi budgétaire avec popup
- **Équipe** : Gestion des participants

### Modales et Interactions
- **Popup de dépenses** : Ajout rapide depuis n'importe où
- **Modales d'activités** : Création et modification complètes
- **Confirmations** : Validation avant suppression
- **Feedback visuel** : États de chargement et succès

## 🛠️ Développement

### Structure du Projet
```
src/
├── components/          # Composants React
├── context/            # Contexts (TripContext, DarkModeContext)
├── hooks/              # Hooks personnalisés (useSupabaseSync)
├── lib/                # Configuration (supabase.ts, database.types.ts)
├── types/              # Types TypeScript
├── data/               # Données initiales
└── utils/              # Utilitaires

public/                 # Assets statiques
dist/                   # Build de production
```

### Scripts Disponibles
```bash
npm run dev           # Serveur de développement
npm run build         # Build de production
npm run preview       # Test de la version de production
npm run lint          # Linting ESLint
npm run type-check    # Vérification TypeScript
```

## 📝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 🔧 Support & Dépannage

### Problèmes Courants

**Erreur de build TypeScript** :
- Vérifiez la version Node.js (22.12.0+)
- Supprimez `node_modules` et réinstallez

**Problème Supabase** :
- Vérifiez les variables d'environnement
- Contrôlez la configuration du projet Supabase

**Erreur de déploiement Netlify** :
- Vérifiez le fichier `.nvmrc`
- Contrôlez `netlify.toml`

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

---

Développé avec ❤️ pour des voyages organisés et mémorables ✈️

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
