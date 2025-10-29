# 🚀 EndlessChat Server - Startup & Management Guide

Complete guide for starting, stopping, monitoring, and managing the EndlessChat server using PM2 and npm scripts.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Development Mode](#-development-mode)
- [Production Mode](#-production-mode)
- [PM2 Management](#-pm2-management)
- [Monitoring & Logs](#-monitoring--logs)
- [Troubleshooting](#-troubleshooting)
- [Health Checks](#-health-checks)
- [Best Practices](#-best-practices)

---

## ⚡ Quick Start

### Prerequisites

```bash
# Ensure you have Node.js 20+ and npm 10+
node --version  # Should be v20.0.0 or higher
npm --version   # Should be 10.0.0 or higher

# Install PM2 globally (optional but recommended)
npm install -g pm2
```

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start Redis (using Docker)
npm run docker:up

# 4. Start the server
npm run dev          # Development mode
# OR
npm run prod:full    # Production mode with PM2
```

---

## 🛠️ Development Mode

### Start Development Server

```bash
# Start with auto-reload (nodemon)
npm run dev

# Start with clean port (kills existing process on port 5000)
npm run dev:clean
```

**Features:**

- ✅ HTTP server on `http://localhost:5000`
- ✅ Auto-reload on file changes (nodemon)
- ✅ Detailed console logging
- ✅ `NODE_ENV=development`

**Access Points:**

- Health: `http://localhost:5000/health`
- API: `http://localhost:5000/api/v2`
- Network: `http://192.168.x.x:5000` (your local IP)

---

## 🏭 Production Mode

### Option 1: Simple Production (No PM2)

```bash
# Start production server directly
npm start

# OR with logging
npm run prod:simple
```

### Option 2: PM2 Production (Recommended)

```bash
# Start with PM2 (recommended)
npm run prod:full

# OR force clean start
npm run prod:force

# OR clean start (kills port + PM2)
npm run prod:clean
```

**Features:**

- ✅ HTTPS server on `https://192.168.x.x:5000`
- ✅ Process management with PM2
- ✅ Auto-restart on crashes
- ✅ `NODE_ENV=production`
- ✅ Production logging with Winston

**Access Points:**

- Health: `https://192.168.x.x:5000/health`
- API: `https://192.168.x.x:5000/api/v2`

---

## 🎛️ PM2 Management

### Cluster Mode vs Fork Mode

**Current Configuration**: Fork Mode (1 instance)

```bash
# Check current mode and instances
pm2 list
# Shows: mode: fork, instances: 1

# View detailed cluster info
pm2 show social-media-blog-app
```

**To Enable Cluster Mode** (Multiple CPU cores):

Edit `ecosystem.config.cjs`:

```javascript
instances: "max",        // Use all CPU cores
// OR
instances: 4,            // Use 4 instances
exec_mode: "cluster",   // Change from "fork" to "cluster"
```

Then restart:

```bash
npm run prod:force
```

**Cluster Mode Benefits**:

- ✅ Load balancing across CPU cores
- ✅ Zero-downtime reload
- ✅ Better performance for high traffic
- ✅ Automatic failover

**View Cluster Instances**:

```bash
pm2 list
# Shows multiple instances:
# 0  │ social-media-blog-app
# 1  │ social-media-blog-app
# 2  │ social-media-blog-app
# 3  │ social-media-blog-app

# Scale instances dynamically
pm2 scale social-media-blog-app 8  # Scale to 8 instances
pm2 scale social-media-blog-app +2 # Add 2 more instances
pm2 scale social-media-blog-app -1 # Remove 1 instance
```

### Start/Stop/Restart

```bash
# Start server with PM2
npm run pm2:start
# OR
pm2 start ecosystem.config.cjs --env production

# Stop server
npm run pm2:stop
# OR
pm2 stop social-media-blog-app

# Restart server
npm run pm2:restart
# OR
pm2 restart social-media-blog-app

# Reload (zero-downtime restart)
npm run prod:reload
# OR
pm2 reload social-media-blog-app

# Delete/Remove from PM2
npm run pm2:delete
# OR
pm2 delete social-media-blog-app

# Delete all PM2 processes
pm2 delete all
```

### PM2 Status & Info

```bash
# View all PM2 processes
npm run pm2:status
# OR
pm2 status
# OR
pm2 list

# View cluster instances
pm2 list
# Shows all running instances with IDs (0, 1, 2, 3...)

# Check CPU count (max instances possible)
echo %NUMBER_OF_PROCESSORS%  # Windows
# OR
nproc  # Linux/Mac

# Detailed info about app
npm run pm2:show
# OR
pm2 show social-media-blog-app

# View environment variables
npm run prod:env
# OR
pm2 env 0

# Describe process
npm run prod:describe
# OR
pm2 describe social-media-blog-app
```

**Example Output:**

```
┌────┬──────────────────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name                     │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │
├────┼──────────────────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ social-media-blog-app    │ 2.0.0   │ fork    │ 12345    │ 5m     │ 0    │ online    │ 0.5%     │ 85.2mb   │
└────┴──────────────────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┘
```

---

## 🔄 Cluster Management

### Check Current Configuration

```bash
# View current instances
pm2 list

# Check CPU cores available
echo %NUMBER_OF_PROCESSORS%  # Windows (e.g., 16 cores)

# Detailed cluster info
pm2 show social-media-blog-app
```

### Enable Cluster Mode

**Step 1**: Edit `ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [
    {
      name: "social-media-blog-app",
      script: "./src/server.js",
      instances: "max", // ⬅️ Change from 1 to "max" or number
      exec_mode: "cluster", // ⬅️ Change from "fork" to "cluster"
      // ... rest of config
    },
  ],
};
```

**Step 2**: Restart PM2

```bash
npm run prod:force
```

**Step 3**: Verify

```bash
pm2 list
# Should show multiple instances:
# ┌────┬──────────────────────┬─────────┬──────────┐
# │ id │ name                     │ mode    │ status    │
# ├────┼──────────────────────┼─────────┼──────────┤
# │ 0  │ social-media-blog-app    │ cluster │ online    │
# │ 1  │ social-media-blog-app    │ cluster │ online    │
# │ 2  │ social-media-blog-app    │ cluster │ online    │
# │ 3  │ social-media-blog-app    │ cluster │ online    │
# │ .. │ ...                      │ ...     │ ...       │
# └────┴──────────────────────┴─────────┴──────────┘
```

### Scale Instances Dynamically

```bash
# Scale to specific number
pm2 scale social-media-blog-app 8
# Now running 8 instances (0-7)

# Add more instances
pm2 scale social-media-blog-app +4
# Adds 4 more instances

# Remove instances
pm2 scale social-media-blog-app -2
# Removes 2 instances

# Scale to max (all CPU cores)
pm2 scale social-media-blog-app max

# Use npm script
npm run pm2:scale 8  # Scale to 8 instances
```

### Cluster Instance Management

```bash
# Restart specific instance
pm2 restart 0  # Restart instance ID 0
pm2 restart 1  # Restart instance ID 1

# Stop specific instance
pm2 stop 0

# Delete specific instance
pm2 delete 0

# Reload all instances (zero-downtime)
pm2 reload social-media-blog-app
# Reloads instances one by one

# View specific instance logs
pm2 logs 0  # Logs for instance 0
pm2 logs 1  # Logs for instance 1
```

### Cluster Monitoring

```bash
# Monitor all cluster instances
pm2 monit
# Shows CPU/Memory for each instance

# View load distribution
pm2 list
# Check CPU% and Memory for each instance

# Detailed cluster metrics
pm2 show social-media-blog-app
# Shows:
# - Total instances
# - Restart count per instance
# - Memory per instance
# - CPU per instance
```

### Cluster Configuration Options

**In `ecosystem.config.cjs`**:

```javascript
module.exports = {
  apps: [
    {
      // Instance configuration
      instances: "max", // "max" = all CPUs, or number (1, 2, 4, 8, 16)
      exec_mode: "cluster", // "cluster" or "fork"

      // Load balancing
      instance_var: "INSTANCE_ID", // Env var with instance ID

      // Performance
      max_memory_restart: "2G", // Restart if memory > 2GB
      min_uptime: "10s", // Min uptime before considering stable
      max_restarts: 10, // Max restarts within min_uptime

      // Cluster-specific
      kill_timeout: 5000, // Time to wait before force kill
      listen_timeout: 10000, // Time to wait for app to listen
      wait_ready: false, // Wait for process.send('ready')
    },
  ],
};
```

### Cluster Best Practices

**Recommended Configurations**:

| CPU Cores | Instances | Use Case               |
| --------- | --------- | ---------------------- |
| 4 cores   | 2-3       | Development/Small apps |
| 8 cores   | 4-6       | Medium traffic         |
| 16 cores  | 8-12      | High traffic           |
| 32+ cores | max       | Enterprise/Heavy load  |

**Tips**:

- ✅ Leave 1-2 cores free for system
- ✅ Start with `instances: 2` and scale up
- ✅ Monitor memory usage per instance
- ✅ Use `pm2 reload` for zero-downtime updates
- ❌ Don't use cluster mode for stateful apps (use Redis for sessions)

### Cluster Troubleshooting

```bash
# Instance keeps restarting
pm2 logs --err  # Check error logs
pm2 describe social-media-blog-app  # Check restart count

# High memory usage
pm2 list  # Check memory per instance
pm2 scale social-media-blog-app -2  # Reduce instances

# Uneven load distribution
pm2 reload social-media-blog-app  # Reload all instances

# Reset cluster
pm2 delete all
pm2 start ecosystem.config.cjs --env production
```

---

## 📊 Monitoring & Logs

### Real-time Monitoring

```bash
# Real-time monitoring dashboard
npm run pm2:monit
# OR
pm2 monit

# Press 'q' to exit
```

**Dashboard Features:**

- CPU usage
- Memory usage
- Process status
- Logs in real-time

### View Logs

```bash
# View all logs (real-time)
npm run pm2:logs
# OR
pm2 logs

# View last 50 lines
pm2 logs --lines 50

# View logs without streaming
pm2 logs --nostream

# View only error logs
pm2 logs --err

# View only output logs
pm2 logs --out

# Clear all logs
pm2 flush
```

**Log Files Location:**

```
logs/
├── pm2-error.log      # PM2 error logs
├── pm2-out.log        # PM2 output logs
├── pm2-combined.log   # Combined logs
└── app.log            # Application logs
```

### Advanced Monitoring

```bash
# PM2 Plus (web monitoring - requires account)
pm2 plus

# Generate monitoring report
pm2 report

# Memory usage
pm2 show social-media-blog-app | grep memory

# CPU usage
pm2 show social-media-blog-app | grep cpu
```

---

## 🔍 Health Checks

### Manual Health Checks

```bash
# Check server health
npm run prod:health
# OR
curl http://localhost:5000/health
# OR (HTTPS)
curl https://192.168.x.x:5000/health

# Check API endpoints
npm run prod:endpoints

# Run health check script
npm run health:check

# Check port status
npm run prod:check-port
```

**Expected Health Response:**

```json
{
  "status": "healthy",
  "version": "v2",
  "environment": "production",
  "timestamp": "2025-10-29T01:49:20.256Z",
  "uptime": 38,
  "memory": {
    "used": "45 MB",
    "total": "47 MB"
  }
}
```

### Automated Health Checks

PM2 automatically monitors:

- Process crashes (auto-restart)
- Memory leaks (restart if > 2GB)
- Uptime tracking
- Error rate monitoring

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5000
npm run prod:check-port
# OR
netstat -ano | findstr :5000

# Kill process on port 5000
npm run prod:kill-port
# OR manually
taskkill /F /PID <PID>

# Clean start
npm run prod:clean
```

### PM2 Process Issues

```bash
# Process not starting
pm2 delete all
npm run prod:force

# Process keeps restarting
pm2 logs --lines 100  # Check error logs
pm2 describe social-media-blog-app  # Check restart count

# Reset PM2
pm2 kill
pm2 start ecosystem.config.cjs --env production

# Clear PM2 logs
pm2 flush
```

### Environment Issues

```bash
# Check environment variables
npm run prod:env

# Verify NODE_ENV
pm2 env 0 | findstr NODE_ENV

# Should show: NODE_ENV: production
```

### Database Connection Issues

```bash
# Check MongoDB connection
# Look for "Database connection established" in logs
pm2 logs --lines 20

# Check Redis connection
# Look for "Redis Connected Successfully" in logs
pm2 logs --lines 20

# Restart Redis
npm run docker:down
npm run docker:up
```

### Memory Issues

```bash
# Check memory usage
pm2 show social-media-blog-app

# If memory > 2GB, PM2 will auto-restart
# Check restart count
pm2 list

# Manual restart
pm2 restart social-media-blog-app
```

---

## 🎯 Best Practices

### Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make changes (auto-reload)

# 3. Test changes
curl http://localhost:5000/health

# 4. Stop server (Ctrl+C)
```

### Production Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Run tests (if available)
npm test

# 4. Start/Reload PM2
npm run prod:reload  # Zero-downtime reload
# OR
npm run prod:force   # Force restart

# 5. Verify deployment
npm run prod:health
pm2 status

# 6. Monitor logs
pm2 logs --lines 50
```

### PM2 Startup on Boot

```bash
# Generate startup script
npm run pm2:startup
# OR
pm2 startup

# Follow the instructions shown

# Save current PM2 processes
npm run pm2:save
# OR
pm2 save

# Now PM2 will auto-start on system reboot
```

### Backup & Restore

```bash
# Save PM2 process list
pm2 save

# Restore PM2 processes
pm2 resurrect

# Export PM2 dump
pm2 dump

# PM2 saves to: ~/.pm2/dump.pm2
```

---

## 📝 Common Commands Cheat Sheet

### Quick Reference

| Command                  | Description                       |
| ------------------------ | --------------------------------- |
| `npm run dev`            | Start development server (HTTP)   |
| `npm run prod:full`      | Start production with PM2 (HTTPS) |
| `npm run prod:force`     | Force clean PM2 start             |
| `npm run pm2:status`     | View PM2 status                   |
| `npm run pm2:logs`       | View real-time logs               |
| `npm run pm2:monit`      | Open monitoring dashboard         |
| `npm run pm2:stop`       | Stop PM2 process                  |
| `npm run pm2:restart`    | Restart PM2 process               |
| `npm run prod:reload`    | Zero-downtime reload              |
| `npm run prod:health`    | Check server health               |
| `npm run prod:kill-port` | Kill process on port 5000         |
| `pm2 delete all`         | Delete all PM2 processes          |
| `pm2 flush`              | Clear all logs                    |

---

## 🔗 Useful Links

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **PM2 Plus (Monitoring)**: https://pm2.io/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## 📞 Support

For issues or questions:

- **Email**: deepanshgangwar7037@outlook.com
- **GitHub Issues**: https://github.com/mr-deepansh/social-media-blog-app/issues

---

**Last Updated**: January 2025  
**Version**: 2.0.0
