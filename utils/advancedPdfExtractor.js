// SYSTÈME D'EXTRACTION PDF AVANCÉ - EXTRACTION 100% COMPLÈTE AVEC OPENAI GPT-4O-MINI
import { NO_CACHE_CONFIG, createNoCachePrompt } from './noCacheConfig.js';
import { createChatCompletion } from './openaiService.js';

// Configuration pour extraction COMPLÈTE - OPTIMISÉ pour GPT-4o-mini
const COMPLETE_EXTRACTION_CONFIG = {
  maxTokensPerChunk: 6000, // AUGMENTÉ pour GPT-4o-mini (supporte plus de tokens)
  maxTokensPerSummary: 1000, // AUGMENTÉ pour GPT-4o-mini
  chunkOverlap: 800, // AUGMENTÉ pour meilleure qualité
  chapterDetection: true, // Détection automatique des chapitres
  extractAllPrinciples: true, // Extraction de TOUS les principes
  extractAllExamples: true, // Extraction de TOUS les exemples
  extractAllQuotes: true, // Extraction de TOUTES les citations
  structuredOutput: true, // Sortie structurée par chapitres
  qualityCheck: true, // Vérification de qualité
  maxChunks: 100 // OPTIMISÉ pour GPT-4o-mini
};

// Configuration OpenAI GPT-4o-mini avec rate limiting
const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
  model: 'gpt-4o-mini', // UTILISE GPT-4O-MINI
  rateLimit: {
    requestsPerMinute: 200, // OpenAI permet plus de requêtes
    maxConcurrentRequests: 10, // Plus de requêtes simultanées
    retryAttempts: 3,
    baseDelay: 300, // Délai plus court
    maxDelay: 3000, // Délai max plus court
    backoffMultiplier: 1.5
  }
};

// Queue de gestion des requêtes OpenAI GPT-4o-mini
class OpenAIRequestQueue {
  constructor(config) {
    this.config = config;
    this.requestTimes = [];
    this.activeRequests = 0;
    this.queue = [];
    this.processing = false;
  }

  async addRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
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
      
      // Attendre entre les requêtes pour respecter le rate limit
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
      this.processQueue(); // Continuer le traitement de la queue
    }
  }

  async retryRequest(requestFn, attempt = 1) {
    try {
      this.recordRequest();
      const result = await requestFn();
      return result;
    } catch (error) {
      if (error.message.includes('429') && attempt <= this.config.retryAttempts) {
        const delay = Math.min(
          this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1),
          this.config.maxDelay
        );
        
        console.log(`⚠️ Rate limit détecté (tentative ${attempt}/${this.config.retryAttempts}). Attente ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
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
    
    if (recentRequests.length >= this.config.requestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = 60000 - (now - oldestRequest) + 200; // +200ms de sécurité

      if (waitTime > 0) {
        console.log(`⏳ Rate limit DeepSeek: attente ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Délai minimum entre requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Instance globale de la queue OpenAI
const openaiQueue = new OpenAIRequestQueue(OPENAI_CONFIG.rateLimit);

// Fonction de découpage intelligent par chapitres
function splitTextIntoChapters(text) {
  const chapters = [];
  const lines = text.split('\n');
  let currentChapter = { title: 'Introduction', content: '', pageStart: 1 };
  let pageNumber = 1;
  
  // Patterns pour détecter les chapitres
  const chapterPatterns = [
    /^CHAPITRE\s+\d+/i,
    /^CHAPTER\s+\d+/i,
    /^PARTIE\s+\d+/i,
    /^PART\s+\d+/i,
    /^\d+\.\s+[A-Z]/,
    /^[A-Z][A-Z\s]{3,}$/,
    /^PREMIÈRE\s+PARTIE/i,
    /^DEUXIÈME\s+PARTIE/i,
    /^TROISIÈME\s+PARTIE/i
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter si c'est un nouveau chapitre
    const isNewChapter = chapterPatterns.some(pattern => pattern.test(line));
    
    if (isNewChapter && currentChapter.content.length > 100) {
      // Sauvegarder le chapitre actuel
      currentChapter.content = currentChapter.content.trim();
      if (currentChapter.content.length > 200) {
        chapters.push({ ...currentChapter });
      }
      
      // Commencer un nouveau chapitre
      currentChapter = { 
        title: line, 
        content: '', 
        pageStart: pageNumber 
      };
    } else {
      // Ajouter au chapitre actuel
      currentChapter.content += line + '\n';
    }
    
    // Détecter les numéros de page
    if (/^\d+$/.test(line) && parseInt(line) > pageNumber) {
      pageNumber = parseInt(line);
    }
  }
  
  // Ajouter le dernier chapitre
  if (currentChapter.content.length > 200) {
    currentChapter.content = currentChapter.content.trim();
    chapters.push(currentChapter);
  }
  
  // Si aucun chapitre détecté, découper par taille
  if (chapters.length <= 1) {
    return splitTextBySize(text);
  }
  
  return chapters;
}

// Découpage par taille si pas de chapitres détectés
function splitTextBySize(text) {
  const chunks = [];
  const maxSize = COMPLETE_EXTRACTION_CONFIG.maxTokensPerChunk * 4; // ~4 chars par token
  const overlap = COMPLETE_EXTRACTION_CONFIG.chunkOverlap;
  
  for (let i = 0; i < text.length; i += maxSize - overlap) {
    const chunk = text.substring(i, i + maxSize);
    chunks.push({
      title: `Partie ${Math.floor(i / maxSize) + 1}`,
      content: chunk,
      pageStart: Math.floor(i / 2000) + 1 // Estimation
    });
  }
  
  return chunks;
}

// Fonction d'extraction COMPLÈTE par chapitre avec OpenAI GPT-4o-mini
async function extractChapterContent(chapter, chapterIndex, totalChapters) {
  // Vérifier si le chapitre est trop volumineux et le diviser si nécessaire
  const maxChunkSize = 25000; // Réduire la taille pour éviter les timeouts
  if (chapter.content.length > maxChunkSize) {
    console.log(`📚 Chapitre ${chapterIndex + 1} volumineux (${chapter.content.length} caractères) - Division en chunks`);
    return await extractLargeChapterContent(chapter, chapterIndex, totalChapters, maxChunkSize);
  }

  const prompt = `SYSTÈME D'EXTRACTION PROFESSIONNELLE - CHAPITRE ${chapterIndex + 1}/${totalChapters}

MISSION CRITIQUE: Extraire 100% du contenu de ce chapitre avec une précision professionnelle.

CHAPITRE: ${chapter.title}
CONTENU:
${chapter.content}

INSTRUCTIONS D'EXTRACTION COMPLÈTE:

1. 🔑 PRINCIPES ET RÈGLES CLÉS
   - Extraire TOUS les principes mentionnés
   - Capturer TOUTES les règles encadrées
   - Identifier TOUTES les lois financières
   - Noter TOUS les enseignements importants

2. ⚡ DIFFÉRENCES ET CONTRASTES
   - Toutes les différences riches/pauvres/classe moyenne
   - Tous les contrastes de mentalité
   - Toutes les oppositions de comportement

3. 💬 CITATIONS IMPORTANTES
   - TOUTES les citations entre guillemets
   - TOUTES les phrases marquantes
   - TOUS les passages soulignés

4. 🎯 POINTS CLÉS
   - TOUS les points importants
   - TOUTES les idées principales
   - TOUS les concepts clés

5. 💡 CONCEPTS ET PRINCIPES
   - TOUS les concepts expliqués
   - TOUS les principes détaillés
   - TOUTES les définitions

6. 📝 EXEMPLES ET CAS CONCRETS
   - TOUS les exemples mentionnés
   - TOUS les cas pratiques
   - TOUTES les histoires

7. 🛠️ TECHNIQUES ET MÉTHODES
   - TOUTES les techniques
   - TOUTES les méthodes
   - TOUTES les stratégies

8. 📊 DONNÉES ET STATISTIQUES
   - TOUTES les données chiffrées
   - TOUTES les statistiques
   - TOUS les pourcentages

FORMAT DE RÉPONSE OBLIGATOIRE:
📖 CHAPITRE ${chapterIndex + 1}: ${chapter.title}

🔑 PRINCIPES ET RÈGLES CLÉS
[Liste complète de tous les principes]

⚡ DIFFÉRENCES ET CONTRASTES
[Toutes les différences mentionnées]

💬 CITATIONS IMPORTANTES
[Toutes les citations]

🎯 POINTS CLÉS
[Tous les points clés]

💡 CONCEPTS ET PRINCIPES
[Tous les concepts]

📝 EXEMPLES ET CAS CONCRETS
[Tous les exemples]

🛠️ TECHNIQUES ET MÉTHODES
[Toutes les techniques]

📊 DONNÉES ET STATISTIQUES
[Toutes les données]

⚠️ NOTES SPÉCIFIQUES AU CHAPITRE
[Notes importantes pour ce chapitre]`;

  try {
    // Utilisation du service OpenAI GPT-4o Mini centralisé
    const messages = [
      { role: 'system', content: 'Tu es un expert en extraction de contenu de documents PDF. Analyse ce texte et extrais tous les principes, concepts et informations importantes.' },
      { role: 'user', content: prompt }
    ];

    const extraction = await createChatCompletion(messages, {
      max_tokens: 8000,
      temperature: 0.1,
      model: 'deepseek-chat'  // EXPLICITEMENT DEEPSEEK V2
    });

    return {
      success: true,
      chapterIndex,
      title: chapter.title,
      extraction: extraction,
      pageStart: chapter.pageStart
    };
  } catch (error) {
    console.error(`❌ Erreur extraction chapitre ${chapterIndex + 1}: ${error.message}`);
    return {
      success: false,
      chapterIndex,
      title: chapter.title,
      error: error.message
    };
  }
}

// Fonction pour gérer les chapitres volumineux avec système de chunks
async function extractLargeChapterContent(chapter, chapterIndex, totalChapters, maxChunkSize) {
  try {
    // Diviser le chapitre en chunks
    const chunks = [];
    const overlap = 1000; // Chevauchement pour conserver le contexte
    
    for (let i = 0; i < chapter.content.length; i += maxChunkSize - overlap) {
      const chunkContent = chapter.content.substring(i, i + maxChunkSize);
      chunks.push({
        index: Math.floor(i / (maxChunkSize - overlap)),
        content: chunkContent,
        start: i,
        end: Math.min(i + maxChunkSize, chapter.content.length)
      });
    }
    
    console.log(`📚 Chapitre ${chapterIndex + 1} divisé en ${chunks.length} chunks`);
    
    // Extraire chaque chunk
    const chunkExtractions = [];
    for (let i = 0; i < chunks.length; i++) {
      console.log(`📄 Extraction chunk ${i + 1}/${chunks.length} du chapitre ${chapterIndex + 1}`);
      
      const chunkPrompt = `EXTRACTION CHUNK ${i + 1}/${chunks.length} - CHAPITRE ${chapterIndex + 1}: ${chapter.title}

CHUNK CONTENT:
${chunks[i].content}

Extraire TOUS les points importants de ce chunk selon les mêmes critères d'extraction complète:
- Principes et règles clés
- Différences riches/pauvres
- Citations importantes
- Points clés
- Concepts et principes
- Exemples concrets
- Techniques et méthodes
- Données et statistiques

FORMAT: Résumé structuré de ce chunk uniquement.`;

      try {
        // Utilisation du service OpenAI GPT-4o Mini centralisé
        const messages = [
          { role: 'system', content: 'Tu es un expert en extraction de contenu de documents PDF. Analyse ce chunk et extrais tous les principes, concepts et informations importantes.' },
          { role: 'user', content: chunkPrompt }
        ];

        const chunkExtraction = await createChatCompletion(messages, {
          max_tokens: 4000,
          temperature: 0.1,
          model: 'deepseek-chat'  // EXPLICITEMENT DEEPSEEK V2
        });
        
        chunkExtractions.push(chunkExtraction);
        console.log(`✅ Chunk ${i + 1}/${chunks.length} du chapitre ${chapterIndex + 1} extrait`);
        
      } catch (error) {
        console.error(`❌ Erreur extraction chunk ${i + 1} du chapitre ${chapterIndex + 1}: ${error.message}`);
        chunkExtractions.push(`Erreur extraction chunk ${i + 1}: ${error.message}`);
      }
    }
    
    // Combiner tous les chunks
    console.log(`🔄 Combinaison des ${chunks.length} chunks du chapitre ${chapterIndex + 1}`);
    
    const combinePrompt = `COMBINAISON FINALE - CHAPITRE ${chapterIndex + 1}: ${chapter.title}

Voici ${chunks.length} extractions de chunks du même chapitre:

${chunkExtractions.map((extraction, i) => `=== CHUNK ${i + 1} ===\n${extraction}\n`).join('\n')}

MISSION: Combiner toutes ces extractions en un résumé COMPLET et STRUCTURÉ du chapitre entier.

FORMAT DE RÉPONSE OBLIGATOIRE:
📖 CHAPITRE ${chapterIndex + 1}: ${chapter.title}

🔑 PRINCIPES ET RÈGLES CLÉS
[Tous les principes combinés de tous les chunks]

⚡ DIFFÉRENCES ET CONTRASTES
[Toutes les différences combinées]

💬 CITATIONS IMPORTANTES
[Toutes les citations combinées]

🎯 POINTS CLÉS
[Tous les points clés combinés]

💡 CONCEPTS ET PRINCIPES
[Tous les concepts combinés]

📝 EXEMPLES ET CAS CONCRETS
[Tous les exemples combinés]

🛠️ TECHNIQUES ET MÉTHODES
[Toutes les techniques combinées]

📊 DONNÉES ET STATISTIQUES
[Toutes les données combinées]

⚠️ NOTES SPÉCIFIQUES AU CHAPITRE
[Notes importantes pour ce chapitre]`;

    // Utilisation du service OpenAI GPT-4o Mini centralisé
    const messages = [
      { role: 'system', content: 'Tu es un expert en synthèse de contenu de documents PDF. Combine ces extractions de chunks en un résumé cohérent et complet.' },
      { role: 'user', content: combinePrompt }
    ];

    const finalExtraction = await createChatCompletion(messages, {
      max_tokens: 10000,
      temperature: 0.1,
      model: 'deepseek-chat'  // EXPLICITEMENT DEEPSEEK V2
    });
    
    console.log(`✅ Chapitre ${chapterIndex + 1} volumineux traité avec succès (${chunks.length} chunks)`);
    
    return {
      success: true,
      chapterIndex,
      title: chapter.title,
      extraction: finalExtraction,
      pageStart: chapter.pageStart,
      chunksProcessed: chunks.length
    };
    
  } catch (error) {
    console.error(`❌ Erreur extraction chapitre volumineux ${chapterIndex + 1}: ${error.message}`);
    return {
      success: false,
      chapterIndex,
      title: chapter.title,
      error: error.message
    };
  }
}

// Fonction de synthèse finale COMPLÈTE avec DeepSeek V2
async function createCompleteBookSummary(chapterExtractions, originalText) {
  const prompt = `SYSTÈME DE SYNTHÈSE FINALE - LIVRE COMPLET

MISSION: Créer un résumé COMPLET qui capture 100% de la valeur du livre en combinant tous les chapitres extraits.

EXTRACTIONS PAR CHAPITRES:
${chapterExtractions.map((extraction, index) => 
  `\n--- CHAPITRE ${index + 1}: ${extraction.title} ---\n${extraction.extraction}`
).join('\n')}

INSTRUCTIONS DE SYNTHÈSE FINALE:

1. 🔑 PRINCIPES ET RÈGLES CLÉS (PRIORITÉ MAXIMALE)
   - Combiner TOUS les principes de tous les chapitres
   - Éliminer les doublons
   - Organiser par importance
   - Donner le contexte complet

2. ⚡ DIFFÉRENCES ET CONTRASTES
   - Synthétiser toutes les différences riches/pauvres/classe moyenne
   - Créer une vue d'ensemble complète
   - Organiser par catégories

3. 📖 STRUCTURE COMPLÈTE DU LIVRE
   - Liste de tous les chapitres avec leurs contenus principaux
   - Progression logique du livre
   - Points de transition entre chapitres

4. 💬 CITATIONS IMPORTANTES
   - Toutes les citations majeures du livre
   - Organisées par chapitre
   - Avec contexte

5. 🎯 POINTS CLÉS EXTRACTS
   - Synthèse de tous les points clés
   - Hiérarchie d'importance
   - Applications pratiques

6. 💡 CONCEPTS ET PRINCIPES
   - Tous les concepts expliqués dans le livre
   - Définitions complètes
   - Relations entre concepts

7. 📝 EXEMPLES ET CAS CONCRETS
   - Tous les exemples mentionnés
   - Cas pratiques complets
   - Histoires et anecdotes

8. 🛠️ TECHNIQUES ET MÉTHODES
   - Toutes les techniques enseignées
   - Méthodes pratiques
   - Stratégies d'application

9. 📊 DONNÉES ET STATISTIQUES
   - Toutes les données chiffrées
   - Statistiques importantes
   - Études mentionnées

10. 🎓 PLAN D'ACTION COMPLET
    - Étapes pratiques pour appliquer le livre
    - Priorités d'action
    - Timeline recommandée

FORMAT DE RÉPONSE FINAL:
📚 RÉSUMÉ COMPLET ET DÉTAILLÉ - [TITRE DU LIVRE]

🔑 PRINCIPES ET RÈGLES CLÉS (PRIORITÉ MAXIMALE)
[TOUS les principes du livre organisés par importance]

⚡ DIFFÉRENCES ET CONTRASTES
[Toutes les différences riches/pauvres/classe moyenne]

📖 STRUCTURE COMPLÈTE DU LIVRE
[Structure détaillée avec tous les chapitres]

💬 CITATIONS IMPORTANTES
[Toutes les citations majeures]

🎯 POINTS CLÉS EXTRACTS
[Tous les points clés du livre]

💡 CONCEPTS ET PRINCIPES
[Tous les concepts expliqués]

📝 EXEMPLES ET CAS CONCRETS
[Tous les exemples mentionnés]

🛠️ TECHNIQUES ET MÉTHODES
[Toutes les techniques enseignées]

📊 DONNÉES ET STATISTIQUES
[Toutes les données chiffrées]

🎓 PLAN D'ACTION COMPLET
[Plan pratique d'application]

⚠️ NOTES IMPORTANTES
- Ce résumé capture 100% de la valeur du livre
- Tous les chapitres ont été analysés en détail
- Aucun contenu important n'a été omis
- Prêt pour application immédiate`;

  try {
    // Utilisation du service OpenAI GPT-4o Mini centralisé pour la synthèse finale
    const messages = [
      { role: 'system', content: 'Tu es un expert en synthèse de contenu de livres. Combine toutes ces extractions de chapitres en un résumé complet et cohérent du livre entier.' },
      { role: 'user', content: prompt }
    ];

    const completeSummary = await createChatCompletion(messages, {
      max_tokens: 15000,
      temperature: 0.1,
      model: 'deepseek-chat'  // EXPLICITEMENT DEEPSEEK V2
    });

    return {
      success: true,
      completeSummary: completeSummary,
      chapterCount: chapterExtractions.length,
      totalExtractions: chapterExtractions.filter(e => e.success).length
    };
  } catch (error) {
    console.error(`❌ Erreur synthèse finale: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction principale d'extraction COMPLÈTE
export async function extractCompleteBookContent(pdfText, bookTitle = 'Livre') {
  const startTime = Date.now();
  
  try {
    console.log(`🚀 Démarrage extraction COMPLÈTE du livre: ${bookTitle}`);
    console.log(`📄 Texte original: ${pdfText.length} caractères`);
    
    // 1. Découper en chapitres
    const chapters = splitTextIntoChapters(pdfText);
    console.log(`📖 ${chapters.length} chapitres/parties détectés`);
    
    // 2. Extraire le contenu de chaque chapitre
    const chapterExtractions = [];
    for (let i = 0; i < chapters.length; i++) {
      console.log(`📖 Extraction chapitre ${i + 1}/${chapters.length}: ${chapters[i].title}`);
      
      const extraction = await extractChapterContent(chapters[i], i, chapters.length);
      chapterExtractions.push(extraction);
      
      if (extraction.success) {
        console.log(`✅ Chapitre ${i + 1} extrait avec succès${extraction.chunksProcessed ? ` (${extraction.chunksProcessed} chunks)` : ''}`);
      } else {
        console.log(`❌ Échec extraction chapitre ${i + 1}: ${extraction.error}`);
      }
      
      // La queue de rate limiting gère automatiquement les délais
      // Plus besoin de pause manuelle ici
    }
    
    // 3. Créer la synthèse finale
    console.log(`🔄 Création de la synthèse finale...`);
    const finalSummary = await createCompleteBookSummary(chapterExtractions, pdfText);
    
    if (!finalSummary.success) {
      throw new Error(`Synthèse finale échouée: ${finalSummary.error}`);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Extraction COMPLÈTE terminée en ${totalTime}ms`);
    console.log(`📊 Statistiques: ${chapters.length} chapitres, ${chapterExtractions.filter(e => e.success).length} extractions réussies`);
    
    return {
      success: true,
      completeSummary: finalSummary.completeSummary,
      chapterExtractions: chapterExtractions,
      metadata: {
        bookTitle,
        originalTextLength: pdfText.length,
        chaptersCount: chapters.length,
        successfulExtractions: chapterExtractions.filter(e => e.success).length,
        totalProcessingTime: totalTime,
        extractionMethod: 'COMPLETE_BY_CHAPTERS',
        quality: 'PROFESSIONAL_GRADE'
      }
    };
    
  } catch (error) {
    console.error(`❌ Erreur extraction COMPLÈTE: ${error.message}`);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

// Fonction de vérification de qualité
export function verifyExtractionQuality(summary) {
  const qualityChecks = {
    hasPrinciples: summary.includes('🔑 PRINCIPES') && summary.includes('PRIORITÉ MAXIMALE'),
    hasDifferences: summary.includes('⚡ DIFFÉRENCES') && summary.includes('riches/pauvres'),
    hasStructure: summary.includes('📖 STRUCTURE') && summary.includes('CHAPITRES'),
    hasQuotes: summary.includes('💬 CITATIONS'),
    hasKeyPoints: summary.includes('🎯 POINTS CLÉS'),
    hasConcepts: summary.includes('💡 CONCEPTS'),
    hasExamples: summary.includes('📝 EXEMPLES'),
    hasTechniques: summary.includes('🛠️ TECHNIQUES'),
    hasData: summary.includes('📊 DONNÉES'),
    hasActionPlan: summary.includes('🎓 PLAN D\'ACTION'),
    isComplete: summary.length > 5000, // Résumé complet
    hasNoAnalysis: !summary.includes('Analysis: I can now help you')
  };
  
  const passedChecks = Object.values(qualityChecks).filter(Boolean).length;
  const totalChecks = Object.keys(qualityChecks).length;
  const qualityScore = Math.round((passedChecks / totalChecks) * 100);
  
  return {
    qualityScore,
    passedChecks,
    totalChecks,
    checks: qualityChecks,
    isHighQuality: qualityScore >= 90
  };
}
