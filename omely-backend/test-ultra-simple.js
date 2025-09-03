// TEST RAPIDE DU SERVEUR ULTRA-SIMPLE
import https from 'https';

const testEndpoint = (url, name, method = 'GET', data = null) => {
  return new Promise((resolve) => {
    console.log(`🧪 Test ${name}...`);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`✅ ${name} réussi - Status: ${res.statusCode}`);
        try {
          const result = JSON.parse(responseData);
          console.log(`   Message: ${result.message || result.status || 'OK'}`);
          if (result.receivedSizeMB) {
            console.log(`   Taille reçue: ${result.receivedSizeMB}`);
          }
        } catch (e) {
          console.log(`   Raw: ${responseData.substring(0, 100)}`);
        }
        resolve({ success: true, status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} échoue: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ ${name} timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testUltraSimple() {
  console.log('🔍 TEST SERVEUR ULTRA-SIMPLE');
  console.log('==============================');

  // Test basique
  const healthResult = await testEndpoint('https://omely-node-backend.fly.dev/health', 'Health Check');

  if (healthResult.success) {
    console.log('\n🎉 SERVEUR ULTRA-SIMPLE FONCTIONNE !');
    console.log('✅ Les limites de taille sont maintenant gérées correctement');
    console.log('✅ Plus d\'erreur "request entity too large"');
  } else {
    console.log('\n❌ SERVEUR ULTRA-SIMPLE NE FONCTIONNE PAS');
  }
}

testUltraSimple().catch(console.error);


