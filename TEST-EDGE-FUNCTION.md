# 🔍 Debug Edge Function

## Problème actuel

Erreur 400 (Bad Request) depuis Anthropic API. Causes possibles :
1. Format base64 incorrect
2. `media_type` incorrect (PNG vs JPEG)
3. Clé API invalide

## Solution : Améliorer l'Edge Function

Remplace le code de ta fonction Supabase par celui-ci (avec meilleure gestion d'erreurs) :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64 } = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Détecter le type d'image depuis la signature base64
    let mediaType = 'image/jpeg'
    if (imageBase64.startsWith('/9j/')) {
      mediaType = 'image/jpeg'
    } else if (imageBase64.startsWith('iVBORw0KGgo')) {
      mediaType = 'image/png'
    } else if (imageBase64.startsWith('R0lGOD')) {
      mediaType = 'image/gif'
    } else if (imageBase64.startsWith('UklGR')) {
      mediaType = 'image/webp'
    }

    console.log('📸 Image type detected:', mediaType)
    console.log('📏 Base64 length:', imageBase64.length)

    // Call Anthropic API
    const anthropicPayload = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: `Tu es un assistant de voyage expert. Analyse cette photo et détermine :

1. **Type de lieu** : Est-ce un restaurant, un temple, un monument, une rue, un magasin, un hébergement, un transport, ou autre ?

2. **Catégorie** : Choisis UNE catégorie parmi :
   - "food" (restaurant, nourriture, plat)
   - "sightseeing" (temple, monument, musée, attraction touristique)
   - "shopping" (magasin, marché, centre commercial)
   - "accommodation" (hôtel, auberge)
   - "transport" (train, bus, avion, taxi)
   - "other" (autre)

3. **Titre** : Un titre court et descriptif (max 50 caractères)

4. **Description** : Une description détaillée de ce que tu vois (max 200 caractères)

5. **Est-ce de la nourriture ?** : true ou false

6. **Prix estimé** : Si c'est de la nourriture ou un ticket d'entrée, estime le prix en :
   - CNY (Yuan) si ça semble être en Chine
   - JPY (Yen) si ça semble être au Japon
   - EUR sinon
   Donne UNIQUEMENT le montant numérique, sans la devise.

7. **Pays probable** : "China", "Japan", ou "Unknown"

**IMPORTANT** : Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après :

\`\`\`json
{
  "title": "...",
  "description": "...",
  "category": "food|sightseeing|shopping|accommodation|transport|other",
  "isFood": true|false,
  "estimatedPrice": number ou null,
  "currency": "CNY|JPY|EUR",
  "country": "China|Japan|Unknown"
}
\`\`\`

Exemple de réponse :
\`\`\`json
{
  "title": "Temple Senso-ji",
  "description": "Grand temple bouddhiste traditionnel avec architecture japonaise classique et toits rouges",
  "category": "sightseeing",
  "isFood": false,
  "estimatedPrice": null,
  "currency": "JPY",
  "country": "Japan"
}
\`\`\``
          }
        ]
      }]
    }

    console.log('🚀 Calling Anthropic API...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(anthropicPayload)
    })

    const responseText = await response.text()
    console.log('📥 Anthropic response status:', response.status)
    console.log('📥 Anthropic response:', responseText.substring(0, 500))

    if (!response.ok) {
      console.error('❌ Anthropic API Error:', responseText)
      return new Response(
        JSON.stringify({
          error: `Anthropic API error: ${response.statusText}`,
          details: responseText,
          status: response.status
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = JSON.parse(responseText)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

## Changements importants

1. **Détection automatique du type d'image** (JPEG, PNG, GIF, WebP)
2. **Logs détaillés** pour debug
3. **Meilleure gestion d'erreurs** avec détails complets
4. **Response text** pour voir l'erreur exacte d'Anthropic

## Après avoir mis à jour la fonction

1. **Redéploie** sur Supabase
2. **Recharge ton app** (F5)
3. **Upload une photo**
4. **Va voir les logs Supabase** :
   - Dashboard → Functions → analyze-photo → Logs
   - Tu verras exactement ce qui se passe

## Vérifier les logs

https://supabase.com/dashboard/project/bbbktqqtayfcspklywzj/functions/analyze-photo/logs

Tu devrais voir :
```
📸 Image type detected: image/jpeg
📏 Base64 length: 123456
🚀 Calling Anthropic API...
📥 Anthropic response status: 200
📥 Anthropic response: {"content":[{"type":"text","text":"..."}]}
```

Si tu vois une erreur, copie-la et envoie-la moi !
