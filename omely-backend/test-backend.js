#!/usr/bin/env node

// Test script pour OMELY Backend Ultra-Rapide v5.0
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Test du Backend OMELY Ultra-Rapide v5.0\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Test Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    console.log('   Version:', healthData.version);
    console.log('   Proxy:', healthData.services.proxy);
    console.log('');

    // Test 2: Test route
    console.log('2️⃣ Test Route...');
    const testResponse = await fetch(`${BASE_URL}/test`);
    const testData = await testResponse.json();
    console.log('✅ Test:', testData.message);
    console.log('   Proxy:', testData.proxy);
    console.log('');

    // Test 3: YouTube summarization (simulation)
    console.log('3️⃣ Test YouTube Summarization...');
    const youtubeResponse = await fetch(`${BASE_URL}/summarize/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
    });
    
    if (youtubeResponse.ok) {
      const youtubeData = await youtubeResponse.json();
      if (youtubeData.status === 'success') {
        console.log('✅ YouTube Summarization: Succès !');
        console.log('   Temps total:', youtubeData.metadata.totalProcessingTime, 'ms');
        console.log('   Téléchargement:', youtubeData.metadata.downloadTime, 'ms');
        console.log('   Transcription:', youtubeData.metadata.transcriptionTime, 'ms');
        console.log('   Résumé:', youtubeData.metadata.summarizationTime, 'ms');
      } else {
        console.log('⚠️ YouTube Summarization: Erreur:', youtubeData.message);
      }
    } else {
      console.log('❌ YouTube Summarization: Erreur HTTP', youtubeResponse.status);
    }

  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Le backend n\'est pas démarré. Lancez-le avec:');
      console.log('   npm run dev');
    }
  }
}

// Test avec une vraie URL YouTube si fournie en argument
async function testRealYouTube(url) {
  if (!url) return;
  
  console.log(`\n🎬 Test avec une vraie URL YouTube: ${url}`);
  
  try {
    const response = await fetch(`${BASE_URL}/summarize/youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        console.log('✅ Résumé généré avec succès !');
        console.log('📝 Résumé:', data.summary.substring(0, 200) + '...');
        console.log('⏱️ Temps total:', data.metadata.totalProcessingTime, 'ms');
      } else {
        console.log('❌ Erreur:', data.message);
      }
    } else {
      console.log('❌ Erreur HTTP:', response.status);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer les tests
const args = process.argv.slice(2);
const youtubeUrl = args[0];

testBackend().then(() => {
  if (youtubeUrl) {
    return testRealYouTube(youtubeUrl);
  }
}).catch(console.error);
