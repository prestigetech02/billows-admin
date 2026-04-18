module.exports = {
  apps: [{
    name: 'billows-admin',
    // Standard Next.js mode - use next start
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3001',
    cwd: '/www/wwwroot/billows_admin',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/www/wwwroot/billows_admin/logs/err.log',
    out_file: '/www/wwwroot/billows_admin/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}

