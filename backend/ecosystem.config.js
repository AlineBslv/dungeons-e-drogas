/**
 * PM2 Ecosystem Configuration - Dungeons e Drogas
 * Configuração para manter o backend sempre rodando em produção
 */

module.exports = {
  apps: [
    {
      name: 'dungeons-drogas-backend',
      script: './index.js',
      instances: 1, // Pode aumentar para usar múltiplos cores (ex: 'max')
      exec_mode: 'cluster',
      watch: false, // Em produção, não queremos auto-reload
      max_memory_restart: '500M', // Reinicia se ultrapassar 500MB
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
      },

      // Restart automático em caso de falha
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Restart graceful
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/dungeons-drogas.git',
      path: '/var/www/dungeons-drogas',
      'post-deploy': 'cd backend && npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
