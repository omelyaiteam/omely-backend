from transcription_service import TranscriptionService

def test_final():
    """Test final du service de transcription"""
    
    print("🧪 Test Final du Service de Transcription")
    print("=" * 50)
    
    # Initialiser le service
    service = TranscriptionService()
    
    # URL de test
    video_url = "https://www.youtube.com/watch?v=Vp-TVkqaCrQ"
    
    print(f"🎬 URL de test: {video_url}")
    print()
    
    try:
        # Test de transcription
        print("🔄 Début de la transcription...")
        result = service.transcribe_video(video_url, service='youtube')
        
        if result and not result.startswith("❌"):
            print("✅ SUCCÈS!")
            print(f"📝 Longueur: {len(result)} caractères")
            print(f"📝 Aperçu: {result[:200]}...")
            print()
            print("🎉 Le service de transcription fonctionne correctement!")
        else:
            print(f"❌ ÉCHEC: {result}")
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
    
    print()
    print("🏁 Test terminé!")

if __name__ == "__main__":
    test_final()
