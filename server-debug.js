// SERVEUR DE DEBUG POUR DIAGNOSTIC FLY.IO
import express from 'express';
import cors from 'cors';

console.log('🚀 DÉMARRAGE SERVEUR DEBUG - ÉTAPE 1');

const app = express();
app.use(cors());
app.use(express.json());

console.log('✅ Express configuré - ÉTAPE 2');

const PORT = process.env.PORT || 3000;

// Health check de debug
app.get('/health', (req, res) => {
  console.log('🏥 Health check reçu à', new Date().toISOString());
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'debug',
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
    message: 'Serveur debug fonctionne !',
    timestamp: new Date().toISOString()
  });
});

// Simulation du serveur principal
app.get('/simulate-main-server', async (req, res) => {
  console.log('🎭 Simulation du serveur principal...');

  try {
    // Simuler les imports du serveur principal
    console.log('  📦 Imports...');
    await import('./utils/openaiService.js');
    await import('./utils/transcribe.js');
    await import('./utils/extractAudio.js');
    await import('./utils/summarize.js');

    console.log('  🚀 Création serveur Express...');
    const { default: express } = await import('express');
    const { default: cors } = await import('cors');
    const { default: multer } = await import('multer');

    const testApp = express();
    testApp.use(cors());
    testApp.use(express.json());

    // Simuler les routes principales
    console.log('  🛣️ Configuration routes...');
    testApp.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: 'test'
      });
    });

    // Simuler une route avec service
    testApp.get('/test-service', async (req, res) => {
      try {
        const { createChatCompletion } = await import('./utils/openaiService.js');
        const response = await createChatCompletion([{
          role: 'user',
          content: 'Test'
        }], { max_tokens: 10 });

        res.json({ success: true, response: response.substring(0, 50) });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    console.log('  ✅ Simulation réussie');

    res.json({
      success: true,
      message: 'Simulation du serveur principal réussie',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform
      }
    });

  } catch (error) {
    console.log('  ❌ Erreur simulation:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Étape 3: Test des imports principaux
app.get('/debug-imports', async (req, res) => {
  console.log('🔍 Test des imports principaux - ÉTAPE 3');
  const results = {};

  try {
    console.log('  📦 Test import fs...');
    await import('fs/promises');
    results.fs = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur fs:', error.message);
    results.fs = '❌ ' + error.message;
  }

  try {
    console.log('  📦 Test import path...');
    await import('path');
    results.path = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur path:', error.message);
    results.path = '❌ ' + error.message;
  }

  try {
    console.log('  📦 Test import multer...');
    await import('multer');
    results.multer = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur multer:', error.message);
    results.multer = '❌ ' + error.message;
  }

  try {
    console.log('  🔧 Test import openaiService...');
    await import('./utils/openaiService.js');
    results.openaiService = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur openaiService:', error.message);
    results.openaiService = '❌ ' + error.message;
  }

  try {
    console.log('  🎵 Test import transcribe...');
    await import('./utils/transcribe.js');
    results.transcribe = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur transcribe:', error.message);
    results.transcribe = '❌ ' + error.message;
  }

  try {
    console.log('  🎵 Test import extractAudio...');
    await import('./utils/extractAudio.js');
    results.extractAudio = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur extractAudio:', error.message);
    results.extractAudio = '❌ ' + error.message;
  }

  try {
    console.log('  📝 Test import summarize...');
    await import('./utils/summarize.js');
    results.summarize = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur summarize:', error.message);
    results.summarize = '❌ ' + error.message;
  }

  console.log('🎯 Test imports terminé');
  res.json({
    timestamp: new Date().toISOString(),
    imports: results
  });
});

// Étape 4: Test des services
app.get('/debug-services', async (req, res) => {
  console.log('🔧 Test des services - ÉTAPE 4');
  const results = {};

  try {
    console.log('  🤖 Test service DeepSeek...');
    const { getDeepSeekConfig, verifyDeepSeekModelUsage } = await import('./utils/openaiService.js');
    const config = getDeepSeekConfig();
    results.deepseekConfig = {
      hasApiKey: config.hasApiKey,
      model: config.model,
      baseURL: config.baseURL
    };

    if (config.hasApiKey) {
      const verification = await verifyDeepSeekModelUsage();
      results.deepseekVerification = {
        success: verification.success,
        requestedModel: verification.requestedModel,
        actualModel: verification.actualModel
      };
    }
    results.deepseekService = '✅ OK';
  } catch (error) {
    console.log('  ❌ Erreur service DeepSeek:', error.message);
    results.deepseekService = '❌ ' + error.message;
  }

  console.log('🎯 Test services terminé');
  res.json({
    timestamp: new Date().toISOString(),
    services: results
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVEUR DEBUG DÉMARRÉ SUR LE PORT ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🔍 Imports: http://localhost:${PORT}/debug-imports`);
  console.log(`🔧 Services: http://localhost:${PORT}/debug-services`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Clé DeepSeek: ${process.env.DEEPSEEK_API_KEY ? 'Présente' : 'Absente'}`);
});
