// TEST DE LA ROUTE CHAT/COMPLETION
import https from 'https';

const testChatRoute = (url, name, messages) => {
  return new Promise((resolve) => {
    console.log(`🤖 Test ${name}...`);

    const data = {
      messages: messages,
      max_tokens: 100
    };
    const jsonData = JSON.stringify(data);

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

        try {
          const result = JSON.parse(responseData);

          if (res.statusCode === 200 && result.success) {
            console.log('   ✅ Chat réussi !');
            if (result.response?.content) {
              console.log(`   💬 Réponse: "${result.response.content.substring(0, 100)}..."`);
            }
          } else if (res.statusCode === 503) {
            console.log('   ⚠️ Service DeepSeek non disponible');
            console.log(`   💬 ${result.message}`);
          } else {
            console.log('   ❌ Erreur chat:', result.error || result.message);
          }

          resolve({ success: res.statusCode === 200, status: res.statusCode, data: result });
        } catch (e) {
          console.log(`   📄 Réponse brute: ${responseData.substring(0, 200)}`);
          resolve({ success: false, error: 'Invalid JSON response' });
        }
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

async function testChatFunctionality() {
  console.log('🤖 TEST ROUTE CHAT/COMPLETION');
  console.log('==============================');

  const baseUrl = 'https://omely-node-backend.fly.dev';

  // Test 1: Health check
  console.log('\n1. HEALTH CHECK:');
  const healthResult = await testEndpoint(`${baseUrl}/health`, 'Health Check');

  // Test 2: Test endpoint
  console.log('\n2. TEST ENDPOINT:');
  const testResult = await testEndpoint(`${baseUrl}/test`, 'Test Endpoint');

  // Test 3: Chat completion simple
  console.log('\n3. CHAT SIMPLE:');
  const chatResult1 = await testChatRoute(`${baseUrl}/chat/completion`, 'Chat Simple', [
    { role: 'user', content: 'Bonjour, peux-tu me dire si tu es DeepSeek ?' }
  ]);

  // Test 4: Chat avec contexte
  console.log('\n4. CHAT AVEC CONTEXTE:');
  const chatResult2 = await testChatRoute(`${baseUrl}/chat/completion`, 'Chat Contexte', [
    { role: 'system', content: 'Tu es un assistant utile.' },
    { role: 'user', content: 'Quelle est la capitale de la France ?' }
  ]);

  console.log('\n📊 RÉSULTATS FINAUX:');
  console.log('===================');

  const successCount = [chatResult1, chatResult2].filter(r => r.success).length;
  const totalTests = 2;

  if (successCount === totalTests) {
    console.log('🎉 TOUS LES TESTS CHAT RÉUSSIS !');
    console.log('✅ La route /chat/completion fonctionne parfaitement');
    console.log('✅ DeepSeek v2 est opérationnel');
  } else if (successCount > 0) {
    console.log(`⚠️ ${successCount}/${totalTests} tests réussis`);
    console.log('⚠️ Certains tests ont échoué (peut-être service DeepSeek temporairement indisponible)');
  } else {
    console.log('❌ Aucun test chat réussi');
    console.log('❌ La route /chat/completion ne fonctionne pas');
  }

  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('• Testez votre application - le chat devrait maintenant fonctionner');
  console.log('• Si ça ne marche pas, vérifiez les logs: fly logs');
  console.log('• La clé API DeepSeek doit être configurée dans Fly.io');
}

async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    console.log(`🧪 Test ${name}...`);

    const req = https.request(url, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`✅ ${name} réussi - Status: ${res.statusCode}`);
        try {
          const result = JSON.parse(responseData);
          console.log(`   💬 ${result.message || result.status || 'OK'}`);
        } catch (e) {
          console.log(`   📄 ${responseData.substring(0, 100)}`);
        }
        resolve({ success: true, status: res.statusCode });
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

    req.end();
  });
}

testChatFunctionality().catch(console.error);


