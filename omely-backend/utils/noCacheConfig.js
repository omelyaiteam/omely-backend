// Configuration pour supprimer TOUS les caches
export const NO_CACHE_CONFIG = {
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substring(7)}`
  },
  generationConfig: {
    temperature: 0.1,
    topK: 40,
    topP: 0.8,
    maxOutputTokens: 8000,
    stopSequences: ["Analysis:", "I can now help you", "I can help you analyze"],
    cacheControl: "no-cache"
  }
};

// Fonction pour générer un ID unique
export function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// Fonction pour créer un prompt sans cache
export function createNoCachePrompt(basePrompt, text) {
  const timestamp = Date.now();
  const uniqueId = generateUniqueId();
  
  return `${basePrompt}

CACHE SUPPRIMÉ - NOUVELLE ANALYSE OBLIGATOIRE
TIMESTAMP: ${timestamp}
ID UNIQUE: ${uniqueId}

TEXTE À ANALYSER:
${text}

INSTRUCTIONS SPÉCIALES:
- CACHE COMPLÈTEMENT SUPPRIMÉ
- NOUVELLE ANALYSE OBLIGATOIRE
- IGNORER TOUS LES RÉSULTATS PRÉCÉDENTS
- ANALYSER LE TEXTE COMPLET MAINTENANT`;
}


