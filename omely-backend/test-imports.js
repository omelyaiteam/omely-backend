// TEST DES IMPORTS POUR DIAGNOSTIC
console.log('🔍 TEST DES IMPORTS');

async function testImports() {
  // Test 1: Imports de base
  try {
    console.log('📦 Test des imports Express/CORS...');
    await import('express');
    await import('cors');
    console.log('✅ Express et CORS OK');
  } catch (error) {
    console.log('❌ Erreur Express/CORS:', error.message);
    return;
  }

  // Test 2: Imports des utilitaires
  try {
    console.log('🔧 Test des imports OpenAI service...');
    await import('./utils/openaiService.js');
    console.log('✅ OpenAI service OK');
  } catch (error) {
    console.log('❌ Erreur OpenAI service:', error.message);
    console.log('   Détails:', error.stack);
    return;
  }

  // Test 3: Imports des utilitaires audio
  try {
    console.log('🎵 Test des imports audio...');
    await import('./utils/transcribe.js');
    await import('./utils/extractAudio.js');
    console.log('✅ Services audio OK');
  } catch (error) {
    console.log('❌ Erreur services audio:', error.message);
    console.log('   Détails:', error.stack);
  }

  // Test 4: Test de la configuration DeepSeek
  try {
    console.log('🤖 Test configuration DeepSeek...');
    const { getDeepSeekConfig } = await import('./utils/openaiService.js');
    const config = getDeepSeekConfig();
    console.log('✅ Configuration DeepSeek OK');
    console.log('   Clé API:', config.hasApiKey ? 'Présente' : 'MANQUANTE');
    console.log('   Modèle:', config.model);
  } catch (error) {
    console.log('❌ Erreur configuration DeepSeek:', error.message);
  }

  console.log('🎯 TESTS D\'IMPORTS TERMINÉS');
}

testImports().catch(console.error);
