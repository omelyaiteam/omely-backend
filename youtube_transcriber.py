from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import whisper
import os
import tempfile
import re
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Whisper model
model = whisper.load_model("base")  # You can use "small", "medium", "large" for better quality

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

def download_audio(url, output_path):
    """Download audio from YouTube video"""
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            return info.get('title', 'Unknown Title'), f"{output_path}.mp3"
    except Exception as e:
        raise Exception(f"Failed to download video: {str(e)}")

def transcribe_audio(audio_path):
    """Transcribe audio using Whisper"""
    try:
        result = model.transcribe(audio_path)
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
        
        # Create temporary directory for files
        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = os.path.join(temp_dir, f"video_{video_id}")
            
            # Download audio
            print(f"Downloading audio for video: {video_id}")
            title, audio_path = download_audio(url, output_path)
            
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
