# 🚀 Configuration Supabase - Guide de déploiement

## 📋 Étapes de configuration

### 1. Créer un projet Supabase

1. **Connectez-vous** à votre dashboard Supabase : https://app.supabase.com
2. **Créez** un nouveau projet ou sélectionnez votre projet existant
3. **Notez** votre URL de projet et votre clé anonyme
4. **Accédez** à l'onglet "SQL Editor"

### 2. Configuration des variables d'environnement

Créez un fichier `.env.local` avec vos clés (remplacez par vos vraies valeurs) :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important** : 
- Ne jamais commiter le fichier `.env.local` 
- Utilisez uniquement des clés d'exemple dans la documentation
- Configurez les vraies clés directement dans Netlify

### 3. Créer les tables dans Supabase

1. **Copiez-collez** le contenu du fichier `supabase-schema.sql` dans le SQL Editor
2. **Exécutez** le script pour créer toutes les tables
3. **Vérifiez** que toutes les tables sont créées : destinations, activities, expenses, people, budget

### 4. Configuration Netlify

Dans votre dashboard Netlify, allez dans **Site settings** > **Environment variables** et ajoutez :

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

### 5. Structure de la base de données

La base de données comprend 5 tables principales :

#### 🗺️ `destinations`
- Informations sur les destinations de voyage
- Dates de début et fin
- Description et pays

#### 📅 `activities` 
- Activités planifiées par destination
- Catégories : transport, hébergement, visites, nourriture, shopping, autres
- Coûts et devises
- Statut de completion

#### 💰 `expenses`
- Dépenses du voyage
- Catégorisation automatique
- Multi-devises (EUR, CNY, JPY)

#### 👥 `people`
- Participants au voyage
- Rôles : organisateur, voyageur
- Informations de contact

#### 💵 `budget`
- Budget global du voyage
- Répartition par catégorie
- Suivi en temps réel

## 🔧 Tests et validation

Une fois configuré :

1. **Testez localement** : `npm run dev`
2. **Vérifiez les connexions** Supabase dans la console
3. **Testez les opérations** CRUD dans l'interface
4. **Déployez** sur Netlify

## 🚨 Sécurité

- ✅ Utilisez des clés d'environnement
- ✅ Activez Row Level Security (RLS) en production
- ✅ Ne jamais exposer les clés dans le code
- ✅ Utilisez des politiques de sécurité appropriées

## 📞 Support

En cas de problème :
1. Vérifiez les logs de la console navigateur
2. Contrôlez les variables d'environnement
3. Testez la connexion Supabase
4. Consultez la documentation Supabase

---

🔐 **Rappel de sécurité** : Ce fichier ne contient que des exemples. Vos vraies clés doivent être configurées dans Netlify et jamais commitées dans Git.