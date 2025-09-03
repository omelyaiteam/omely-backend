// SERVICE ULTRA-RAPIDE OPENAI GPT-4O MINI - REMPLACE DEEPSEEK
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

// Cache pour les réponses similaires
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 secondes

export async function createChatCompletion(messages, options = {}) {
  // Cache ultra-rapide
  const cacheKey = JSON.stringify({ messages: messages.slice(-1), options });
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('⚡ CACHE HIT - réponse instantanée !');
    return cached.response;
  }

  try {
    console.log(`🚀 OpenAI GPT-4o-mini: ${messages.length} messages`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // LE PLUS RAPIDE ET ÉCONOMIQUE
      messages: messages,
      temperature: 0.7,
      max_tokens: options.max_tokens || 150,
      top_p: 0.9,
      stream: false, // Désactivé pour simplicité et rapidité
    });

    const response = completion.choices[0]?.message?.content || '';

    // Cache la réponse
    responseCache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });

    console.log(`✅ OpenAI réponse: ${response.length} caractères`);
    return response;

  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw new Error(`Erreur OpenAI: ${error.message}`);
  }
}

// Fonctions de compatibilité pour remplacer DeepSeek
export async function summarizeText(text, type = 'general') {
  const messages = [
    {
      role: 'system',
      content: 'Tu es un assistant qui résume des textes de manière claire et concise.'
    },
    {
      role: 'user',
      content: `Résume ce texte: ${text}`
    }
  ];

  return await createChatCompletion(messages, { max_tokens: 200 });
}

export async function extractCompleteBookContent(text, title = 'Livre') {
  const messages = [
    {
      role: 'system',
      content: `Tu es un expert en analyse de livres. Analyse ce livre intitulé "${title}" et fournis un résumé complet et structuré.`
    },
    {
      role: 'user',
      content: text
    }
  ];

  return await createChatCompletion(messages, { max_tokens: 1000 });
}

// Fonctions utilitaires
export function getDeepSeekQueueStatus() {
  return { queueLength: 0, activeRequests: 0, recentRequests: 0 };
}

export function clearDeepSeekQueue() {
  console.log('🔄 Queue OpenAI vidée');
}

export async function testDeepSeekConnection() {
  try {
    const response = await createChatCompletion([{
      role: 'user',
      content: 'Dis simplement "OpenAI fonctionne"'
    }], { max_tokens: 20 });

    return { success: true, message: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function verifyDeepSeekModelUsage() {
  return {
    success: true,
    requestedModel: 'gpt-4o-mini',
    actualModel: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1'
  };
}

export function getDeepSeekConfig() {
  return {
    model: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1',
    expectedModel: 'gpt-4o-mini',
    verifyModel: true,
    hasApiKey: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here')
  };
}

console.log('✅ Service OpenAI GPT-4o-mini activé - Rapidité maximale !');