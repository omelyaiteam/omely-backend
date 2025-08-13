import requests
import json
import os

# API Keys Configuration
ASSEMBLYAI_API_KEY = "f0069983d3ec4ffdb8f3535a530e90c2"
os.environ['ASSEMBLYAI_API_KEY'] = ASSEMBLYAI_API_KEY

def test_assemblyai_direct():
    """Test AssemblyAI with direct YouTube URL"""
    try:
        # Test with a simple YouTube URL
        video_url = "https://www.youtube.com/watch?v=Vp-TVkqaCrQ"
        
        api_url = "https://api.assemblyai.com/v2/transcript"
        api_key = os.environ.get('ASSEMBLYAI_API_KEY', '')
        
        if not api_key:
            print("❌ AssemblyAI API key not found")
            return
        
        headers = {
            "authorization": api_key,
            "content-type": "application/json"
        }
        
        data = {
            "audio_url": video_url,
            "language_code": "en",
            "punctuate": True,
            "format_text": True
        }
        
        print("🚀 Testing AssemblyAI with direct YouTube URL...")
        print(f"Video URL: {video_url}")
        
        response = requests.post(api_url, json=data, headers=headers, timeout=30)
        
        print(f"📡 AssemblyAI response status: {response.status_code}")
        print(f"📄 Response content: {response.text}")
        
        if response.status_code in [200, 201]:
            transcript_id = response.json()['id']
            print(f"✅ AssemblyAI Transcript ID: {transcript_id}")
            
            # Poll for completion
            polling_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
            for attempt in range(12):  # Wait up to 2 minutes for testing
                try:
                    polling_response = requests.get(polling_url, headers=headers, timeout=30)
                    print(f"🔄 Polling attempt {attempt + 1}, status: {polling_response.status_code}")
                    
                    if polling_response.status_code == 200:
                        result = polling_response.json()
                        status = result['status']
                        
                        if status == 'completed':
                            transcription = result.get('text', '')
                            if transcription:
                                print("🎉 AssemblyAI transcription successful!")
                                print(f"📝 Transcription length: {len(transcription)} characters")
                                print(f"📝 First 200 chars: {transcription[:200]}...")
                                return transcription
                            else:
                                print("❌ AssemblyAI returned empty transcription")
                                return None
                        elif status == 'error':
                            error_msg = result.get('error', 'Unknown error')
                            print(f"❌ AssemblyAI transcription failed: {error_msg}")
                            return None
                        elif status == 'queued':
                            print("⏳ AssemblyAI: Transcription queued, waiting...")
                        elif status == 'processing':
                            print("⚙️ AssemblyAI: Transcription processing...")
                        else:
                            print(f"❓ AssemblyAI: Unknown status '{status}'")
                    else:
                        print(f"❌ AssemblyAI polling error: {polling_response.status_code}")
                        
                except requests.exceptions.Timeout:
                    print(f"⏰ AssemblyAI polling timeout on attempt {attempt + 1}")
                except Exception as poll_error:
                    print(f"❌ AssemblyAI polling error: {str(poll_error)}")
                
                import time
                time.sleep(10)
            
            print("⏰ AssemblyAI transcription timeout")
            return None
        else:
            error_msg = f"❌ AssemblyAI API error: {response.status_code}"
            try:
                error_detail = response.json()
                if 'error' in error_detail:
                    error_msg += f" - {error_detail['error']}"
            except:
                pass
            print(error_msg)
            return None
            
    except Exception as e:
        print(f"❌ AssemblyAI test failed: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing AssemblyAI Transcription Service")
    print("=" * 50)
    result = test_assemblyai_direct()
    if result:
        print("\n✅ Test successful! AssemblyAI can handle YouTube URLs directly.")
    else:
        print("\n❌ Test failed. Check the error messages above.")
