// DIAGNOSTIC RAPIDE DEEPSEEK API
import { testOpenAIConnection as testDeepSeekConnection, getDeepSeekConfig, verifyDeepSeekModelUsage } from './utils/openaiService.js';

console.log('🔍 DIAGNOSTIC RAPIDE DEEPSEEK API');
console.log('=================================');

// 1. Vérifier la configuration
console.log('1. CONFIGURATION:');
const config = getDeepSeekConfig();
console.log('   Modèle:', config.model);
console.log('   URL:', config.baseURL);
console.log('   Clé API:', config.hasApiKey ? '✅ Configurée' : '❌ Manquante');

if (!config.hasApiKey) {
  console.log('\n❌ PROBLÈME: Clé API DeepSeek non configurée');
  console.log('   Solution: Définir la variable DEEPSEEK_API_KEY');
  process.exit(1);
}

// 2. Test de connexion basique
console.log('\n2. TEST CONNEXION:');
try {
  const testResult = await testDeepSeekConnection();

  if (testResult.success) {
    console.log('✅ Connexion réussie');
    console.log('   Message:', testResult.message);
    console.log('   Modèle:', testResult.model);
  } else {
    console.log('❌ Échec connexion:', testResult.error);
    process.exit(1);
  }
} catch (error) {
  console.log('❌ ERREUR CONNEXION:', error.message);
  process.exit(1);
}

// 3. Vérification du modèle
console.log('\n3. VÉRIFICATION MODÈLE:');
try {
  const modelCheck = await verifyDeepSeekModelUsage();

  if (modelCheck.success) {
    console.log('✅ Modèle DeepSeek v2 confirmé');
    console.log('   Modèle demandé:', modelCheck.requestedModel);
    console.log('   Modèle utilisé:', modelCheck.actualModel);
  } else {
    console.log('❌ Modèle incorrect détecté:');
    console.log('   Demandé:', modelCheck.requestedModel);
    console.log('   Utilisé:', modelCheck.actualModel || 'N/A');
    console.log('   Erreur:', modelCheck.error);
  }
} catch (error) {
  console.log('❌ ERREUR VÉRIFICATION:', error.message);
}

console.log('\n🎯 DIAGNOSTIC TERMINÉ');
