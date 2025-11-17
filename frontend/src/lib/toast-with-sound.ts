/**
 * Toast com Som - Wrapper para Sonner com feedback auditivo automático
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';
import { audioManager } from './audio-manager';

/**
 * Toca som de toast de forma assíncrona (não bloqueia)
 */
async function playToastSound(type: 'success' | 'error' | 'info' | 'warning') {
  try {
    // Mapear tipo de toast para som
    const soundMap = {
      success: 'success',
      error: 'error',
      info: 'notification',
      warning: 'notification',
    };

    const soundName = soundMap[type];
    const volume = type === 'error' ? 0.6 : type === 'success' ? 0.7 : 0.5;

    // Tocar som de forma não-bloqueante
    audioManager.play(soundName, {
      category: 'sfx',
      volume,
    }).catch((err) => {
      // Falha silenciosa - não queremos que erro de áudio quebre o toast
      console.warn('[ToastWithSound] Erro ao tocar som:', err);
    });
  } catch (error) {
    // Falha silenciosa
    console.warn('[ToastWithSound] Erro ao configurar som:', error);
  }
}

/**
 * Toast com som de sucesso
 */
export function success(message: string, data?: ExternalToast) {
  playToastSound('success');
  return sonnerToast.success(message, data);
}

/**
 * Toast com som de erro
 */
export function error(message: string, data?: ExternalToast) {
  playToastSound('error');
  return sonnerToast.error(message, data);
}

/**
 * Toast com som de informação
 */
export function info(message: string, data?: ExternalToast) {
  playToastSound('info');
  return sonnerToast.info(message, data);
}

/**
 * Toast com som de aviso
 */
export function warning(message: string, data?: ExternalToast) {
  playToastSound('warning');
  return sonnerToast.warning(message, data);
}

/**
 * Toast padrão (sem tipo específico) com som
 */
export function message(message: string, data?: ExternalToast) {
  playToastSound('info');
  return sonnerToast(message, data);
}

/**
 * Toast de promessa (loading -> success/error) com sons
 */
export function promise<T>(
  promise: Promise<T>,
  {
    loading,
    success: successMessage,
    error: errorMessage,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  return sonnerToast.promise(promise, {
    loading,
    success: (data) => {
      playToastSound('success');
      return typeof successMessage === 'function'
        ? successMessage(data)
        : successMessage;
    },
    error: (err) => {
      playToastSound('error');
      return typeof errorMessage === 'function'
        ? errorMessage(err)
        : errorMessage;
    },
  });
}

/**
 * Toast customizado sem som automático (para casos especiais)
 */
export function custom(component: (id: string | number) => React.ReactElement, data?: ExternalToast) {
  return sonnerToast.custom(component, data);
}

/**
 * Dispensa um toast específico
 */
export function dismiss(toastId?: string | number) {
  return sonnerToast.dismiss(toastId);
}

/**
 * Toast com carregamento
 */
export function loading(message: string, data?: ExternalToast) {
  return sonnerToast.loading(message, data);
}

/**
 * Exporta como objeto com todas as funções (compatível com uso import * as toast)
 */
export const toast = {
  success,
  error,
  info,
  warning,
  message,
  promise,
  custom,
  dismiss,
  loading,
};

// Exportação default para compatibilidade
export default toast;
