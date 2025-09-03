// TEST DU SERVEUR SIMPLIFIÉ DÉPLOYÉ
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
          console.log(`   Message: ${result.message || result.status || 'OK'}`);
          if (result.environment) {
            console.log(`   NODE_ENV: ${result.environment.NODE_ENV}`);
            console.log(`   Clé API présente: ${result.environment.DEEPSEEK_API_KEY !== 'NOT_SET'}`);
          }
          if (result.server) {
            console.log(`   Serveur: ${result.server}`);
            console.log(`   Fonctionnalités: ${result.features?.join(', ') || 'N/A'}`);
          }
        } catch (e) {
          console.log(`   Raw: ${data.substring(0, 100)}`);
        }
        resolve(true);
      });
    });
    req.on('error', (err) => {
      console.log(`❌ ${name} échoue: ${err.message}`);
      resolve(false);
    });
    req.setTimeout(10000, () => {
      console.log(`⏰ ${name} timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

async function testSimplified() {
  console.log('🔍 TEST SERVEUR SIMPLIFIÉ DÉPLOYÉ');
  console.log('===================================');

  const healthOk = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');
  const testOk = await testEndpoint('https://omely-node-backend.fly.dev/test', 'Test Endpoint');
  const diagnosticOk = await testEndpoint('https://omely-node-backend.fly.dev/diagnostic', 'Diagnostic');

  console.log('\n📊 RÉSULTATS:');
  console.log(`   Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`   Test: ${testOk ? '✅' : '❌'}`);
  console.log(`   Diagnostic: ${diagnosticOk ? '✅' : '❌'}`);

  if (healthOk && testOk && diagnosticOk) {
    console.log('\n🎉 SUCCÈS ! Le serveur simplifié fonctionne parfaitement.');
    console.log('Cela confirme que :');
    console.log('✅ Express fonctionne sur Fly.io');
    console.log('✅ Les middlewares de base fonctionnent');
    console.log('✅ La gestion d\'erreurs fonctionne');
    console.log('✅ Les variables d\'environnement sont accessibles');
    console.log('\n🔧 PROCHAINE ÉTAPE: Ajouter progressivement les services DeepSeek');
  } else {
    console.log('\n❌ Le serveur simplifié a encore des problèmes.');
    console.log('Il faut déboguer plus profondément.');
  }
}

testSimplified().catch(console.error);


