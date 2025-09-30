import { supabase } from '../lib/supabase';

// Test de connexion et vérification des tables
async function testSupabaseConnection() {
  console.log('🔌 Test de connexion Supabase...');
  
  try {
    // Test de connexion basique
    const { error } = await supabase.from('destinations').select('count');
    
    if (error && error.code === '42P01') {
      console.log('📊 Tables non trouvées - Création manuelle requise');
      console.log('💡 Instructions :');
      console.log('   1. Allez sur https://supabase.com/dashboard');
      console.log('   2. Sélectionnez votre projet');
      console.log('   3. Ouvrez l\'éditeur SQL');
      console.log('   4. Copiez et exécutez le contenu du fichier supabase-schema.sql');
      console.log('   5. Revenez ici et testez à nouveau');
      return false;
    } else if (error) {
      console.error('❌ Erreur de connexion:', error);
      return false;
    } else {
      console.log('✅ Connexion Supabase réussie !');
      console.log('📊 Tables existantes détectées');
      
      // Test d'insertion de données initiales
      await insertInitialData();
      return true;
    }
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion:', err);
    return false;
  }
}

// Insertion des données initiales
async function insertInitialData() {
  console.log('📝 Vérification et insertion des données initiales...');
  
  try {
    // Vérifier si des données existent déjà
    const { data: existingDest } = await supabase.from('destinations').select('id').limit(1);
    
    if (existingDest && existingDest.length > 0) {
      console.log('✅ Données déjà présentes dans la base');
      return true;
    }

    // Destinations
    const destinations = [
      { id: '1', name: 'Pékin', country: 'Chine', start_date: '2024-05-02', end_date: '2024-05-05', description: 'Capitale de la Chine, riche en histoire et culture' },
      { id: '2', name: 'Chongqing', country: 'Chine', start_date: '2024-05-05', end_date: '2024-05-09', description: 'Ville moderne avec des paysages spectaculaires' },
      { id: '3', name: 'Shanghai', country: 'Chine', start_date: '2024-05-11', end_date: '2024-05-16', description: 'Centre économique et financier de la Chine' },
      { id: '4', name: 'Tokyo', country: 'Japon', start_date: '2024-05-16', end_date: '2024-05-21', description: 'Capitale du Japon, mélange de tradition et modernité' },
      { id: '5', name: 'Kyoto & Osaka', country: 'Japon', start_date: '2024-05-25', end_date: '2024-05-29', description: 'Ancienne capitale et centre gastronomique' }
    ];

    const { error: destError } = await supabase.from('destinations').upsert(destinations);
    if (destError) throw destError;

    // Activités
    const activities = [
      { id: 'act-1', destination_id: '1', title: 'Vol vers Pékin', description: 'Départ le 1er mai, arrivée le 2 mai', date: '2024-05-01', time: '10:00', category: 'transport', cost: 800, currency: 'EUR', is_completed: false },
      { id: 'act-2', destination_id: '1', title: 'Visite de la Cité Interdite', description: 'Exploration du palais impérial', date: '2024-05-03', time: '09:00', category: 'sightseeing', cost: 60, currency: 'CNY', is_completed: false },
      { id: 'act-3', destination_id: '4', title: 'Temple Senso-ji', description: 'Visite du plus ancien temple de Tokyo', date: '2024-05-17', time: '14:00', category: 'sightseeing', cost: 0, currency: 'JPY', is_completed: false }
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
    console.log('❌ Configuration incomplète');
    console.log('💡 Suivez les instructions ci-dessus pour créer les tables');
  }
  
  return success;
}

export { runCompleteTest, testSupabaseConnection };