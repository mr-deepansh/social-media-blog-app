# 🚀 PM2 Setup Guide

## 📦 Installation

```bash
# Install PM2 globally (recommended)
npm install -g pm2

# Or install locally (already added to package.json)
npm install pm2
```

## ⚙️ Configuration

PM2 configuration is in `ecosystem.config.js`:

```javascript
{
  name: 'social-media-blog-app',
  script: './src/server.js',
  instances: 'max',           // Use all CPU cores
  exec_mode: 'cluster',       // Cluster mode for load balancing
  max_memory_restart: '1G',   // Restart if memory exceeds 1GB
  autorestart: true,          // Auto restart on crash
  watch: false,               // Disable file watching in production
  env: {
    NODE_ENV: 'development',
    PORT: 5000
  },
  env_production: {
    NODE_ENV: 'production',
    PORT: 5000
  }
}
```

## 🎯 Usage Commands

### Start Application

```bash
# Start with ecosystem config
npm run pm2:start

# Or directly
pm2 start ecosystem.config.js
```

### Monitor Application

```bash
# View status
npm run pm2:status

# View logs
npm run pm2:logs

# Real-time monitoring
npm run pm2:monit
```

### Manage Application

```bash
# Restart (with downtime)
npm run pm2:restart

# Reload (zero downtime)
npm run pm2:reload

# Stop application
npm run pm2:stop

# Delete from PM2
npm run pm2:delete
```

### Production Deployment

```bash
# Start in production mode
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## 📊 Monitoring Features

### Real-time Dashboard

```bash
pm2 monit
```

### Log Management

```bash
# View all logs
pm2 logs

# View specific app logs
pm2 logs social-media-blog-app

# Clear logs
pm2 flush
```

### Process Information

```bash
# Detailed process info
pm2 show social-media-blog-app

# Process list
pm2 list
```

## 🔧 Advanced Configuration

### Memory & CPU Limits

```javascript
{
  max_memory_restart: '1G',
  node_args: '--max-old-space-size=1024',
  instances: 'max'  // or specific number like 4
}
```

### Log Configuration

```javascript
{
  log_date_format: 'YYYY-MM-DD HH:mm Z',
  error_file: './logs/pm2-error.log',
  out_file: './logs/pm2-out.log',
  log_file: './logs/pm2-combined.log'
}
```

### Environment Variables

```javascript
{
  env: {
    NODE_ENV: 'development',
    PORT: 5000
  },
  env_production: {
    NODE_ENV: 'production',
    PORT: 5000
  }
}
```

## 🚀 Quick Start

1. **Install PM2**:

   ```bash
   npm install -g pm2
   ```

2. **Start Application**:

   ```bash
   npm run pm2:start
   ```

3. **Check Status**:

   ```bash
   npm run pm2:status
   ```

4. **View Logs**:
   ```bash
   npm run pm2:logs
   ```

## 🔄 Auto-restart on System Boot

```bash
# Generate startup script
pm2 startup

# Save current PM2 processes
pm2 save
```

## 📈 Performance Benefits

- ✅ **Zero Downtime Deployment** with `pm2 reload`
- ✅ **Load Balancing** across CPU cores
- ✅ **Auto Restart** on crashes
- ✅ **Memory Management** with automatic restarts
- ✅ **Log Management** with rotation
- ✅ **Process Monitoring** with real-time metrics

## 🛠️ Troubleshooting

### Common Issues

```bash
# If PM2 daemon not responding
pm2 kill
pm2 start ecosystem.config.js

# Check PM2 version
pm2 --version

# Update PM2
npm install -g pm2@latest
pm2 update
```

### Log Locations

- Error logs: `./logs/pm2-error.log`
- Output logs: `./logs/pm2-out.log`
- Combined logs: `./logs/pm2-combined.log`

Ready for production! 🎉
