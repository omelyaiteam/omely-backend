// TEST DU DÉMARRAGE DU SERVEUR PRINCIPAL
console.log('🔍 TEST DÉMARRAGE SERVEUR PRINCIPAL');

async function testServerStartup() {
  // Test 1: Imports de base (comme dans server.js)
  try {
    console.log('📦 Test imports de base...');
    await import('express');
    await import('cors');
    await import('fs/promises');
    await import('path');
    await import('multer');
    console.log('✅ Imports de base OK');
  } catch (error) {
    console.log('❌ Erreur imports de base:', error.message);
    return;
  }

  // Test 2: Imports des services (potentiellement problématiques)
  try {
    console.log('🔧 Test imports des services...');
    await import('./utils/openaiService.js');
    console.log('✅ Service OpenAI OK');
  } catch (error) {
    console.log('❌ Erreur service OpenAI:', error.message);
    console.log('   Stack:', error.stack);
    return;
  }

  // Test 3: Imports audio (potentiellement problématiques)
  try {
    console.log('🎵 Test imports audio...');
    await import('./utils/transcribe.js');
    await import('./utils/extractAudio.js');
    console.log('✅ Services audio OK');
  } catch (error) {
    console.log('❌ Erreur services audio:', error.message);
    console.log('   Stack:', error.stack);
    // Ne pas quitter - certains imports peuvent échouer mais ne bloquent pas le démarrage
  }

  // Test 4: Imports summarize (potentiellement problématiques)
  try {
    console.log('📝 Test imports summarize...');
    await import('./utils/summarize.js');
    console.log('✅ Service summarize OK');
  } catch (error) {
    console.log('❌ Erreur services summarize:', error.message);
    console.log('   Stack:', error.stack);
    // Ne pas quitter - certains imports peuvent échouer mais ne bloquent pas le démarrage
  }

  // Test 5: Simulation du démarrage du serveur
  try {
    console.log('🚀 Simulation démarrage serveur...');

    // Simuler la création de l'app Express
    const { default: express } = await import('express');
    const { default: cors } = await import('cors');

    const app = express();
    app.use(cors());
    app.use(express.json());

    // Simuler les routes de base
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: 'test'
      });
    });

    console.log('✅ Simulation serveur OK');

  } catch (error) {
    console.log('❌ Erreur simulation serveur:', error.message);
    console.log('   Stack:', error.stack);
    return;
  }

  console.log('\n🎯 TESTS TERMINÉS AVEC SUCCÈS');
  console.log('Le serveur devrait pouvoir démarrer correctement sur Fly.io');
}

testServerStartup().catch(console.error);


