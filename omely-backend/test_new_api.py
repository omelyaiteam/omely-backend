#!/usr/bin/env python3
"""
Test script for the new OMELY Transcription API
"""

import asyncio
import httpx
import json
import time

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll pour test

async def test_health_check():
    """Test du health check"""
    print("🏥 Test du health check...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/health")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Erreur health check: {e}")
            return False

async def test_status():
    """Test du status"""
    print("\n📊 Test du status...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/status")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Erreur status: {e}")
            return False

async def test_transcription():
    """Test de transcription"""
    print(f"\n🎬 Test de transcription pour: {TEST_VIDEO_URL}")
    
    payload = {
        "youtube_url": TEST_VIDEO_URL,
        "language": "auto",
        "max_duration": 300  # 5 minutes max pour le test
    }
    
    async with httpx.AsyncClient(timeout=300.0) as client:  # 5 minutes timeout
        try:
            start_time = time.time()
            response = await client.post(
                f"{API_BASE_URL}/extract-transcribe",
                json=payload
            )
            processing_time = time.time() - start_time
            
            print(f"Status: {response.status_code}")
            print(f"Temps de traitement: {processing_time:.2f}s")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Succès!")
                print(f"Titre: {result.get('title', 'N/A')}")
                print(f"Durée: {result.get('duration', 'N/A')}s")
                print(f"Transcription: {result.get('transcription', 'N/A')[:200]}...")
                return True
            else:
                print(f"❌ Erreur: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur transcription: {e}")
            return False

async def main():
    """Fonction principale de test"""
    print("🧪 Tests de l'API OMELY Transcription")
    print("=" * 50)
    
    # Test 1: Health check
    health_ok = await test_health_check()
    
    # Test 2: Status
    status_ok = await test_status()
    
    # Test 3: Transcription (seulement si les autres tests passent)
    transcription_ok = False
    if health_ok and status_ok:
        transcription_ok = await test_transcription()
    
    # Résumé
    print("\n" + "=" * 50)
    print("📋 Résumé des tests:")
    print(f"Health Check: {'✅' if health_ok else '❌'}")
    print(f"Status: {'✅' if status_ok else '❌'}")
    print(f"Transcription: {'✅' if transcription_ok else '❌'}")
    
    if all([health_ok, status_ok, transcription_ok]):
        print("\n🎉 Tous les tests sont passés!")
    else:
        print("\n⚠️ Certains tests ont échoué.")

if __name__ == "__main__":
    asyncio.run(main())
