// TEST DU SERVEUR ULTRA-MINIMAL DÉPLOYÉ
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

async function testUltraMinimal() {
  console.log('🔍 TEST SERVEUR ULTRA-MINIMAL DÉPLOYÉ');
  console.log('=====================================');

  const healthOk = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');
  const testOk = await testEndpoint('https://omely-node-backend.fly.dev/test', 'Test Endpoint');

  console.log('\n📊 RÉSULTATS:');
  console.log(`   Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`   Test: ${testOk ? '✅' : '❌'}`);

  if (healthOk && testOk) {
    console.log('\n🎉 SUCCÈS ! Le serveur ultra-minimal fonctionne.');
    console.log('Cela confirme que :');
    console.log('✅ Fly.io fonctionne');
    console.log('✅ Les health checks passent');
    console.log('✅ Le réseau fonctionne');
    console.log('\n🔧 CONCLUSION: Le problème vient des dépendances/complexité du serveur principal.');
    console.log('\n💡 SOLUTION: Simplifier progressivement le serveur principal');
  } else {
    console.log('\n❌ ÉCHEC du serveur ultra-minimal.');
    console.log('Le problème est plus fondamental (Fly.io, réseau, etc.)');
  }
}

testUltraMinimal().catch(console.error);


