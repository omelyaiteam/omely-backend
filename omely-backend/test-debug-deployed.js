// TEST DU SERVEUR DEBUG DÉPLOYÉ
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
          if (result.imports) {
            console.log('   📦 Imports testés:');
            Object.entries(result.imports).forEach(([key, value]) => {
              console.log(`     ${key}: ${value}`);
            });
          }
          if (result.services) {
            console.log('   🔧 Services testés:');
            Object.entries(result.services).forEach(([key, value]) => {
              if (typeof value === 'object') {
                console.log(`     ${key}: ${JSON.stringify(value)}`);
              } else {
                console.log(`     ${key}: ${value}`);
              }
            });
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
    req.setTimeout(15000, () => {
      console.log(`⏰ ${name} timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

async function testDebugServer() {
  console.log('🔍 TEST SERVEUR DEBUG DÉPLOYÉ');
  console.log('==============================');

  const healthOk = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');
  const testOk = await testEndpoint('https://omely-node-backend.fly.dev/test', 'Test Endpoint');

  console.log('\n📊 RÉSULTATS DE BASE:');
  console.log(`   Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`   Test: ${testOk ? '✅' : '❌'}`);

  if (healthOk && testOk) {
    console.log('\n🎉 SERVEUR DEBUG FONCTIONNE !');
    console.log('Maintenant testons les imports...\n');

    const importsOk = await testEndpoint('https://omely-node-backend.fly.dev/debug-imports', 'Debug Imports');
    console.log();
    const servicesOk = await testEndpoint('https://omely-node-backend.fly.dev/debug-services', 'Debug Services');

    console.log('\n📊 RÉSULTATS COMPLETS:');
    console.log(`   Health: ✅`);
    console.log(`   Test: ✅`);
    console.log(`   Imports: ${importsOk ? '✅' : '❌'}`);
    console.log(`   Services: ${servicesOk ? '✅' : '❌'}`);

  } else {
    console.log('\n❌ SERVEUR DEBUG NE FONCTIONNE PAS');
    console.log('Le problème est plus basique que les imports.');
  }
}

testDebugServer().catch(console.error);


