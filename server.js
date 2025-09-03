// OMELY BACKEND - VERSION OPTIMISÉE
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Services
import { createChatCompletion } from './utils/openaiService.js';
import transcribe from './utils/transcribe.js';
import summarizeText from './utils/summarize.js';
import { extractTextFromPDF } from './utils/extractPdfText.js';
import { extractAudio } from './utils/extractAudio.js';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 OMELY Backend - Démarrage optimisé');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration multer pour l'upload de fichiers
const upload = multer({
  dest: path.join(__dirname, 'temp'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'audio/mpeg', 'audio/mp3', 'audio/wav',
      'video/mp4', 'video/avi', 'video/mov'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

console.log('✅ Configuration Express et Multer terminée');

// Créer le dossier temporaire
const fs = await import('fs/promises');
await fs.mkdir(path.join(__dirname, 'temp'), { recursive: true });

// Configuration optimisée
const CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxTextLength: 150000,
  chunkSize: 50000,
  timeout: 180000,
  port: process.env.PORT || 3001,
  host: process.env.HOST || '0.0.0.0',
  tempCleanupInterval: 3600000, // 1 heure
  maxTempAge: 7200000 // 2 heures
};

// Fonction de nettoyage automatique des fichiers temporaires
async function cleanupTempFiles() {
  try {
    const tempDir = path.join(__dirname, 'temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      // Supprimer les fichiers de plus de 2 heures
      if (now - stats.mtime.getTime() > CONFIG.maxTempAge) {
        await fs.unlink(filePath);
        console.log(`🧹 Fichier temporaire supprimé: ${file}`);
      }
    }
  } catch (error) {
    console.error('Erreur nettoyage fichiers temporaires:', error);
  }
}

// Démarrer le nettoyage automatique
setInterval(cleanupTempFiles, CONFIG.tempCleanupInterval);
console.log('🧹 Nettoyage automatique des fichiers temporaires activé');

// ==================== ROUTES OPTIMISÉES ====================

// Health check rapide
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0-optimized',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      whisper: !!process.env.OPENAI_API_KEY
    }
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'OMELY Backend optimisé fonctionne !',
    timestamp: new Date().toISOString(),
    version: '1.0-optimized'
  });
});

// ==================== ROUTES CHAT ET SUMMARIZATION ====================

// Route de chat optimisée
app.post('/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message requis'
      });
    }

    // Limiter l'historique pour optimiser
    const recentHistory = conversationHistory.slice(-10);

    // Construction des messages
    const messages = [
      {
        role: 'system',
        content: 'Tu es OMELY, un assistant IA spécialisé dans l\'optimisation cognitive et l\'apprentissage. Réponds en français de manière claire et utile.'
      },
      ...recentHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await createChatCompletion(messages, {
      max_tokens: 1000,
      temperature: 0.7
    });

    res.json({
      success: true,
      response,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Erreur chat:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur de chat',
      processingTime: Date.now() - startTime
    });
  }
});

// Routes de summarization optimisées

// Summarization PDF
app.post('/summarize/pdf', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Fichier PDF requis' });
    }

    console.log(`📄 Summarization PDF: ${req.file.originalname}`);

    // Extraire le texte
    const { text } = await extractTextFromPDF(req.file.path);

    // Résumer
    const summary = await summarizeText(text, 'pdf');

    // Nettoyer
    await import('fs').then(fs => fs.unlink(req.file.path));

    res.json({
      success: true,
      summary,
      metadata: {
        filename: req.file.originalname,
        textLength: text.length,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Erreur PDF:', error);
    if (req.file?.path) {
      await import('fs').then(fs => fs.unlink(req.file.path).catch(() => {}));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Summarization Audio
app.post('/summarize/audio', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Fichier audio requis' });
    }

    console.log(`🎵 Summarization Audio: ${req.file.originalname}`);

    // Transcrire
    const transcript = await transcribe(req.file.path);

    // Résumer
    const summary = await summarizeText(transcript, 'audio');

    // Nettoyer
    await import('fs').then(fs => fs.unlink(req.file.path));

    res.json({
      success: true,
      summary,
      metadata: {
        filename: req.file.originalname,
        transcriptLength: transcript.length,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Erreur Audio:', error);
    if (req.file?.path) {
      await import('fs').then(fs => fs.unlink(req.file.path).catch(() => {}));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Summarization Vidéo
app.post('/summarize/video', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Fichier vidéo requis' });
    }

    console.log(`🎬 Summarization Vidéo: ${req.file.originalname}`);

    // Extraire l'audio
    const { audioFilePath } = await extractAudio(req.file.path);

    // Transcrire
    const transcript = await transcribe(audioFilePath);

    // Résumer
    const summary = await summarizeText(transcript, 'video');

    // Nettoyer
    await import('fs').then(fs =>
      Promise.all([
        fs.unlink(req.file.path),
        fs.unlink(audioFilePath)
      ])
    );

    res.json({
      success: true,
      summary,
      metadata: {
        filename: req.file.originalname,
        transcriptLength: transcript.length,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Erreur Vidéo:', error);
    if (req.file?.path) {
      await import('fs').then(fs => fs.unlink(req.file.path).catch(() => {}));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Extraction complète de livre
app.post('/extract/book', upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Fichier PDF requis' });
    }

    console.log(`📚 Extraction livre: ${req.file.originalname}`);

    // Extraire le texte
    const { text } = await extractTextFromPDF(req.file.path);

    // Résumer avec extraction complète
    const summary = await summarizeText(text, 'book');

    // Nettoyer
    await import('fs').then(fs => fs.unlink(req.file.path));

    res.json({
      success: true,
      summary,
      metadata: {
        filename: req.file.originalname,
        textLength: text.length,
        processingTime: Date.now() - startTime
      }
    });

  } catch (error) {
    console.error('Erreur livre:', error);
    if (req.file?.path) {
      await import('fs').then(fs => fs.unlink(req.file.path).catch(() => {}));
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gestion d'erreurs et démarrage du serveur

// Middleware d'erreur
app.use((error, req, res, next) => {
  console.error('Erreur:', error);
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Démarrage du serveur
const server = app.listen(CONFIG.port, CONFIG.host, () => {
  console.log(`🚀 OMELY Backend v1.0 optimisé démarré sur ${CONFIG.host}:${CONFIG.port}`);
  console.log(`📊 Configuration: ${CONFIG.maxFileSize / (1024 * 1024)}MB max, timeout ${CONFIG.timeout / 1000}s`);
  console.log(`🔗 Routes:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /test - Test route`);
  console.log(`   POST /chat - Chat IA`);
  console.log(`   POST /summarize/pdf - Summarization PDF`);
  console.log(`   POST /summarize/audio - Summarization Audio`);
  console.log(`   POST /summarize/video - Summarization Vidéo`);
  console.log(`   POST /extract/book - Extraction livre complète`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt propre du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

console.log('✅ OMELY Backend optimisé prêt !');

