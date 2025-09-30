# 🌏 Application de Gestion de Voyage - Chine & Japon

Une application React moderne pour gérer votre voyage en Chine et au Japon du 1er au 29 mai 2024.

## ✨ Fonctionnalités

### 📊 Tableau de bord
- Vue d'ensemble du voyage avec statistiques
- Graphiques des dépenses par catégorie
- Prochaines activités à venir
- Progression du budget

### 🗺️ Destinations
- **Chine** : Pékin, Chongqing, Zhangjiajie, Shanghai
- **Japon** : Tokyo, Nikko, Takaragawa Onsen, Hakone, Kyoto & Osaka
- Détails de chaque destination avec durée et activités

### 📅 Calendrier des activités
- Vue calendrier mensuelle
- Gestion des activités par destination
- Suivi de l'avancement (activités complétées)
- Catégorisation (transport, hébergement, visites, etc.)

### 👥 Gestion des voyageurs
- Ajout et gestion des participants
- Rôles (organisateur, voyageur)
- Informations de contact

### 💰 Gestion du budget
- Budget total configurable
- Suivi des dépenses en temps réel
- Répartition par catégorie
- Alertes de dépassement
- Recommandations budgétaires

### 💳 Suivi des dépenses
- Ajout de dépenses par destination
- Catégorisation automatique
- Filtres avancés
- Support multi-devises (EUR, CNY, JPY)

## 🛣️ Itinéraire du voyage

### Chine (1-16 mai)
1. **Vol vers Pékin** - 1er mai
2. **Pékin** - 2-5 mai (3 jours)
3. **Chongqing** - 5-9 mai (4 jours)
4. **Zhangjiajie** - 9-11 mai (2 jours)
5. **Shanghai** - 11-16 mai (5 jours)

### Japon (16-29 mai)
6. **Tokyo** - 16-21 mai (5 jours)
7. **Nikko** - 21-23 mai (2 jours)
8. **Takaragawa Onsen** - 23-24 mai (1 jour)
9. **Hakone** - 24-25 mai (1 jour)
10. **Kyoto & Osaka** - 25-29 mai (4 jours)

## 🚀 Technologies utilisées

- **React 19** avec TypeScript
- **Tailwind CSS** pour le design
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes
- **date-fns** pour la gestion des dates
- **Vite** comme bundler

## 🏗️ Architecture

```
src/
├── components/          # Composants React
│   ├── Dashboard.tsx    # Tableau de bord principal
│   ├── Navigation.tsx   # Navigation principale
│   ├── DestinationList.tsx
│   ├── ActivityCalendar.tsx
│   ├── PeopleManager.tsx
│   ├── BudgetManager.tsx
│   └── ExpenseTracker.tsx
├── context/            # Contexte React pour l'état global
│   └── TripContext.tsx
├── data/              # Données initiales
│   └── initialData.ts
├── types/             # Types TypeScript
│   └── index.ts
└── App.tsx           # Composant principal
```

## 📦 Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualisation du build
npm run preview
```

## 🔮 Fonctionnalités à venir

- [ ] Connexion à une base de données
- [ ] Système d'authentification
- [ ] Synchronisation multi-utilisateurs
- [ ] Export PDF des itinéraires
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Géolocalisation
- [ ] Photos et médias
- [ ] Partage social

## 🎯 État actuel

L'application est entièrement fonctionnelle avec :
- ✅ Interface utilisateur complète
- ✅ Gestion d'état avec React Context
- ✅ Tous les composants implémentés
- ✅ Design responsive avec Tailwind CSS
- ✅ Données de voyage pré-remplies
- ✅ Graphiques et visualisations

## 📝 Notes de développement

L'application est conçue pour être facilement extensible. Les prochaines étapes incluront l'ajout d'une base de données (Firebase ou Supabase) et d'un système d'authentification pour permettre la collaboration entre voyageurs.