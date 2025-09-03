// SERVEUR ULTRA-SIMPLE POUR TESTS
import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: 'ultra-simple',
      server: 'http-only'
    }));
  } else if (req.url === '/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Serveur ultra-simple fonctionne !',
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/test-limits' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Protection contre les données trop volumineuses
      if (body.length > 50 * 1024 * 1024) { // 50MB
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Request entity too large',
          message: 'Données trop volumineuses',
          received: body.length,
          limit: '50MB'
        }));
        return;
      }
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Test limites réussi',
          receivedSize: body.length,
          receivedSizeMB: (body.length / (1024 * 1024)).toFixed(2) + 'MB',
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Invalid JSON',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not found',
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 SERVEUR ULTRA-SIMPLE DÉMARRÉ`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`📏 Test limites: POST http://localhost:${PORT}/test-limits`);
  console.log(`📊 Limite: 50MB par requête`);
});

