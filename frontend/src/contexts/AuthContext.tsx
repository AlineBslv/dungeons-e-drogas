'use client';

/**
 * AuthContext - Context de Autenticação
 * Gerencia estado de usuário e funções de auth
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Tipos de usuário
export type UserTier = 'mestre' | 'jogador';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  tier: UserTier;
  active_campaigns: string[];
  preferred_tone?: 'epic' | 'casual' | 'horror';
  created_at: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, tier: UserTier) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar perfil do Firestore
  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Registro
  const signUp = async (email: string, password: string, name: string, tier: UserTier) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar display name
      await updateProfile(user, { displayName: name });

      // Criar perfil no Firestore
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        tier,
        active_campaigns: [],
        created_at: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Erro no logout:', error);
      throw new Error(error.message || 'Erro ao sair');
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
