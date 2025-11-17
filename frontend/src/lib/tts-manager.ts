/**
 * TTS Manager - Sistema de Text-to-Speech para narração do Drogon
 * Usa Web Speech API (nativo do browser) como primeira opção
 */

export interface TTSSettings {
  enabled: boolean;
  voice: string | null; // Nome da voz selecionada
  pitch: number; // 0.1 - 2.0 (padrão: 1.0)
  rate: number; // 0.1 - 10.0 (padrão: 1.0)
  volume: number; // 0.0 - 1.0 (padrão: 1.0)
  language: string; // 'pt-BR', 'en-US', etc.
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: true,
  voice: null,
  pitch: 1.0,
  rate: 0.9, // Ligeiramente mais lento para melhor compreensão
  volume: 0.8,
  language: 'pt-BR',
};

const STORAGE_KEY = 'dungeons-drogas-tts-settings';

class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: TTSSettings;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isInitialized = false;

  constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * Inicializa o sistema TTS
   */
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;

    // Verifica suporte
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Web Speech API não suportada neste browser');
      return false;
    }

    this.synth = window.speechSynthesis;

    // Carrega vozes
    await this.loadVoices();

    this.isInitialized = true;
    console.log('[TTS] Sistema inicializado com sucesso');
    return true;
  }

  /**
   * Carrega vozes disponíveis
   */
  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      // Tenta carregar vozes imediatamente
      let voices = this.synth.getVoices();

      if (voices.length > 0) {
        this.voices = voices;
        this.selectBestVoice();
        resolve();
        return;
      }

      // Aguarda evento onvoiceschanged (necessário em alguns browsers)
      this.synth.onvoiceschanged = () => {
        voices = this.synth!.getVoices();
        this.voices = voices;
        this.selectBestVoice();
        console.log(`[TTS] ${voices.length} vozes carregadas`);
        resolve();
      };

      // Timeout de segurança (5s)
      setTimeout(() => {
        if (this.voices.length === 0) {
          console.warn('[TTS] Timeout ao carregar vozes');
        }
        resolve();
      }, 5000);
    });
  }

  /**
   * Seleciona a melhor voz para o idioma configurado
   */
  private selectBestVoice(): void {
    if (this.voices.length === 0) return;

    // Se já tem voz configurada, tenta encontrá-la
    if (this.settings.voice) {
      const savedVoice = this.voices.find((v) => v.name === this.settings.voice);
      if (savedVoice) return;
    }

    // Tenta encontrar voz no idioma configurado
    const languageVoices = this.voices.filter((v) =>
      v.lang.startsWith(this.settings.language)
    );

    if (languageVoices.length > 0) {
      // Prefere vozes locais (melhor qualidade)
      const localVoice = languageVoices.find((v) => v.localService);
      this.settings.voice = (localVoice || languageVoices[0]).name;
    } else {
      // Fallback: primeira voz disponível
      this.settings.voice = this.voices[0].name;
    }

    this.saveSettings();
  }

  /**
   * Narra um texto
   */
  async speak(text: string): Promise<void> {
    if (!this.settings.enabled) {
      console.log('[TTS] Desabilitado, ignorando narração');
      return;
    }

    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) {
        console.warn('[TTS] Não foi possível inicializar');
        return;
      }
    }

    if (!this.synth) {
      console.warn('[TTS] Synth não disponível');
      return;
    }

    // Cancela narração anterior se houver
    this.stop();

    // Cria utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Configura voz
    if (this.settings.voice) {
      const voice = this.voices.find((v) => v.name === this.settings.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Configura parâmetros
    utterance.pitch = this.settings.pitch;
    utterance.rate = this.settings.rate;
    utterance.volume = this.settings.volume;
    utterance.lang = this.settings.language;

    // Event handlers
    utterance.onstart = () => {
      console.log('[TTS] Narração iniciada');
    };

    utterance.onend = () => {
      console.log('[TTS] Narração concluída');
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      console.error('[TTS] Erro na narração:', event.error);
      this.currentUtterance = null;
    };

    // Inicia narração
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Para a narração atual
   */
  stop(): void {
    if (!this.synth) return;

    if (this.synth.speaking) {
      this.synth.cancel();
    }

    this.currentUtterance = null;
  }

  /**
   * Pausa a narração
   */
  pause(): void {
    if (!this.synth || !this.synth.speaking) return;
    this.synth.pause();
  }

  /**
   * Retoma a narração pausada
   */
  resume(): void {
    if (!this.synth || !this.synth.paused) return;
    this.synth.resume();
  }

  /**
   * Retorna se está narrando
   */
  isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }

  /**
   * Retorna se está pausado
   */
  isPaused(): boolean {
    return this.synth?.paused || false;
  }

  /**
   * Retorna vozes disponíveis
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Retorna vozes filtradas por idioma
   */
  getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith(language));
  }

  /**
   * Retorna configurações atuais
   */
  getSettings(): TTSSettings {
    return { ...this.settings };
  }

  /**
   * Atualiza configurações
   */
  updateSettings(newSettings: Partial<TTSSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    this.saveSettings();
    console.log('[TTS] Configurações atualizadas:', this.settings);
  }

  /**
   * Carrega configurações do localStorage
   */
  private loadSettings(): TTSSettings {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return DEFAULT_SETTINGS;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('[TTS] Erro ao carregar configurações:', error);
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
      console.warn('[TTS] Erro ao salvar configurações:', error);
    }
  }

  /**
   * Testa a narração com um texto de exemplo
   */
  async test(): Promise<void> {
    const testText = 'Saudações, aventureiros! Eu sou o Mestre Drogon, seu narrador nesta jornada épica.';
    await this.speak(testText);
  }

  /**
   * Verifica se TTS está disponível
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }
}

// Singleton
export const ttsManager = new TTSManager();

// Exporta classe para testes
export default TTSManager;
