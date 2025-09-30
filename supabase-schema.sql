-- SQL pour créer les tables dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Table des destinations
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des activités
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  category TEXT CHECK (category IN ('transport', 'accommodation', 'sightseeing', 'food', 'shopping', 'other')) NOT NULL,
  cost DECIMAL(10,2),
  currency TEXT CHECK (currency IN ('EUR', 'CNY', 'JPY')) NOT NULL DEFAULT 'EUR',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des dépenses
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT CHECK (currency IN ('EUR', 'CNY', 'JPY')) NOT NULL DEFAULT 'EUR',
  category TEXT CHECK (category IN ('transport', 'accommodation', 'food', 'shopping', 'activities', 'other')) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des personnes
CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('traveler', 'organizer')) NOT NULL DEFAULT 'traveler',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du budget
CREATE TABLE IF NOT EXISTS budget (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_budget DECIMAL(10,2) NOT NULL,
  currency TEXT CHECK (currency IN ('EUR')) NOT NULL DEFAULT 'EUR',
  spent DECIMAL(10,2) DEFAULT 0,
  remaining DECIMAL(10,2) DEFAULT 0,
  by_category JSONB NOT NULL DEFAULT '{
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "shopping": 0,
    "activities": 0,
    "other": 0
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_budget CHECK (id = 1)
);

-- Triggers pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_updated_at BEFORE UPDATE ON budget
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security) - permettre tout pour l'instant
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre toutes les opérations (à ajuster selon vos besoins de sécurité)
CREATE POLICY "Allow all operations" ON destinations FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON people FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON budget FOR ALL USING (true);

-- Insérer les données initiales des destinations
INSERT INTO destinations (id, name, country, start_date, end_date, description) VALUES
('1', 'Pékin', 'Chine', '2024-05-02', '2024-05-05', 'Capitale de la Chine, riche en histoire et culture'),
('2', 'Chongqing', 'Chine', '2024-05-05', '2024-05-09', 'Ville moderne avec des paysages spectaculaires'),
('3', 'Zhangjiajie', 'Chine', '2024-05-09', '2024-05-11', 'Parc national aux formations rocheuses uniques'),
('4', 'Shanghai', 'Chine', '2024-05-11', '2024-05-16', 'Centre économique et financier de la Chine'),
('5', 'Tokyo', 'Japon', '2024-05-16', '2024-05-21', 'Capitale du Japon, mélange de tradition et modernité'),
('6', 'Nikko', 'Japon', '2024-05-21', '2024-05-23', 'Ville historique avec des temples et la nature'),
('7', 'Takaragawa Onsen', 'Japon', '2024-05-23', '2024-05-24', 'Sources chaudes traditionnelles'),
('8', 'Hakone', 'Japon', '2024-05-24', '2024-05-25', 'Resort de montagne avec vue sur le Mont Fuji'),
('9', 'Kyoto & Osaka', 'Japon', '2024-05-25', '2024-05-29', 'Ancienne capitale et centre gastronomique')
ON CONFLICT (id) DO NOTHING;

-- Insérer les activités initiales
INSERT INTO activities (id, destination_id, title, description, date, time, category, cost, currency, is_completed) VALUES
('act-1', '1', 'Vol vers Pékin', 'Départ le 1er mai, arrivée le 2 mai', '2024-05-01', '10:00', 'transport', 800, 'EUR', false),
('act-2', '1', 'Visite de la Cité Interdite', 'Exploration du palais impérial', '2024-05-03', '09:00', 'sightseeing', 60, 'CNY', false),
('act-3', '1', 'Grande Muraille de Chine', 'Visite de la section de Mutianyu', '2024-05-04', '08:00', 'sightseeing', 45, 'CNY', false),
('act-4', '5', 'Vol Shanghai - Tokyo', 'Vol vers le Japon', '2024-05-16', '14:00', 'transport', 300, 'EUR', false)
ON CONFLICT (id) DO NOTHING;

-- Insérer une personne initiale
INSERT INTO people (id, name, role) VALUES
('person-1', 'Vous', 'organizer')
ON CONFLICT (id) DO NOTHING;

-- Insérer le budget initial
INSERT INTO budget (id, total_budget, currency, spent, remaining, by_category) VALUES
(1, 5000, 'EUR', 0, 5000, '{
  "transport": 0,
  "accommodation": 0,
  "food": 0,
  "shopping": 0,
  "activities": 0,
  "other": 0
}')
ON CONFLICT (id) DO NOTHING;