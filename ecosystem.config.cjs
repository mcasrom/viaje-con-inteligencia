module.exports = {
  apps: [{
    name: 'viajeinteligencia',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/viajeinteligencia',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '2G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/www/viajeinteligencia/logs/error.log',
    out_file: '/var/www/viajeinteligencia/logs/out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
  }]
};
