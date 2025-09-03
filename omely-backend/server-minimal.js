// SERVEUR MINIMAL POUR TEST FLY.IO
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check minimal
app.get('/health', (req, res) => {
  console.log('🏥 Health check reçu à', new Date().toISOString());
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'minimal-test',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? '***' + process.env.DEEPSEEK_API_KEY.slice(-4) : 'NOT_SET'
    }
  });
});

// Test simple
app.get('/test', (req, res) => {
  console.log('🧪 Test reçu à', new Date().toISOString());
  res.json({
    message: 'Serveur minimal fonctionne !',
    timestamp: new Date().toISOString(),
    secrets: {
      deepseek_key_exists: !!(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here')
    }
  });
});

// Test DeepSeek basique (sans imports complexes)
app.get('/verify-deepseek-minimal', (req, res) => {
  console.log('🔍 Test DeepSeek minimal reçu');
  const hasKey = !!(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here');
  res.json({
    timestamp: new Date().toISOString(),
    deepseek_api_key: hasKey ? 'CONFIGURED' : 'MISSING',
    key_length: process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0,
    key_starts_with: process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.substring(0, 4) : 'N/A'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVEUR MINIMAL DÉMARRÉ`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🤖 DeepSeek: http://localhost:${PORT}/verify-deepseek-minimal`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Clé DeepSeek: ${process.env.DEEPSEEK_API_KEY ? 'Présente' : 'Absente'}`);
});

