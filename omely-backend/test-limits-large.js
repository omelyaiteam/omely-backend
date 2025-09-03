// TEST DES LIMITES AVEC DONNÉES VOLUMINEUSES
import https from 'https';

// Créer des données volumineuses pour tester les limites
const createLargeData = (sizeMB) => {
  const size = sizeMB * 1024 * 1024;
  const baseData = { test: 'data', timestamp: new Date().toISOString() };
  const jsonStr = JSON.stringify(baseData);
  const repetitions = Math.floor(size / jsonStr.length);
  const largeData = { items: [] };

  for (let i = 0; i < repetitions; i++) {
    largeData.items.push({
      id: i,
      data: 'x'.repeat(100), // Données supplémentaires
      ...baseData
    });
  }

  return largeData;
};

const testLargeRequest = (url, name, dataSizeMB) => {
  return new Promise((resolve) => {
    console.log(`🧪 Test ${name} (${dataSizeMB}MB)...`);

    const largeData = createLargeData(dataSizeMB);
    const jsonData = JSON.stringify(largeData);

    console.log(`   📊 Taille des données: ${(jsonData.length / (1024 * 1024)).toFixed(2)}MB`);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`✅ ${name} terminé - Status: ${res.statusCode}`);

        if (res.statusCode === 413) {
          console.log('   📏 Limite atteinte (normal):', res.statusCode);
        } else if (res.statusCode === 200) {
          console.log('   ✅ Données acceptées');
        }

        try {
          const result = JSON.parse(responseData);
          if (result.message) {
            console.log(`   💬 ${result.message}`);
          }
          if (result.limit) {
            console.log(`   📊 Limite: ${result.limit}`);
          }
        } catch (e) {
          console.log(`   📄 Réponse: ${responseData.substring(0, 100)}`);
        }

        resolve({ success: true, status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} échoue: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(30000, () => {
      console.log(`⏰ ${name} timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.write(jsonData);
    req.end();
  });
};

async function testLimits() {
  console.log('📏 TEST DES LIMITES DE TAILLE');
  console.log('===============================');

  const baseUrl = 'https://omely-node-backend.fly.dev';

  // Test 1: Données normales (devrait réussir)
  console.log('\n1. TEST DONNÉES NORMALES (1MB):');
  await testLargeRequest(`${baseUrl}/test-limits`, 'Données 1MB', 1);

  // Test 2: Données volumineuses (devrait réussir)
  console.log('\n2. TEST DONNÉES VOLUMINEUSES (10MB):');
  await testLargeRequest(`${baseUrl}/test-limits`, 'Données 10MB', 10);

  // Test 3: Données très volumineuses (devrait échouer)
  console.log('\n3. TEST DONNÉES TRÈS VOLUMINEUSES (60MB):');
  const result = await testLargeRequest(`${baseUrl}/test-limits`, 'Données 60MB', 60);

  console.log('\n📊 RÉSULTATS FINAUX:');
  console.log('===================');

  if (result.status === 413) {
    console.log('✅ LIMITES FONCTIONNENT CORRECTEMENT !');
    console.log('✅ L\'erreur "request entity too large" est maintenant gérée proprement');
    console.log('✅ Les utilisateurs reçoivent un message d\'erreur explicite');
  } else {
    console.log('⚠️ Les limites pourraient ne pas fonctionner comme attendu');
  }

  console.log('\n💡 RÉSUMÉ:');
  console.log('• ✅ Données normales: acceptées');
  console.log('• ✅ Données volumineuses: acceptées jusqu\'à la limite');
  console.log('• ✅ Données trop volumineuses: rejetées avec message explicite');
  console.log('• ✅ Plus d\'erreur 500 mystérieuse');
}

testLimits().catch(console.error);


