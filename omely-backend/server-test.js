// SERVEUR DE TEST MINIMAL POUR DIAGNOSTIC
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
    version: 'test-minimal'
  });
});

// Test simple
app.get('/test', (req, res) => {
  console.log('🧪 Test reçu à', new Date().toISOString());
  res.json({
    message: 'Serveur de test fonctionne !',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
});

