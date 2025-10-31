/**
 * Health Check Monitor - Dungeons e Drogas
 * Script para monitorar a saúde do servidor
 */

const http = require('http');

const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:4000/health';
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 30000; // 30 segundos
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Discord/Slack webhook (opcional)

let consecutiveFailures = 0;
const MAX_FAILURES = 3;

/**
 * Verifica a saúde do servidor
 */
async function checkHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(HEALTH_URL);

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data);
            resolve(health);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Envia alerta via webhook
 */
async function sendAlert(message, isError = true) {
  if (!WEBHOOK_URL) return;

  const payload = {
    content: isError ? '🚨 **ALERTA** 🚨' : '✅ **RECUPERADO** ✅',
    embeds: [{
      title: 'Dungeons e Drogas - Backend Monitor',
      description: message,
      color: isError ? 16711680 : 65280, // Vermelho ou Verde
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options);
    req.write(JSON.stringify(payload));
    req.end();
  } catch (error) {
    console.error('Erro ao enviar alerta:', error.message);
  }
}

/**
 * Loop de monitoramento
 */
async function monitor() {
  try {
    const health = await checkHealth();

    console.log(`✅ [${new Date().toISOString()}] Servidor saudável`);
    console.log(`   Uptime: ${Math.floor(health.uptime)}s`);
    console.log(`   Firebase: ${health.services.firebase ? '✅' : '❌'}`);
    console.log(`   Socket.io: ${health.services.socketio ? '✅' : '❌'}`);

    // Recuperação após falhas
    if (consecutiveFailures >= MAX_FAILURES) {
      const message = `Servidor recuperado após ${consecutiveFailures} falhas consecutivas`;
      console.log(`✅ ${message}`);
      await sendAlert(message, false);
    }

    consecutiveFailures = 0;

  } catch (error) {
    consecutiveFailures++;
    const message = `Falha ${consecutiveFailures}/${MAX_FAILURES}: ${error.message}`;

    console.error(`❌ [${new Date().toISOString()}] ${message}`);

    // Envia alerta apenas após múltiplas falhas
    if (consecutiveFailures === MAX_FAILURES) {
      await sendAlert(`Servidor não está respondendo!\n${message}`, true);
    }
  }
}

// Inicia monitoramento
console.log('🔍 Iniciando monitor de saúde...');
console.log(`   URL: ${HEALTH_URL}`);
console.log(`   Intervalo: ${CHECK_INTERVAL}ms`);
console.log(`   Webhook: ${WEBHOOK_URL ? 'Configurado' : 'Não configurado'}`);
console.log('');

// Primeira verificação imediata
monitor();

// Verificações periódicas
setInterval(monitor, CHECK_INTERVAL);
