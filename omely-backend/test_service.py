from transcription_service import TranscriptionService

def test_transcription_service():
    """Test the transcription service with different methods"""
    
    # Initialize the service
    service = TranscriptionService()
    
    # Test video URL
    video_url = "https://www.youtube.com/watch?v=Vp-TVkqaCrQ"
    
    print("🧪 Testing Transcription Service")
    print("=" * 50)
    print(f"Video URL: {video_url}")
    print()
    
    # Test different services
    services_to_test = ['mock', 'youtube', 'alternative']
    
    for service_name in services_to_test:
        print(f"🔄 Testing {service_name} service...")
        try:
            result = service.transcribe_video(video_url, service=service_name)
            if result and not result.startswith("❌"):
                print(f"✅ {service_name} service succeeded!")
                print(f"📝 Result length: {len(result)} characters")
                print(f"📝 Preview: {result[:200]}...")
            else:
                print(f"❌ {service_name} service failed: {result}")
        except Exception as e:
            print(f"❌ {service_name} service failed with exception: {str(e)}")
        print("-" * 30)
        print()

if __name__ == "__main__":
    test_transcription_service()
