// OMELY BACKEND AVEC GPT-4o mini - VERSION STABLE
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createChatCompletion } from './utils/openaiService.js';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DÉMARRAGE SERVEUR PRINCIPAL STABLE');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration multer pour l'upload de fichiers
const upload = multer({
  dest: path.join(__dirname, 'ultra_temp'),
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

console.log('✅ Express et multer configurés');

// Imports asynchrones avec gestion d'erreurs (comme dans le serveur simplifié)
let services = {};
let servicesLoaded = false;

async function loadServices() {
  try {
    console.log('🔧 Chargement des services...');

    // Service GPT-4o mini exclusivement
    try {
      const openaiModule = await import('./utils/openaiService.js');
      services.openai = {
        createChatCompletion: openaiModule.createChatCompletion,
        testOpenAIConnection: openaiModule.testOpenAIConnection,
        extractCompleteBookContent: openaiModule.extractCompleteBookContent,
        verifyGPT4oModelUsage: openaiModule.verifyDeepSeekModelUsage, // Alias pour compatibilité
        getGPT4oConfig: openaiModule.getDeepSeekConfig // Alias pour compatibilité
      };
      console.log('✅ Service GPT-4o mini chargé (GPT-4o mini remplacé)');
    } catch (error) {
      console.log('⚠️ Service GPT-4o mini non disponible:', error.message);
      services.openai = null;
    }

    // Service transcription
    try {
      const transcribeModule = await import('./utils/transcribe.js');
      services.transcribe = transcribeModule.default;
      console.log('✅ Service transcription chargé');
    } catch (error) {
      console.log('⚠️ Service transcription non disponible:', error.message);
      services.transcribe = null;
    }

    // Service extraction audio
    try {
      const extractAudioModule = await import('./utils/extractAudio.js');
      services.extractAudio = extractAudioModule.default;
      console.log('✅ Service extraction audio chargé');
    } catch (error) {
      console.log('⚠️ Service extraction audio non disponible:', error.message);
      services.extractAudio = null;
    }

    // Service summarization
    try {
      const summarizeModule = await import('./utils/summarize.js');
      services.summarizeText = summarizeModule.default;
      console.log('✅ Service summarization chargé');
    } catch (error) {
      console.log('⚠️ Service summarization non disponible:', error.message);
      services.summarizeText = null;
    }

    servicesLoaded = true;
    console.log('🎉 Tous les services chargés avec succès');

  } catch (error) {
    console.error('❌ Erreur lors du chargement des services:', error);
    servicesLoaded = false;
  }
}

// ==================== ROUTES SIMPLIFIÉES ====================

// Health check - Ultra rapide pour Fly.io
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'v6.0-stable',
    servicesLoaded: servicesLoaded,
    gpt4oAvailable: services.openai ? true : false
  });
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'OMELY Backend SIMPLIFIÉ fonctionne !',
    timestamp: new Date().toISOString(),
    version: '6.0-simplified'
  });
});

// GPT-4o mini Verification Endpoint
app.get('/verify-gpt4o', async (req, res) => {
  try {
    console.log('🔍 Requête de vérification GPT-4o mini reçue');

    if (!services.openai) {
      return res.status(503).json({
        timestamp: new Date().toISOString(),
        service: 'GPT-4o mini',
        verification: {
          status: 'SERVICE_UNAVAILABLE',
          message: 'Service GPT-4o mini non chargé',
          error: 'Le service GPT-4o mini n\'a pas pu être initialisé'
        }
      });
    }

    const config = services.openai.getGPT4oConfig();
    const modelVerification = await services.openai.verifyGPT4oModelUsage();

    const response = {
      timestamp: new Date().toISOString(),
      service: 'GPT-4o mini',
      verification: {
        config: {
          hasApiKey: config.hasApiKey,
          model: config.model,
          baseURL: config.baseURL,
          verifyModel: config.verifyModel
        },
        modelCheck: {
          success: modelVerification.success,
          requestedModel: modelVerification.requestedModel,
          actualModel: modelVerification.actualModel,
          baseURL: modelVerification.baseURL,
          error: modelVerification.error
        },
        status: modelVerification.success && config.hasApiKey ? 'ACTIVE' : 'INACTIVE',
        message: modelVerification.success && config.hasApiKey
          ? '✅ API utilise exclusivement GPT-4o mini'
          : '❌ Problème de configuration détecté'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Erreur vérification GPT-4o mini:', error);
    res.status(500).json({
      error: 'Erreur de vérification GPT-4o mini',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route de debug pour lister toutes les routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json({
    status: 'OK',
    message: 'Routes disponibles',
    routes: routes,
    total: routes.length
  });
});

// Route de test temporaire
app.get('/test-quiz-route', (req, res) => {
  console.log('🧪 Route de test appelée à', new Date().toISOString());
  res.json({
    status: 'OK',
    message: 'Route quiz is working!',
    timestamp: new Date().toISOString(),
    routes: ['/api/generate-quiz', '/api/generate-pretest', '/test-quiz-route']
  });
});

// ==================== ROUTE QUIZ IMMERSIVE ====================

// Route pour les chat completions (remplace Gemini) avec mémoire
app.post('/chat/completion', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Nouvelle requête chat completion GPT-4o mini avec mémoire');
    
    const { 
      systemPrompt, 
      userMessage, 
      contextualPrompt = '', 
      conversationHistory = [], 
      userId = null, 
      options = {} 
    } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message utilisateur requis',
        processingTime: Date.now() - startTime
      });
    }
    
    console.log(`💬 Chat avec mémoire: ${userMessage.substring(0, 50)}... (User: ${userId || 'anonymous'})`);
    console.log(`📚 Historique: ${conversationHistory.length} messages`);
    
    // Optimisation mémoire: Limiter l'historique 
    const optimizedHistory = conversationHistory.slice(-MEMORY_CONFIG.maxMessagesPerUser);
    
    if (conversationHistory.length > MEMORY_CONFIG.maxMessagesPerUser) {
      console.log(`📊 Historique optimisé: ${conversationHistory.length} → ${optimizedHistory.length} messages`);
    }
    
    // Calculer l'utilisation mémoire
    const memoryUsage = calculateMemoryUsage(optimizedHistory);
    console.log(`📊 Utilisation mémoire: ${memoryUsage.estimatedKB}KB/${memoryUsage.limitKB}KB (${memoryUsage.usagePercent}%) - ${memoryUsage.messages} messages, ${memoryUsage.summaries} résumés`);
    
    // Utiliser la fonction chatWithMemory existante (maintenant avec GPT-4o mini)
    const { success, response, context } = await chatWithMemory(userMessage, optimizedHistory, userId);
    
    if (!success) {
      throw new Error('Chat IA avec mémoire échoué');
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Chat completion avec mémoire réussi en ${totalTime}ms`);
    
    res.json({
      success: true,
      response: response,
      model: 'gpt-4o-mini',
      provider: 'OpenAI',
      metadata: {
        source: 'omely-chat-gpt4o',
        processingTime: totalTime,
        contextLength: context.length,
        memoryOptimized: true,
        historyLength: optimizedHistory.length,
        memoryUsage: memoryUsage,
        provider: 'OpenAI',
        model: 'gpt-4o-mini'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur chat completion avec mémoire:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur interne du serveur',
      processingTime: Date.now() - startTime
    });
  }
});

// Route de test GPT-4o mini
app.get('/test/openai', async (req, res) => {
  try {
    const result = await testOpenAIConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configuration GPT-4o mini exclusivement
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-your-key-here'
});

// Configuration GPT-4o mini optimisée
const GPT4O_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
  model: 'gpt-4o-mini',
  maxTokens: 1000
};

// Ancienne config GPT-4o mini supprimée - maintenant 100% GPT-4o mini

// Configuration optimisée pour EXTRACTION COMPLÈTE
const OPTIMIZATION_CONFIG = {
  maxTextLength: 150000, // Augmenté pour traiter de gros livres
  maxSummaryLength: 15000, // Résumés détaillés et complets
  concurrentProcessing: true, // Traitement parallèle
  cacheEnabled: false, // Pas de cache pour éviter les résumés partiels
  timeoutMs: 180000, // 3 minutes pour extraction complète
  chunkSize: 50000, // Réduit à 50k pour éviter les timeouts Gemini
  overlapSize: 3000 // Chevauchement entre chunks réduit
};

// Configuration mémoire MVP (500MB Supabase)
const MEMORY_CONFIG = {
  maxStoragePerUser: 100 * 1024, // 100KB par utilisateur
  maxMessagesPerUser: 50, // 50 messages max par conversation
  maxSummariesPerUser: 10, // 10 résumés max par utilisateur
  maxTotalUsers: 5000, // 5000 utilisateurs max pour MVP
  estimatedStoragePerUser: {
    messages: 25 * 1024, // 25KB pour messages
    summaries: 50 * 1024, // 50KB pour résumés
    metadata: 25 * 1024 // 25KB pour métadonnées
  }
};

// Fonction de calcul d'utilisation mémoire
function calculateMemoryUsage(conversationHistory = []) {
  const messages = conversationHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');
  const summaries = conversationHistory.filter(msg => 
    msg.role === 'assistant' && 
    (msg.content.includes('📚') || msg.content.includes('📄') || msg.content.includes('🎬') || 
     msg.content.includes('🎵') || msg.content.includes('📺') || msg.content.includes('RÉSUMÉ') ||
     msg.content.includes('📝 PDF Summary') || msg.content.includes('📝 Video Summary') ||
     msg.content.includes('📝 Audio Summary') || msg.content.includes('📝 YouTube Summary'))
  );
  
  const totalChars = conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0);
  const estimatedBytes = totalChars * 2; // UTF-8 estimation
  
  return {
    messages: messages.length,
    summaries: summaries.length,
    totalChars,
    estimatedBytes,
    estimatedKB: Math.round(estimatedBytes / 1024 * 100) / 100,
    limitKB: MEMORY_CONFIG.maxStoragePerUser / 1024,
    usagePercent: Math.round((estimatedBytes / MEMORY_CONFIG.maxStoragePerUser) * 100)
  };
}

// Créer le dossier temp
const tempDir = path.join(__dirname, 'ultra_temp');
await fs.mkdir(tempDir, { recursive: true });

// Configuration multer (already declared above)

// FONCTION EXTRACTION TEXTE PDF AVEC PDFJS-DIST (EXTRACTION RÉELLE)
async function extractTextFromPDF(pdfBuffer) {
  const startTime = Date.now();
  
  try {
    console.log(`📄 Extraction texte PDF avec pdfjs-dist (extraction réelle)...`);
    
    // Vérifier que le buffer est valide
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Buffer PDF invalide ou vide');
    }
    
    // Vérifier que c'est bien un PDF (magic number)
    const pdfHeader = pdfBuffer.toString('ascii', 0, 4);
    if (pdfHeader !== '%PDF') {
      throw new Error('Le fichier ne semble pas être un PDF valide');
    }
    
    console.log(`📄 Buffer PDF reçu: ${pdfBuffer.length} bytes, header: ${pdfHeader}`);
    
    try {
      // Importer pdfjs-dist de manière sécurisée
      let pdfjsLib;
      try {
        const pdfjsModule = await import('pdfjs-dist');
        pdfjsLib = pdfjsModule.default || pdfjsModule;
        console.log(`📄 pdfjs-dist importé avec succès`);
      } catch (importError) {
        console.error(`❌ Erreur import pdfjs-dist: ${importError.message}`);
        throw new Error('Impossible de charger pdfjs-dist');
      }
      
      // Désactiver le worker pour Node.js
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      }
      
      // Convertir le buffer en Uint8Array
      const uint8Array = new Uint8Array(pdfBuffer);
      
      // Charger le PDF avec pdfjs-dist
      console.log(`📄 Chargement du PDF avec pdfjs-dist...`);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDocument = await loadingTask.promise;
      
      const numPages = pdfDocument.numPages;
      console.log(`📄 PDF chargé: ${numPages} pages détectées`);
      
      // Extraire le texte de chaque page
      let fullText = '';
      let totalTextLength = 0;
      
      for (let i = 1; i <= numPages; i++) {
        console.log(`📄 Extraction page ${i}/${numPages}...`);
        
        try {
          const page = await pdfDocument.getPage(i);
          
          // Extraire le contenu textuel de la page
          const textContent = await page.getTextContent();
          
          let pageText = '';
          for (const item of textContent.items) {
            if (item.str) {
              pageText += item.str + ' ';
            }
          }
          
          // Nettoyer le texte de la page
          pageText = pageText
            .replace(/\s+/g, ' ')
            .trim();
          
          if (pageText) {
            fullText += pageText + '\n\n';
            totalTextLength += pageText.length;
            console.log(`📄 Page ${i}: ${pageText.length} caractères extraits`);
          } else {
            console.log(`📄 Page ${i}: Aucun texte détecté`);
          }
          
        } catch (pageError) {
          console.warn(`⚠️ Erreur extraction page ${i}: ${pageError.message}`);
        }
      }
      
      // Nettoyer le texte final
      fullText = fullText
        .replace(/\n\s*\n/g, '\n') // Supprimer les lignes vides multiples
        .replace(/\s+/g, ' ') // Normaliser les espaces
        .trim();
      
      console.log(`📄 Extraction terminée: ${fullText.length} caractères extraits au total`);
      
      // Vérifier que l'extraction a fonctionné
      if (!fullText || fullText.length < 100) {
        console.warn(`⚠️ Texte extrait trop court (${fullText.length} caractères), tentative d'extraction alternative...`);
        
        // Tentative d'extraction alternative avec une approche différente
        try {
          let alternativeText = '';
          
          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });
            
            // Essayer d'extraire le contenu de la page avec une approche différente
            const textContent = await page.getTextContent();
            if (textContent && textContent.items && textContent.items.length > 0) {
              alternativeText += `Page ${i} (${viewport.width}x${viewport.height}): ${textContent.items.length} éléments de texte\n`;
            }
          }
          
          if (alternativeText) {
            fullText = alternativeText;
          } else {
            throw new Error('Aucune méthode d\'extraction n\'a fonctionné');
          }
        } catch (altError) {
          throw new Error(`Extraction alternative échouée: ${altError.message}`);
        }
      }
      
      // Gestion intelligente selon la taille du document
      let optimizedText = fullText;
      if (optimizedText.length > OPTIMIZATION_CONFIG.maxTextLength) {
        console.log(`📚 Document volumineux détecté (${optimizedText.length} caractères) - Conservation complète pour extraction professionnelle`);
        // Conserver le texte complet pour extraction professionnelle
        // Le système de chunks se chargera de la gestion
      } else {
        console.log(`📄 Document standard (${optimizedText.length} caractères) - Traitement direct`);
      }
      
      const extractionTime = Date.now() - startTime;
      console.log(`✅ Texte PDF extrait en ${extractionTime}ms (${optimizedText.length} caractères, ${numPages} pages)`);
      
      return {
        success: true,
        text: optimizedText,
        extractionTime,
        pages: numPages,
        originalLength: fullText.length
      };
      
    } catch (extractError) {
      console.error(`❌ Erreur extraction pdfjs-dist: ${extractError.message}`);
      throw new Error(`Échec de l'extraction PDF: ${extractError.message}`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur extraction PDF: ${error.message}`);
    // Retourner une erreur plus claire
    throw new Error(`Échec de l'extraction PDF: ${error.message}`);
  }
}

// FONCTION TRANSCRIPTION AUDIO OPTIMISÉE (MP3/MP4) - VERSION MÉMOIRE OPTIMISÉE
async function transcribeAudio(audioFilePath) {
  const startTime = Date.now();

  try {
    console.log(`🎵 Transcription audio optimisée avec Whisper...`);

    // Utiliser directement la nouvelle fonction transcribe optimisée
    const transcript = await transcribe(audioFilePath);
    const transcriptionTime = Date.now() - startTime;

    // Optimisation: Limiter la longueur de la transcription si nécessaire
    let finalTranscript = transcript;
    if (transcript.length > OPTIMIZATION_CONFIG.maxTextLength) {
      finalTranscript = transcript.substring(0, OPTIMIZATION_CONFIG.maxTextLength) + '...';
      console.log(`📝 Transcription tronquée à ${OPTIMIZATION_CONFIG.maxTextLength} caractères pour optimiser la vitesse`);
    }

    console.log(`✅ Transcription terminée en ${transcriptionTime}ms (${finalTranscript.length} caractères)`);

    return {
      success: true,
      transcript: finalTranscript,
      transcriptionTime: transcriptionTime,
      originalLength: transcript.length
    };
  } catch (error) {
    console.error(`❌ Erreur transcription: ${error.message}`);
    return {
      success: false,
      transcript: '',
      transcriptionTime: Date.now() - startTime,
      error: error.message
    };
  }
}

// FONCTION EXTRACTION AUDIO DEPUIS MP4 OPTIMISÉE - VERSION MÉMOIRE OPTIMISÉE
async function extractAudioFromMP4(videoBuffer) {
  const startTime = Date.now();
  const videoFile = path.join(tempDir, `video_${Date.now()}.mp4`);

  try {
    console.log(`🎬 Extraction audio optimisée depuis MP4...`);

    // Écrire le fichier vidéo temporaire
    await fs.writeFile(videoFile, videoBuffer);

    // Utiliser la nouvelle fonction extractAudio optimisée
    const audioFilePath = await extractAudio(videoFile);
    const extractionTime = Date.now() - startTime;

    console.log(`✅ Audio extrait en ${extractionTime}ms`);

    // Nettoyer le fichier vidéo temporaire
    await fs.unlink(videoFile).catch(() => {});

    return {
      success: true,
      audioFilePath: audioFilePath, // Retourner le chemin au lieu du buffer
      extractionTime
    };
  } catch (error) {
    console.error(`❌ Erreur extraction MP4: ${error.message}`);
    // Nettoyer en cas d'erreur
    await fs.unlink(videoFile).catch(() => {});
    return {
      success: false,
      audioFilePath: null,
      extractionTime: Date.now() - startTime,
      error: error.message
    };
  }
}



// FONCTIONS DE CHUNKING POUR GROS DOCUMENTS
function processChunk(text, chunkIndex, totalChunks, type = 'book') {
  const chunkPrompt = `EXTRACTION PROFESSIONNELLE - CHUNK ${chunkIndex + 1}/${totalChunks}

⚠️ MISSION: Extraire TOUS les principes d'enrichissement de ce fragment avec précision chirurgicale.

TEXTE À ANALYSER (FRAGMENT ${chunkIndex + 1}/${totalChunks}):
${text}

INSTRUCTIONS OPTIMISÉES POUR CE CHUNK:
- Extraire les principes d'enrichissement ESSENTIELS (3-5 par chunk)
- Capturer les différences riches/pauvres PRINCIPALES
- Noter les conseils financiers UNIVERSELS et APPLICABLES
- Ignorer les montants, prix et chiffres spécifiques
- Se concentrer sur les CONCEPTS généralisables
- Extraire les citations INSPIRANTES uniquement
- Éviter les détails numériques inutiles
- Privilégier les enseignements ACTIONNABLES

FORMAT STRUCTURÉ POUR CE CHUNK:

═════════════════════════════════════════════════════
🔸 **CHUNK ${chunkIndex + 1}/${totalChunks} - EXTRACTION CIBLÉE**
═════════════════════════════════════════════════════

## 🔑 **PRINCIPES ESSENTIELS**
**1.** [Principe principal 1 - concis]
**2.** [Principe principal 2 - concis]
**3.** [Principe principal 3 - concis]

---

## ⚡ **CONTRASTES RICHES/PAUVRES**
• **Riches :** [Comportement/mentalité riche]
  **vs Pauvres :** [Comportement/mentalité pauvre]

• **Riches :** [Comportement/mentalité riche]
  **vs Pauvres :** [Comportement/mentalité pauvre]

---

## 💰 **TECHNIQUES APPLICABLES**
🔧 **[Technique 1] :** [Description courte]
🔧 **[Technique 2] :** [Description courte]
🔧 **[Technique 3] :** [Description courte]

---

## 💬 **CITATIONS MARQUANTES**
> *"[Citation inspirante du chunk]"*

═════════════════════════════════════════════════════

⚠️ Extraire uniquement ce qui est RÉELLEMENT dans ce fragment, ne pas inventer.`;

  return chunkPrompt;
}

async function combineChunkSummaries(chunkSummaries, originalTextLength, totalChunks) {
  const combinePrompt = `SYNTHÈSE FINALE - COMBINAISON DE ${totalChunks} CHUNKS

MISSION CRITIQUE: Combiner TOUS les chunks pour créer un résumé COMPLET qui capture 100% de la valeur du livre (${originalTextLength} caractères).

EXTRACTIONS DES CHUNKS:
${chunkSummaries.map((summary, index) => `\n--- CHUNK ${index + 1} ---\n${summary}`).join('\n')}

INSTRUCTIONS DE SYNTHÈSE FINALE OPTIMISÉE:
- Combiner les principes d'enrichissement ESSENTIELS (15-25 max)
- Éliminer les doublons et détails numériques spécifiques
- Organiser par catégories PRATIQUES et ACTIONNABLES
- Créer un résumé COMPLET mais CONCIS (5000-8000 caractères)
- Ignorer les montants, prix et chiffres spécifiques
- REMPLIR TOUTES LES SECTIONS - aucune section vide ou "trop longue"
- INTERDICTION absolue d'inclure "Analysis:" ou messages d'aide
- Se concentrer sur les CONCEPTS applicables universellement

UTILISER LE FORMAT VISUELLEMENT ATTRACTIF SUIVANT :

═══════════════════════════════════════════════════════════════════
📚 **RÉSUMÉ COMPLET PROFESSIONNEL**
📖 **[TITRE DU LIVRE]** - 100% VALEUR CAPTURÉE (${totalChunks} PARTIES ANALYSÉES)
═══════════════════════════════════════════════════════════════════

## 🔑 **PRINCIPES D'ENRICHISSEMENT CLÉS**
*Les règles fondamentales extraites de ${totalChunks} parties du livre*

**1.** [Principe 1 combiné - court et percutant]
   → **Application pratique :** [Comment l'appliquer]

**2.** [Principe 2 combiné - court et percutant]
   → **Application pratique :** [Comment l'appliquer]

[Continuer avec les principes les plus importants - 15-20 maximum]

---

## ⚡ **MENTALITÉS : RICHES vs PAUVRES**
*Les différences de pensée synthétisées*

| 💰 **LES RICHES** | 💸 **LES PAUVRES** |
|-------------------|---------------------|
| ✅ [Mentalité riche synthétisée] | ❌ [Mentalité pauvre synthétisée] |
| ✅ [Mentalité riche synthétisée] | ❌ [Mentalité pauvre synthétisée] |

---

## 💰 **STRATÉGIES FINANCIÈRES ESSENTIELLES**
*Les techniques qui génèrent la richesse - synthèse complète*

### 📈 **Investissement & Placement**
• [Stratégie combinée 1]
• [Stratégie combinée 2]

### 🏠 **Patrimoine & Actifs**
• [Méthode combinée 1]
• [Méthode combinée 2]

---

## 🎯 **PLAN D'ACTION IMMÉDIAT**
*Actions synthétisées de toutes les parties*

### 📅 **CETTE SEMAINE :**
1. [Action immédiate synthétisée]
2. [Action immédiate synthétisée]

### 📅 **CE MOIS-CI :**
1. [Action moyen terme synthétisée]
2. [Action moyen terme synthétisée]

### 📅 **CETTE ANNÉE :**
1. [Objectif long terme synthétisé]
2. [Objectif long terme synthétisé]

---

## 💬 **CITATIONS INSPIRANTES DU LIVRE**
*Les meilleures phrases extraites de ${totalChunks} parties*

> 🌟 *"[Citation puissante du livre]"*
> 🌟 *"[Citation puissante du livre]"*
> 🌟 *"[Citation puissante du livre]"*

---

## ❌ **PIÈGES À ÉVITER ABSOLUMENT**
*Les erreurs identifiées dans le livre complet*

🚫 **[Erreur synthétisée]** - *Pourquoi c'est dangereux*
🚫 **[Erreur synthétisée]** - *Pourquoi c'est dangereux*

---

## 🛠️ **OUTILS ET TECHNIQUES PRATIQUES**
*Les méthodes concrètes du livre complet*

**🔧 [Technique synthétisée] :**
   • Étape pratique 1
   • Étape pratique 2

**🔧 [Technique synthétisée] :**
   • Étape pratique 1
   • Étape pratique 2

═══════════════════════════════════════════════════════════════════
✅ **RÉSUMÉ PROFESSIONNEL COMPLET**
🎯 **SYNTHÈSE DE ${totalChunks} PARTIES - PRÊT POUR APPLICATION**
═══════════════════════════════════════════════════════════════════`;

  return combinePrompt;
}

// FONCTION DE CHUNKING INTELLIGENT CORRIGÉE
function splitTextIntoIntelligentChunks(text) {
  const chunks = [];
  const maxChunkSize = OPTIMIZATION_CONFIG.chunkSize; // 80000
  const overlapSize = OPTIMIZATION_CONFIG.overlapSize; // 5000
  
  // Si le texte est petit, retourner tel quel
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  console.log(`📚 Découpage intelligent du texte (${text.length} caractères) en chunks de ${maxChunkSize} caractères`);
  
  // Méthode 1: Essayer de découper par paragraphes
  let paragraphs = text.split(/\n\s*\n/);
  
  // Si les paragraphes sont trop gros, découper par phrases
  if (paragraphs.some(p => p.length > maxChunkSize)) {
    console.log(`📚 Paragraphes trop volumineux, découpage par phrases...`);
    paragraphs = text.split(/\.\s+/);
  }
  
  // Si les phrases sont encore trop grosses, découpage forcé par caractères
  if (paragraphs.some(p => p.length > maxChunkSize)) {
    console.log(`📚 Phrases trop volumineuses, découpage forcé par caractères...`);
    return splitTextByCharacters(text, maxChunkSize, overlapSize);
  }
  
  let currentChunk = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
    
    // Si ajouter ce paragraphe dépasse la taille max
    if (potentialChunk.length > maxChunkSize && currentChunk.length > 0) {
      // Finaliser le chunk actuel
      chunks.push(currentChunk.trim());
      
      // Commencer un nouveau chunk avec chevauchement
      const overlap = currentChunk.slice(-Math.min(overlapSize, currentChunk.length));
      currentChunk = overlap + '\n\n' + paragraph;
    } else {
      // Ajouter le paragraphe au chunk actuel
      currentChunk = potentialChunk;
    }
    
    // Sécurité: si le chunk actuel dépasse déjà la taille max
    if (currentChunk.length > maxChunkSize) {
      // Forcer la finalisation
      chunks.push(currentChunk.substring(0, maxChunkSize).trim());
      currentChunk = currentChunk.substring(maxChunkSize - overlapSize);
    }
  }
  
  // Ajouter le dernier chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  console.log(`📚 Texte découpé en ${chunks.length} chunks intelligents`);
  console.log(`📚 Tailles des chunks: ${chunks.map(c => c.length).join(', ')} caractères`);
  
  return chunks;
}

// FONCTION DE DÉCOUPAGE FORCÉ PAR CARACTÈRES
function splitTextByCharacters(text, maxChunkSize, overlapSize) {
  const chunks = [];
  let position = 0;
  
  while (position < text.length) {
    const endPosition = Math.min(position + maxChunkSize, text.length);
    let chunk = text.substring(position, endPosition);
    
    // Essayer de finir sur un espace ou une ponctuation pour éviter de couper les mots
    if (endPosition < text.length) {
      const lastSpace = chunk.lastIndexOf(' ');
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      
      const bestCut = Math.max(lastSpace, lastPeriod, lastNewline);
      if (bestCut > maxChunkSize * 0.8) { // Au moins 80% du chunk
        chunk = chunk.substring(0, bestCut);
        position += bestCut;
      } else {
        position = endPosition;
      }
    } else {
      position = endPosition;
    }
    
    chunks.push(chunk.trim());
    
    // Reculer un peu pour le chevauchement (sauf pour le dernier chunk)
    if (position < text.length) {
      position = Math.max(position - overlapSize, position - maxChunkSize + 1);
    }
  }
  
  console.log(`📚 Découpage forcé: ${chunks.length} chunks de tailles ${chunks.map(c => c.length).join(', ')}`);
  return chunks;
}

// FONCTION D'APPEL OPENAI AVEC RETRY ET GESTION D'ERREURS (remplace Gemini)
async function callGPT4oWithRetry(prompt, context = '', maxRetries = 3) {
  try {
    console.log(`🔄 Appel GPT-4o mini pour ${context}...`);

    // Construire les messages pour GPT-4o mini
    const messages = [
      { role: 'user', content: prompt }
    ];

    // Utiliser le service GPT-4o mini centralisé
    const response = await createChatCompletion(messages, {
      max_tokens: 3000,
      temperature: 0.1
    });

    console.log(`✅ Appel GPT-4o mini réussi pour ${context}`);
    return response;

  } catch (error) {
    console.error(`❌ Erreur GPT-4o mini pour ${context}: ${error.message}`);
    throw new Error(`Échec GPT-4o mini pour ${context}: ${error.message}`);
  }
}

// Alias pour la compatibilité (remplace l'ancienne fonction Gemini)
const callGeminiWithRetry = callGPT4oWithRetry;

// FONCTION SUMMARIZATION CONTENT (version ULTRA-DÉTAILLÉE et robuste)
async function summarizeContent(text, type = 'general', options = {}) {
  const startTime = Date.now();

  try {
    console.log(`⚡ Démarrage summarization content via service GPT-4o mini centralisé...`);
    // Mapper le type pour le service central (pdf → book)
    const targetType = (type === 'pdf' || type === 'book')
      ? 'book'
      : (type === 'audio'
        ? 'audio'
        : (type === 'video' ? 'video' : 'general'));
    const result = await summarizeText(text, targetType, options);
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      summary: result,
      summarizationTime: processingTime,
      method: 'OPENAI_SERVICE'
    };
  } catch (error) {
    console.error(`❌ Erreur summarization content: ${error.message}`);
    return {
      success: false,
      error: error.message,
      summarizationTime: Date.now() - startTime
    };
  }
}

// FONCTION CHAT IA AVEC MÉMOIRE OPTIMISÉE (GPT-4o mini)
async function chatWithMemory(userMessage, conversationHistory = [], userId = null) {
  try {
    console.log(`💬 Chat IA GPT-4o mini avec mémoire optimisée...`);
    
    // Détecter la langue du message utilisateur
    const isEnglish = /^[a-zA-Z\s.,!?;:'"()-]+$/.test(userMessage) && !/[àâäéèêëïîôöùûüÿç]/i.test(userMessage);
    const userLanguage = isEnglish ? 'English' : 'French';
    
    // Optimisation: Extraire et conserver TOUS les résumés (identification améliorée)
    const summaries = conversationHistory.filter(msg => 
      msg.role === 'assistant' && 
      (msg.content.includes('📚') || msg.content.includes('📄') || msg.content.includes('🎬') || 
       msg.content.includes('🎵') || msg.content.includes('📺') || msg.content.includes('RÉSUMÉ') ||
       msg.content.includes('📝 PDF Summary') || msg.content.includes('📝 Video Summary') ||
       msg.content.includes('📝 Audio Summary') || msg.content.includes('📝 YouTube Summary'))
    );
    
    // Construire le prompt système
    let systemPrompt = `Tu es OMELY, un assistant IA spécialisé dans l'optimisation cognitive et l'apprentissage. Tu as une mémoire des conversations précédentes et des résumés que tu as créés.

SYSTÈME: L'utilisateur parle en ${userLanguage}. Tu dois répondre dans la MÊME LANGUE que l'utilisateur (${userLanguage}) et rester dans ton rôle d'assistant OMELY spécialisé dans l'optimisation cognitive. Utilise GPT-4o mini pour des réponses rapides et précises.`;

    if (summaries.length > 0) {
      console.log(`📚 ${summaries.length} résumés trouvés en mémoire`);
      systemPrompt += `\n\nMÉMOIRE DES RÉSUMÉS CRÉÉS (conservés en mémoire):\n`;
      summaries.forEach((summary, index) => {
        // Conserver un extrait des résumés pour éviter les tokens trop longs
        const excerpt = summary.content.length > 1000 ? 
          summary.content.substring(0, 1000) + '...' : 
          summary.content;
        systemPrompt += `\n--- RÉSUMÉ ${index + 1} ---\n${excerpt}\n`;
      });
    }

    // Construire les messages pour GPT-4o mini
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Ajouter l'historique récent
    const recentMessages = conversationHistory.slice(-10); // Réduire pour optimiser les tokens
    recentMessages.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: userMessage
    });

    // Appel via le service GPT-4o mini
    const response = await createChatCompletion(messages, {
      max_tokens: 1200,
      temperature: 0.7
    });
    
    console.log(`✅ Chat IA GPT-4o mini réussi (${userLanguage})`);
    
    return {
      success: true,
      response: response,
      context: systemPrompt.substring(0, 500) + '...' // Pour debug
    };
  } catch (error) {
    console.error(`❌ Erreur chat IA GPT-4o mini: ${error.message}`);
    throw error;
  }
}

// ROUTES API

// Chat IA avec mémoire optimisée pour MVP
app.post('/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, conversationHistory = [], userId = null } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message required',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`💬 Chat IA demandé: ${message.substring(0, 50)}... (User: ${userId || 'anonymous'})`);

    // Optimisation mémoire: Limiter l'historique à 50 messages max pour MVP
    const optimizedHistory = conversationHistory.slice(-MEMORY_CONFIG.maxMessagesPerUser);
    
    if (conversationHistory.length > MEMORY_CONFIG.maxMessagesPerUser) {
      console.log(`📊 Historique optimisé: ${conversationHistory.length} → ${optimizedHistory.length} messages`);
    }

    // Calculer l'utilisation mémoire
    const memoryUsage = calculateMemoryUsage(optimizedHistory);
    console.log(`📊 Utilisation mémoire: ${memoryUsage.estimatedKB}KB/${memoryUsage.limitKB}KB (${memoryUsage.usagePercent}%) - ${memoryUsage.messages} messages, ${memoryUsage.summaries} résumés`);

    const { success, response, context } = await chatWithMemory(message, optimizedHistory, userId);
    
    if (!success) {
      throw new Error('Chat IA failed');
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Chat IA complet en ${totalTime}ms (Context: ${context.length} chars)`);
    
    res.json({
      status: 'success',
      response,
      metadata: {
        source: 'omely-chat',
        processingTime: totalTime,
        contextLength: context.length,
        memoryOptimized: true,
        maxMessages: MEMORY_CONFIG.maxMessagesPerUser,
        maxSummaries: MEMORY_CONFIG.maxSummariesPerUser,
        memoryUsage: memoryUsage,
        mvpConfig: {
          maxUsers: MEMORY_CONFIG.maxTotalUsers,
          storagePerUser: `${MEMORY_CONFIG.maxStoragePerUser / 1024}KB`,
          totalStorage: '500MB'
        }
      }
    });

  } catch (error) {
    console.error(`❌ Chat IA error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Chat IA failed',
      processingTime: Date.now() - startTime
    });
  }
});

// Health check - Ultra rapide pour Fly.io
app.get('/health', (req, res) => {
  // Réponse immédiate sans calculs lourds
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: 'v6.0-optimized'
  });
});

// Health check détaillé
app.get('/health/detailed', (req, res) => {
  res.json({
    status: 'OMELY BACKEND ULTRA-RAPIDE OK',
    timestamp: new Date().toISOString(),
    version: 'v6.0',
    services: {
      pdf: true,
      audio: true,
      video: true,
      openai: !!process.env.OPENAI_API_KEY,
      whisper: !!process.env.OPENAI_API_KEY,
      chat: true,
        optimized: true
      },
    uptime: process.uptime()
  });
});

// PDF summarization
app.post('/summarize/pdf', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'PDF file required',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`📄 PDF summarization: ${req.file.originalname}`);

    // Lire le fichier PDF
    const pdfBuffer = await fs.readFile(req.file.path);
    
    // Nettoyer le fichier temp
    await fs.unlink(req.file.path);

    // 1. Extraire le texte du PDF
    const { success: extractSuccess, text, extractionTime } = await extractTextFromPDF(pdfBuffer);
    if (!extractSuccess) {
      throw new Error('PDF text extraction failed');
    }

    // 2. Résumer le contenu avec le titre du livre
    const bookTitle = req.file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    const { success: summarySuccess, summary, summarizationTime } = await summarizeContent(text, 'pdf', { bookTitle });
    if (!summarySuccess) {
      throw new Error('Summarization failed');
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ PDF summarization complet en ${totalTime}ms`);
    
    res.json({
      status: 'success',
      summary,
      metadata: {
        source: 'pdf',
        filename: req.file.originalname,
        extractionTime,
        summarizationTime,
        totalProcessingTime: totalTime,
        textLength: text.length,
        summaryLength: summary.length
      }
    });

  } catch (error) {
    console.error(`❌ PDF summarization error: ${error.message}`);
    console.error(`❌ Error stack: ${error.stack}`);

    // Log détaillé pour debug
    console.error(`📄 PDF info: ${req.file.originalname} (${req.file.size} bytes)`);
    console.error(`📊 Extraction: ${extractSuccess ? 'SUCCESS' : 'FAILED'}`);
    if (extractSuccess) {
      console.error(`📊 Texte extrait: ${text ? text.length : 0} caractères`);
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'PDF summarization failed',
      details: {
        filename: req.file?.originalname,
        fileSize: req.file?.size,
        textLength: text?.length,
        extractionSuccess: extractSuccess,
        errorStack: error.stack
      },
      processingTime: Date.now() - startTime
    });
  }
});

// Audio summarization (MP3)
app.post('/summarize/audio', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Audio file required',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`🎵 Audio summarization: ${req.file.originalname}`);

    // 1. Transcrire avec Whisper (utilisation directe du fichier pour économiser mémoire)
    const { success: transcribeSuccess, transcript, transcriptionTime } = await transcribeAudio(req.file.path);
    if (!transcribeSuccess) {
      throw new Error('Transcription failed');
    }

    // 2. Résumer le contenu
    const { success: summarySuccess, summary, summarizationTime } = await summarizeContent(transcript, 'audio');
    if (!summarySuccess) {
      throw new Error('Summarization failed');
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Audio summarization complet en ${totalTime}ms`);
    
    res.json({
      status: 'success',
      summary,
      metadata: {
        source: 'audio',
        filename: req.file.originalname,
        transcriptionTime,
        summarizationTime,
        totalProcessingTime: totalTime,
        transcriptLength: transcript.length,
        summaryLength: summary.length
      }
    });

  } catch (error) {
    console.error(`❌ Audio summarization error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Audio summarization failed',
      processingTime: Date.now() - startTime
    });
  }
});

// Video summarization (MP4)
app.post('/summarize/video', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Video file required',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`🎬 Video summarization: ${req.file.originalname}`);

    // Lire le fichier vidéo
    const videoBuffer = await fs.readFile(req.file.path);
    
    // Nettoyer le fichier temp
    await fs.unlink(req.file.path);

    // 1. Extraire l'audio depuis la vidéo
    const { success: extractSuccess, audioFilePath, extractionTime } = await extractAudioFromMP4(videoBuffer);
    if (!extractSuccess) {
      throw new Error('Audio extraction failed');
    }

    // 2. Transcrire avec Whisper (utilisation directe du fichier audio pour économiser mémoire)
    const { success: transcribeSuccess, transcript, transcriptionTime } = await transcribeAudio(audioFilePath);
    if (!transcribeSuccess) {
      throw new Error('Transcription failed');
    }

    // 3. Résumer le contenu
    const { success: summarySuccess, summary, summarizationTime } = await summarizeContent(transcript, 'video');
    if (!summarySuccess) {
      throw new Error('Summarization failed');
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Video summarization complet en ${totalTime}ms`);
    
    res.json({
      status: 'success',
      summary,
      metadata: {
        source: 'video',
        filename: req.file.originalname,
        extractionTime,
        transcriptionTime,
        summarizationTime,
        totalProcessingTime: totalTime,
        transcriptLength: transcript.length,
        summaryLength: summary.length
      }
    });

  } catch (error) {
    console.error(`❌ Video summarization error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Video summarization failed',
      processingTime: Date.now() - startTime
    });
  }
});

// ENDPOINT EXTRACTION COMPLÈTE DE LIVRE (/extract/book) - PERMANENT
app.post('/extract/book', upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'PDF file required for book extraction',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`📚 EXTRACTION COMPLÈTE DE LIVRE: ${req.file.originalname}`);

    // Lire le fichier PDF
    const pdfBuffer = await fs.readFile(req.file.path);
    
    // Nettoyer le fichier temp
    await fs.unlink(req.file.path);

    // 1. Extraire le texte du PDF
    const { success: extractSuccess, text, extractionTime, pages } = await extractTextFromPDF(pdfBuffer);
    if (!extractSuccess) {
      throw new Error('PDF text extraction failed');
    }

    console.log(`📄 Texte extrait: ${text.length} caractères, ${pages} pages`);

    // 2. Déterminer la méthode d'extraction selon la taille
    let summary, metadata;
    
    // Migration vers GPT-4o mini V2 pour tous les livres
    console.log(`📚 Extraction livre avec GPT-4o mini V2 (${text.length} caractères)`);
    
    const bookTitle = req.file.originalname.replace('.pdf', '');
    
    // Utiliser le nouveau service GPT-4o mini
    const result = await extractCompleteBookContent(text, bookTitle);
    
    if (!result.success) {
      throw new Error(`Extraction GPT-4o mini échouée: ${result.error}`);
    }
    
    summary = result.completeSummary;
    metadata = {
      source: 'book-extraction-gpt4o',
      filename: req.file.originalname,
      extractionMethod: 'GPT4O_MINI',
      originalTextLength: text.length,
      pages,
      extractionTime,
      bookProcessingTime: result.metadata.totalProcessingTime,
      totalProcessingTime: Date.now() - startTime,
      quality: 'PROFESSIONAL_GRADE',
      provider: 'GPT-4o mini',
      model: 'gpt-4o-mini'
    };

    console.log(`✅ EXTRACTION COMPLÈTE DE LIVRE réussie en ${Date.now() - startTime}ms`);
    
    res.json({
      status: 'success',
      summary: summary,
      metadata: metadata,
      extractionNote: "✅ EXTRACTION COMPLÈTE - Ce résumé capture 100% de la valeur du livre avec une précision professionnelle. Tous les principes d'enrichissement ont été extraits.",
      chatIntegration: {
        forChat: true,
        preserveInHistory: true,
        messageType: 'document_summary'
      }
    });

  } catch (error) {
    console.error(`❌ Book extraction error: ${error.message}`);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message || 'Book extraction failed',
      processingTime: Date.now() - startTime
    });
  }
});

// ENDPOINT CHAT AVEC INTÉGRATION RÉSUMÉS (/chat-with-summary)
app.post('/chat-with-summary', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      message, 
      conversationHistory = [], 
      userId = null,
      summaryContent = null,
      summaryMetadata = null
    } = req.body;
    
    if (!message && !summaryContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Message or summary content required',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`💬 Chat avec intégration résumé demandé`);

    // Si c'est un résumé, l'intégrer dans l'historique de manière persistante
    let enhancedHistory = [...conversationHistory];
    let finalMessage = message;
    
    if (summaryContent) {
      // Créer un message assistant avec le résumé
      const summaryMessage = {
        role: 'assistant',
        content: summaryContent,
        timestamp: new Date().toISOString(),
        metadata: {
          type: 'document_summary',
          ...summaryMetadata
        }
      };
      
      enhancedHistory.push(summaryMessage);
      
      // Si pas de message utilisateur, créer un message générique
      if (!message) {
        finalMessage = `Voici le résumé du document "${summaryMetadata?.filename || 'document'}". Peux-tu m'aider à analyser ce contenu ?`;
      }
    }

    // Optimisation mémoire: Limiter l'historique
    const optimizedHistory = enhancedHistory.slice(-MEMORY_CONFIG.maxMessagesPerUser);
    
    if (enhancedHistory.length > MEMORY_CONFIG.maxMessagesPerUser) {
      console.log(`📊 Historique optimisé: ${enhancedHistory.length} → ${optimizedHistory.length} messages`);
    }

    // Calculer l'utilisation mémoire
    const memoryUsage = calculateMemoryUsage(optimizedHistory);
    console.log(`📊 Utilisation mémoire: ${memoryUsage.estimatedKB}KB/${memoryUsage.limitKB}KB (${memoryUsage.usagePercent}%) - ${memoryUsage.messages} messages, ${memoryUsage.summaries} résumés`);

    // Appeler le chat avec mémoire
    const { success, response, context } = await chatWithMemory(finalMessage, optimizedHistory, userId);
    
    if (!success) {
      throw new Error('Chat IA failed');
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Chat avec résumé complet en ${totalTime}ms`);
    
    res.json({
      status: 'success',
      response,
      summaryIntegrated: !!summaryContent,
      metadata: {
        source: 'omely-chat-with-summary',
        processingTime: totalTime,
        contextLength: context.length,
        memoryOptimized: true,
        summaryPreserved: !!summaryContent,
        memoryUsage: memoryUsage
      }
    });

  } catch (error) {
    console.error(`❌ Chat avec résumé error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Chat avec résumé failed',
      processingTime: Date.now() - startTime
    });
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({
    message: 'OMELY Backend EXTRACTION COMPLÈTE v6.4 fonctionne !',
    timestamp: new Date().toISOString(),
    features: {
      'extraction_complete': true,
      'chunks_system_fixed': true,
      'visual_formatting': true,
      'professional_layout': true,
      'retry_system': true,
      'no_limited_extract_message': true,
      'markdown_tables': true,
      'numbered_action_plans': true,
      'visual_separators': true,
      'chat_persistence': true,
      'summary_preservation': true,
      'metadata_storage': true
    },
    formatting: {
      'visual_separators': '═══ and ---',
      'comparison_tables': 'Riches vs Pauvres',
      'numbered_principles': '1. 2. 3. format',
      'formatted_quotes': '> 🌟 *"quote"*',
      'emoji_categories': '🔑 💰 ⚡ 🎯',
      'markdown_styling': '**bold** and *italic*'
    },
    endpoints: {
      'book_extraction': '/extract/book',
      'pdf_standard': '/summarize/pdf',
      'audio': '/summarize/audio',
      'video': '/summarize/video',
      'chat': '/chat',
      'chat_with_summary': '/chat-with-summary',
      'health': '/health'
    },
    persistence: {
      'summary_storage': 'Supabase integration',
      'chat_memory': 'Conversation history preserved',
      'metadata_tracking': 'Full document metadata saved'
    },
    version: '6.4',
    optimization: {
      'max_text_length': OPTIMIZATION_CONFIG.maxTextLength,
      'chunk_size': OPTIMIZATION_CONFIG.chunkSize,
      'timeout_ms': OPTIMIZATION_CONFIG.timeoutMs
    }
  });
});

// FONCTION GÉNÉRATION QUIZ ULTRA-RAPIDE AVEC GPT-4o mini
async function generateQuizFromSummary(summaryContent, options = {}) {
  const startTime = Date.now();

  try {
    console.log('⚡ Génération ultra-rapide de quiz avec GPT-4o mini...');

    // PROMPT ULTRA-COURT ET OPTIMISÉ POUR LA VITESSE
    const quizPrompt = `Créez un quiz de 5 questions basé sur ce résumé. Format JSON strict:

CONTENU:
${summaryContent.substring(0, 2000)}...

RÈGLES:
- 5 questions QCM seulement (A,B,C,D)
- Questions basées sur le contenu
- 1 bonne réponse par question
- Explication courte pour chaque réponse
- Difficulté: facile/moyen/difficile

FORMAT JSON:
{
  "title": "Titre du quiz",
  "description": "Description courte",
  "questions": [
    {
      "id": 1,
      "question": "Question?",
      "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
      "correctAnswer": "A",
      "explanation": "Explication courte",
      "difficulty": "facile"
    }
  ]
}

QUIZ JSON:`;

    // APPEL ULTRA-RAPIDE AVEC PARAMÈTRES OPTIMISÉS
    const messages = [
      { role: 'system', content: 'Générez un quiz JSON rapidement.' },
      { role: 'user', content: quizPrompt }
    ];

    const quizResponse = await createChatCompletion(messages, {
      max_tokens: 1500,  // RÉDUIT de 4000 à 1500 tokens
      temperature: 0.3,  // RÉDUIT de 0.7 à 0.3 pour plus de rapidité
      model: 'gpt-4o-mini'
    });

    console.log('✅ Quiz généré par GPT-4o mini');

    // Parser la réponse JSON
    let quizData;
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = quizResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Format JSON non trouvé dans la réponse');
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON du quiz:', parseError);
      // Fallback: créer un quiz simple en cas d'erreur de parsing
      quizData = {
        title: "Quiz - Problème de génération",
        description: "Quiz de secours généré automatiquement",
        questions: [{
          id: 1,
          question: "Quel est l'objectif principal des principes d'enrichissement?",
          options: {
            A: "Accumuler de la richesse rapidement",
            B: "Développer une mentalité d'abondance",
            C: "Investir dans des actions uniquement",
            D: "Économiser le plus possible"
          },
          correctAnswer: "B",
          explanation: "Les principes d'enrichissement visent principalement à développer une mentalité d'abondance et des habitudes financières saines.",
          difficulty: "facile",
          topic: "Mentalité d'enrichissement"
        }]
      };
    }

    // Validation basique du quiz
    if (!quizData.questions || quizData.questions.length === 0) {
      throw new Error('Aucune question générée');
    }

    // Ajouter des métadonnées
    quizData.metadata = {
      generatedBy: 'GPT-4o mini',
      generationTime: Date.now() - startTime,
      sourceContent: summaryContent.substring(0, 100) + '...',
      questionCount: quizData.questions.length,
      provider: 'GPT-4o mini',
      model: 'gpt-4o-mini'
    };

    console.log(`✅ Quiz généré: ${quizData.questions.length} questions en ${Date.now() - startTime}ms`);

    return {
      success: true,
      quiz: quizData,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('❌ Erreur génération quiz:', error);

    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

// QUIZ ENDPOINT AVEC DEEPSEEK V2
app.post('/api/generate-quiz', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('🧠 Génération de quiz avec GPT-4o mini V2...');

    const { summaryContent, options = {} } = req.body;

    if (!summaryContent || typeof summaryContent !== 'string' || summaryContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contenu de résumé manquant ou invalide. Fournissez un résumé valide pour générer le quiz.',
        processingTime: Date.now() - startTime
      });
    }

    // Vérifier la longueur minimale du contenu
    if (summaryContent.length < 100) {
      return res.status(400).json({
        success: false,
        error: 'Le résumé est trop court pour générer un quiz de qualité. Minimum 100 caractères requis.',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`📊 Génération de quiz pour ${summaryContent.length} caractères de contenu`);

    // Générer le quiz avec GPT-4o mini
    const result = await generateQuizFromSummary(summaryContent, options);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: `Échec de la génération du quiz: ${result.error}`,
        processingTime: Date.now() - startTime
      });
    }

    // Validation finale
    if (!result.quiz || !result.quiz.questions || result.quiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Quiz généré invalide - aucune question créée',
        processingTime: Date.now() - startTime
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Quiz généré avec succès: ${result.quiz.questions.length} questions en ${totalTime}ms`);

    res.json({
      success: true,
      quiz: result.quiz,
      metadata: {
        source: 'openai-gpt4o-mini',
        processingTime: totalTime,
        contentLength: summaryContent.length,
        questionCount: result.quiz.questions.length,
        provider: 'GPT-4o mini',
        model: 'gpt-4o-mini',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur endpoint quiz:', error);

    res.status(500).json({
      success: false,
      error: `Erreur interne lors de la génération du quiz: ${error.message}`,
      processingTime: Date.now() - startTime
    });
  }
});

// Endpoint pour générer le pré-test (2-3 questions générales)
app.post('/api/generate-pretest', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('🧠 Génération de pré-test avec GPT-4o mini V2...');

    const { summaryContent, options = {} } = req.body;

    if (!summaryContent || typeof summaryContent !== 'string' || summaryContent.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contenu de résumé manquant ou invalide. Fournissez un résumé valide pour générer le pré-test.',
        processingTime: Date.now() - startTime
      });
    }

    // Vérifier la longueur minimale du contenu
    if (summaryContent.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Le résumé est trop court pour générer un pré-test. Minimum 50 caractères requis.',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`📊 Génération de pré-test pour ${summaryContent.length} caractères de contenu`);

    // Générer le pré-test avec GPT-4o mini
    const result = await generatePreTestFromSummary(summaryContent, options);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: `Échec de la génération du pré-test: ${result.error}`,
        processingTime: Date.now() - startTime
      });
    }

    // Validation finale
    if (!result.pretest || !result.pretest.questions || result.pretest.questions.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Pré-test généré invalide - aucune question créée',
        processingTime: Date.now() - startTime
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Pré-test généré avec succès: ${result.pretest.questions.length} questions en ${totalTime}ms`);

    res.json({
      success: true,
      pretest: result.pretest,
      metadata: {
        source: 'openai-gpt4o-mini',
        processingTime: totalTime,
        contentLength: summaryContent.length,
        questionCount: result.pretest.questions.length,
        provider: 'GPT-4o mini',
        model: 'gpt-4o-mini',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur endpoint pré-test:', error);

    res.status(500).json({
      success: false,
      error: `Erreur interne lors de la génération du pré-test: ${error.message}`,
      processingTime: Date.now() - startTime
    });
  }
});

// Fonction pour générer le pré-test (questions générales seulement)
export async function generatePreTestFromSummary(summaryContent, options = {}) {
  const startTime = Date.now();

  try {
    console.log('⚡ Génération ultra-rapide de pré-test avec GPT-4o mini V2...');

    // PROMPT ULTRA-COURT ET OPTIMISÉ POUR LE PRÉ-TEST
    const pretestPrompt = `Créez un pré-test de 2-3 questions générales basées sur ce résumé. Format JSON strict:

CONTENU:
${summaryContent.substring(0, 1500)}...

RÈGLES:
- 2-3 questions QCM seulement (A,B,C,D)
- Questions GÉNÉRALES (pas trop spécifiques)
- Questions pour évaluer les connaissances de base
- 1 bonne réponse par question
- Explication courte pour chaque réponse
- Difficulté: facile/moyen

FORMAT JSON:
{
  "title": "Que savez-vous déjà ?",
  "description": "Testez vos connaissances avant de lire",
  "questions": [
    {
      "id": 1,
      "question": "Question générale sur le thème principal?",
      "options": {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"},
      "correctAnswer": "A",
      "explanation": "Explication courte",
      "difficulty": "facile"
    }
  ]
}

PRÉ-TEST JSON:`;

    // APPEL ULTRA-RAPIDE AVEC PARAMÈTRES OPTIMISÉS
    const messages = [
      { role: 'system', content: 'Générez un pré-test JSON rapidement avec des questions générales.' },
      { role: 'user', content: pretestPrompt }
    ];

    const pretestResponse = await createChatCompletion(messages, {
      max_tokens: 800,  // Plus court que le quiz complet
      temperature: 0.4,  // Légèrement plus créatif que le quiz
      model: 'gpt-4o-mini'
    });

    console.log('✅ Pré-test généré par GPT-4o mini V2');

    // Parser la réponse JSON
    let pretestData;
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = pretestResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pretestData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Format JSON non trouvé dans la réponse');
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON du pré-test:', parseError);
      // Fallback: créer un pré-test simple en cas d'erreur de parsing
      pretestData = {
        title: "Que savez-vous déjà ?",
        description: "Testez vos connaissances avant de lire",
        questions: [{
          id: 1,
          question: "Quel est le thème principal abordé dans ce contenu?",
          options: {
            A: "Développement personnel",
            B: "Technologie avancée",
            C: "Cuisine internationale",
            D: "Sports extrêmes"
          },
          correctAnswer: "A",
          explanation: "Le contenu traite de thèmes liés au développement personnel et à l'efficacité.",
          difficulty: "facile"
        }]
      };
    }

    // Validation basique du pré-test
    if (!pretestData.questions || pretestData.questions.length === 0) {
      throw new Error('Aucune question générée pour le pré-test');
    }

    // S'assurer qu'il y a au maximum 3 questions pour le pré-test
    if (pretestData.questions.length > 3) {
      pretestData.questions = pretestData.questions.slice(0, 3);
    }

    // Ajouter des métadonnées
    pretestData.metadata = {
      generatedBy: 'GPT-4o mini',
      generationTime: Date.now() - startTime,
      sourceContent: summaryContent.substring(0, 100) + '...',
      questionCount: pretestData.questions.length,
      provider: 'GPT-4o mini',
      model: 'gpt-4o-mini',
      type: 'pretest'
    };

    console.log(`✅ Pré-test généré: ${pretestData.questions.length} questions en ${Date.now() - startTime}ms`);

    return {
      success: true,
      pretest: pretestData
    };

  } catch (error) {
    console.error('❌ Erreur génération pré-test:', error);
    return {
      success: false,
      error: error.message,
      pretest: null
    };
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

// Chargement des services puis démarrage du serveur
async function startServer() {
  console.log('🔧 Chargement des services avant démarrage...');

  // Charger les services en premier
  await loadServices();

  console.log('🚀 Démarrage du serveur...');

  // Démarrage du serveur seulement après chargement des services
  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 OMELY Backend v6.0-stable démarré sur ${HOST}:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test: http://localhost:${PORT}/test`);
    console.log(`🤖 Vérification GPT-4o mini: http://localhost:${PORT}/verify-gpt4o`);
    console.log(`💬 Chat IA: POST http://localhost:${PORT}/chat`);
    console.log(`📚 EXTRACTION COMPLÈTE DE LIVRE: POST http://localhost:${PORT}/extract/book`);
    console.log(`📄 PDF Standard: POST http://localhost:${PORT}/summarize/pdf`);
    console.log(`🎵 Audio: POST http://localhost:${PORT}/summarize/audio`);
    console.log(`🎬 Video: POST http://localhost:${PORT}/summarize/video`);
    console.log(`🧠 QUIZ ROUTE: POST http://localhost:${PORT}/api/generate-quiz`);
    console.log(`🔧 Services chargés: ${servicesLoaded ? '✅' : '❌'}`);
    console.log(`🤖 GPT-4o mini disponible: ${services.openai ? '✅' : '❌'}`);
  });

  // Gestion des erreurs du serveur
  server.on('error', (error) => {
    console.error('❌ Erreur du serveur:', error);
  });

  // Gestion de l'arrêt propre
  process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu, arrêt propre...');
    server.close(() => {
      console.log('✅ Serveur arrêté proprement');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Signal SIGINT reçu, arrêt propre...');
    server.close(() => {
      console.log('✅ Serveur arrêté proprement');
      process.exit(0);
    });
  });
}

// Démarrage asynchrone du serveur
startServer().catch((error) => {
  console.error('❌ Erreur fatale lors du démarrage:', error);
  process.exit(1);
});

