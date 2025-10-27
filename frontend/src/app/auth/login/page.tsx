'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GiDragonHead } from 'react-icons/gi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-grimoire border-primary/30 shadow-arcane relative overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>

          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>

          <div className="relative z-10">
            {/* Header */}
            <CardHeader className="text-center pb-8">
              <GiDragonHead className="w-20 h-20 text-primary mx-auto mb-4 animate-pulse text-glow-gold" />
              <CardTitle className="text-3xl font-medieval text-metallic-gold mb-2">
                Bem-vindo de Volta
              </CardTitle>
              <CardDescription className="text-muted-foreground font-lore">
                Entre para continuar sua jornada
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive-foreground text-sm font-lore">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground font-medieval">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-foreground font-medieval">
                    Senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-medieval"
                  size="lg"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4 text-sm text-muted-foreground font-lore">ou</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-lore">
                  Não tem uma conta?{' '}
                  <Link href="/auth/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Criar conta
                  </Link>
                </p>
              </div>

              {/* Back to Home */}
              <div className="text-center">
                <Link href="/" className="text-muted-foreground/70 hover:text-muted-foreground text-sm font-lore transition-colors">
                  ← Voltar para home
                </Link>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
