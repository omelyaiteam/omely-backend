// SERVICE OPENAI GPT-4O MINI OPTIMISÉ
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

// Cache simple pour éviter les répétitions
const responseCache = new Map();
const CACHE_TTL = 60000; // 1 minute

export async function createChatCompletion(messages, options = {}) {
  try {
    console.log(`🚀 OpenAI GPT-4o-mini: ${messages.length} messages`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || '';
    console.log(`✅ OpenAI réponse: ${response.length} caractères`);

    return response;

  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw new Error(`Erreur OpenAI: ${error.message}`);
  }
}

// Fonction de résumé optimisée
export async function summarizeText(text, type = 'general', options = {}) {
  const maxLength = options.maxLength || 2000;

  let prompt = '';
  switch (type) {
    case 'pdf':
    case 'book':
      prompt = `Tu es un expert en analyse de documents. Analyse ce texte et fournis un résumé complet et structuré qui capture tous les points importants. Structure le résumé avec des sections claires.`;
      break;
    case 'audio':
      prompt = `Tu es un expert en analyse de contenu audio. Analyse cette transcription et fournis un résumé structuré qui capture les idées principales.`;
      break;
    case 'video':
      prompt = `Tu es un expert en analyse de contenu vidéo. Analyse cette transcription et fournis un résumé structuré qui capture les idées principales.`;
      break;
    default:
      prompt = `Résume ce texte de manière claire et concise.`;
  }

  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: text.substring(0, maxLength) }
  ];

  return await createChatCompletion(messages, { max_tokens: 1500 });
}

// Fonction d'extraction complète pour livres
export async function extractCompleteBookContent(text, title = 'Livre') {
  const prompt = `Tu es un expert en analyse de livres. Analyse ce livre intitulé "${title}" et fournis un résumé PROFESSIONNEL complet qui capture 100% de la valeur du livre.

INSTRUCTIONS OBLIGATOIRES:
- Extrais TOUS les concepts, principes et stratégies importants
- Ne laisse AUCUN point clé de côté
- Organise par sections thématiques claires
- Inclus les exemples concrets et cas pratiques
- Mentionne les techniques spécifiques et méthodes
- Sois exhaustif - ne limite pas le contenu

FORMAT STRUCTURE:
## 🔑 PRINCIPES CLÉS
## 💰 STRATÉGIES FINANCIÈRES
## ⚡ MENTALITÉS RICHES vs PAUVRES
## 🎯 PLAN D'ACTION
## 💬 CITATIONS INSPIRANTES

RÉSUMÉ COMPLET:`;

  const messages = [
    { role: 'system', content: prompt },
    { role: 'user', content: text.substring(0, 10000) }
  ];

  const summary = await createChatCompletion(messages, { max_tokens: 2000 });

  return {
    success: true,
    completeSummary: summary,
    metadata: {
      title,
      originalTextLength: text.length,
      processingTime: Date.now(),
      provider: 'GPT-4o mini'
    }
  };
}

// Test de connexion
export async function testConnection() {
  try {
    const response = await createChatCompletion([{
      role: 'user',
      content: 'Réponds simplement "OK"'
    }], { max_tokens: 10 });

    return { success: true, message: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Configuration
export function getConfig() {
  return {
    model: 'gpt-4o-mini',
    provider: 'OpenAI',
    hasApiKey: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here'),
    baseURL: 'https://api.openai.com/v1'
  };
}

console.log('✅ Service OpenAI GPT-4o-mini optimisé !');