const http = require('http');
const url = require('url');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

function createServer() {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    switch (pathname) {
      case '/':
        handleHome(req, res);
        break;
        
      case '/api/info':
        handleApiInfo(req, res);
        break;
        
      case '/api/health':
        handleHealth(req, res);
        break;
        
      default:
        handle404(req, res);
    }
  });
  
  return server;
}

function handleHome(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Node.js SEA Web Server</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 2rem;
                border-radius: 10px;
                backdrop-filter: blur(10px);
            }
            h1 {
                text-align: center;
                margin-bottom: 2rem;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            .info-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .api-links {
                text-align: center;
                margin-top: 2rem;
            }
            .api-links a {
                color: #fff;
                text-decoration: none;
                margin: 0 1rem;
                padding: 0.5rem 1rem;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 5px;
                transition: all 0.3s ease;
            }
            .api-links a:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Node.js Single Executable Application</h1>
            <p>This web server is running as a single executable file built with node-package-builder!</p>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>📊 Server Info</h3>
                    <p><strong>Host:</strong> ${HOST}</p>
                    <p><strong>Port:</strong> ${PORT}</p>
                    <p><strong>Platform:</strong> ${process.platform}</p>
                    <p><strong>Architecture:</strong> ${process.arch}</p>
                </div>
                
                <div class="info-card">
                    <h3>⚡ Runtime Info</h3>
                    <p><strong>Node.js:</strong> ${process.version}</p>
                    <p><strong>PID:</strong> ${process.pid}</p>
                    <p><strong>Uptime:</strong> ${Math.round(process.uptime())}s</p>
                    <p><strong>Memory:</strong> ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB</p>
                </div>
            </div>
            
            <div class="api-links">
                <h3>🔗 API Endpoints</h3>
                <a href="/api/info">System Info</a>
                <a href="/api/health">Health Check</a>
            </div>
        </div>
    </body>
    </html>
  `;
  
  res.writeHead(200);
  res.end(html);
}

function handleApiInfo(req, res) {
  const info = {
    server: {
      host: HOST,
      port: PORT,
      uptime: process.uptime(),
      platform: process.platform,
      architecture: process.arch
    },
    runtime: {
      nodeVersion: process.version,
      pid: process.pid,
      execPath: process.execPath,
      cwd: process.cwd(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    }
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(info, null, 2));
}

function handleHealth(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().rss / 1024 / 1024),
      unit: 'MB'
    }
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(health, null, 2));
}

function handle404(req, res) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>404 - Not Found</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
            h1 { color: #e74c3c; }
        </style>
    </head>
    <body>
        <h1>404 - Page Not Found</h1>
        <p>The requested page could not be found.</p>
        <a href="/">← Back to Home</a>
    </body>
    </html>
  `;
  
  res.writeHead(404);
  res.end(html);
}

function startServer() {
  const server = createServer();
  
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}/`);
    console.log(`📊 Platform: ${process.platform} (${process.arch})`);
    console.log(`⚡ Node.js: ${process.version}`);
    console.log(`🔧 PID: ${process.pid}`);
    console.log('\n📡 Available endpoints:');
    console.log(`   • http://${HOST}:${PORT}/`);
    console.log(`   • http://${HOST}:${PORT}/api/info`);
    console.log(`   • http://${HOST}:${PORT}/api/health`);
    console.log('\n✨ This server is running as a single executable!');
  });
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
  
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };