// Test simple et direct
const https = require('https');

console.log('🚀 Test simple de l\'endpoint quiz...\n');

// Test de l'endpoint Fly.io
const testFlyIO = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      summaryContent: 'Test simple'
    });

    const options = {
      hostname: 'omely-node-backend.fly.dev',
      port: 443,
      path: '/api/generate-quiz',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📡 Test de Fly.io...');
    const req = https.request(options, (res) => {
      console.log(`📊 Status Fly.io: ${res.statusCode}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('✅ Fly.io fonctionne !');
            console.log('📋 Données:', JSON.stringify(jsonData, null, 2));
          } else {
            console.log('❌ Fly.io erreur:', res.statusCode);
            console.log('📄 Réponse:', data.substring(0, 200));
          }
          resolve();
        } catch (e) {
          console.log('❌ Erreur parsing Fly.io:', e.message);
          resolve();
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Erreur connexion Fly.io:', e.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
};

// Test de l'endpoint local (si dispo)
const testLocal = () => {
  return new Promise((resolve) => {
    const http = require('http');

    const postData = JSON.stringify({
      summaryContent: 'Test local'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/generate-quiz',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('\n🏠 Test local...');
    const req = http.request(options, (res) => {
      console.log(`📊 Status Local: ${res.statusCode}`);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            console.log('✅ Local fonctionne !');
            console.log('📋 Données:', JSON.stringify(jsonData, null, 2));
          } else {
            console.log('❌ Local erreur:', res.statusCode);
          }
          resolve();
        } catch (e) {
          console.log('❌ Erreur parsing local:', e.message);
          resolve();
        }
      });
    });

    req.on('error', () => {
      console.log('⚠️ Local pas disponible');
      resolve();
    });

    req.write(postData);
    req.setTimeout(2000, () => {
      console.log('⏰ Timeout local');
      req.destroy();
      resolve();
    });

    req.end();
  });
};

// Lancer les tests
async function runTests() {
  await testFlyIO();
  await testLocal();

  console.log('\n🎯 Résumé:');
  console.log('- Si Fly.io retourne 502: problème serveur déployé');
  console.log('- Si Fly.io retourne 404: endpoint pas trouvé');
  console.log('- Si Local fonctionne: problème spécifique à Fly.io');
}

runTests();
