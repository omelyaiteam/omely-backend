// SERVEUR CHAT AVEC OPENAI GPT-4O-MINI - VERSION ULTRA-RAPIDE
import http from 'http';
import dotenv from 'dotenv';
import { createChatCompletion } from './utils/openaiService.js';

// Charger les variables d'environnement
dotenv.config();

// Configuration OpenAI
const OPENAI_CONFIG = {
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
  maxTokens: 1000,
  safeInputTokens: 120000, // GPT-4o-mini supporte plus de tokens
  safeOutputTokens: 1000,
  maxContextTokens: 128000
};

// Service OpenAI directement importé

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
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
      version: 'chat-enabled',
      openai: !!(OPENAI_CONFIG.apiKey && OPENAI_CONFIG.apiKey !== 'your-openai-api-key-here'),
      server: 'http-with-chat'
    }));

  } else if (req.url === '/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Serveur chat fonctionne !',
      openaiAvailable: !!(OPENAI_CONFIG.apiKey && OPENAI_CONFIG.apiKey !== 'your-openai-api-key-here'),
      timestamp: new Date().toISOString()
    }));

  } else   if (req.url === '/chat/completion' && req.method === 'POST') {
    console.log('🤖 Requête chat/completion reçue');

    if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey === 'your-openai-api-key-here') {
      console.log('⚠️ Clé API OpenAI non configurée');
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Clé API OpenAI manquante',
        message: 'Configurez OPENAI_API_KEY dans le fichier .env',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // Protection contre les données trop volumineuses
      if (body.length > 10 * 1024 * 1024) { // 10MB pour les messages chat
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Request entity too large',
          message: 'Le message de chat est trop volumineux',
          limit: '10MB'
        }));
        return;
      }
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        console.log('📨 Message reçu:', data.messages?.length || 0, 'messages');

        const response = await createChatCompletion(data.messages || [], {
          max_tokens: data.max_tokens || OPENAI_CONFIG.safeOutputTokens
        });

        console.log('✅ Réponse OpenAI générée');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          response: response,
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error('❌ Erreur chat DeepSeek:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Erreur DeepSeek',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });

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

// Service OpenAI directement disponible

server.listen(PORT, () => {
  console.log(`🚀 SERVEUR CHAT AVEC OPENAI GPT-4O-MINI DÉMARRÉ`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`🤖 Chat: POST http://localhost:${PORT}/chat/completion`);
  console.log(`📏 Test limites: POST http://localhost:${PORT}/test-limits`);
  console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configuré' : 'Manquant'}`);
  console.log(`📊 Limites: Chat 10MB, Général 50MB`);
});

