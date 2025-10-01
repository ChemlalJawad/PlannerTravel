-- Ajouter la colonne google_maps_url à la table activities
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

-- Ajouter un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_activities_google_maps_url ON activities(google_maps_url);

-- Commentaire pour la colonne
COMMENT ON COLUMN activities.google_maps_url IS 'URL Google Maps pour localiser l''activité';
