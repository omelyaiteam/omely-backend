import requests
import json
import os

# API Keys Configuration
ASSEMBLYAI_API_KEY = "f0069983d3ec4ffdb8f3535a530e90c2"
OPENAI_API_KEY = "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"

print("🧪 Test Simple des API Keys")
print("=" * 40)

# Test 1: Vérifier AssemblyAI
print("1️⃣ Test AssemblyAI API...")
try:
    api_url = "https://api.assemblyai.com/v2/transcript"
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json"
    }
    
    # Test simple avec une URL YouTube
    data = {
        "audio_url": "https://www.youtube.com/watch?v=Vp-TVkqaCrQ",
        "language_code": "en"
    }
    
    response = requests.post(api_url, json=data, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        print(f"   ✅ AssemblyAI fonctionne!")
        print(f"   Transcript ID: {result.get('id', 'N/A')}")
        print(f"   Status: {result.get('status', 'N/A')}")
    else:
        print(f"   ❌ Erreur AssemblyAI: {response.text[:100]}")
        
except Exception as e:
    print(f"   ❌ Exception AssemblyAI: {str(e)}")

print()

# Test 2: Vérifier OpenAI
print("2️⃣ Test OpenAI API...")
try:
    api_url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    
    response = requests.get(api_url, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        models = response.json()
        whisper_available = any('whisper' in model['id'].lower() for model in models['data'])
        print(f"   ✅ OpenAI fonctionne!")
        print(f"   Whisper disponible: {whisper_available}")
    else:
        print(f"   ❌ Erreur OpenAI: {response.text[:100]}")
        
except Exception as e:
    print(f"   ❌ Exception OpenAI: {str(e)}")

print()
print("✅ Test terminé!")
