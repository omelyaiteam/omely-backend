from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from transcription_service import TranscriptionService
from content_analyzer import ContentAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize services
transcription_service = TranscriptionService()
content_analyzer = ContentAnalyzer()

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
        
        # Get video info using YouTube API
        try:
            video_info = get_video_info(video_id)
            title = video_info['snippet']['title']
            
            # Check duration using API
            duration_str = video_info['contentDetails']['duration']
            # Parse ISO 8601 duration (PT1M30S -> 90 seconds)
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
        
        # Get transcription using YouTube API first, then alternative method as fallback
        transcription = transcription_service.transcribe_video(url, service='youtube')
        
        # Analyze content and generate summary and quiz
        analysis = content_analyzer.analyze_content(transcription, title)
        
        return jsonify({
            'success': True,
            'title': title,
            'transcription': transcription,
            'summary': analysis['summary'],
            'key_insights': analysis['key_insights'],
            'video_id': video_id
        })
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'youtube-transcriber-final'})

@app.route('/test-imports', methods=['GET'])
def test_imports():
    """Test if all required imports are available"""
    try:
        import_status = transcription_service.test_imports()
        return jsonify({
            'status': 'success',
            'imports': import_status,
            'youtube_api_key': bool(os.environ.get('YOUTUBE_API_KEY')),
            'huggingface_api_key': bool(os.environ.get('HUGGINGFACE_API_KEY'))
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/test-audio-download', methods=['POST'])
def test_audio_download():
    """Test audio download functionality"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Test the transcription service
        result = transcription_service.transcribe_video(url, service='youtube')
        
        return jsonify({
            'success': True,
            'result': result[:500] + "..." if len(result) > 500 else result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/debug-transcription', methods=['POST'])
def debug_transcription():
    """Debug transcription step by step"""
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Test imports first
        import_status = transcription_service.test_imports()
        
        # Test video ID extraction
        import re
        video_id = None
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                video_id = match.group(1)
                break
        
        return jsonify({
            'success': True,
            'imports': import_status,
            'video_id': video_id,
            'youtube_api_key': bool(os.environ.get('YOUTUBE_API_KEY')),
            'huggingface_api_key': bool(os.environ.get('HUGGINGFACE_API_KEY'))
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting YouTube Transcriber Server (Final)...")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
