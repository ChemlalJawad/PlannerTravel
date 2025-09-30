# Guide de Déploiement

## Configuration Netlify

L'application est maintenant configurée pour être déployée sur Netlify avec les paramètres suivants :

### Fichiers de Configuration

#### `.nvmrc`
```
22.12.0
```
Spécifie la version Node.js recommandée pour le déploiement.

#### `netlify.toml`
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "22.12.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variables d'Environnement Netlify

Assurez-vous de configurer les variables d'environnement suivantes dans votre dashboard Netlify :

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Instructions de Déploiement

1. **Connecter le Repository**
   - Connectez votre repository GitHub à Netlify
   - Sélectionnez la branche `main` pour le déploiement automatique

2. **Configuration de Build**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node.js version: `22.12.0` (automatiquement détectée via .nvmrc)

3. **Variables d'Environnement**
   - Ajoutez vos variables Supabase dans Site settings > Environment variables

4. **Déploiement**
   - Le déploiement se lance automatiquement après chaque push sur `main`
   - Ou cliquez sur "Deploy site" dans l'interface Netlify

### Résolution des Problèmes de Build

Les erreurs TypeScript suivantes ont été résolues :
- ✅ Types Supabase corrigés (client sans typage strict)
- ✅ Imports non utilisés supprimés
- ✅ Fichiers corrompus supprimés
- ✅ Version Node.js spécifiée (22.12.0)
- ✅ Configuration Netlify complète

### Test Local

Pour tester la version de production localement :

```bash
npm run build
npm run preview
```

L'application sera disponible sur `http://localhost:4173/`

### Structure de l'Application

L'application comprend :
- 📱 Interface responsive optimisée pour iPhone 14 Pro Max
- 📅 Calendrier d'activités avec vue liste et calendrier
- 💰 Gestionnaire de dépenses avec popup modal
- 🎯 Système de modification et suppression d'activités
- 🌙 Mode sombre/clair
- 💾 Synchronisation Supabase (quand configuré)

### Support

En cas de problème de déploiement :
1. Vérifiez les logs de build dans Netlify
2. Assurez-vous que les variables d'environnement sont correctes
3. Vérifiez que la version Node.js est 22.12.0+
4. Contactez le support si nécessaire