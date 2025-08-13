#!/usr/bin/env python3
"""
🧪 Test du système OMELY
Vérifie que tous les composants fonctionnent correctement
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8080"  # Changez pour l'URL de production

def test_health():
    """Test de l'endpoint health"""
    print("🏥 Test de l'endpoint /health...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health OK - Status: {data.get('status')}")
            print(f"📦 Modèles chargés: {data.get('models_loaded')}")
            return True
        else:
            print(f"❌ Health échec - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur health: {str(e)}")
        return False

def test_home():
    """Test de l'endpoint home"""
    print("\n🏠 Test de l'endpoint /...")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Home OK - Message: {data.get('message')}")
            print(f"🔗 Endpoints disponibles: {list(data.get('endpoints', {}).keys())}")
            return True
        else:
            print(f"❌ Home échec - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur home: {str(e)}")
        return False

def test_summarize():
    """Test de l'endpoint summarize"""
    print("\n🎬 Test de l'endpoint /summarize...")
    
    # URL de test (vidéo courte)
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    payload = {
        "video_url": test_url
    }
    
    try:
        print(f"📹 Test avec: {test_url}")
        print("⏳ Traitement en cours... (peut prendre 2-5 minutes)")
        
        response = requests.post(
            f"{BASE_URL}/summarize",
            json=payload,
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Summarize réussi!")
                print(f"📹 Video ID: {data.get('video_id')}")
                print(f"📺 Titre: {data.get('video_title')}")
                print(f"⏱️ Durée: {data.get('video_duration')}s")
                print(f"📝 Transcription: {data.get('transcription_length')} caractères")
                print(f"📄 Résumé: {data.get('summary_length')} caractères")
                print(f"📄 Résumé: {data.get('summary')[:200]}...")
                return True
            else:
                print(f"❌ Summarize échec: {data.get('error')}")
                return False
        else:
            print(f"❌ Summarize échec - Status: {response.status_code}")
            print(f"📄 Réponse: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Timeout - Le traitement prend trop de temps")
        return False
    except Exception as e:
        print(f"❌ Erreur summarize: {str(e)}")
        return False

def test_load_models():
    """Test du chargement des modèles"""
    print("\n🤖 Test du chargement des modèles...")
    
    try:
        response = requests.post(f"{BASE_URL}/load-models", timeout=60)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Modèles chargés avec succès!")
                return True
            else:
                print(f"❌ Échec chargement: {data.get('error')}")
                return False
        else:
            print(f"❌ Échec chargement - Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur chargement: {str(e)}")
        return False

def main():
    """Test principal"""
    print("🧪 TESTS OMELY - Système de Summarisation")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Home Page", test_home),
        ("Load Models", test_load_models),
        ("Summarize Video", test_summarize)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}")
        print("-" * 30)
        
        try:
            success = test_func()
            results.append((test_name, success))
            
            if not success:
                print(f"⚠️ {test_name} a échoué")
            
        except Exception as e:
            print(f"❌ Erreur dans {test_name}: {str(e)}")
            results.append((test_name, False))
    
    # Résumé des tests
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("🎉 Tous les tests sont passés! Le système fonctionne parfaitement.")
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez la configuration.")

if __name__ == "__main__":
    main()
