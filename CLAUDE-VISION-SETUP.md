# 🔑 Configuration de Claude Vision API

## Étape 1 : Obtenir une clé API Anthropic

1. Allez sur https://console.anthropic.com/
2. Créez un compte ou connectez-vous
3. Allez dans **Settings** → **API Keys**
4. Cliquez sur **Create Key**
5. Copiez la clé (format : `sk-ant-api03-...`)

## Étape 2 : Configurer la clé dans l'app

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Remplacez la ligne :
   ```
   VITE_ANTHROPIC_API_KEY=your_api_key_here
   ```
   Par :
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
   ```

3. Redémarrez le serveur de dev :
   ```bash
   npm run dev
   ```

## Étape 3 : Tester

1. Allez dans **Planning** ou **Carte**
2. Cliquez sur le bouton **📸 Photo**
3. Uploadez une photo (de préférence avec GPS)
4. L'analyse se lance automatiquement avec Claude Vision
5. Vérifiez la console du navigateur pour voir les logs :
   ```
   📸 Claude Vision réponse brute: {...}
   ✅ Claude Vision analyse: {...}
   ```

## 💰 Coût

- **Modèle** : Claude 3.5 Sonnet (20241022)
- **Coût** : ~$0.003 par image (3 millièmes de dollar)
- **Pour 100 photos** : ~$0.30
- **Pour 1000 photos** : ~$3.00

C'est très abordable pour un usage personnel !

## 🧪 Mode simulation (sans clé API)

Si vous n'ajoutez pas de clé API ou laissez `your_api_key_here` :
- L'app fonctionne en **mode simulation**
- Analyse factice avec délai de 2 secondes
- Extrait quand même GPS et date de la photo
- Affiche un message : "Mode simulation - ajoutez votre clé API"

## 🔒 Sécurité

### ⚠️ Attention en production !

Le code actuel utilise `dangerouslyAllowBrowser: true` pour permettre l'utilisation de l'API côté client. **Ceci expose votre clé API dans le code JavaScript du navigateur.**

### Pour une app de production :

#### Option 1 : Backend proxy (recommandé)
Créez un endpoint backend qui fait l'appel à l'API :

```typescript
// Backend (Node.js/Express)
app.post('/api/analyze-photo', async (req, res) => {
  const { imageBase64 } = req.body;
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY // Clé côté serveur
  });
  const result = await client.messages.create({...});
  res.json(result);
});

// Frontend
const analyzePhotoWithAI = async (imageBase64: string) => {
  const response = await fetch('/api/analyze-photo', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 })
  });
  return response.json();
};
```

#### Option 2 : Edge Functions (Supabase)
Utilisez Supabase Edge Functions pour sécuriser la clé :

```typescript
// supabase/functions/analyze-photo/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Anthropic from "@anthropic-ai/sdk"

serve(async (req) => {
  const { imageBase64 } = await req.json()
  const client = new Anthropic({
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')
  })
  const result = await client.messages.create({...})
  return new Response(JSON.stringify(result))
})
```

## 📝 Que peut analyser Claude Vision ?

### ✅ Très précis pour :
- **Plats de nourriture** : Identification du type (ramen, sushi, dim sum, etc.)
- **Monuments** : Temple, pagode, tour, château
- **Architecture** : Style chinois, japonais, moderne
- **Texte** : Panneaux, menus en chinois/japonais (OCR)
- **Scènes** : Restaurant, rue, marché, gare

### 💰 Estimation de prix :
- Analyse les photos de **menus**
- Détecte les **prix écrits** sur les tickets
- Estime le coût d'un **plat** basé sur l'apparence
- Exemple : Ramen → ~800-1200 JPY, Peking Duck → ~200-300 CNY

### 🌍 Détection du pays :
- Reconnaît l'**architecture typique** (toits chinois vs japonais)
- Lit les **caractères** (simplifié = Chine, kanji = Japon)
- Identifie les **marques** locales
- Devine la **devise** appropriée

## 🐛 Dépannage

### ❌ "Error: Invalid API Key"
- Vérifiez que la clé commence par `sk-ant-api03-`
- Assurez-vous qu'il n'y a pas d'espaces
- La clé doit être active sur console.anthropic.com

### ❌ "CORS Error"
- Normal si vous testez depuis `file://`
- Utilisez `npm run dev` pour avoir un serveur local
- En production, utilisez un backend proxy

### ⚠️ "Rate limit exceeded"
- Claude a des limites de requêtes
- Plan gratuit : 50 requêtes/jour
- Plan payant : beaucoup plus élevé
- Attendez 1 minute entre les uploads massifs

### 📸 Photos mal analysées
- **Floue** : Claude ne peut pas bien voir → résultats aléatoires
- **Sombre** : Augmentez la luminosité avant upload
- **Trop petite** : Utilisez au moins 800x600px
- **Sans contexte** : Ajoutez des éléments reconnaissables

## 💡 Exemples de résultats réels

### Photo d'un bol de ramen
```json
{
  "title": "Ramen tonkotsu",
  "description": "Bol de ramen avec bouillon crémeux, porc chashu, œuf mariné, et oignons verts",
  "category": "food",
  "isFood": true,
  "estimatedPrice": 950,
  "currency": "JPY",
  "country": "Japan"
}
```

### Photo du Temple du Ciel
```json
{
  "title": "Temple du Ciel",
  "description": "Célèbre temple de Pékin avec architecture de dynastie Ming, toit triple en tuiles bleues",
  "category": "sightseeing",
  "isFood": false,
  "estimatedPrice": 30,
  "currency": "CNY",
  "country": "China"
}
```

### Photo d'un menu de restaurant
```json
{
  "title": "Menu restaurant japonais",
  "description": "Menu avec diverses options de sushi, tempura et bento. Prix visibles entre 800-2000 yen",
  "category": "food",
  "isFood": true,
  "estimatedPrice": 1500,
  "currency": "JPY",
  "country": "Japan"
}
```

## 🚀 Améliorations futures possibles

1. **Cache des analyses** : Stocker les résultats dans Supabase pour éviter de ré-analyser
2. **Batch processing** : Analyser plusieurs photos d'un coup
3. **OCR avancé** : Extraire tout le texte des menus pour traduction
4. **Recherche Google Lens** : Identifier les monuments célèbres
5. **Comparaison de prix** : Vérifier si le prix estimé est raisonnable

## 📚 Documentation API

- [Claude Vision API](https://docs.anthropic.com/claude/docs/vision)
- [Anthropic Console](https://console.anthropic.com/)
- [Pricing](https://www.anthropic.com/pricing)
- [Rate Limits](https://docs.anthropic.com/claude/docs/rate-limits)

---

**🎉 Profitez de l'analyse intelligente de vos photos de voyage !**
