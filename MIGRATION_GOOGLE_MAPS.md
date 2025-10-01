# Migration : Ajout de Google Maps URL

## Étape 1 : Exécuter la migration SQL

Allez sur votre dashboard Supabase : https://supabase.com/dashboard/project/bbbktqqtayfcspklywzj/editor

### Option A : Via l'éditeur SQL
1. Cliquez sur "SQL Editor" dans la barre latérale
2. Cliquez sur "+ New query"
3. Copiez-collez le contenu du fichier `supabase/migrations/add_google_maps_url.sql` :

```sql
-- Ajouter la colonne google_maps_url à la table activities
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Ajouter un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_activities_google_maps_url ON activities(google_maps_url);

-- Commentaire pour la colonne
COMMENT ON COLUMN activities.google_maps_url IS 'URL Google Maps pour localiser l''activité';
```

4. Cliquez sur "Run" pour exécuter la migration

### Option B : Via Supabase CLI
```bash
supabase db push
```

## Étape 2 : Vérifier la migration

Dans l'éditeur SQL, exécutez :
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activities' AND column_name = 'google_maps_url';
```

Vous devriez voir :
```
column_name       | data_type | is_nullable
google_maps_url   | text      | YES
```

## Étape 3 : Tester l'application

1. Rafraîchissez votre application (F5)
2. Ajoutez une nouvelle activité avec un lien Google Maps
3. Vérifiez que l'activité apparaît correctement sur la carte
4. Les activités existantes sans URL Google Maps continueront de fonctionner normalement

## Fonctionnalités activées

✅ **Stockage des URLs Google Maps** : Chaque activité peut maintenant stocker son lien Google Maps
✅ **Affichage sur la carte** : Les activités avec des coordonnées GPS sont affichées sur la carte
✅ **Conversion automatique des devises** : Les prix sont affichés en EUR avec le prix original entre parenthèses
  - Exemple : `25.00 EUR (500 JPY)`
✅ **Photo upload** : Analyse automatique des photos avec extraction GPS et prix

## Taux de change actuels

Configurés dans `src/utils/currency.ts` :
- 1 CNY = 0.13 EUR
- 1 JPY = 0.0062 EUR
- 1 EUR = 1 EUR

💡 **Note** : Mettez à jour les taux de change régulièrement dans le fichier `currency.ts`
