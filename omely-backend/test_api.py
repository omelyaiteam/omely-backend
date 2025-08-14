#!/usr/bin/env python3
"""
Test simple de l'API OMELY
"""

import requests
import json

def test_health():
    """Test de l'endpoint /health"""
    try:
        response = requests.get('http://localhost:8080/health')
        print(f"✅ Health check: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_summarize():
    """Test de l'endpoint /summarize avec une vidéo courte"""
    try:
        # Vidéo courte pour le test
        test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        
        print(f"🎬 Test avec: {test_url}")
        
        response = requests.post(
            'http://localhost:8080/summarize',
            json={'video_url': test_url},
            timeout=300  # 5 minutes timeout
        )
        
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Summarisation réussie!")
            print(f"📹 Video ID: {result.get('video_id')}")
            print(f"⏱️ Temps de traitement: {result.get('processing_time')}s")
            print(f"📝 Résumé: {result.get('summary', 'N/A')[:200]}...")
        else:
            print(f"❌ Erreur: {response.text}")
            
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Test de l'API OMELY")
    print("=" * 50)
    
    # Test 1: Health check
    if test_health():
        print("\n" + "=" * 50)
        
        # Test 2: Summarisation (optionnel)
        user_input = input("Voulez-vous tester la summarisation? (y/n): ")
        if user_input.lower() == 'y':
            test_summarize()
    
    print("\n�� Tests terminés!")
