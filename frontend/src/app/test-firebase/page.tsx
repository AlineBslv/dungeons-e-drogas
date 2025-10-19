'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';

export default function TestFirebasePage() {
  const [results, setResults] = useState({
    auth: '⏳ Testando...',
    firestore: '⏳ Testando...',
    storage: '⏳ Testando...',
    config: '⏳ Verificando...'
  });

  useEffect(() => {
    async function testFirebase() {
      const newResults: any = {};

      // Test Auth
      try {
        await auth.authStateReady();
        newResults.auth = '✅ Firebase Auth conectado';
      } catch (error: any) {
        newResults.auth = `❌ Auth Error: ${error.message}`;
      }

      // Test Firestore
      try {
        await db.app.automaticDataCollectionEnabled;
        newResults.firestore = '✅ Firestore conectado';
      } catch (error: any) {
        newResults.firestore = `❌ Firestore Error: ${error.message}`;
      }

      // Test Storage
      try {
        const bucket = storage.app.options.storageBucket;
        newResults.storage = `✅ Storage conectado: ${bucket}`;
      } catch (error: any) {
        newResults.storage = `❌ Storage Error: ${error.message}`;
      }

      // Check Config
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓' : '✗',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓' : '✗',
      };

      newResults.config = JSON.stringify(config, null, 2);

      setResults(newResults);
    }

    testFirebase();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔥 Firebase Connection Test</h1>

        <div className="space-y-6">
          {/* Auth Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Firebase Authentication</h2>
            <p className="font-mono text-sm">{results.auth}</p>
          </div>

          {/* Firestore Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Firestore Database</h2>
            <p className="font-mono text-sm">{results.firestore}</p>
          </div>

          {/* Storage Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Firebase Storage</h2>
            <p className="font-mono text-sm">{results.storage}</p>
          </div>

          {/* Config */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
            <pre className="font-mono text-xs bg-black/50 p-4 rounded overflow-auto">
              {results.config}
            </pre>
          </div>

          {/* Instructions */}
          <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">⚠️ Se houver erro auth/configuration-not-found:</h2>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Acesse: <a href="https://console.firebase.google.com/project/dungeons-e-drogas/authentication/providers" target="_blank" className="text-purple-400 underline">Firebase Console → Authentication</a></li>
              <li>Clique em <strong>"Sign-in method"</strong> ou <strong>"Métodos de login"</strong></li>
              <li>Ative o provedor <strong>"Email/Password"</strong> (Email/Senha)</li>
              <li>Clique em <strong>"Enable"</strong> (Ativar)</li>
              <li>Salve as alterações</li>
              <li>Volte aqui e recarregue a página</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-purple-400 hover:text-purple-300">
            ← Voltar para home
          </a>
        </div>
      </div>
    </main>
  );
}
