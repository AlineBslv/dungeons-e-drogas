/**
 * useTTS Hook - React hook para usar o sistema TTS
 */

import { useState, useEffect, useCallback } from 'react';
import { ttsManager, TTSSettings } from '@/lib/tts-manager';

export function useTTS() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [settings, setSettings] = useState<TTSSettings>(ttsManager.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Inicializa TTS ao montar
  useEffect(() => {
    const initTTS = async () => {
      const success = await ttsManager.init();
      setIsInitialized(success);

      if (success) {
        setVoices(ttsManager.getVoices());
      }
    };

    initTTS();
  }, []);

  // Polling para atualizar estado de fala
  useEffect(() => {
    const interval = setInterval(() => {
      setIsSpeaking(ttsManager.isSpeaking());
      setIsPaused(ttsManager.isPaused());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /**
   * Narra um texto
   */
  const speak = useCallback(async (text: string) => {
    await ttsManager.speak(text);
  }, []);

  /**
   * Para a narração
   */
  const stop = useCallback(() => {
    ttsManager.stop();
  }, []);

  /**
   * Pausa a narração
   */
  const pause = useCallback(() => {
    ttsManager.pause();
  }, []);

  /**
   * Retoma a narração
   */
  const resume = useCallback(() => {
    ttsManager.resume();
  }, []);

  /**
   * Atualiza configurações
   */
  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    ttsManager.updateSettings(newSettings);
    setSettings(ttsManager.getSettings());
  }, []);

  /**
   * Testa TTS
   */
  const test = useCallback(async () => {
    await ttsManager.test();
  }, []);

  return {
    // Estado
    isInitialized,
    isSpeaking,
    isPaused,
    settings,
    voices,

    // Métodos
    speak,
    stop,
    pause,
    resume,
    updateSettings,
    test,

    // Utilitários
    isSupported: (ttsManager.constructor as any).isSupported(),
  };
}

/**
 * Hook simplificado para apenas narrar
 */
export function useSpeakText() {
  const { speak, settings } = useTTS();

  return useCallback(
    async (text: string) => {
      if (settings.enabled) {
        await speak(text);
      }
    },
    [speak, settings.enabled]
  );
}
