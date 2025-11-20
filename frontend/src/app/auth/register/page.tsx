'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserTier } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GiDragonHead, GiSwordman } from 'react-icons/gi';
import { FaUserShield } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
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
                Criar Conta
              </CardTitle>
              <CardDescription className="text-muted-foreground font-lore">
                Comece sua aventura épica
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
                  <Label htmlFor="name" className="block text-sm font-medium text-foreground font-medieval">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-sm font-medium text-foreground font-medieval">
                    Email
                  </Label>
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
                  <Label htmlFor="password" className="block text-sm font-medium text-foreground font-medieval">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground font-medieval">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {/* User Tier Selection */}
                <div className="space-y-3">
                  <Label className="block text-sm font-medium text-foreground font-medieval">
                    Escolha seu papel
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setTier('mestre')}
                      className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                        tier === 'mestre'
                          ? 'border-primary bg-primary/20 shadow-glow'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <FaUserShield className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm font-medieval">Mestre</p>
                      <p className="text-xs text-muted-foreground mt-1 font-lore">Narro aventuras</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTier('jogador')}
                      className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                        tier === 'jogador'
                          ? 'border-primary bg-primary/20 shadow-glow'
                          : 'border-border bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <GiSwordman className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="font-semibold text-sm font-medieval">Jogador</p>
                      <p className="text-xs text-muted-foreground mt-1 font-lore">Vivo aventuras</p>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full font-medieval"
                  size="lg"
                >
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4 text-sm text-muted-foreground font-lore">ou</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm font-lore">
                  Já tem uma conta?{' '}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Fazer login
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
