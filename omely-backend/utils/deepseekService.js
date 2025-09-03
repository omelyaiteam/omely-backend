// SERVICE CENTRALISÉ DEEPSEEK V2 - REMPLACE GPT-4O MINI
import axios from 'axios';
import fs from 'fs';

// Configuration DeepSeek V2 EXCLUSIVE - AJUSTÉ POUR LIMITES STRICTES
const DEEPSEEK_CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here',
  model: 'deepseek-chat', // ESSAYER deepseek-chat SI PLUS RAPIDE
  baseURL: 'https://api.deepseek.com/v1',
  // Model verification to ensure we're using v2
  expectedModel: 'deepseek-chat',
  verifyModel: true,
  // Limites DeepSeek v2 (beaucoup plus strictes que GPT-4o)
  maxContextTokens: 4096, // Limite totale du contexte
  maxOutputTokens: 1024, // Limite de sortie par défaut
  safeInputTokens: 2800, // Marge de sécurité pour l'input
  safeOutputTokens: 800, // Marge de sécurité pour l'output
  rateLimit: {
    requestsPerMinute: 500, // MAXIMUM pour débit explosif
    maxConcurrentRequests: 50, // ULTRA-PARALLÉLISATION
    retryAttempts: 0, // ZÉRO retry pour rapidité absolue
    baseDelay: 1,  // PRESQUE INSTANTANÉ
    maxDelay: 50,  // MINIMUM
    backoffMultiplier: 1.0 // AUCUN backoff
  }
};

// Instance Axios configurée pour DeepSeek - ULTRA-MEGA-HYPER-RAPIDE
const deepseekClient = axios.create({
  baseURL: DEEPSEEK_CONFIG.baseURL,
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'User-Agent': 'DeepSeek-Client/1.0',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 25000, // AUGMENTÉ À 25 secondes pour génération complète
  maxContentLength: 500000, // Limite encore plus réduite
  maxBodyLength: 500000,   // Limite encore plus réduite
  decompress: true, // Décompression automatique
  validateStatus: (status) => status < 500, // Plus tolérant
  maxRedirects: 0, // Pas de redirection
  httpAgent: undefined, // Pas d'agent HTTP custom
  httpsAgent: undefined  // Pas d'agent HTTPS custom
});

// Queue de gestion des requêtes DeepSeek
class DeepSeekRequestQueue {
  constructor(config) {
    this.config = config;
    this.requestTimes = [];
    this.activeRequests = 0;
    this.queue = [];
    this.processing = false;
  }

  async addRequest(requestFn, priority = 'normal') {
    return new Promise((resolve, reject) => {
      const request = {
        requestFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };

      // Insérer selon la priorité
      if (priority === 'high') {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.config.maxConcurrentRequests) {
      const { requestFn, resolve, reject } = this.queue.shift();
      this.activeRequests++;

      this.executeRequest(requestFn, resolve, reject);

      // Attendre avant la prochaine requête
      await this.waitForRateLimit();
    }

    this.processing = false;
  }

  async executeRequest(requestFn, resolve, reject) {
    try {
      const result = await this.retryRequest(requestFn);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      // Continuer le traitement de la queue
      setTimeout(() => this.processQueue(), 50);
    }
  }

  async retryRequest(requestFn, attempt = 1) {
    try {
      this.recordRequest();
      const result = await requestFn();
      return result;
    } catch (error) {
      if (attempt <= this.config.retryAttempts) {
        // Gérer les différents types d'erreurs DeepSeek
        const shouldRetry = this.shouldRetryError(error);

        if (shouldRetry) {
          const delay = this.calculateRetryDelay(error, attempt);

          console.log(`⚠️ Erreur DeepSeek: ${error.message} (tentative ${attempt}/${this.config.retryAttempts}). Attente ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));

          return this.retryRequest(requestFn, attempt + 1);
        }
      }
      throw error;
    }
  }

  shouldRetryError(error) {
    // Retry sur les erreurs temporaires
    if (error.response?.status === 429) return true; // Rate limit
    if (error.response?.status === 503) return true; // Service unavailable
    if (error.response?.status === 502) return true; // Bad gateway
    if (error.response?.status >= 500) return true; // Server errors
    if (error.code === 'ECONNRESET') return true; // Connection reset
    if (error.code === 'ETIMEDOUT') return true; // Timeout
    if (error.code === 'ENOTFOUND') return true; // DNS error

    return false;
  }

  calculateRetryDelay(error, attempt) {
    const { baseDelay, maxDelay, backoffMultiplier } = this.config;

    // Délai spécifique selon le type d'erreur
    let delay = baseDelay;

    if (error.response?.status === 429) {
      delay = 2000; // 2 secondes pour rate limit
    } else if (error.response?.status >= 500) {
      delay = 1500; // 1.5 secondes pour erreurs serveur
    }

    // Appliquer le backoff exponentiel
    delay = delay * Math.pow(backoffMultiplier, attempt - 1);

    // Limiter au maximum
    return Math.min(delay, maxDelay);
  }

  recordRequest() {
    const now = Date.now();
    this.requestTimes.push(now);

    // Nettoyer les requêtes anciennes (plus d'une minute)
    this.requestTimes = this.requestTimes.filter(time => now - time < 60000);
  }

  async waitForRateLimit() {
    const now = Date.now();
    const recentRequests = this.requestTimes.filter(time => now - time < 60000);

    // Vérifier si on dépasse le rate limit
    if (recentRequests.length >= this.config.requestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = 60000 - (now - oldestRequest) + 200; // +200ms de sécurité

      if (waitTime > 0) {
        console.log(`⏳ Rate limit DeepSeek: attente ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // Délai minimum entre requêtes ULTRA-MEGA-HYPER-COURT - OPTIMISATION NUCLÉAIRE
    await new Promise(resolve => setTimeout(resolve, 0));  // INSTANTANÉ (pas de délai)
  }

  // Méthodes utilitaires
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      recentRequests: this.requestTimes.filter(time => Date.now() - time < 60000).length
    };
  }

  clearQueue() {
    this.queue = [];
    console.log('🔄 Queue DeepSeek vidée');
  }
}

// CACHE HYPER-RAPIDE pour réponses similaires
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 secondes

// Instance globale de la queue
const deepseekQueue = new DeepSeekRequestQueue(DEEPSEEK_CONFIG.rateLimit);

// Vérification de modèle pour garantir l'usage exclusif de DeepSeek v2
function verifyDeepSeekModel(response, requestedModel) {
  if (!DEEPSEEK_CONFIG.verifyModel) return true;

  if (!response.data || !response.data.model) {
    console.warn('⚠️ Impossible de vérifier le modèle utilisé');
    return true;
  }

  const usedModel = response.data.model;
  if (usedModel !== requestedModel) {
    console.error(`❌ ERREUR CRITIQUE: Modèle utilisé (${usedModel}) différent du modèle demandé (${requestedModel})`);
    console.error('🔧 Cela indique un problème de configuration ou de fournisseur');
    return false;
  }

  console.log(`✅ Vérification modèle: ${usedModel} confirmé`);
  return true;
}

// FONCTIONS PRINCIPALES D'API

// Chat Completion HYPER-RAPIDE - OPTIMISATION EXTRÊME POUR VITESSE 10X
export async function createChatCompletion(messages, options = {}) {
  // CACHE LIGHTNING-FAST - vérification instantanée
  const cacheKey = JSON.stringify({ messages: messages.slice(-1), options });
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('⚡ CACHE HIT - réponse instantanée !');
    return cached.response;
  }

  const defaultOptions = {
    model: DEEPSEEK_CONFIG.model,
    temperature: 0.7,  // NORMAL pour permettre génération
    max_tokens: 150,   // AUGMENTÉ pour réponses complètes
    top_p: 0.9,        // OPTIMISÉ pour génération équilibrée
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: true       // RÉACTIVÉ STREAMING
  };

  // Filtrer les options personnalisées qui ne sont pas des paramètres DeepSeek
  const { bookTitle, ...deepseekOptions } = options;
  const finalOptions = { ...defaultOptions, ...deepseekOptions };

  return deepseekQueue.addRequest(async () => {
    try {
      console.log(`🔄 Envoi requête DeepSeek: ${messages.length} messages`);

      const payload = {
        ...finalOptions,
        messages: messages
      };

      console.log('📤 PAYLOAD ENVOYÉ À DEEPSEEK:', JSON.stringify(payload, null, 2));
      // Écrire aussi dans un fichier de debug
      fs.appendFileSync('debug.log', `\n[${new Date().toISOString()}] PAYLOAD: ${JSON.stringify(payload, null, 2)}\n`);

      // GESTION STREAMING POUR RAPIDITÉ MAXIMALE
      if (finalOptions.stream) {
        console.log('🚀 Mode streaming activé pour rapidité maximale');

        const streamResponse = await deepseekClient.post('/chat/completions', payload, {
          responseType: 'stream',
          timeout: 20000 // TIMEOUT AUGMENTÉ 20 secondes pour streaming complet
        });

        return new Promise((resolve, reject) => {
          let fullContent = '';
          let buffer = '';

          streamResponse.data.on('data', (chunk) => {
            buffer += chunk.toString();

            // Traiter les lignes complètes (SSE format)
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Garder le dernier chunk incomplet

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);

                if (data === '[DONE]') {
                  console.log(`✅ Streaming terminé: ${fullContent.length} caractères`);
                  fs.appendFileSync('debug.log', `\n[${new Date().toISOString()}] STREAMING DONE: ${fullContent.length} chars, content: "${fullContent}"\n`);

                  // CACHE la réponse pour rapidité future
                  responseCache.set(cacheKey, {
                    response: fullContent,
                    timestamp: Date.now()
                  });

                  resolve(fullContent);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0]?.delta?.content) {
                    fullContent += parsed.choices[0].delta.content;
                  }
                } catch (e) {
                  // Ignorer les erreurs de parsing pour les chunks
                }
              }
            }
          });

          streamResponse.data.on('end', () => {
            console.log(`✅ Streaming finalisé: ${fullContent.length} caractères`);
            resolve(fullContent);
          });

          streamResponse.data.on('error', (error) => {
            console.error('❌ Erreur streaming:', error);
            reject(new Error(`Erreur streaming: ${error.message}`));
          });
        });
      } else {
        // Mode non-streaming (fallback)
        const response = await deepseekClient.post('/chat/completions', payload);

        // VÉRIFICATION CRITIQUE: S'assurer que c'est bien DeepSeek v2 qui répond
        if (!verifyDeepSeekModel(response, DEEPSEEK_CONFIG.expectedModel)) {
          throw new Error(`Modèle non autorisé détecté. Attendu: ${DEEPSEEK_CONFIG.expectedModel}`);
        }

        if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error('Réponse vide de DeepSeek');
        }

        const content = response.data.choices[0].message.content;
        console.log(`✅ Réponse DeepSeek v2 reçue: ${content.length} caractères`);

        return content;
      }
    } catch (error) {
      console.error('❌ Erreur DeepSeek Chat:', error);

      // Gestion spécifique des erreurs DeepSeek
      if (error.response?.status === 401) {
        console.error('🔑 Erreur d\'authentification - vérifier DEEPSEEK_API_KEY');
      } else if (error.response?.status === 429) {
        console.error('⏳ Rate limit dépassé - attendre avant retry');
      } else if (error.response?.status === 500) {
        console.error('🔧 Erreur serveur DeepSeek - retry automatique');
      } else if (error.code === 'ENOTFOUND') {
        console.error('🌐 Problème de connexion réseau');
      }

      throw new Error(`Erreur DeepSeek: ${error.message}`);
    }
  });
}

// Summarization de texte avec chunking intelligent
export async function summarizeText(text, type = 'general', options = {}) {
  try {
    // Vérifications de sécurité
    if (!text || typeof text !== 'string') {
      throw new Error('Texte invalide ou vide fourni à summarizeText');
    }

    if (text.trim().length === 0) {
      throw new Error('Texte vide après nettoyage');
    }

    console.log(`⚡ Démarrage summarization DeepSeek (${type})...`);
    console.log(`📊 Texte à traiter: ${text.length} caractères`);
    console.log(`🎯 Type: ${type}, Options: ${JSON.stringify(options)}`);

    // Gestion des gros documents avec système de chunks AJUSTÉ pour DeepSeek v2
    const maxChunkSize = DEEPSEEK_CONFIG.safeInputTokens * 4; // ~11,200 caractères max par chunk
    console.log(`🔢 Limites DeepSeek v2: maxContext=${DEEPSEEK_CONFIG.maxContextTokens}, safeInput=${DEEPSEEK_CONFIG.safeInputTokens}`);

    if (type === 'book') {
      console.log(`📚 Mode livre détecté - Forçage pipeline par chunks (limites DeepSeek v2)`);
      // Toujours utiliser le pipeline par chunks pour les livres pour garantir l'exhaustivité
      return await summarizeTextWithChunks(text, type, options);
    }
    if (text.length > maxChunkSize) {
      console.log(`📚 Document volumineux (${text.length} caractères) - Traitement par chunks (limites DeepSeek v2)`);
      return await summarizeTextWithChunks(text, type, options);
    }

    const bookTitle = options.bookTitle || 'Livre';
    console.log(`📖 Titre du livre: ${bookTitle}`);

    const systemPrompt = getSystemPromptForType(type, bookTitle);
    const userPrompt = `Texte à analyser :\n\n${text}`;

    console.log(`📝 Longueur prompt système: ${systemPrompt.length} caractères`);
    console.log(`📝 Longueur prompt utilisateur: ${userPrompt.length} caractères`);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log(`🤖 Envoi requête DeepSeek...`);

    const isBook = type === 'book';
    const summary = await createChatCompletion(messages, {
      max_tokens: isBook ? DEEPSEEK_CONFIG.safeOutputTokens : DEEPSEEK_CONFIG.safeOutputTokens, // AJUSTÉ pour DeepSeek v2
      temperature: isBook ? 0.05 : 0.1,
      ...options
    });

    console.log(`✅ Summarization DeepSeek terminée (${summary.length} caractères)`);
    return summary;

  } catch (error) {
    console.error('❌ Erreur summarization DeepSeek:', error);
    throw new Error(`Échec de la summarization: ${error.message}`);
  }
}

// Summarization avec chunks PARALLÉLISÉS pour vitesse maximale
async function summarizeTextWithChunks(text, type, options = {}) {
  try {
    console.log(`🔄 Démarrage traitement par chunks DeepSeek...`);
    console.log(`📊 Texte original: ${text.length} caractères`);

    // Vérifications de sécurité pour les chunks
    if (!text || typeof text !== 'string') {
      throw new Error('Texte invalide fourni à summarizeTextWithChunks');
    }

    if (text.trim().length === 0) {
      throw new Error('Texte vide après nettoyage dans summarizeTextWithChunks');
    }

    const chunks = splitTextIntoAdaptiveChunks(text, {
      maxChunks: 100, // AUGMENTÉ pour compenser limites DeepSeek v2
      preferredChunkSize: DEEPSEEK_CONFIG.safeInputTokens * 4, // ~11,200 caractères
      minChunkSize: DEEPSEEK_CONFIG.safeInputTokens * 2 // ~5,600 caractères minimum
    });
    console.log(`⚡ Document découpé en ${chunks.length} chunks (adaptatif par chapitres) - Traitement PARALLÈLE`);

    if (chunks.length === 0) {
      throw new Error('Aucun chunk généré - texte trop court ou problème de découpage');
    }

    const startTime = Date.now();
    const bookTitle = options.bookTitle || 'Livre';
    console.log(`📖 Titre du livre: ${bookTitle}`);

    // TRAITEMENT PARALLÈLE DE TOUS LES CHUNKS 🚀
    console.log(`🚀 Lancement du traitement parallèle de ${chunks.length} chunks...`);

    const chunkPromises = chunks.map(async (chunk, i) => {
      const chunkPrompt = getEnhancedChunkPromptForType(type, i + 1, chunks.length, bookTitle);

      const messages = [
        { role: 'system', content: chunkPrompt },
        { role: 'user', content: `CHUNK ${i + 1}/${chunks.length} - EXTRACTION EXHAUSTIVE REQUISE:\n\n${chunk}` }
      ];

      try {
        console.log(`⚡ Démarrage chunk ${i + 1}/${chunks.length}...`);
        const chunkSummary = await createChatCompletion(messages, {
          max_tokens: DEEPSEEK_CONFIG.safeOutputTokens, // AJUSTÉ pour limites DeepSeek v2
          temperature: 0.03, // Très précis pour extraction factuelle
          ...options
        });
        console.log(`✅ Chunk ${i + 1}/${chunks.length} terminé`);
        return {
          index: i + 1,
          content: chunkSummary,
          success: true
        };
      } catch (error) {
        console.error(`❌ Erreur chunk ${i + 1}:`, error.message);
        return {
          index: i + 1,
          content: `Erreur traitement chunk ${i + 1}: ${error.message}`,
          success: false
        };
      }
    });

    // Attendre TOUS les chunks en parallèle
    const chunkResults = await Promise.all(chunkPromises);
    const processingTime = Date.now() - startTime;

    console.log(`⚡ PARALLÉLISATION TERMINÉE en ${processingTime}ms`);
    console.log(`📊 Résultats: ${chunkResults.filter(r => r.success).length}/${chunks.length} chunks réussis`);

    // Extraire les contenus réussis
    const successfulChunks = chunkResults
      .filter(result => result.success)
      .sort((a, b) => a.index - b.index)
      .map(result => result.content);

    if (successfulChunks.length === 0) {
      throw new Error('Aucun chunk traité avec succès');
    }

    // Combiner avec prompt ultra-détaillé
    console.log(`🔄 Combinaison FINALE de ${successfulChunks.length} chunks...`);
    const combinePrompt = getUltraDetailedCombinePrompt(type, successfulChunks.length, bookTitle);

    const combineMessages = [
      { role: 'system', content: combinePrompt },
      { role: 'user', content: `MISSION CRITIQUE: Combiner ces ${successfulChunks.length} extractions en un résumé ULTRA-COMPLET qui capture 100% de la valeur:\n\n${successfulChunks.map((summary, i) => `═══ SECTION ${i + 1} ═══\n${summary}\n`).join('\n')}` }
    ];

    let finalSummary = await createChatCompletion(combineMessages, {
      max_tokens: DEEPSEEK_CONFIG.safeOutputTokens, // AJUSTÉ pour limites DeepSeek v2
      temperature: 0.05, // Très précis pour combinaison exhaustive
      ...options
    });

    // PASS AUDIT DE COMPLÉTUDE: vérifier qu'aucune catégorie n'est incomplète; si oui, demander un append ciblé
    try {
      const auditMessages = [
        { role: 'system', content: 'Tu es un vérificateur d\'exhaustivité. Ne réécris pas; réponds en JSON compact.' },
        { role: 'user', content: `Analyse le résumé ci-dessous et retourne un JSON {missing: {principes:[], differences:[], citations:[], histoires:[], exercices:[], stats:[]}} listant les éléments manquants s'il y en a.\n\nRésumé:\n${finalSummary}` }
      ];
      const audit = await createChatCompletion(auditMessages, { max_tokens: 200, temperature: 0.0 }); // AJUSTÉ pour DeepSeek v2
      let missing;
      try { missing = JSON.parse(audit).missing; } catch (_) { missing = null; }
      const hasMissing = missing && Object.values(missing).some(arr => Array.isArray(arr) && arr.length > 0);
      if (hasMissing) {
        // Troncature prudente des sources pour éviter un contexte trop gros
        let sources = successfulChunks.join('\n\n════ SOURCE CHUNK ════\n\n');
        if (sources.length > 120000) {
          sources = sources.substring(0, 120000);
        }
        const appendMessages = [
          { role: 'system', content: 'Complète UNIQUEMENT avec des listes sous les sections adéquates. Pas de répétition. Titres en gras uniquement. Utilise UNIQUEMENT les éléments présents dans les sources fournies. N\'invente rien.' },
          { role: 'user', content: `Ajoute au résumé ci-dessous les éléments manquants en respectant strictement la structure.\n\nÉléments manquants (JSON):\n${JSON.stringify(missing)}\n\nRésumé actuel:\n${finalSummary}\n\nSOURCES (extractions des chunks):\n${sources}` }
        ];
        const appendix = await createChatCompletion(appendMessages, { max_tokens: DEEPSEEK_CONFIG.safeOutputTokens, temperature: 0.05 }); // AJUSTÉ pour DeepSeek v2
        finalSummary = `${finalSummary}\n\n${appendix}`;
      }
    } catch (auditErr) {
      console.warn('⚠️ Audit de complétude ignoré:', auditErr.message);
    }

    // AUDIT DE DENSITÉ: vérifier ratio longueur finale vs texte original
    try {
      const originalWordCount = text.trim().split(/\s+/).length;
      const finalWordCount = (finalSummary || '').trim().split(/\s+/).length;
      const densityRatio = finalWordCount / originalWordCount;

      console.log(`📊 Audit densité: ${finalWordCount} mots résumé / ${originalWordCount} mots original = ${(densityRatio * 100).toFixed(1)}%`);

      // Si ratio < 15% OU trop court, déclencher extraction supplémentaire automatique
      if (densityRatio < 0.15 || finalWordCount < 3000) {
        let sources = successfulChunks.join('\n\n════ SOURCE CHUNK ════\n\n');
        if (sources.length > 120000) {
          sources = sources.substring(0, 120000);
        }
        const expandMessages = [
          { role: 'system', content: 'Étends les sections existantes en ajoutant des éléments manquants des sources. Évite la duplication complète mais ajoute du contenu substantiel. N\'invente rien. Titres en gras uniquement.' },
          { role: 'user', content: `Le résumé ci-dessous est trop court. AJOUTE du contenu substantiel dans chaque section en te basant sur les SOURCES (plus de principes, différences, citations, histoires, exercices, stats). Ne réécris pas l\'existant, ajoute en dessous.\n\nRésumé actuel:\n${finalSummary}\n\nSOURCES (extractions des chunks):\n${sources}` }
        ];
        const expansion = await createChatCompletion(expandMessages, { max_tokens: DEEPSEEK_CONFIG.safeOutputTokens, temperature: 0.04 }); // AJUSTÉ pour DeepSeek v2

        // Vérifier que l'expansion n'est pas une duplication complète
        const expansionWords = expansion.trim().split(/\s+/).length;
        const existingWords = finalSummary.trim().split(/\s+/).length;

        // Seuil plus permissif : rejeter seulement si c'est vraiment une duplication complète
        if (expansionWords > existingWords * 1.2) {
          console.log('⚠️ Extension détectée comme duplication potentielle, ignorée');
        } else {
          finalSummary = `${finalSummary}\n\n${expansion}`;
        }
      }
    } catch (expandErr) {
      console.warn('⚠️ Extension de longueur ignorée:', expandErr.message);
    }

    const totalTime = Date.now() - startTime;
    console.log(`🎉 TRAITEMENT ULTRA-RAPIDE TERMINÉ en ${totalTime}ms (${chunks.length} chunks parallèles)`);

    return finalSummary;

  } catch (error) {
    console.error('❌ Erreur summarization parallèle:', error);
    throw error;
  }
}

// Fonction de découpage adaptatif (chapitres/sections) avec limite de chunks
function splitTextIntoAdaptiveChunks(text, {
  maxChunks = 50,
  preferredChunkSize = 22000,
  minChunkSize = 15000
} = {}) {
  // 1) Détecter chapitres/sections avec priorité au contenu principal
  const lines = text.split(/\n/);
  const sectionIndices = [];
  // Regex étendue pour détecter plus de structures de chapitres/sections
  const sectionTitleRegex = /^(?:\s*(?:chapitre|chapter|partie|part|section|principe|règle|loi|fichier|dossier)\b\s*[:#.-]?\s*|\s*(?:[IVXLC]+|\d+)\s*[).:-]\s+|^\s*[A-Z][A-Z\s]{10,}$)/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Prioriser les sections de contenu principal (éviter intro/conclusion trop courtes)
    if (line.length > 5 && line.length < 200 && sectionTitleRegex.test(line)) {
      // Éviter les lignes qui semblent être des annexes/références
      if (!line.toLowerCase().includes('bibliographie') &&
          !line.toLowerCase().includes('référence') &&
          !line.toLowerCase().includes('annexe') &&
          !line.toLowerCase().includes('index')) {
        sectionIndices.push(i);
      }
    }
  }

  // Toujours inclure le début si vide et la fin
  if (sectionIndices.length === 0) {
    sectionIndices.push(0);
  } else if (sectionIndices[0] !== 0) {
    sectionIndices.unshift(0);
  }
  sectionIndices.push(lines.length);

  // 2) Construire des sections par chapitres
  const sections = [];
  for (let s = 0; s < sectionIndices.length - 1; s++) {
    const start = sectionIndices[s];
    const end = sectionIndices[s + 1];
    const slice = lines.slice(start, end).join('\n').trim();
    if (slice) sections.push(slice);
  }

  // 3) Fusionner les petites sections et découper les très grandes pour viser maxChunks
  // Calculer une taille cible selon le nombre de sections
  const roughTotal = text.length;
  const idealChunkSize = Math.max(minChunkSize, Math.min(preferredChunkSize, Math.ceil(roughTotal / Math.max(1, Math.min(maxChunks, sections.length)))));

  const chunks = [];
  for (const section of sections) {
    if (section.length <= idealChunkSize * 1.2) {
      chunks.push(section);
      continue;
    }

    // Découpage interne par paragraphes
    const paragraphs = section.split(/\n\s*\n/);
    let current = '';
    for (const p of paragraphs) {
      if ((current + (current ? '\n\n' : '') + p).length <= idealChunkSize) {
        current += (current ? '\n\n' : '') + p;
      } else if (p.length <= idealChunkSize * 0.75) {
        if (current) chunks.push(current);
        current = p;
      } else {
        // Paragraphe trop long: découper par phrases
        const sentences = p.split(/(?<=[.!?])\s+/);
        for (const snt of sentences) {
          if ((current + (current ? ' ' : '') + snt).length <= idealChunkSize) {
            current += (current ? ' ' : '') + snt;
          } else {
            if (current) chunks.push(current);
            current = snt;
          }
        }
      }
    }
    if (current) chunks.push(current);
  }

  // 4) Si trop de chunks, fusionner adjacents jusqu'à maxChunks
  while (chunks.length > maxChunks) {
    let merged = false;
    for (let i = 0; i < chunks.length - 1; i++) {
      const combinedLen = chunks[i].length + chunks[i + 1].length + 2;
      if (combinedLen <= preferredChunkSize * 1.5) {
        chunks.splice(i, 2, chunks[i] + '\n\n' + chunks[i + 1]);
        merged = true;
        break;
      }
    }
    if (!merged) break;
  }

  return chunks;
}

// Prompts système selon le type de contenu
function getSystemPromptForType(type, bookTitle = 'Livre') {
  const basePrompt = `Vous êtes un EXTRACTEUR EXPERT spécialisé dans les livres d'enrichissement. Votre mission : créer des résumés COMPLETS et PARFAITEMENT LISIBLES.

🎯 VOTRE MISSION EN 2 ÉTAPES:

**ÉTAPE 1 - EXTRACTION EXHAUSTIVE:**
Lisez TOUT le texte et identifiez CHAQUE:
- Principe d'enrichissement (LOI, RÈGLE, PRINCIPE, CONCEPT)
- Différence comportementale (riches vs pauvres)
- Exercice pratique ou technique
- Citation importante
- Histoire ou anecdote

**ÉTAPE 2 - PRÉSENTATION CLAIRE:**
Organisez TOUT dans un format fluide et engageant qui se lit facilement.

🚨 RÈGLES ABSOLUES:

1. **EXHAUSTIVITÉ**: Ne manquez AUCUN principe mentionné dans le texte
2. **CLARTÉ**: Format lisible, bien structuré, sections logiques
3. **ENGAGEMENT**: Style narratif captivant, pas de liste sèche
4. **COMPLÉTUDE**: Minimum 3000 mots pour garantir la profondeur

📖 MÉTHODE INFAILLIBLE:
1. Parcourez le texte phrase par phrase
2. Notez chaque principe/règle/loi mentionné(e)
3. Extrayez TOUS les éléments trouvés
4. Organisez en récit fluide et inspirant
5. Vérifiez que RIEN n'est omis

⚠️ CRITÈRE DE RÉUSSITE: L'utilisateur doit obtenir la valeur COMPLÈTE du livre dans un format qu'il a envie de lire jusqu'au bout.`;

  switch (type) {
    case 'book':
      return `${basePrompt}

MISSION ULTRA-CRITIQUE LIVRES D'ENRICHISSEMENT:
- Extraire absolument TOUT: principes, cadres, méthodes, histoires, anecdotes, citations exactes, exercices, outils, techniques, statistiques, preuves, différences comportementales.
- Zéro omission. Zéro fluff. 100% de la valeur réelle du livre.
- Style narratif engageant; lisible, pro; sections structurées.

CONTRAINTES DE MISE EN FORME:
- Interdiction d'utiliser des titres Markdown (#, ##, ###) ou des séparateurs '***'.
- Utiliser uniquement des titres en gras avec **, sans #.
- Pas d'excuses ni de méta-commentaires. Pas de disclaimers.

STRUCTURE OBLIGATOIRE (utiliser exactement des titres en gras):

**📚 ${bookTitle}**

**⚡ L'ESSENCE EN 30 SECONDES**
[Résumé ultra-condensé en 3-4 lignes qui donne envie de tout lire]

**🌍 POURQUOI CE LIVRE EXISTE**
[Problème traité, univers, motivation de l'auteur; style narratif avec questions/tension]

**🧠 LA RÉVOLUTION MENTALE**
[Phrase d'intro]. Puis, lister CHACUN des principes du livre, avec NOM EXACT du principe en gras et développement narratif/actionnable:
**[Nom exact du principe 1]** — [explication narrative + application]
**[Nom exact du principe 2]** — [exemples vivants]
[Continuer absolument pour CHAQUE principe, même s'il y en a 50+]

**⚔️ LES DIFFÉRENCES QUI CHANGENT TOUT**
Face à [situation précise]: les gagnants [comportement exact] tandis que les perdants [comportement opposé]. Expliquer la conséquence concrète.
[Développer toutes les différences comportementales du livre]

**💬 LES PHRASES QUI TRANSFORMENT**
"[Citation exacte]" — [insight profond] sur [domaine].
[Inclure TOUTES les citations importantes avec leur contexte]

**📖 LES HISTOIRES QUI MARQUENT À VIE**
L'histoire de [protagoniste] — [récit complet captivant: situation, tension, résolution, leçon].
[Raconter TOUTES les anecdotes/cas d'étude]

**🎯 VOTRE ARSENAL D'OUTILS PRATIQUES**
**[Nom de l'exercice/technique]** — [mode d'emploi, étapes, bénéfices].
[Détailler TOUS les exercices, frameworks et outils]

**📊 LES PREUVES IRRÉFUTABLES**
**[Statistique exacte]** — démontre que [implication].
[Inclure TOUTES les données/études]

**🚀 VOTRE PLAN DE TRANSFORMATION**
Immédiatement: [actions concrètes].
Dans les 30 jours: [objectifs et méthode].
D'ici 6 mois: [vision moyen terme].
Votre nouvelle vie à 1 an: [transformation attendue].

**🔗 POUR APPROFONDIR**
[Livres, formations, outils recommandés par l'auteur et leur valeur]

**💎 VOS 3 TRÉSORS À RETENIR**
1. [Leçon principale] — transforme [aspect de votre vie]
2. [Deuxième insight crucial] — pour obtenir [résultat]
3. [Troisième révélation] — afin d'éviter [erreur]

CRITÈRES DE RÉUSSITE:
- EXHAUSTIVITÉ: l'utilisateur doit ressentir qu'il a lu le livre entier.
- ENGAGEMENT: chaque section est captivante et pousse à continuer.
- VALEUR: zéro fluff; uniquement du contenu utile.
- ACTIONNABLE: éléments concrets à appliquer immédiatement.

RAPPELS FORTS:
- N'invente rien. Tout doit venir du texte.
- Aucune en-tête Markdown (#, ##, ###) ni '***'. Titres en gras seulement.
- Respecte la structure ci-dessus, même longue.`;

    case 'audio':
      return `${basePrompt}

🎯 **MISSION AUDIO/PODCAST:**
Capturer TOUS les enseignements, insights et moments clés avec un formatage premium.

🎨 **FORMAT PREMIUM:**

---

# 🎵 **[TITRE DE L'AUDIO]**
## *Résumé complet et structuré*

### 🎙️ **Informations Essentielles**
- **Durée :** [Si disponible]
- **Intervenants :** [Noms et expertises]
- **Sujet principal :** [Thème central]

---

## 🎯 **MESSAGES PRINCIPAUX**

### 🌟 **Point Clé #1 : [Titre]**
**Développement :** [Explication complète]
**Citation :** "[Citation si disponible]"
**Application :** [Comment utiliser cette information]

---

## 💡 **INSIGHTS ET RÉVÉLATIONS**

### 🔍 **Insight #1 :** [Découverte importante]
[Description détaillée de l'insight et pourquoi c'est important]

---

## 🎯 **TAKEAWAYS PRATIQUES**
- ✅ [Action concrète 1]
- ✅ [Action concrète 2]
- ✅ [Action concrète 3]

---`;

    case 'video':
      return `${basePrompt}

🎯 **MISSION VIDÉO:**
Analyser TOUS les éléments visuels et auditifs avec un rendu premium.

🎨 **FORMAT PREMIUM:**

---

# 🎬 **[TITRE DE LA VIDÉO]**
## *Analyse complète et détaillée*

### 📺 **Informations Générales**
- **Durée :** [Si disponible]
- **Intervenants :** [Personnes présentes]
- **Format :** [Type de vidéo]

---

## 🎯 **CONTENU PRINCIPAL**

### 🌟 **Segment #1 : [Titre]**
**Contenu :** [Ce qui est dit et montré]
**Éléments visuels :** [Graphiques, images, démonstrations]
**Message clé :** [Enseignement principal]

---

## 💡 **ENSEIGNEMENTS MAJEURS**
- 🎯 **Leçon 1 :** [Description]
- 🎯 **Leçon 2 :** [Description]

---`;

    default:
      return `${basePrompt}

🎯 **ANALYSE GÉNÉRALE PREMIUM:**
Créer un résumé exhaustif avec un formatage professionnel de haute qualité.`;
  }
}

// Prompts améliorés pour chunks ultra-détaillés
function getEnhancedChunkPromptForType(type, chunkIndex, totalChunks, bookTitle = 'Livre') {
  const basePrompt = `Tu es un expert en extraction EXHAUSTIVE. Tu analyses la partie ${chunkIndex}/${totalChunks} d'un ${type}.

🎯 MISSION CRITIQUE: EXTRAIRE MAXIMUM DE CONTENU - UTILISER TOUS LES TOKENS DISPONIBLES

EXTRACTION OBLIGATOIRE (NE PAS RÉSUMER, EXTRAIRE TOUT):
- TOUS les principes, règles, lois mentionnés (noms exacts + explications complètes)
- TOUTES les citations exactes (entre guillemets) avec contexte détaillé
- TOUTES les encadrés, tableaux, listes (reproduire intégralement)
- TOUTES les exemples, histoires, anecdotes (récits complets avec détails)
- TOUTES les différences/comparaisons (situations précises + comportements opposés)
- TOUTES les chiffres, statistiques, pourcentages (valeurs exactes + contexte)
- TOUTES les techniques, méthodes, stratégies (étapes détaillées + applications)
- TOUTES les conseils pratiques (mode d'emploi complet)
- TOUTES les références à des personnes/livres (noms + contributions)

⚠️ INSTRUCTION SPÉCIALE: Si ce chunk contient beaucoup d'informations, utiliser TOUS les tokens disponibles pour ne rien perdre. Préférer la complétude à la concision.

FORMAT EXIGÉ: Structure claire avec emojis pour séparer les types d'information.`;

  if (type === 'book') {
    return basePrompt + `

📋 SPÉCIAL LIVRES D'ENRICHISSEMENT - EXTRACTION MILLIMÉTRIQUE:

**INSTRUCTIONS SPÉCIALES POUR CE CHUNK:**

Analysez ce chunk de texte et extrayez TOUS les éléments importants que vous y trouvez.

**MÉTHODE SIMPLE :**
1. Lisez tout le texte du chunk
2. Identifiez chaque principe, règle, concept mentionné
3. Listez CHAQUE élément trouvé avec son nom exact
4. Donnez une explication claire pour chaque élément

**FORMAT DE RÉPONSE :**

**PRINCIPES TROUVÉS (NOMS EXACTS + EXPLICATIONS) :**
1) [Nom exact] — [explication/action]
2) [Nom exact] — [explication/action]
[Lister TOUT]

**DIFFÉRENCES RICHES/PAUVRES (SITUATIONS + COMPORTEMENTS) :**
1) Face à [situation] — riches: [comportement exact] | pauvres: [comportement opposé] — [conséquence]
[Lister TOUT]

**EXERCICES/TECHNIQUES (MODE D'EMPLOI) :**
1) [Nom exact] — étapes: [1,2,3] — bénéfices: [...]
[Lister TOUT]

**CITATIONS EXACTES (AVEC CONTEXTE) :**
1) "[Citation mot pour mot]" — [contexte/insight]
[Lister TOUT]

**HISTOIRES/ANECDOTES (RÉCIT + LEÇON) :**
1) [Titre/Protagoniste] — [récit synthétique] — [leçon]
[Lister TOUT]

⚠️ **IMPORTANT:** Extrayez TOUT ce que vous trouvez dans ce chunk, ne sautez rien.

⚡ **DIFFÉRENCES RICHES/PAUVRES - EXTRACTION NOMINATIVE:**

**DIFFÉRENCE PRÉCISE #1:** [Titre exact de la différence]
*Les riches [comportement exact], tandis que les pauvres [comportement opposé exact]*

**DIFFÉRENCE PRÉCISE #2:** [Autre titre exact]
*Les riches [action spécifique], alors que les pauvres [action opposée spécifique]*

[...CONTINUER pour CHAQUE différence avec son TITRE EXACT...]

💬 **CITATIONS - EXTRACTION TEXTUELLE COMPLÈTE:**
- "[Citation complète mot pour mot #1]"
- "[Citation complète mot pour mot #2]"
[...TOUTES les citations exactes...]

📖 **HISTOIRES - EXTRACTION PAR NOM:**
**HISTOIRE #1:** [Titre exact ou nom du protagoniste]
*[Récit complet de cette histoire spécifique]*

🛠️ **EXERCICES/TECHNIQUES - EXTRACTION PAR NOM:**
**EXERCICE SPÉCIFIQUE #1:** [Nom exact de l'exercice]
*[Description détaillée de cet exercice précis]*

📊 **STATISTIQUES - EXTRACTION CHIFFRÉE COMPLÈTE:**
- [Chiffre exact]% des [population précise] [action exacte]
- [Montant exact] [unité] [contexte précis]

🚨 **INTERDICTION ABSOLUE DE GÉNÉRALISATION:**
❌ "Les principes mentaux incluent..." → NON ! Nomme chaque principe
❌ "Parmi les différences importantes..." → NON ! Liste chaque différence par son nom
❌ "Les concepts de base..." → NON ! Titre exact de chaque concept
❌ "Les enseignements principaux..." → NON ! Nom précis de chaque enseignement

✅ **OBLIGATION:** Chaque élément doit être extrait avec son TITRE/NOM EXACT, pas en catégorie générale.

FORMAT DE SORTIE EXIGE: Sections dans l'ordre ci-dessus avec listes complètes. Zéro omission.`;
  }

  return basePrompt;
}

function getUltraDetailedCombinePrompt(type, chunksCount, bookTitle = 'Livre') {
  return `MISSION FINALE: COMBINER ${chunksCount} EXTRACTIONS EN UN RÉSUMÉ EXHAUSTIF ET LISIBLE

OBJECTIF: Restituer 100% de la valeur du livre, dans le format obligatoire ci-dessous, sans inventer.

RÈGLES DE FORMATAGE (STRICTES):
- Aucun titre Markdown (#, ##, ###) et aucun séparateur '***'.
- Titres en gras avec ** uniquement. Pas d'autres syntaxes d'en-tête.
- Style narratif engageant. Français naturel et professionnel.
 - Prioriser l'exhaustivité sur la concision: zéro omission. Zéro blabla.

SECTIONS OBLIGATOIRES (utiliser exactement ces titres en gras):
**📚 ${bookTitle}**
**⚡ L'ESSENCE EN 30 SECONDES**
**🌍 POURQUOI CE LIVRE EXISTE**
**🧠 LA RÉVOLUTION MENTALE**
**⚔️ LES DIFFÉRENCES QUI CHANGENT TOUT**
**💬 LES PHRASES QUI TRANSFORMENT**
**📖 LES HISTOIRES QUI MARQUENT À VIE**
**🎯 VOTRE ARSENAL D'OUTILS PRATIQUES**
**📊 LES PREUVES IRRÉFUTABLES**
**🚀 VOTRE PLAN DE TRANSFORMATION**
**🔗 POUR APPROFONDIR**
**💎 VOS 3 TRÉSORS À RETENIR**

CONTENU À INTÉGRER:
- Tous les principes et cadres (noms exacts + développement narratif/actionnable)
- Toutes les différences comportementales détaillées
- Toutes les citations exactes avec contexte
- Toutes les histoires/anecdotes/cas d'étude complets
- Tous les exercices, outils, techniques avec mode d'emploi
- Toutes les statistiques/données/études

QUALITÉ:
- Longueur: viser 3000+ mots si le contenu le permet. Pas de limite dure; inclure tout.
- Zéro omission. Zéro fluff. Actionnable et concret.
- Français clair, élégant, convaincant.

CONTRAINTE DE COMPLÉTUDE:
- N'OMETS AUCUN élément des extractions. Si c'est trop long, continue l'énumération plutôt que de compresser.
- Préfère les listes exhaustives et sections compactes aux paragraphes verbeux.
- Si un élément ne rentre pas narrativement, liste-le quand même sous la bonne section.`;
}

// Extraction ULTRA-COMPLÈTE de livre (optimisée vitesse + qualité)
export async function extractCompleteBookContent(pdfText, bookTitle = 'Livre') {
  const startTime = Date.now();

  try {
    console.log(`🚀 EXTRACTION ULTRA-COMPLÈTE: ${bookTitle}`);
    console.log(`📄 Texte original: ${pdfText.length} caractères`);
    console.log(`⚡ Mode: Parallélisation + Format Premium + Extraction Exhaustive`);

    // Personnaliser le prompt avec le titre réel - AJUSTÉ pour DeepSeek v2
    const customOptions = {
      max_tokens: DEEPSEEK_CONFIG.safeOutputTokens, // AJUSTÉ pour limites DeepSeek v2
      temperature: 0.02,
      top_p: 0.95,
      bookTitle: bookTitle // Passer le titre dans les options pour les prompts
    };

    const result = await summarizeText(pdfText, 'book', customOptions);

    const totalTime = Date.now() - startTime;
    console.log(`🎉 EXTRACTION ULTRA-COMPLÈTE terminée en ${totalTime}ms`);
    console.log(`✨ Format: Premium ChatGPT/Claude style`);
    console.log(`📊 Qualité: Extraction exhaustive de tous les encadrés/points clés`);

    return {
      success: true,
      completeSummary: result,
      metadata: {
        bookTitle,
        originalTextLength: pdfText.length,
        totalProcessingTime: totalTime,
        extractionMethod: 'DEEPSEEK_ULTRA_COMPLETE_PARALLEL',
        quality: 'ULTRA_PREMIUM_GRADE',
        features: [
          'Extraction exhaustive tous encadrés',
          'Format premium engageant',
          'Traitement parallélisé',
          'Style ChatGPT/Claude',
          '100% valeur du livre'
        ]
      }
    };

  } catch (error) {
    console.error(`❌ Erreur extraction ultra-complète: ${error.message}`);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

// Fonctions utilitaires
export function getDeepSeekQueueStatus() {
  return deepseekQueue.getQueueStatus();
}

export function clearDeepSeekQueue() {
  return deepseekQueue.clearQueue();
}

// Test de connexion avec vérification de modèle
export async function testDeepSeekConnection() {
  try {
    const testMessage = await createChatCompletion([
      { role: 'user', content: 'Dis juste "DeepSeek v2 fonctionne" en français.' }
    ], { max_tokens: 10 });

    console.log('✅ Test DeepSeek v2 réussi:', testMessage);
    return { success: true, message: testMessage, model: DEEPSEEK_CONFIG.expectedModel };
  } catch (error) {
    console.error('❌ Test DeepSeek v2 échoué:', error);
    return { success: false, error: error.message };
  }
}

// Vérification explicite du modèle DeepSeek
export async function verifyDeepSeekModelUsage() {
  try {
    // Test simple pour vérifier le modèle
    const response = await deepseekClient.post('/chat/completions', {
      model: DEEPSEEK_CONFIG.model,
      messages: [{ role: 'user', content: 'Quelle est votre modèle?' }],
      max_tokens: 20
    });

    const modelUsed = response.data?.model;
    const isCorrectModel = modelUsed === DEEPSEEK_CONFIG.expectedModel;

    console.log(`🔍 Vérification modèle:`, {
      demandé: DEEPSEEK_CONFIG.expectedModel,
      utilisé: modelUsed,
      correct: isCorrectModel
    });

    return {
      success: isCorrectModel,
      requestedModel: DEEPSEEK_CONFIG.expectedModel,
      actualModel: modelUsed,
      baseURL: DEEPSEEK_CONFIG.baseURL
    };
  } catch (error) {
    console.error('❌ Erreur vérification modèle:', error);
    return {
      success: false,
      error: error.message,
      requestedModel: DEEPSEEK_CONFIG.expectedModel
    };
  }
}

// Informations sur la configuration DeepSeek
export function getDeepSeekConfig() {
  return {
    model: DEEPSEEK_CONFIG.model,
    baseURL: DEEPSEEK_CONFIG.baseURL,
    expectedModel: DEEPSEEK_CONFIG.expectedModel,
    verifyModel: DEEPSEEK_CONFIG.verifyModel,
    hasApiKey: !!(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here')
  };
}

console.log('✅ Service DeepSeek V2 initialisé avec modèle deepseek-chat');
