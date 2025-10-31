'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeProvider - Aplica tema visual dinâmico baseado na preferência do usuário
 *
 * Quando visualTheme='horror', aplica data-tone="horror" no HTML para ativar
 * a paleta de cores roxa/verde/vermelha do tema Halloween
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { visualTheme, isHalloween } = useTheme();

  useEffect(() => {
    const htmlElement = document.documentElement;

    console.log('🎨 [ThemeProvider] Aplicando tema visual:', {
      visualTheme,
      isHalloween
    });

    if (isHalloween) {
      // Aplica data-tone="horror" no HTML para CSS selectors
      htmlElement.setAttribute('data-tone', 'horror');
      console.log('🎃 [ThemeProvider] TEMA HALLOWEEN ATIVADO! Paleta roxa/verde/vermelha aplicada');
    } else {
      // Remove data-tone para voltar ao tema padrão
      htmlElement.removeAttribute('data-tone');
      console.log('✨ [ThemeProvider] Tema padrão (medieval dourado) aplicado');
    }
  }, [visualTheme, isHalloween]);

  return <>{children}</>;
}
