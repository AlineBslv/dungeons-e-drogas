'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GiDragonHead } from 'react-icons/gi';
import { FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { GiSwordman } from 'react-icons/gi';

export default function DashboardPage() {
  const { user, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <GiDragonHead className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const isMaster = userProfile.tier === 'mestre';

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <GiDragonHead className="w-16 h-16 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Bem-vindo, {userProfile.name}!</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg hover:bg-gray-800/70 transition-all"
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </button>
        </div>
      </motion.div>

      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-6">
            {isMaster ? (
              <FaUserShield className="w-24 h-24 text-purple-400" />
            ) : (
              <GiSwordman className="w-24 h-24 text-purple-400" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-300">
                  {isMaster ? '🧙 Mestre' : '🛡️ Jogador'}
                </span>
              </div>
              <p className="text-gray-400 mb-4">{userProfile.email}</p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Campanhas Ativas:</span>
                  <span className="font-semibold text-purple-300">
                    {userProfile.active_campaigns.length}
                  </span>
                </div>
                {userProfile.preferred_tone && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Tom Preferido:</span>
                    <span className="font-semibold text-purple-300 capitalize">
                      {userProfile.preferred_tone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto"
      >
        <h3 className="text-2xl font-bold mb-6">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isMaster ? (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer">
                <h4 className="text-xl font-semibold mb-2">🎭 Nova Campanha</h4>
                <p className="text-gray-400 text-sm">Crie uma nova aventura épica</p>
              </div>
              <div
                onClick={() => router.push('/chat')}
                className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer"
              >
                <h4 className="text-xl font-semibold mb-2">💬 Chat com Drogon</h4>
                <p className="text-gray-400 text-sm">Converse com o narrador IA</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer">
                <h4 className="text-xl font-semibold mb-2">📚 Base Cognitiva</h4>
                <p className="text-gray-400 text-sm">Consulte regras e lore de D&D</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer">
                <h4 className="text-xl font-semibold mb-2">🗡️ Minhas Campanhas</h4>
                <p className="text-gray-400 text-sm">Veja suas aventuras ativas</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer">
                <h4 className="text-xl font-semibold mb-2">📜 Fichas de Personagem</h4>
                <p className="text-gray-400 text-sm">Gerencie seus personagens</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 transition-all cursor-pointer">
                <h4 className="text-xl font-semibold mb-2">🎲 Rolagens Rápidas</h4>
                <p className="text-gray-400 text-sm">Role dados virtualmente</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Coming Soon Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-7xl mx-auto mt-12 text-center"
      >
        <div className="bg-purple-900/30 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
          <p className="text-gray-400">
            🚧 Dashboard em construção • Mais funcionalidades em breve
          </p>
        </div>
      </motion.div>
    </main>
  );
}
