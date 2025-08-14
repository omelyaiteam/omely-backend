from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yt_dlp
import os
import tempfile
import asyncio
from typing import Optional
import openai
from dotenv import load_dotenv
import json
import uuid
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="Omely Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class VideoProcessor:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
    
    async def download_video(self, url: str) -> str:
        """Download video from URL using yt-dlp with anti-detection and fallback strategies"""
        
        # Strategy 1: Try with cookies and enhanced anti-detection
        try:
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(self.temp_dir, '%(id)s.%(ext)s'),
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                # Enhanced anti-detection options
                'nocheckcertificate': True,
                'ignoreerrors': False,
                'no_warnings': False,
                'quiet': False,
                'verbose': True,
                # Enhanced user agent and headers
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0',
                },
                # Enhanced retry options
                'retries': 15,
                'fragment_retries': 15,
                'skip_unavailable_fragments': True,
                # Rate limiting
                'sleep_interval': 2,
                'max_sleep_interval': 10,
                # Cookie handling - try to use cookies if available
                'cookiefile': os.path.join(os.path.dirname(__file__), 'cookies.txt') if os.path.exists(os.path.join(os.path.dirname(__file__), 'cookies.txt')) else None,
                # Additional options for better compatibility
                'extractor_retries': 5,
                'ignore_no_formats_error': True,
                # Age verification bypass
                'age_limit': None,
                # Geo-restriction bypass
                'geo_bypass': True,
                'geo_bypass_country': 'US',
                # Additional extractor options
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android', 'web'],
                        'player_skip': ['webpage', 'configs'],
                    }
                }
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                video_id = info['id']
                audio_path = os.path.join(self.temp_dir, f"{video_id}.mp3")
                
                if os.path.exists(audio_path):
                    return audio_path
                else:
                    raise Exception("Failed to download audio")
                    
        except Exception as e:
            print(f"Strategy 1 failed: {str(e)}")
            
            # Strategy 2: Try with different format and minimal options
            try:
                ydl_opts = {
                    'format': 'worstaudio/worst',
                    'outtmpl': os.path.join(self.temp_dir, '%(id)s.%(ext)s'),
                    'postprocessors': [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '128',
                    }],
                    'nocheckcertificate': True,
                    'ignoreerrors': True,
                    'quiet': True,
                    'no_warnings': True,
                    'http_headers': {
                        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                    },
                    'retries': 5,
                }
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    video_id = info['id']
                    audio_path = os.path.join(self.temp_dir, f"{video_id}.mp3")
                    
                    if os.path.exists(audio_path):
                        return audio_path
                    else:
                        raise Exception("Failed to download audio with strategy 2")
                        
            except Exception as e2:
                print(f"Strategy 2 failed: {str(e2)}")
                
                # Strategy 3: Try with different player clients and age verification bypass
                try:
                    ydl_opts = {
                        'format': 'bestaudio/best',
                        'outtmpl': os.path.join(self.temp_dir, '%(id)s.%(ext)s'),
                        'postprocessors': [{
                            'key': 'FFmpegExtractAudio',
                            'preferredcodec': 'mp3',
                            'preferredquality': '128',
                        }],
                        'nocheckcertificate': True,
                        'ignoreerrors': True,
                        'quiet': True,
                        'no_warnings': True,
                        'http_headers': {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                        },
                        'extractor_args': {
                            'youtube': {
                                'player_client': ['android', 'tv_embedded', 'web'],
                                'player_skip': ['webpage', 'configs'],
                                'age_verify': False,
                            }
                        },
                        'age_limit': None,
                        'geo_bypass': True,
                        'geo_bypass_country': 'US',
                    }
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    video_id = info['id']
                    audio_path = os.path.join(self.temp_dir, f"{video_id}.mp3")
                    
                    if os.path.exists(audio_path):
                        return audio_path
                    else:
                        raise Exception("Failed to download audio with strategy 3")
                        
                except Exception as e3:
                    print(f"Strategy 3 failed: {str(e3)}")
                    
                    # Strategy 4: Try to extract audio URL directly with minimal options
                    try:
                        ydl_opts = {
                            'format': 'bestaudio/best',
                            'nocheckcertificate': True,
                            'ignoreerrors': True,
                            'quiet': True,
                            'no_warnings': True,
                            'extract_flat': False,
                            'http_headers': {
                                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            },
                            'extractor_args': {
                                'youtube': {
                                    'player_client': ['android', 'tv_embedded'],
                                    'age_verify': False,
                                }
                            },
                        }
                
                        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                            info = ydl.extract_info(url, download=False)
                            if 'url' in info:
                                # Download the audio URL directly
                                import requests
                                video_id = info['id']
                                audio_path = os.path.join(self.temp_dir, f"{video_id}.mp3")
                                
                                response = requests.get(info['url'], stream=True)
                                with open(audio_path, 'wb') as f:
                                    for chunk in response.iter_content(chunk_size=8192):
                                        f.write(chunk)
                                
                                if os.path.exists(audio_path):
                                    return audio_path
                            
                            raise Exception("Failed to extract audio URL")
                            
                    except Exception as e4:
                        print(f"Strategy 4 failed: {str(e4)}")
                        raise HTTPException(status_code=400, detail=f"All download strategies failed. This video may require authentication or be restricted. Last error: {str(e4)}")
    
    async def transcribe_audio(self, audio_path: str) -> dict:
        """Transcribe audio using OpenAI Whisper API"""
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = openai.Audio.transcribe(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json"
                )
            return transcript
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")
    
    # Summary generation removed - will be handled by frontend with Gemini
    
    def cleanup_temp_files(self, audio_path: str):
        """Clean up temporary files"""
        try:
            if os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception as e:
            print(f"Cleanup error: {e}")

# Initialize video processor
processor = VideoProcessor()

@app.get("/")
async def root():
    return {"message": "Omely Backend API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/process-video")
async def process_video(
    background_tasks: BackgroundTasks,
    url: str = Form(...)
):
    """
    Process a video URL: download and transcribe only
    Summary will be generated by frontend using Gemini
    """
    task_id = str(uuid.uuid4())
    
    try:
        print(f"[{task_id}] Starting video processing for URL: {url}")
        
        # Download video
        print(f"[{task_id}] Downloading video...")
        audio_path = await processor.download_video(url)
        print(f"[{task_id}] Video downloaded successfully: {audio_path}")
        
        # Transcribe audio
        print(f"[{task_id}] Starting transcription...")
        transcript_result = await processor.transcribe_audio(audio_path)
        print(f"[{task_id}] Transcription completed")
        
        # Extract transcript text
        transcript_text = transcript_result.get('text', '')
        
        # Clean up temporary files
        background_tasks.add_task(processor.cleanup_temp_files, audio_path)
        
        print(f"[{task_id}] Processing completed successfully")
        
        return {
            "task_id": task_id,
            "status": "completed",
            "transcript": transcript_text,
            "segments": transcript_result.get('segments', []),
            "language": transcript_result.get('language', 'unknown'),
            "duration": transcript_result.get('duration', 0)
        }
        
    except Exception as e:
        print(f"[{task_id}] Error during processing: {str(e)}")
        import traceback
        print(f"[{task_id}] Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/upload-video")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Process an uploaded video file
    Summary will be generated by frontend using Gemini
    """
    try:
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Save uploaded file temporarily
        temp_path = os.path.join(processor.temp_dir, f"{task_id}_{file.filename}")
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Transcribe audio
        transcript_result = await processor.transcribe_audio(temp_path)
        
        # Extract transcript text
        transcript_text = transcript_result.get('text', '')
        
        # Clean up temporary files
        background_tasks.add_task(processor.cleanup_temp_files, temp_path)
        
        return {
            "task_id": task_id,
            "status": "completed",
            "transcript": transcript_text,
            "segments": transcript_result.get('segments', []),
            "language": transcript_result.get('language', 'unknown'),
            "duration": transcript_result.get('duration', 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transcript/{task_id}")
async def get_transcript(task_id: str):
    """
    Get transcript by task ID (placeholder for future implementation with database)
    """
    return {"message": "Transcript retrieval not implemented yet", "task_id": task_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
