// TEST DE MIGRATION COMPLÈTE VERS OPENAI GPT-4O MINI

import { testOpenAIConnection, createChatCompletion, summarizeText } from './utils/openaiService.js';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = 'http://localhost:3002'; // URL locale pour tests

// Tests de base
async function testBasicOpenAI() {
  console.log('\n🧪 TEST 1: Connexion OpenAI de base');
  
  try {
    const result = await testOpenAIConnection();
    if (result.success) {
      console.log('✅ Connexion OpenAI OK:', result.message);
    } else {
      console.log('❌ Connexion OpenAI échouée:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur test connexion:', error.message);
    return false;
  }
  
  return true;
}

// Test du service de chat completion
async function testChatCompletion() {
  console.log('\n🧪 TEST 2: Chat Completion OpenAI');
  
  try {
    const messages = [
      { role: 'system', content: 'Tu es OMELY, assistant IA spécialisé dans l\'apprentissage.' },
      { role: 'user', content: 'Dis bonjour en français en une phrase.' }
    ];
    
    const response = await createChatCompletion(messages, { max_tokens: 50 });
    console.log('✅ Chat completion réussi:', response.substring(0, 100) + '...');
    return true;
  } catch (error) {
    console.log('❌ Chat completion échoué:', error.message);
    return false;
  }
}

// Test de summarization
async function testSummarization() {
  console.log('\n🧪 TEST 3: Summarization OpenAI');
  
  try {
    const testText = `
      L'investissement est l'art de faire travailler son argent. Les riches comprennent 
      cette règle fondamentale tandis que les pauvres travaillent pour l'argent. 
      Cette différence de mentalité est cruciale pour l'accumulation de richesse.
    `;
    
    const summary = await summarizeText(testText, 'general');
    console.log('✅ Summarization réussie:', summary.substring(0, 150) + '...');
    return true;
  } catch (error) {
    console.log('❌ Summarization échouée:', error.message);
    return false;
  }
}

// Test des routes backend
async function testBackendRoutes() {
  console.log('\n🧪 TEST 4: Routes Backend');
  
  // Test route de test OpenAI
  try {
    const response = await fetch(`${BACKEND_URL}/test/openai`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Route test OpenAI OK:', data.message);
    } else {
      console.log('❌ Route test OpenAI échouée:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur route test:', error.message);
    return false;
  }
  
  // Test route chat completion
  try {
    const response = await fetch(`${BACKEND_URL}/chat/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'Tu es OMELY.',
        userMessage: 'Dis bonjour',
        options: { max_tokens: 50 }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Route chat completion OK:', data.response.substring(0, 50) + '...');
    } else {
      console.log('❌ Route chat completion échouée:', data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur route chat completion:', error.message);
    return false;
  }
  
  return true;
}

// Test avec un petit document
async function testBookExtraction() {
  console.log('\n🧪 TEST 5: Extraction de livre (simulation)');
  
  try {
    const testBookText = `
      CHAPITRE 1: LES SECRETS DE L'ENRICHISSEMENT
      
      Les riches pensent différemment des pauvres. Ils investissent leur argent 
      plutôt que de le dépenser. Cette mentalité d'investisseur est fondamentale.
      
      RÈGLE 1: Faites travailler votre argent pour vous.
      RÈGLE 2: Ne travaillez jamais pour l'argent.
      
      Les pauvres achètent des passifs qu'ils croient être des actifs.
      Les riches achètent des actifs qui génèrent des revenus.
    `;
    
    const summary = await summarizeText(testBookText, 'book');
    console.log('✅ Extraction livre simulée réussie');
    console.log('📚 Résumé généré:', summary.substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.log('❌ Extraction livre échouée:', error.message);
    return false;
  }
}

// Fonction principale de test
async function runMigrationTests() {
  console.log('🚀 TESTS DE MIGRATION OPENAI GPT-4O MINI');
  console.log('=====================================');
  
  const tests = [
    { name: 'Connexion OpenAI', fn: testBasicOpenAI },
    { name: 'Chat Completion', fn: testChatCompletion },
    { name: 'Summarization', fn: testSummarization },
    { name: 'Routes Backend', fn: testBackendRoutes },
    { name: 'Extraction Livre', fn: testBookExtraction }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await test.fn();
    if (success) {
      passed++;
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 RÉSULTATS DES TESTS');
  console.log('======================');
  console.log(`✅ Tests réussis: ${passed}/${total}`);
  console.log(`❌ Tests échoués: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 MIGRATION OPENAI COMPLÈTEMENT RÉUSSIE !');
    console.log('🔄 Gemini → OpenAI GPT-4o mini: ✅');
    console.log('💬 Chat: ✅');
    console.log('📚 Summarization: ✅');
    console.log('📄 Extraction de livres: ✅');
    console.log('🎵 Audio/Vidéo: ✅ (via summarization)');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
  
  return passed === total;
}

// Vérification de configuration
function checkConfiguration() {
  console.log('\n🔧 VÉRIFICATION DE CONFIGURATION');
  console.log('=================================');
  
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey || openaiKey === 'your-openai-api-key-here') {
    console.log('❌ OPENAI_API_KEY non configurée !');
    console.log('⚠️ Définissez OPENAI_API_KEY dans vos variables d\'environnement');
    return false;
  } else {
    console.log('✅ OPENAI_API_KEY configurée');
    console.log(`🔑 Clé: ${openaiKey.substring(0, 12)}...`);
  }
  
  return true;
}

// Point d'entrée
async function main() {
  console.log('🎯 TEST DE MIGRATION COMPLÈTE: GEMINI → OPENAI GPT-4O MINI');
  console.log('============================================================');
  
  // Vérifier la configuration
  if (!checkConfiguration()) {
    console.log('\n❌ Configuration invalide. Tests arrêtés.');
    return;
  }
  
  // Lancer les tests
  const success = await runMigrationTests();
  
  if (success) {
    console.log('\n✨ Migration testée et validée avec succès !');
    console.log('🚀 Votre application utilise maintenant OpenAI GPT-4o mini');
  } else {
    console.log('\n💥 Des problèmes ont été détectés dans la migration.');
    console.log('🔧 Consultez les logs d\'erreur pour diagnostiquer les problèmes.');
  }
}

// Lancer les tests si le script est exécuté directement
main().catch(console.error);
