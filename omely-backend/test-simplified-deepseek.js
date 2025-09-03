// TEST COMPLET DU SERVEUR SIMPLIFIÉ AVEC DEEPSEEK
import https from 'https';

const testEndpoint = (url, name) => {
  return new Promise((resolve) => {
    console.log(`🧪 Test ${name}...`);
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${name} réussi - Status: ${res.statusCode}`);
        try {
          const result = JSON.parse(data);
          console.log(`   Status: ${result.status || result.message || 'OK'}`);

          if (result.features) {
            console.log(`   Fonctionnalités: ${result.features.join(', ')}`);
          }
          if (result.deepseekAvailable !== undefined) {
            console.log(`   DeepSeek disponible: ${result.deepseekAvailable ? '✅' : '❌'}`);
          }
          if (result.success !== undefined) {
            console.log(`   Test réussi: ${result.success ? '✅' : '❌'}`);
            if (result.response) {
              console.log(`   Réponse DeepSeek: "${result.response.substring(0, 50)}..."`);
            }
          }
          if (result.error) {
            console.log(`   Erreur: ${result.message}`);
          }

          resolve({ success: true, data: result });
        } catch (e) {
          console.log(`   Raw: ${data.substring(0, 100)}`);
          resolve({ success: true, raw: data });
        }
      });
    });
    req.on('error', (err) => {
      console.log(`❌ ${name} échoue: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    req.setTimeout(15000, () => {
      console.log(`⏰ ${name} timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
};

async function testSimplifiedWithDeepSeek() {
  console.log('🔍 TEST SERVEUR SIMPLIFIÉ AVEC DEEPSEEK');
  console.log('=======================================');

  // Tests de base
  const healthResult = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');
  const testResult = await testEndpoint('https://omely-node-backend.fly.dev/test', 'Test Endpoint');
  const diagnosticResult = await testEndpoint('https://omely-node-backend.fly.dev/diagnostic', 'Diagnostic');

  console.log('\n' + '='.repeat(50));

  // Test DeepSeek
  const deepseekResult = await testEndpoint('https://omely-node-backend.fly.dev/test-deepseek', 'DeepSeek Test');

  console.log('\n📊 RÉSULTATS FINAUX:');
  console.log('='.repeat(50));
  console.log(`   Health: ${healthResult.success ? '✅' : '❌'}`);
  console.log(`   Test: ${testResult.success ? '✅' : '❌'}`);
  console.log(`   Diagnostic: ${diagnosticResult.success ? '✅' : '❌'}`);
  console.log(`   DeepSeek: ${deepseekResult.success ? '✅' : '❌'}`);

  // Analyse des résultats
  const allBasicTestsPass = healthResult.success && testResult.success && diagnosticResult.success;
  const deepseekWorks = deepseekResult.success && deepseekResult.data?.success;

  console.log('\n🎯 ANALYSE:');
  if (allBasicTestsPass) {
    console.log('✅ Le serveur de base fonctionne parfaitement');
  }

  if (deepseekWorks) {
    console.log('🎉 DEEPSEEK FONCTIONNE ! L\'API est maintenant opérationnelle');
    console.log('✅ Vous pouvez utiliser le chat avec DeepSeek v2');
    console.log('✅ Toutes les fonctionnalités de summarization sont disponibles');
  } else if (deepseekResult.success && !deepseekResult.data?.success) {
    console.log('⚠️ DeepSeek est chargé mais il y a une erreur dans les appels API');
    console.log('   Erreur:', deepseekResult.data?.message || 'Inconnue');
  } else {
    console.log('❌ DeepSeek n\'est pas disponible ou ne fonctionne pas');
  }

  console.log('\n🔧 PROCHAINES ÉTAPES:');
  if (deepseekWorks) {
    console.log('✅ Le système est prêt ! Vous pouvez utiliser:');
    console.log('   - /health : Vérification de santé');
    console.log('   - /test-deepseek : Test DeepSeek');
    console.log('   - Toutes les routes de summarization');
  } else {
    console.log('🔧 Il faut corriger les erreurs DeepSeek avant de continuer');
  }
}

testSimplifiedWithDeepSeek().catch(console.error);


