/**
 * useSTT Hook - React hook para usar o sistema STT (Speech-to-Text)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sttManager, STTSettings, STTCallback, STTErrorCallback } from '@/lib/stt-manager';

export function useSTT() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<STTSettings>(sttManager.getSettings());

  // Refs para callbacks
  const onResultRef = useRef<STTCallback | null>(null);
  const onErrorRef = useRef<STTErrorCallback | null>(null);

  // Inicializa STT ao montar
  useEffect(() => {
    const initSTT = async () => {
      const success = await sttManager.init();
      setIsInitialized(success);
    };

    initSTT();
  }, []);

  // Polling para atualizar estado de listening
  useEffect(() => {
    const interval = setInterval(() => {
      setIsListening(sttManager.getIsListening());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  /**
   * Inicia o reconhecimento de voz
   */
  const startListening = useCallback(
    async (onResult?: STTCallback, onError?: STTErrorCallback) => {
      setError(null);
      setTranscript('');
      setInterimTranscript('');

      // Salva callbacks
      onResultRef.current = onResult || null;
      onErrorRef.current = onError || null;

      // Handler interno
      const handleResult: STTCallback = (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimTranscript('');
        } else {
          setInterimTranscript(text);
        }

        // Chama callback externo
        if (onResultRef.current) {
          onResultRef.current(text, isFinal);
        }
      };

      // Handler de erro interno
      const handleError: STTErrorCallback = (errorMsg) => {
        setError(errorMsg);
        setIsListening(false);

        // Chama callback externo
        if (onErrorRef.current) {
          onErrorRef.current(errorMsg);
        }
      };

      const started = await sttManager.start(handleResult, handleError);
      if (started) {
        setIsListening(true);
      }
    },
    []
  );

  /**
   * Para o reconhecimento de voz
   */
  const stopListening = useCallback(() => {
    sttManager.stop();
  }, []);

  /**
   * Cancela o reconhecimento de voz
   */
  const abortListening = useCallback(() => {
    sttManager.abort();
    setTranscript('');
    setInterimTranscript('');
  }, []);

  /**
   * Atualiza configurações
   */
  const updateSettings = useCallback((newSettings: Partial<STTSettings>) => {
    sttManager.updateSettings(newSettings);
    setSettings(sttManager.getSettings());
  }, []);

  return {
    // Estado
    isInitialized,
    isListening,
    transcript,
    interimTranscript,
    error,
    settings,

    // Métodos
    startListening,
    stopListening,
    abortListening,
    updateSettings,

    // Utilitários
    isSupported: (sttManager.constructor as any).isSupported(),
  };
}

/**
 * Hook simplificado para transcrição rápida
 */
export function useVoiceInput(onTranscript: (text: string) => void) {
  const { startListening, stopListening, isListening } = useSTT();

  const toggle = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening((text, isFinal) => {
        if (isFinal) {
          onTranscript(text);
        }
      });
    }
  }, [isListening, startListening, stopListening, onTranscript]);

  return {
    isListening,
    toggle,
    start: () => startListening((text, isFinal) => {
      if (isFinal) onTranscript(text);
    }),
    stop: stopListening,
  };
}
