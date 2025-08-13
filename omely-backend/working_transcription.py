import requests
import json
import os
import re

# API Keys Configuration
ASSEMBLYAI_API_KEY = "f0069983d3ec4ffdb8f3535a530e90c2"
OPENAI_API_KEY = "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"

# Set environment variables
os.environ['ASSEMBLYAI_API_KEY'] = ASSEMBLYAI_API_KEY
os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY

def safe_import_yt_dlp():
    """Safely import yt-dlp with error handling"""
    try:
        import importlib
        yt_dlp = importlib.import_module('yt_dlp')
        return yt_dlp, True
    except ImportError:
        return None, False

class WorkingTranscriptionService:
    def __init__(self):
        self.services = {
            'mock': self._transcribe_mock,
            'youtube': self._transcribe_youtube,
            'alternative': self._transcribe_alternative
        }
    
    def transcribe_video(self, video_url, service='youtube'):
        """Transcribe video using specified service"""
        if service in self.services:
            try:
                return self.services[service](video_url)
            except Exception as e:
                print(f"Service {service} failed: {str(e)}")
                if service != 'mock':
                    return self._transcribe_alternative(video_url)
                else:
                    raise e
        else:
            raise Exception(f"Unknown transcription service: {service}")
    
    def _transcribe_mock(self, video_url):
        """Mock transcription for testing"""
        mock_transcriptions = {
            "Vp-TVkqaCrQ": """
            The mindset that changed my life immediately was understanding that success is not about talent or intelligence, but about consistent action and persistence. 
            
            When I first started my journey, I thought I needed to be perfect before taking action. I would spend hours planning and researching, but never actually doing anything. 
            
            Then I realized that the most successful people don't wait for perfect conditions. They start with what they have and improve along the way. They understand that progress, not perfection, is the key to success.
            
            The second mindset shift was embracing failure as feedback. Instead of seeing mistakes as proof that I wasn't good enough, I started seeing them as valuable lessons that would help me improve.
            
            Finally, I learned that consistency beats intensity. It's better to do something small every day than to do something huge once in a while. This is how you build lasting habits and achieve long-term success.
            """,
            "default": """
            This is a sample transcription that demonstrates how Omely can analyze video content to create summaries and quizzes. 
            
            The key points discussed include the importance of mindset, the power of consistent action, and how to overcome common obstacles in personal development.
            
            The speaker emphasizes that success comes from daily habits rather than occasional bursts of motivation, and that failure should be viewed as a learning opportunity rather than a setback.
            """
        }
        
        video_id = video_url.split('v=')[-1] if 'v=' in video_url else 'default'
        return mock_transcriptions.get(video_id, mock_transcriptions['default'])
    
    def _transcribe_youtube(self, video_url):
        """Transcribe YouTube video using yt-dlp + OpenAI"""
        return self._transcribe_alternative(video_url)
    
    def _transcribe_alternative(self, video_url):
        """Main transcription method using yt-dlp + OpenAI"""
        try:
            print(f"🎯 Starting transcription for: {video_url}")
            
            # Extract video ID
            video_id = self._extract_video_id(video_url)
            if not video_id:
                raise Exception("Could not extract video ID from URL")
            
            print(f"📹 Video ID: {video_id}")
            
            # Download audio using yt-dlp
            audio_file = self._download_audio(video_url, video_id)
            if not audio_file:
                raise Exception("Failed to download audio")
            
            print(f"🎵 Audio downloaded: {audio_file}")
            
            # Transcribe with OpenAI
            transcription = self._transcribe_with_openai(audio_file)
            
            # Clean up
            try:
                os.remove(audio_file)
                print("🧹 Audio file cleaned up")
            except:
                pass
            
            if transcription:
                print("✅ Transcription successful!")
                return transcription
            else:
                raise Exception("OpenAI transcription failed")
                
        except Exception as e:
            print(f"❌ Transcription failed: {str(e)}")
            return f"❌ Erreur lors de la transcription: {str(e)}"
    
    def _extract_video_id(self, video_url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, video_url)
            if match:
                return match.group(1)
        return None
    
    def _download_audio(self, video_url, video_id):
        """Download audio using yt-dlp"""
        try:
            yt_dlp_module, yt_dlp_available = safe_import_yt_dlp()
            if not yt_dlp_available:
                raise Exception("yt-dlp not available")
            
            # Simple yt-dlp configuration
            ydl_opts = {
                'format': 'worstaudio/worst',
                'outtmpl': '%(id)s.%(ext)s',
                'quiet': True,
                'no_warnings': True
            }
            
            print("⬇️ Downloading audio...")
            with yt_dlp_module.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            
            # Find downloaded file
            possible_extensions = ['.mp3', '.webm', '.m4a', '.mp4', '.ogg', '.wav']
            for ext in possible_extensions:
                test_filename = f"{video_id}{ext}"
                if os.path.exists(test_filename):
                    return test_filename
            
            raise Exception("No audio file found after download")
            
        except Exception as e:
            print(f"❌ Audio download failed: {str(e)}")
            return None
    
    def _transcribe_with_openai(self, audio_file_path):
        """Transcribe audio file using OpenAI Whisper"""
        try:
            api_url = "https://api.openai.com/v1/audio/transcriptions"
            api_key = os.environ.get('OPENAI_API_KEY', '')
            
            if not api_key:
                raise Exception("OpenAI API key not found")
            
            headers = {
                "Authorization": f"Bearer {api_key}"
            }
            
            print("🤖 Sending to OpenAI Whisper...")
            with open(audio_file_path, "rb") as f:
                files = {"file": f}
                data = {"model": "whisper-1"}
                
                response = requests.post(api_url, headers=headers, files=files, data=data, timeout=60)
            
            if response.status_code == 200:
                transcription = response.json()['text']
                print("✅ OpenAI transcription successful")
                return transcription
            else:
                print(f"❌ OpenAI API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ OpenAI transcription failed: {str(e)}")
            return None

# Test function
def test_working_transcription():
    """Test the working transcription service"""
    service = WorkingTranscriptionService()
    video_url = "https://www.youtube.com/watch?v=Vp-TVkqaCrQ"
    
    print("🧪 Testing Working Transcription Service")
    print("=" * 50)
    
    try:
        result = service.transcribe_video(video_url, service='youtube')
        if result and not result.startswith("❌"):
            print(f"✅ SUCCESS!")
            print(f"📝 Length: {len(result)} characters")
            print(f"📝 Preview: {result[:300]}...")
        else:
            print(f"❌ FAILED: {result}")
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")

if __name__ == "__main__":
    test_working_transcription()
