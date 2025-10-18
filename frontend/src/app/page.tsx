'use client';
import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<string>("Conectando...");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Testar conexão com o backend
    api.get("/ping")
      .then(res => {
        setApiStatus(`✅ ${res.data.message}`);
        setIsConnected(true);
      })
      .catch(err => {
        setApiStatus("❌ Backend offline");
        setIsConnected(false);
        console.error("Erro ao conectar com backend:", err);
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          🔥 Dungeons e Drogas
        </h1>

        <p className="text-xl text-gray-300">
          Sistema Narrativo Interativo de RPG com IA
        </p>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-semibold mb-4">Status do Ambiente</h2>

          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="font-mono text-sm">Frontend (Next.js)</span>
              <span className="text-green-400">✅ Online</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="font-mono text-sm">Backend (Express)</span>
              <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {apiStatus}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="font-mono text-sm">Firebase</span>
              <span className="text-yellow-400">⚙️ Configurar</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded">
              <span className="font-mono text-sm">Gemini API</span>
              <span className="text-yellow-400">⚙️ Configurar</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold mb-3">Próximos Passos</h3>
          <ol className="text-left space-y-2 text-sm text-gray-300">
            <li>1. Configurar projeto Firebase e adicionar credenciais em <code className="bg-black/50 px-2 py-1 rounded">.env.local</code></li>
            <li>2. Obter chave da API Gemini e configurar no backend</li>
            <li>3. Implementar autenticação de usuários</li>
            <li>4. Desenvolver interface de chat com Mestre Drogon</li>
          </ol>
        </div>

        <p className="text-sm text-gray-500">
          Ambiente de desenvolvimento configurado com sucesso! 🎲
        </p>
      </div>
    </main>
  );
}
