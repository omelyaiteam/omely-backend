from transcription_service import TranscriptionService
import time

def test_simple_transcription():
    """Test the transcription service with a simple approach"""
    
    # Initialize the service
    service = TranscriptionService()
    
    # Test video URL
    video_url = "https://www.youtube.com/watch?v=Vp-TVkqaCrQ"
    
    print("🧪 Testing Simple Transcription")
    print("=" * 50)
    print(f"Video URL: {video_url}")
    print()
    
    # Test the alternative method directly
    print("🔄 Testing alternative transcription method...")
    try:
        result = service._transcribe_with_alternative_method(video_url)
        if result and not result.startswith("❌"):
            print(f"✅ Transcription successful!")
            print(f"📝 Result length: {len(result)} characters")
            print(f"📝 Preview: {result[:300]}...")
        else:
            print(f"❌ Transcription failed: {result}")
    except Exception as e:
        print(f"❌ Transcription failed with exception: {str(e)}")

if __name__ == "__main__":
    test_simple_transcription()
