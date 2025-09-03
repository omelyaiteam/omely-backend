// SCRIPT DE DIAGNOSTIC RAPIDE FLY.IO
import { execSync } from 'child_process';
import https from 'https';

console.log('🔍 DIAGNOSTIC RAPIDE FLY.IO');
console.log('=============================');

// 1. Vérifier l'état des machines
console.log('\n1. ÉTAT DES MACHINES:');
try {
  const status = execSync('fly status', { encoding: 'utf8' });
  console.log(status);
} catch (error) {
  console.log('❌ Erreur fly status:', error.message);
}

// 2. Lister les machines
console.log('\n2. MACHINES DISPONIBLES:');
try {
  const machines = execSync('fly machine list', { encoding: 'utf8' });
  console.log(machines);
} catch (error) {
  console.log('❌ Erreur fly machine list:', error.message);
}

// 3. Tester l'endpoint health
console.log('\n3. TEST ENDPOINT HEALTH:');
const testEndpoint = (url) => {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
};

await testEndpoint('https://omely-node-backend.fly.dev/health').then(result => {
  if (result.error) {
    console.log('❌ Health check échoue:', result.error);
  } else {
    console.log('✅ Health check réussi:', result.status);
    try {
      const data = JSON.parse(result.data);
      console.log('📊 Données:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('📄 Réponse brute:', result.data);
    }
  }
});

// 4. Tester l'endpoint DeepSeek
console.log('\n4. TEST ENDPOINT DEEPSEEK:');
await testEndpoint('https://omely-node-backend.fly.dev/verify-deepseek').then(result => {
  if (result.error) {
    console.log('❌ DeepSeek endpoint échoue:', result.error);
  } else {
    console.log('✅ DeepSeek endpoint réussi:', result.status);
    try {
      const data = JSON.parse(result.data);
      console.log('🤖 API Key configurée:', data.verification?.config?.hasApiKey ? '✅' : '❌');
      console.log('📊 Status:', data.verification?.status);
    } catch (e) {
      console.log('📄 Réponse brute:', result.data);
    }
  }
});

console.log('\n🎯 DIAGNOSTIC TERMINÉ');

