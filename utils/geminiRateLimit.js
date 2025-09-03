// CONFIGURATION ET GESTION CENTRALISÉE DU RATE LIMITING POUR L'API GEMINI

// Configuration globale du rate limiting
export const GEMINI_RATE_LIMIT_CONFIG = {
  // Limites conservatrices pour éviter les erreurs 429
  requestsPerMinute: 15,
  maxConcurrentRequests: 2,
  
  // Stratégie de retry
  maxRetries: 5,
  baseDelay: 2000, // 2 secondes
  maxDelay: 60000, // 1 minute
  backoffMultiplier: 2,
  
  // Délais spécifiques par type d'erreur
  errorDelays: {
    429: 15000, // 15 secondes pour rate limit
    503: 5000,  // 5 secondes pour service unavailable
    default: 3000 // 3 secondes pour autres erreurs
  },
  
  // Délais entre chunks
  chunkDelay: 5000, // 5 secondes entre chunks
  
  // Timeouts
  requestTimeout: 60000 // 1 minute par requête
};

// Classe de gestion globale du rate limiting
class GlobalGeminiRateLimiter {
  constructor() {
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
    
    while (this.queue.length > 0 && this.activeRequests < GEMINI_RATE_LIMIT_CONFIG.maxConcurrentRequests) {
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
      setTimeout(() => this.processQueue(), 100);
    }
  }

  async retryRequest(requestFn, attempt = 1) {
    try {
      this.recordRequest();
      const result = await requestFn();
      return result;
    } catch (error) {
      if (attempt <= GEMINI_RATE_LIMIT_CONFIG.maxRetries) {
        const delay = this.calculateRetryDelay(error, attempt);
        
        if (delay > 0) {
          console.log(`⚠️ Erreur API Gemini: ${error.message} (tentative ${attempt}/${GEMINI_RATE_LIMIT_CONFIG.maxRetries}). Attente ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.retryRequest(requestFn, attempt + 1);
        }
      }
      throw error;
    }
  }

  calculateRetryDelay(error, attempt) {
    const { baseDelay, maxDelay, backoffMultiplier, errorDelays } = GEMINI_RATE_LIMIT_CONFIG;
    
    // Délai spécifique selon le type d'erreur
    let delay = baseDelay;
    
    if (error.message.includes('429')) {
      delay = errorDelays[429];
    } else if (error.message.includes('503')) {
      delay = errorDelays[503];
    } else {
      delay = errorDelays.default;
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
    if (recentRequests.length >= GEMINI_RATE_LIMIT_CONFIG.requestsPerMinute) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = 60000 - (now - oldestRequest) + 1000; // +1s de sécurité
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limit: attente ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Délai minimum entre requêtes
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    console.log('🔄 Queue Gemini vidée');
  }
}

// Instance globale partagée
export const globalGeminiRateLimiter = new GlobalGeminiRateLimiter();

// Fonction helper pour faire un appel API avec rate limiting
export async function callGeminiAPI(apiCall, priority = 'normal') {
  return globalGeminiRateLimiter.addRequest(apiCall, priority);
}

// Fonction helper pour obtenir le statut de la queue
export function getGeminiQueueStatus() {
  return globalGeminiRateLimiter.getQueueStatus();
}

// Configuration des headers standard
export const GEMINI_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Template de configuration Gemini standard
export function createGeminiRequestConfig(prompt, maxTokens = 8000) {
  return {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.1,
      topK: 40,
      topP: 0.8,
      stopSequences: ["Analysis:", "I can now help you", "I can help you"]
    }
  };
}

console.log('✅ Module de rate limiting Gemini initialisé');
