module.exports = {
  apps: [{
    name: "viajeinteligencia",
    cwd: "/var/www/viajeinteligencia",
    script: "npm",
    args: "start -- --port 3000",
    env: { NODE_ENV: "production", PORT: "3000" },
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    autorestart: true,
    watch: false,
  }],
};
