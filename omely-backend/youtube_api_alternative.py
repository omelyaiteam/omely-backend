# Alternative using YouTube Data API v3
# This requires a YouTube API key but is more reliable

import requests
import json

def get_video_info_with_api(video_id, api_key):
    """Get video info using YouTube Data API"""
    url = f"https://www.googleapis.com/youtube/v3/videos"
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
    return None

# Note: This requires a YouTube API key
# You can get one at: https://console.cloud.google.com/apis/credentials
