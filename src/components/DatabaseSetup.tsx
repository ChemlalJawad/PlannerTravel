import React, { useState } from 'react';
import { Database, CheckCircle, XCircle, Loader2, Play, ExternalLink } from 'lucide-react';
import { runCompleteTest } from '../utils/supabaseSetupSimple';

const DatabaseSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    setLogs([]);

    // Capture console.log
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const capturedLogs: string[] = [];
    
    console.log = (...args) => {
      const message = args.join(' ');
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = '❌ ' + args.join(' ');
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalError(...args);
    };
    
    console.warn = (...args) => {
      const message = '⚠️ ' + args.join(' ');
      capturedLogs.push(message);
      setLogs(prev => [...prev, message]);
      originalWarn(...args);
    };

    try {
      const result = await runCompleteTest();
      setTestResult(result ?? false);
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setTestResult(false);
    } finally {
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Database className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configuration Base de Données</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Ce test va vérifier la connexion à Supabase et créer automatiquement toutes les tables nécessaires pour votre application de voyage.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Étapes du test :</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vérification de la connexion</li>
              <li>• Détection des tables existantes</li>
              <li>• Instructions pour créer les tables</li>
              <li>• Insertion des données initiales</li>
            </ul>
            
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir Supabase Dashboard
            </a>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Configuration actuelle :</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span>URL Supabase:</span>
                {import.meta.env.VITE_SUPABASE_URL ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Clé API:</span>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Lancer le test de connexion
            </>
          )}
        </button>
      </div>

      {/* Résultat du test */}
      {testResult !== null && (
        <div className={`p-4 rounded-lg mb-6 ${testResult ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {testResult ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Test réussi !</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Test échoué</span>
              </>
            )}
          </div>
          <p className={`text-sm ${testResult ? 'text-green-700' : 'text-red-700'}`}>
            {testResult 
              ? 'La base de données est configurée et prête à être utilisée.'
              : 'Vérifiez vos credentials et votre connexion réseau.'
            }
          </p>
        </div>
      )}

      {/* Logs du test */}
      {logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2">Console de test :</h3>
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseSetup;