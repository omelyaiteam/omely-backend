// SCRIPT DE VÉRIFICATION EXHAUSTIVE DE DEEPSEEK V2
import { verifyDeepSeekModelUsage, getDeepSeekConfig, testDeepSeekConnection } from './utils/openaiService.js';

async function runDeepSeekVerification() {
  console.log('🔍 DÉMARRAGE VÉRIFICATION COMPLÈTE DEEPSEEK V2\n');

  try {
    // 1. Vérifier la configuration
    console.log('📋 1. VÉRIFICATION CONFIGURATION:');
    const config = getDeepSeekConfig();
    console.log('   Configuration:', JSON.stringify(config, null, 2));

    if (!config.hasApiKey) {
      console.error('❌ ERREUR: Clé API DeepSeek non configurée');
      console.log('   Définissez la variable d\'environnement DEEPSEEK_API_KEY');
      return;
    }

    // 2. Test de connexion simple
    console.log('\n🔗 2. TEST DE CONNEXION:');
    const testResult = await testDeepSeekConnection();
    if (testResult.success) {
      console.log('✅ Connexion réussie');
      console.log('   Modèle:', testResult.model);
      console.log('   Réponse:', testResult.message);
    } else {
      console.error('❌ Échec connexion:', testResult.error);
      return;
    }

    // 3. Vérification explicite du modèle
    console.log('\n🎯 3. VÉRIFICATION MODÈLE UTILISÉ:');
    const modelCheck = await verifyDeepSeekModelUsage();
    if (modelCheck.success) {
      console.log('✅ Modèle correct détecté');
      console.log('   Modèle demandé:', modelCheck.requestedModel);
      console.log('   Modèle utilisé:', modelCheck.actualModel);
      console.log('   URL API:', modelCheck.baseURL);
    } else {
      console.error('❌ Modèle incorrect détecté:');
      console.log('   Demandé:', modelCheck.requestedModel);
      console.log('   Utilisé:', modelCheck.actualModel);
      console.log('   Erreur:', modelCheck.error);
    }

    // 4. Résumé final
    console.log('\n📊 4. RÉSUMÉ FINAL:');
    console.log('   ✅ Configuration:', config.hasApiKey ? 'OK' : 'ÉCHEC');
    console.log('   ✅ Connexion:', testResult.success ? 'OK' : 'ÉCHEC');
    console.log('   ✅ Modèle:', modelCheck.success ? 'DEEPSEEK V2 CONFIRMÉ' : 'PROBLÈME DÉTECTÉ');

    if (config.hasApiKey && testResult.success && modelCheck.success) {
      console.log('\n🎉 SUCCÈS: Votre API utilise exclusivement DeepSeek v2!');
      console.log('   Toutes les vérifications sont passées avec succès.');
    } else {
      console.log('\n⚠️ ATTENTION: Problème détecté dans la configuration.');
      console.log('   Vérifiez votre clé API et votre configuration réseau.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécuter la vérification
runDeepSeekVerification().catch(console.error);
