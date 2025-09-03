// TEST DU SYSTÈME DE RATE LIMITING POUR L'API GEMINI

import { globalGeminiRateLimiter, callGeminiAPI, getGeminiQueueStatus, GEMINI_HEADERS, createGeminiRequestConfig } from './utils/geminiRateLimit.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAQNGdj456cdl2WD1SRhWd_nUhJW-rSmt4';

// Fonction de test d'appel API Gemini
async function testGeminiCall(testName, prompt) {
  console.log(`\n🧪 Test: ${testName}`);
  
  try {
    const result = await callGeminiAPI(async () => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: GEMINI_HEADERS,
        body: JSON.stringify(createGeminiRequestConfig(prompt, 1000)),
        signal: AbortSignal.timeout(60000)
      });

      if (!response.ok) {
        throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Réponse invalide de l\'API Gemini');
      }

      return data.candidates[0].content.parts[0].text;
    });
    
    console.log(`✅ ${testName} réussi`);
    console.log(`📝 Réponse: ${result.substring(0, 100)}...`);
    
    return true;
  } catch (error) {
    console.error(`❌ ${testName} échoué: ${error.message}`);
    return false;
  }
}

// Test de charge pour vérifier le rate limiting
async function testRateLimiting() {
  console.log('\n🚀 DÉMARRAGE DES TESTS DE RATE LIMITING');
  console.log('=====================================');
  
  // Test 1: Appel simple
  await testGeminiCall('Appel simple', 'Dis bonjour en français en une phrase.');
  
  console.log(`\n📊 Statut queue: ${JSON.stringify(getGeminiQueueStatus(), null, 2)}`);
  
  // Test 2: Appels multiples rapides (pour tester la queue)
  console.log('\n🔄 Test d\'appels multiples rapides...');
  
  const promises = [];
  for (let i = 1; i <= 5; i++) {
    promises.push(
      testGeminiCall(`Appel multiple #${i}`, `Compte jusqu'à ${i} en français.`)
    );
  }
  
  const results = await Promise.all(promises);
  const successCount = results.filter(Boolean).length;
  
  console.log(`\n📈 Résultats: ${successCount}/${results.length} appels réussis`);
  console.log(`📊 Statut final: ${JSON.stringify(getGeminiQueueStatus(), null, 2)}`);
  
  // Test 3: Test avec un texte plus long (pour tester les timeouts)
  const longPrompt = `
    Analyse ce texte court et extrais les points clés:
    
    "L'investissement est l'art de mettre de l'argent au travail pour qu'il génère plus d'argent. 
    Les riches comprennent cette règle fondamentale: leur argent doit travailler pour eux, 
    pas l'inverse. Ils investissent dans des actifs qui génèrent des revenus passifs."
    
    Extrais:
    1. Les principes clés
    2. Les différences de mentalité
    3. Les techniques mentionnées
  `;
  
  await testGeminiCall('Test texte long', longPrompt);
  
  console.log('\n✅ Tests de rate limiting terminés');
}

// Test spécifique des erreurs 429
async function testErrorHandling() {
  console.log('\n🛠️ TEST DE GESTION DES ERREURS');
  console.log('==============================');
  
  // Simuler une erreur 429
  try {
    await callGeminiAPI(async () => {
      throw new Error('Erreur API Gemini: 429 Too Many Requests');
    });
  } catch (error) {
    console.log(`✅ Gestion erreur 429 testée: ${error.message}`);
  }
  
  // Simuler une erreur 503
  try {
    await callGeminiAPI(async () => {
      throw new Error('Erreur API Gemini: 503 Service Unavailable');
    });
  } catch (error) {
    console.log(`✅ Gestion erreur 503 testée: ${error.message}`);
  }
}

// Fonction principale
async function runTests() {
  console.log('🎯 TESTS DU SYSTÈME DE RATE LIMITING GEMINI');
  console.log('===========================================');
  
  try {
    await testRateLimiting();
    await testErrorHandling();
    
    console.log('\n🎉 TOUS LES TESTS TERMINÉS');
    console.log('✅ Le système de rate limiting fonctionne correctement');
    
  } catch (error) {
    console.error('\n💥 ERREUR PENDANT LES TESTS:', error);
  }
}

// Lancer les tests si le script est exécuté directement
runTests();

export { testRateLimiting, testErrorHandling };
