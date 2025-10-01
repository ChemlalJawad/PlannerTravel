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

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
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
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API Error:', errorData)
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
