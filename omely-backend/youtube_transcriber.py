from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import whisper
import os
import tempfile
import re
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Whisper model - using base for better accuracy (Fly.io has no timeout limit)
model = whisper.load_model("base")  # Better accuracy for Fly.io

def extract_video_id(url):
    """Extract YouTube video ID from URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_video_info(video_id):
    """Get video info using YouTube Data API"""
    api_key = os.environ.get('YOUTUBE_API_KEY')
    if not api_key:
        raise Exception("YouTube API key not configured")
    
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        'part': 'snippet,contentDetails',
        'id': video_id,
        'key': api_key
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['items']:
            return data['items'][0]
    
    raise Exception("Failed to get video info from YouTube API")

def download_audio_with_ytdlp(url, output_path):
    """Download audio using yt-dlp as fallback"""
    try:
        import yt_dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': output_path,
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            return info.get('title', 'Unknown Title'), f"{output_path}.mp3"
    except Exception as e:
        raise Exception(f"Failed to download video: {str(e)}")

def transcribe_audio(audio_path):
    """Transcribe audio using Whisper"""
    try:
        result = model.transcribe(audio_path, fp16=False, language='en')
        return result["text"]
    except Exception as e:
        raise Exception(f"Failed to transcribe audio: {str(e)}")

@app.route('/transcribe', methods=['POST'])
def transcribe_youtube():
    """Main endpoint for YouTube transcription"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Extract video ID
        video_id = extract_video_id(url)
        if not video_id:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # Get video info using YouTube API first
        try:
            video_info = get_video_info(video_id)
            title = video_info['snippet']['title']
            
            # Check duration using API
            duration_str = video_info['contentDetails']['duration']
            # Parse ISO 8601 duration (PT1M30S -> 90 seconds)
            import re
            duration_match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
            if duration_match:
                hours = int(duration_match.group(1) or 0)
                minutes = int(duration_match.group(2) or 0)
                seconds = int(duration_match.group(3) or 0)
                duration = hours * 3600 + minutes * 60 + seconds
                
                if duration > 600:  # 10 minutes max
                    return jsonify({'error': 'Video too long (max 10 minutes)'}), 400
        except Exception as e:
            print(f"Warning: Could not get video info: {str(e)}")
            title = "Unknown Title"
        
        # Create temporary directory for files
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = os.path.join(temp_dir, f"video_{video_id}")
            
            # Download audio using yt-dlp (simplified)
            print(f"Downloading audio for video: {video_id}")
            try:
                title, audio_path = download_audio_with_ytdlp(url, output_path)
            except Exception as e:
                # If yt-dlp fails, use the title from API
                if 'title' not in locals():
                    title = "Unknown Title"
                raise e
            
            # Transcribe audio
            print(f"Transcribing audio...")
            transcription = transcribe_audio(audio_path)
            
            return jsonify({
                'success': True,
                'title': title,
                'transcription': transcription,
                'video_id': video_id
            })
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'youtube-transcriber'})

if __name__ == '__main__':
    print("Starting YouTube Transcriber Server...")
    print("Make sure you have ffmpeg installed!")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
