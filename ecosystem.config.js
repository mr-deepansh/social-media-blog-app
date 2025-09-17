export default {
  apps: [
    {
      name: "social-media-blog-app",
      script: "./src/server.js",
      instances: "max", // Use all CPU cores
      exec_mode: "cluster",

      // Environment configurations
      env: {
        NODE_ENV: "development",
        PORT: 5000,
        NODE_OPTIONS: "--max-old-space-size=4096 --enable-source-maps",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        NODE_OPTIONS: "--max-old-space-size=8192 --enable-source-maps --optimize-for-size",
      },

      // Performance settings for millions of users
      max_memory_restart: "2G",
      min_uptime: "10s",
      max_restarts: 10,
      autorestart: true,
      watch: false,
      ignore_watch: ["node_modules", "logs", "uploads"],

      // Logging configuration
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      merge_logs: true,
      time: true,

      // Advanced settings
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      wait_ready: true,

      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // Node.js specific optimizations
      node_args: [
        "--max-old-space-size=8192",
        "--max-semi-space-size=128",
        "--optimize-for-size",
        "--gc-interval=60",
        "--enable-source-maps",
      ],

      // Process management
      increment_var: "PORT",
      combine_logs: true,
      force: true,

      // Monitoring
      pmx: true,
      automation: false,
      vizion: false,

      // Advanced cluster settings
      instance_var: "INSTANCE_ID",
      exec_interpreter: "node",
      exec_mode: "cluster_mode",

      // Resource limits
      max_memory_restart: "2G",
      restart_delay: 4000,

      // Production optimizations
      source_map_support: true,
      disable_source_map_support: false,

      // Graceful shutdown
      kill_timeout: 5000,
      shutdown_with_message: true,
      wait_ready: true,
      listen_timeout: 3000,
    },
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: "deploy",
      host: ["server1.example.com", "server2.example.com"],
      ref: "origin/main",
      repo: "git@github.com:mr-deepansh/social-media-blog-app.git",
      path: "/var/www/social-media-blog-app",
      "post-deploy": "npm install --production && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "apt update && apt install git -y",
    },
  },
};
