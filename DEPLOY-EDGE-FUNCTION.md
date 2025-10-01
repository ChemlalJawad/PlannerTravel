# 🚀 Déploiement Supabase Edge Function pour Claude Vision

## Pourquoi une Edge Function ?

L'API Anthropic ne permet pas les appels directs depuis le navigateur (problème CORS). La solution est d'utiliser une **Supabase Edge Function** comme proxy sécurisé.

## 📋 Pré-requis

1. Un compte Supabase (déjà créé ✅)
2. Supabase CLI installé
3. Une clé API Anthropic

## Étape 1 : Installer Supabase CLI

### Windows (PowerShell en tant qu'administrateur)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Ou télécharger directement : https://github.com/supabase/cli/releases

### macOS/Linux
```bash
brew install supabase/tap/supabase
```

### Vérifier l'installation
```bash
supabase --version
```

## Étape 2 : Se connecter à Supabase

```bash
supabase login
```

Cela ouvrira votre navigateur pour vous connecter.

## Étape 3 : Lier le projet local

```bash
cd C:\Users\Jawad\source\PlannerTravel
supabase link --project-ref bbbktqqtayfcspklywzj
```

(Le project-ref est extrait de ton URL Supabase : `https://bbbktqqtayfcspklywzj.supabase.co`)

## Étape 4 : Configurer la clé API Anthropic

### Via la console Supabase (recommandé)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Edge Functions** → **Secrets**
4. Ajoutez un nouveau secret :
   - Nom : `ANTHROPIC_API_KEY`
   - Valeur : `sk-ant-api03-VOTRE_CLE_ICI`

### Ou via CLI
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
```

## Étape 5 : Déployer la fonction

```bash
supabase functions deploy analyze-photo
```

Sortie attendue :
```
Deploying function analyze-photo...
Function deployed successfully!
URL: https://bbbktqqtayfcspklywzj.supabase.co/functions/v1/analyze-photo
```

## Étape 6 : Tester la fonction

### Via curl
```bash
curl -X POST \
  https://bbbktqqtayfcspklywzj.supabase.co/functions/v1/analyze-photo \
  -H "Authorization: Bearer VOTRE_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"imageBase64": "BASE64_DE_IMAGE"}'
```

### Via l'app
1. Rechargez votre app (F5)
2. Allez dans Planning → 📸 Photo
3. Uploadez une photo
4. L'analyse devrait fonctionner ! ✅

## 🔧 Dépannage

### Erreur "Function not found"
```bash
# Vérifier les fonctions déployées
supabase functions list
```

### Erreur "ANTHROPIC_API_KEY not configured"
```bash
# Vérifier les secrets
supabase secrets list

# Re-définir le secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Erreur CORS
Vérifiez que les headers CORS sont présents dans `supabase/functions/analyze-photo/index.ts` :
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### Voir les logs
```bash
supabase functions logs analyze-photo
```

## 💰 Coûts

### Supabase
- **Gratuit** jusqu'à 500,000 invocations/mois
- Edge Functions sont incluses dans le plan gratuit

### Anthropic Claude
- ~$0.003 par image analysée
- 100 photos = $0.30
- 1000 photos = $3.00

**Total pour usage personnel : Presque gratuit** 🎉

## 🔐 Sécurité

### ✅ Ce qui est sécurisé
- La clé API Anthropic est stockée côté serveur (Supabase)
- Elle n'est JAMAIS exposée dans le code JavaScript
- Les appels passent par un proxy sécurisé

### ⚠️ À améliorer pour production
1. **Rate limiting** : Limiter le nombre d'appels par utilisateur
```typescript
// Dans index.ts
const userId = req.headers.get('x-user-id')
// Implémenter un système de rate limiting avec Supabase
```

2. **Validation d'image** : Vérifier la taille et le format
```typescript
if (imageBase64.length > 5000000) { // 5MB max
  return new Response('Image too large', { status: 413 })
}
```

3. **Authentication** : Utiliser Supabase Auth
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(supabaseUrl, supabaseKey)
const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization'))
if (!user) return new Response('Unauthorized', { status: 401 })
```

## 📊 Monitoring

### Voir les invocations
Dans le dashboard Supabase :
- **Edge Functions** → **analyze-photo** → **Metrics**

Vous verrez :
- Nombre d'appels
- Taux d'erreur
- Temps de réponse moyen
- Logs en temps réel

## 🔄 Mises à jour

Pour re-déployer après des modifications :

```bash
# Modifier le fichier
nano supabase/functions/analyze-photo/index.ts

# Re-déployer
supabase functions deploy analyze-photo

# Vérifier
supabase functions logs analyze-photo --tail
```

## 🎯 Test complet

Après le déploiement :

1. **Upload une photo de ramen** 🍜
   - Devrait détecter : category="food", title="Ramen ...", price~1000 JPY

2. **Upload une photo du Temple du Ciel** 🏛️
   - Devrait détecter : category="sightseeing", title="Temple...", country="China"

3. **Upload un screenshot Google Maps**
   - Devrait détecter la catégorie même sans photo réelle

4. **Vérifier la console** (F12)
   ```
   📸 Claude Vision réponse brute: {"title": "...", ...}
   ✅ Claude Vision analyse: {...}
   ```

## 🆘 Besoin d'aide ?

- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Documentation Claude API](https://docs.anthropic.com/claude/reference/messages_post)
- [Supabase Discord](https://discord.supabase.com/)

---

**Une fois déployé, l'analyse de photos fonctionnera parfaitement ! 📸✨**
