import fetch from 'node-fetch';

async function testServer() {
  try {
    console.log('🧪 Testing server endpoints...');

    // Test health endpoint
    console.log('📡 Testing /health...');
    const healthResponse = await fetch('http://127.0.0.1:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health response:', healthData);

    // Test YouTube endpoint
    console.log('📺 Testing /summarize/youtube...');
    const youtubeResponse = await fetch('http://127.0.0.1:3000/summarize/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://youtu.be/dQw4w9WgXcQ' })
    });
    const youtubeData = await youtubeResponse.json();
    console.log('✅ YouTube response:', youtubeData);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServer();












