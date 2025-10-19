'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserTier } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GiDragonHead } from 'react-icons/gi';
import { FaUserShield } from 'react-icons/fa';
import { GiSwordman } from 'react-icons/gi';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tier, setTier] = useState<UserTier>('jogador');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, tier);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <GiDragonHead className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-400">Comece sua aventura épica</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* User Tier Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Escolha seu papel</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTier('mestre')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tier === 'mestre'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/30 bg-gray-900/50 hover:border-purple-500/50'
                  }`}
                >
                  <FaUserShield className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="font-semibold text-sm">Mestre</p>
                  <p className="text-xs text-gray-400 mt-1">Narro aventuras</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('jogador')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tier === 'jogador'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/30 bg-gray-900/50 hover:border-purple-500/50'
                  }`}
                >
                  <GiSwordman className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <p className="font-semibold text-sm">Jogador</p>
                  <p className="text-xs text-gray-400 mt-1">Vivo aventuras</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-purple-500/30"></div>
            <span className="px-4 text-sm text-gray-400">ou</span>
            <div className="flex-1 border-t border-purple-500/30"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                Fazer login
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
              ← Voltar para home
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
