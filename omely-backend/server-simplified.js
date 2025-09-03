// SERVEUR SIMPLIFIÉ - EXPRESS AVEC DEEPSEEK V2
import express from 'express';
import cors from 'cors';

console.log('🚀 DÉMARRAGE SERVEUR SIMPLIFIÉ AVEC DEEPSEEK');

const app = express();
app.use(cors());

// Configuration pour gérer les gros fichiers et données
app.use(express.json({ limit: '50mb' }));  // Limite JSON à 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // Limite URL-encoded à 50MB

// Configuration multer pour les uploads de fichiers
const multer = await import('multer');
const upload = multer.default({
  dest: './ultra_temp',
  limits: {
    fileSize: 100 * 1024 * 1024,  // 100MB max par fichier
    files: 5  // Maximum 5 fichiers
  }
});

const PORT = process.env.PORT || 3000;

console.log('✅ Express configuré');

// Test d'import DeepSeek (étape 1)
let deepSeekService = null;
try {
  console.log('🔧 Test import service DeepSeek...');
  const { createChatCompletion, getDeepSeekConfig } = await import('./utils/openaiService.js');
  deepSeekService = { createChatCompletion, getDeepSeekConfig };
  console.log('✅ Service DeepSeek importé avec succès');
} catch (error) {
  console.log('⚠️ Import DeepSeek échoué (non critique):', error.message);
  console.log('   Le serveur continuera sans les fonctionnalités DeepSeek');
}

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check reçu');
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'simplified',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? '***' + process.env.DEEPSEEK_API_KEY.slice(-4) : 'NOT_SET'
    }
  });
});

// Test route
app.get('/test', (req, res) => {
  console.log('🧪 Test route reçu');
  res.json({
    message: 'Serveur simplifié fonctionne !',
    timestamp: new Date().toISOString()
  });
});

// Route de diagnostic basique
app.get('/diagnostic', (req, res) => {
  console.log('🔍 Diagnostic demandé');
  res.json({
    timestamp: new Date().toISOString(),
    server: 'simplified',
    status: deepSeekService ? 'operational' : 'partial',
    features: ['express', 'cors', 'json', deepSeekService ? 'deepseek' : 'no-deepseek'],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      deepseekAvailable: !!deepSeekService
    }
  });
});

// Route de test DeepSeek (si disponible)
app.get('/test-deepseek', async (req, res) => {
  console.log('🤖 Test DeepSeek demandé');

  if (!deepSeekService) {
    return res.status(503).json({
      error: 'Service DeepSeek non disponible',
      message: 'Le service DeepSeek n\'a pas pu être chargé',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { createChatCompletion } = deepSeekService;
    const response = await createChatCompletion([{
      role: 'user',
      content: 'Dis juste "Hello from DeepSeek!" en français.'
    }], { max_tokens: 20 });

    res.json({
      success: true,
      message: 'DeepSeek fonctionne !',
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erreur DeepSeek:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur DeepSeek',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de test des limites de taille
app.post('/test-limits', upload.array('files', 5), (req, res) => {
  console.log('📏 Test des limites demandé');

  const filesInfo = req.files ? req.files.map(file => ({
    name: file.originalname,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2) + 'MB'
  })) : [];

  res.json({
    success: true,
    message: 'Test des limites réussi',
    data: {
      bodySize: JSON.stringify(req.body).length,
      bodySizeMB: (JSON.stringify(req.body).length / (1024 * 1024)).toFixed(2) + 'MB',
      filesCount: filesInfo.length,
      files: filesInfo
    },
    limits: {
      json: '50MB',
      files: '100MB par fichier',
      maxFiles: '5 fichiers'
    },
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreurs spécifique pour "request entity too large"
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.message.includes('request entity too large')) {
    console.log('📏 Requête trop volumineuse détectée:', err.message);
    return res.status(413).json({
      error: 'Request entity too large',
      message: 'Le fichier ou les données envoyées sont trop volumineux. Limite: 100MB pour les fichiers, 50MB pour les données JSON.',
      limit: {
        json: '50MB',
        files: '100MB',
        files_count: '5 fichiers maximum'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Erreur multer pour fichiers trop gros
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log('📁 Fichier trop volumineux:', err.message);
    return res.status(413).json({
      error: 'File too large',
      message: 'Le fichier envoyé est trop volumineux. Limite maximale: 100MB.',
      limit: '100MB',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur multer pour trop de fichiers
  if (err.code === 'LIMIT_FILE_COUNT') {
    console.log('📂 Trop de fichiers:', err.message);
    return res.status(413).json({
      error: 'Too many files',
      message: 'Trop de fichiers envoyés. Limite: 5 fichiers maximum.',
      limit: '5 fichiers',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur JSON malformé ou trop gros
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    console.log('🔧 Erreur de parsing JSON:', err.message);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Les données JSON envoyées sont invalides ou trop volumineuses.',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur générique
  console.error('❌ Erreur globale:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❓ Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not found',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVEUR SIMPLIFIÉ AVEC DEEPSEEK DÉMARRÉ`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🔍 Diagnostic: http://localhost:${PORT}/diagnostic`);
  console.log(`🤖 Test DeepSeek: http://localhost:${PORT}/test-deepseek`);
  console.log(`📏 Test limites: POST http://localhost:${PORT}/test-limits`);
  console.log(`📊 Limites configurées:`);
  console.log(`   • JSON: 50MB maximum`);
  console.log(`   • Fichiers: 100MB par fichier, 5 fichiers max`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Clé DeepSeek: ${process.env.DEEPSEEK_API_KEY ? 'Présente' : 'Absente'}`);
  console.log(`🔧 Service DeepSeek: ${deepSeekService ? '✅ Chargé' : '❌ Non disponible'}`);
});
