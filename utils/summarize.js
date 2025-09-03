// SERVICE DE SUMMARIZATION AVEC OPENAI GPT-4O-MINI
import { createChatCompletion } from './openaiService.js';

const MAX_CHUNK_SIZE = 30000; // AJUSTÉ pour GPT-4o-mini (supporte plus de tokens)

/**
 * Summarizes text using OpenAI GPT-4o-mini, with chunking for large texts
 * @param {string} text - The text to summarize
 * @param {string} type - Type of content ('pdf', 'audio', 'video', 'general')
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The summarized text
 */
async function summarizeText(text, type = 'general', options = {}) {
  const chunks = chunkText(text, MAX_CHUNK_SIZE);
  
  // Process chunks sequentially to avoid rate limiting
  const summaries = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`📖 Processing chunk ${i + 1}/${chunks.length} with OpenAI GPT-4o-mini...`);

    // Add delay between chunks to respect rate limits
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Optimisé pour OpenAI
    }

    try {
      const summary = await generateSummary(chunks[i], type, options);
      summaries.push(summary);
    } catch (error) {
      console.error(`❌ Chunk ${i + 1} failed: ${error.message}`);
      summaries.push(`⚠️ Chunk ${i + 1} extraction failed: ${error.message}`);
    }
  }

  const combined = summaries.join('\n\n');
  if (chunks.length > 1) {
    // Add delay before final combination
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateSummary(combined, type, { ...options, isFinal: true });
  }
  return summaries[0];
}

function chunkText(text, maxSize) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxSize) {
    chunks.push(text.substring(i, i + maxSize));
  }
  return chunks;
}

async function generateSummary(text, type = 'general', options = {}) {
  const { isFinal = false } = options;

  // Vérification basique de l'API OpenAI
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
          return `⚠️ DeepSeek API not configured\n\nSample summary for: ${text.substring(0, 100)}...\n\n• This is a placeholder response\n• Configure DEEPSEEK_API_KEY environment variable\n• Using DeepSeek V2 model\n**Key concepts** would appear here`;
  }

  // Prompt amélioré pour des résumés plus détaillés avec DeepSeek V2
  const prompt = isFinal
    ? `Tu es un expert en analyse de contenu. Analyse ces résumés combinés et génère un résumé COMPLET et DÉTAILLÉ qui capture TOUS les points importants.

    INSTRUCTIONS STRICTES:
    - Extrais TOUS les concepts, principes et stratégies importants
    - Ne laisse AUCUN point clé de côté
    - Organise par sections thématiques claires
    - Inclus les exemples concrets et cas pratiques
    - Mentionne les techniques spécifiques et méthodes
    - Sois exhaustif - ne limite pas le contenu
    - Évite les généralités, va dans le détail de chaque concept
    - Structure clairement avec des sections et sous-sections

    RÉSUMÉS COMBINÉS:
    ${text}

    FORMAT DE RÉPONSE OBLIGATOIRE:
    📚 RÉSUMÉ COMPLET ET DÉTAILLÉ

    🎯 CONCEPTS FONDAMENTAUX
    [Liste exhaustive de tous les concepts principaux]

    📖 SECTIONS THÉMATIQUES PRINCIPALES
    [Organisation détaillée par thèmes]

    💡 STRATÉGIES ET TECHNIQUES SPÉCIFIQUES
    [Toutes les méthodes pratiques mentionnées]

    🔑 PRINCIPES CLÉS ET LOIS
    [Tous les principes et lois importantes]

    📝 EXEMPLES ET CAS PRATIQUES
    [Tous les exemples concrets]

    🎓 ENSEIGNEMENTS PRINCIPAUX
    [Tous les enseignements et leçons]

    ⚡ POINTS D'ACTION
    [Actions concrètes à entreprendre]

    💰 CONCEPTS FINANCIERS (si applicable)
    [Tous les concepts financiers importants]

    🧠 MENTALITÉ ET PSYCHOLOGIE (si applicable)
    [Aspects psychologiques et mentaux]`
    : `Tu es un expert en analyse de contenu. Tu dois analyser ce texte et générer un résumé EXTRÊMEMENT DÉTAILLÉ qui capture ABSOLUMENT TOUS les points importants.

    INSTRUCTIONS STRICTES ET OBLIGATOIRES:
    - Extrais TOUS les concepts, principes, stratégies, techniques et exemples
    - Ne laisse AUCUN point clé de côté, même les plus petits
    - Sois EXHAUSTIF - ce texte fait 200 pages, il y a BEAUCOUP plus à extraire
    - Organise par chapitres/sections si possible
    - Inclus TOUS les exemples concrets, cas pratiques et démonstrations
    - Mentionne TOUTES les techniques spécifiques, méthodes et formules
    - Évite les généralités, va dans le DÉTAIL de chaque concept
    - Si c'est un livre de développement personnel/financier, extrais TOUS les enseignements
    - Structure clairement avec des sections et sous-sections détaillées

    TEXTE À ANALYSER (EXTRAIRE TOUT):
    ${text}

    FORMAT DE RÉPONSE OBLIGATOIRE ET DÉTAILLÉ:
    📚 RÉSUMÉ COMPLET ET DÉTAILLÉ - [TITRE DU LIVRE/DOCUMENT]

    🎯 CONCEPTS FONDAMENTAUX
    [Liste EXHAUSTIVE de tous les concepts principaux mentionnés]

    📖 CHAPITRES ET SECTIONS PRINCIPALES
    [Organisation DÉTAILLÉE par chapitres/sections avec tous les points]

    💡 STRATÉGIES ET TECHNIQUES SPÉCIFIQUES
    [TOUTES les méthodes pratiques, formules et techniques mentionnées]

    🔑 PRINCIPES CLÉS ET LOIS
    [TOUS les principes, lois et règles importantes]

    📝 EXEMPLES ET CAS PRATIQUES
    [TOUS les exemples concrets, démonstrations et cas d'études]

    🎓 ENSEIGNEMENTS PRINCIPAUX
    [TOUS les enseignements, leçons et insights]

    ⚡ POINTS D'ACTION
    [Actions concrètes, étapes et plans mentionnés]

    💰 CONCEPTS FINANCIERS (si applicable)
    [TOUS les concepts financiers, systèmes et méthodes]

    🧠 MENTALITÉ ET PSYCHOLOGIE (si applicable)
    [Aspects psychologiques, mindset et transformations]

    📊 MÉTHODES ET SYSTÈMES
    [TOUS les systèmes, frameworks et méthodologies]

    🎯 OBJECTIFS ET RÉSULTATS
    [Objectifs visés et résultats attendus]

    IMPORTANT: Ce texte fait 200 pages, assure-toi d'extraire TOUT le contenu important, pas seulement un résumé superficiel !`;

  // Appel à DeepSeek V2 avec retry automatique géré par le service
  const messages = [
    { role: 'system', content: 'Tu es un expert en analyse de contenu et résumé de documents.' },
    { role: 'user', content: prompt }
  ];

  try {
    const maxTokens = isFinal ? 800 : 600; // AJUSTÉ pour limites DeepSeek v2
    const summary = await createChatCompletion(messages, {
      max_tokens: maxTokens,
      temperature: 0.2,
      model: 'deepseek-chat'  // EXPLICITEMENT DEEPSEEK V2
    });

    console.log(`✅ Résumé généré avec DeepSeek V2: ${summary.length} caractères`);
    return summary;

  } catch (error) {
    console.error('❌ Erreur génération résumé DeepSeek V2:', error);
    throw new Error(`Échec génération résumé: ${error.message}`);
  }
}

export default summarizeText;
