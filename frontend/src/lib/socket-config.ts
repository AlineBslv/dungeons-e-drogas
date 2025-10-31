/**
 * Socket.io Configuration - Dungeons e Drogas
 * Configurações centralizadas para conexão WebSocket
 */

export const SOCKET_CONFIG = {
  // URL do backend
  url: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',

  // Configurações de reconexão
  reconnection: true,
  reconnectionAttempts: Infinity, // Tenta reconectar indefinidamente
  reconnectionDelay: 2000, // 2 segundos
  reconnectionDelayMax: 10000, // Máximo 10 segundos
  randomizationFactor: 0.5, // Randomiza o delay para evitar thundering herd

  // Timeouts
  timeout: 20000, // 20 segundos para conexão inicial
  connectTimeout: 30000,

  // Transports (ordem de preferência)
  transports: ['websocket', 'polling'],

  // Auto-connect
  autoConnect: true,

  // Upgrade automático para WebSocket se possível
  upgrade: true,
  upgradeTimeout: 10000,

  // Ping/Pong (mantém conexão viva)
  pingInterval: 25000,
  pingTimeout: 60000,

  // Produção vs Desenvolvimento
  forceNew: process.env.NODE_ENV === 'production',

  // Path customizado (se necessário)
  path: '/socket.io/',
};

/**
 * Opções de autenticação
 */
export function getAuthOptions(token: string) {
  return {
    auth: { token },
  };
}

/**
 * Configuração completa do Socket.io
 */
export function getSocketConfig(token: string) {
  return {
    ...SOCKET_CONFIG,
    ...getAuthOptions(token),
  };
}
