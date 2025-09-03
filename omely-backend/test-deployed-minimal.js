// TEST DU SERVEUR MINIMAL DÉPLOYÉ
import https from 'https';

const testEndpoint = (url, name) => {
  return new Promise((resolve) => {
    console.log(`🧪 Test ${name}...`);
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ ${name} réussi - Status: ${res.statusCode}`);
          console.log(`   Message: ${result.message || result.status || 'OK'}`);
          if (result.deepseek_api_key) {
            console.log(`   Clé DeepSeek: ${result.deepseek_api_key}`);
          }
          if (result.environment) {
            console.log(`   NODE_ENV: ${result.environment.NODE_ENV}`);
            console.log(`   Clé API présente: ${result.environment.DEEPSEEK_API_KEY !== 'NOT_SET'}`);
          }
        } catch (e) {
          console.log(`✅ ${name} répondu - Status: ${res.statusCode}`);
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

async function testDeployedServer() {
  console.log('🔍 TEST DU SERVEUR MINIMAL DÉPLOYÉ');
  console.log('====================================');

  const healthOk = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');
  const testOk = await testEndpoint('https://omely-node-backend.fly.dev/test', 'Test Endpoint');
  const deepseekOk = await testEndpoint('https://omely-node-backend.fly.dev/verify-deepseek-minimal', 'DeepSeek Check');

  console.log('\n📊 RÉSULTATS:');
  console.log(`   Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`   Test: ${testOk ? '✅' : '❌'}`);
  console.log(`   DeepSeek: ${deepseekOk ? '✅' : '❌'}`);

  if (healthOk && testOk) {
    console.log('\n🎉 SERVEUR MINIMAL FONCTIONNE !');
    console.log('   Le problème vient du serveur principal, pas de Fly.io');
    console.log('\n🔧 SOLUTION:');
    console.log('   1. Revenir au serveur principal');
    console.log('   2. Corriger les imports problématiques');
  } else {
    console.log('\n❌ SERVEUR MINIMAL NE FONCTIONNE PAS');
    console.log('   Le problème vient de Fly.io ou de la configuration');
    console.log('\n🔧 DIAGNOSTIC À FAIRE:');
    console.log('   1. Vérifier les logs Fly.io');
    console.log('   2. Vérifier la configuration réseau');
    console.log('   3. Vérifier les secrets Fly.io');
  }
}

testDeployedServer().catch(console.error);

