/**
 * STT Manager - Sistema de Speech-to-Text para entrada de voz
 * Usa Web Speech API (nativo do browser)
 */

export interface STTSettings {
  enabled: boolean;
  language: string; // 'pt-BR', 'en-US', etc.
  continuous: boolean; // Reconhecimento contínuo
  interimResults: boolean; // Resultados parciais
  maxAlternatives: number; // Número de alternativas
}

const DEFAULT_SETTINGS: STTSettings = {
  enabled: true,
  language: 'pt-BR',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
};

const STORAGE_KEY = 'dungeons-drogas-stt-settings';

// Define tipo para SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type STTCallback = (transcript: string, isFinal: boolean) => void;
export type STTErrorCallback = (error: string) => void;

class STTManager {
  private recognition: any = null;
  private settings: STTSettings;
  private isInitialized = false;
  private isListening = false;
  private onResult: STTCallback | null = null;
  private onError: STTErrorCallback | null = null;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Inicializa o sistema STT
   */
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    // Verifica suporte
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[STT] Web Speech API não suportada neste browser');
      return false;
    }

    // Cria instância
    this.recognition = new SpeechRecognition();

    // Configura
    this.recognition.lang = this.settings.language;
    this.recognition.continuous = this.settings.continuous;
    this.recognition.interimResults = this.settings.interimResults;
    this.recognition.maxAlternatives = this.settings.maxAlternatives;

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('[STT] Reconhecimento iniciado');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('[STT] Reconhecimento encerrado');
    };

    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const isFinal = lastResult.isFinal;

      console.log(`[STT] Resultado: "${transcript}" (${isFinal ? 'final' : 'parcial'})`);

      if (this.onResult) {
        this.onResult(transcript, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('[STT] Erro:', event.error);
      this.isListening = false;

      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.isInitialized = true;
    console.log('[STT] Sistema inicializado com sucesso');
    return true;
  }

  /**
   * Inicia o reconhecimento de voz
   */
  async start(
    onResult: STTCallback,
    onError?: STTErrorCallback
  ): Promise<boolean> {
    if (!this.settings.enabled) {
      console.log('[STT] Desabilitado, ignorando');
      return false;
    }

    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    if (this.isListening) {
      console.warn('[STT] Já está escutando');
      return false;
    }

    this.onResult = onResult;
    this.onError = onError || null;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[STT] Erro ao iniciar:', error);
      return false;
    }
  }

  /**
   * Para o reconhecimento de voz
   */
  stop(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('[STT] Erro ao parar:', error);
    }
  }

  /**
   * Cancela o reconhecimento de voz (sem processar resultados)
   */
  abort(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.abort();
    } catch (error) {
      console.error('[STT] Erro ao cancelar:', error);
    }
  }

  /**
   * Retorna se está escutando
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Retorna configurações atuais
   */
  getSettings(): STTSettings {
    return { ...this.settings };
  }

  /**
   * Atualiza configurações
   */
  updateSettings(newSettings: Partial<STTSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    // Atualiza recognition se já inicializado
    if (this.recognition) {
      this.recognition.lang = this.settings.language;
      this.recognition.continuous = this.settings.continuous;
      this.recognition.interimResults = this.settings.interimResults;
      this.recognition.maxAlternatives = this.settings.maxAlternatives;
    }

    this.saveSettings();
    console.log('[STT] Configurações atualizadas:', this.settings);
  }

  /**
   * Carrega configurações do localStorage
   */
  private loadSettings(): STTSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_SETTINGS;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('[STT] Erro ao carregar configurações:', error);
    }

    return { ...DEFAULT_SETTINGS };
  }

  /**
   * Salva configurações no localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('[STT] Erro ao salvar configurações:', error);
    }
  }

  /**
   * Verifica se STT está disponível
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

// Singleton
export const sttManager = new STTManager();

// Exporta classe para testes
export default STTManager;
