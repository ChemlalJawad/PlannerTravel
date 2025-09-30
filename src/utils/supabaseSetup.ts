import { supabase } from '../lib/supabase';

// Test de connexion et création des tables
async function testSupabaseConnection() {
  console.log('🔌 Test de connexion Supabase...');
  
  try {
    // Test de connexion basique
    const { error } = await supabase.from('destinations').select('count');
    
    if (error && error.code === '42P01') {
      console.log('📊 Tables non trouvées - Création en cours...');
      await createTables();
    } else if (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    } else {
      console.log('✅ Connexion Supabase réussie !');
      console.log('📊 Tables existantes détectées');
      return true;
    }
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion:', err);
    return false;
  }
}

// Création des tables
async function createTables() {
  console.log('🏗️ Création des tables...');
  
  try {
    // Test si les tables existent déjà
    const { error: testError } = await supabase.from('destinations').select('id').limit(1);
    
    if (!testError) {
      console.log('✅ Tables déjà existantes !');
      return true;
    }
    
    console.log('📊 Tables non trouvées - Création manuelle requise');
    console.log('💡 Veuillez exécuter le script SQL dans votre dashboard Supabase :');
    console.log('   → Allez sur https://supabase.com/dashboard');
    console.log('   → Ouvrez l\'éditeur SQL');
    console.log('   → Copiez et exécutez le contenu de supabase-schema.sql');
    
    return false;
  } catch (err) {
    console.error('❌ Erreur lors de la création des tables:', err);
    return false;
  }
}

// Activation de Row Level Security
async function enableRLS() {
  console.log('🔒 Activation des politiques de sécurité...');
  
  const policies = [
    'ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE activities ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE people ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE budget ENABLE ROW LEVEL SECURITY;',
    
    `CREATE POLICY IF NOT EXISTS "Allow all operations" ON destinations FOR ALL USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Allow all operations" ON activities FOR ALL USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Allow all operations" ON expenses FOR ALL USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Allow all operations" ON people FOR ALL USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Allow all operations" ON budget FOR ALL USING (true);`
  ];

  try {
    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        console.warn('⚠️ Politique déjà existante ou erreur:', error.message);
      }
    }
    console.log('✅ Politiques de sécurité configurées !');
  } catch (err) {
    console.warn('⚠️ Erreur lors de la configuration des politiques:', err);
  }
}

// Insertion des données initiales
async function insertInitialData() {
  console.log('📝 Insertion des données initiales...');
  
  try {
    // Destinations
    const destinations = [
      { id: '1', name: 'Pékin', country: 'Chine', start_date: '2024-05-02', end_date: '2024-05-05', description: 'Capitale de la Chine, riche en histoire et culture' },
      { id: '2', name: 'Chongqing', country: 'Chine', start_date: '2024-05-05', end_date: '2024-05-09', description: 'Ville moderne avec des paysages spectaculaires' },
      { id: '3', name: 'Zhangjiajie', country: 'Chine', start_date: '2024-05-09', end_date: '2024-05-11', description: 'Parc national aux formations rocheuses uniques' },
      { id: '4', name: 'Shanghai', country: 'Chine', start_date: '2024-05-11', end_date: '2024-05-16', description: 'Centre économique et financier de la Chine' },
      { id: '5', name: 'Tokyo', country: 'Japon', start_date: '2024-05-16', end_date: '2024-05-21', description: 'Capitale du Japon, mélange de tradition et modernité' },
      { id: '6', name: 'Nikko', country: 'Japon', start_date: '2024-05-21', end_date: '2024-05-23', description: 'Ville historique avec des temples et la nature' },
      { id: '7', name: 'Takaragawa Onsen', country: 'Japon', start_date: '2024-05-23', end_date: '2024-05-24', description: 'Sources chaudes traditionnelles' },
      { id: '8', name: 'Hakone', country: 'Japon', start_date: '2024-05-24', end_date: '2024-05-25', description: 'Resort de montagne avec vue sur le Mont Fuji' },
      { id: '9', name: 'Kyoto & Osaka', country: 'Japon', start_date: '2024-05-25', end_date: '2024-05-29', description: 'Ancienne capitale et centre gastronomique' }
    ];

    const { error: destError } = await supabase.from('destinations').upsert(destinations);
    if (destError) throw destError;

    // Activités
    const activities = [
      { id: 'act-1', destination_id: '1', title: 'Vol vers Pékin', description: 'Départ le 1er mai, arrivée le 2 mai', date: '2024-05-01', time: '10:00', category: 'transport', cost: 800, currency: 'EUR', is_completed: false },
      { id: 'act-2', destination_id: '1', title: 'Visite de la Cité Interdite', description: 'Exploration du palais impérial', date: '2024-05-03', time: '09:00', category: 'sightseeing', cost: 60, currency: 'CNY', is_completed: false },
      { id: 'act-3', destination_id: '1', title: 'Grande Muraille de Chine', description: 'Visite de la section de Mutianyu', date: '2024-05-04', time: '08:00', category: 'sightseeing', cost: 45, currency: 'CNY', is_completed: false },
      { id: 'act-4', destination_id: '5', title: 'Vol Shanghai - Tokyo', description: 'Vol vers le Japon', date: '2024-05-16', time: '14:00', category: 'transport', cost: 300, currency: 'EUR', is_completed: false }
    ];

    const { error: actError } = await supabase.from('activities').upsert(activities);
    if (actError) throw actError;

    // Personnes
    const people = [
      { id: 'person-1', name: 'Vous', role: 'organizer' }
    ];

    const { error: peopleError } = await supabase.from('people').upsert(people);
    if (peopleError) throw peopleError;

    // Budget
    const budget = {
      id: 1,
      total_budget: 5000,
      currency: 'EUR',
      spent: 0,
      remaining: 5000,
      by_category: {
        transport: 0,
        accommodation: 0,
        food: 0,
        shopping: 0,
        activities: 0,
        other: 0
      }
    };

    const { error: budgetError } = await supabase.from('budget').upsert(budget);
    if (budgetError) throw budgetError;

    console.log('✅ Données initiales insérées avec succès !');
    return true;
  } catch (err) {
    console.error('❌ Erreur lors de l\'insertion des données:', err);
    return false;
  }
}

// Test complet
async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet Supabase...');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Présente' : '❌ Manquante');
  
  const success = await testSupabaseConnection();
  
  if (success) {
    console.log('🎉 Configuration Supabase terminée avec succès !');
    console.log('📱 L\'application peut maintenant synchroniser avec la base de données.');
  } else {
    console.log('❌ Échec de la configuration Supabase');
    console.log('💡 Vérifiez vos clés et la connectivité réseau');
  }
  
  return success;
}

export { runCompleteTest, testSupabaseConnection };