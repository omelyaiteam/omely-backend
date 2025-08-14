#!/usr/bin/env python3
"""
YouTube Audio Extractor Service
Utilise yt-dlp avec techniques anti-détection avancées
"""

import os
import re
import time
import random
import logging
import asyncio
from typing import Dict, Any, Tuple, Optional
from pathlib import Path
import yt_dlp

logger = logging.getLogger(__name__)

class YouTubeExtractor:
    def __init__(self):
        self.temp_dir = Path("/tmp/omely_audio")
        self.temp_dir.mkdir(exist_ok=True)
        
        # User agents rotation pour éviter la détection
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        
        # Configuration yt-dlp avec anti-détection
        self.base_options = {
            'format': 'bestaudio/best',
            'outtmpl': str(self.temp_dir / '%(title)s.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
            'extractaudio': True,
            'audioformat': 'mp3',
            'audioquality': '192K',
            'extractor_retries': 3,
            'fragment_retries': 3,
            'retries': 3,
            'file_access_retries': 3,
            'http_headers': {
                'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        }
        
        self.status = {
            "extractions_count": 0,
            "errors_count": 0,
            "last_extraction": None,
            "average_duration": 0
        }

    def _get_random_user_agent(self) -> str:
        """Retourne un user agent aléatoire"""
        return random.choice(self.user_agents)

    def _validate_youtube_url(self, url: str) -> bool:
        """Valide l'URL YouTube"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            if re.search(pattern, url):
                return True
        return False

    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extrait l'ID de la vidéo YouTube"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def _get_ydlp_options(self, max_duration: int = 7200) -> Dict[str, Any]:
        """Génère les options yt-dlp avec anti-détection"""
        options = self.base_options.copy()
        
        # User agent aléatoire
        options['user_agent'] = self._get_random_user_agent()
        
        # Cookies depuis le navigateur (si disponible)
        try:
            options['cookies_from_browser'] = ('chrome',)
        except:
            pass  # Ignore si pas de cookies disponibles
        
        # Limite de durée
        if max_duration:
            options['max_duration'] = max_duration
        
        # Options anti-détection supplémentaires
        options.update({
            'nocheckcertificate': True,
            'ignoreerrors': False,
            'no_color': True,
            'prefer_ffmpeg': True,
            'geo_bypass': True,
            'geo_bypass_country': 'US',
            'geo_bypass_ip_block': '1.0.0.1',
        })
        
        return options

    async def extract_audio(self, url: str, max_duration: int = 7200) -> Tuple[str, Dict[str, Any]]:
        """
        Extrait l'audio d'une vidéo YouTube avec anti-détection
        
        Args:
            url: URL de la vidéo YouTube
            max_duration: Durée maximale en secondes
            
        Returns:
            Tuple (chemin_fichier_audio, info_vidéo)
        """
        start_time = time.time()
        
        try:
            # Validation de l'URL
            if not self._validate_youtube_url(url):
                raise ValueError("URL YouTube invalide")
            
            video_id = self._extract_video_id(url)
            if not video_id:
                raise ValueError("Impossible d'extraire l'ID de la vidéo")
            
            logger.info(f"🎬 Extraction audio pour video ID: {video_id}")
            
            # Configuration yt-dlp
            options = self._get_ydlp_options(max_duration)
            
            # Extraction avec retry
            for attempt in range(3):
                try:
                    with yt_dlp.YoutubeDL(options) as ydl:
                        # Récupération des infos
                        info = ydl.extract_info(url, download=False)
                        
                        # Vérification de la durée
                        duration = info.get('duration', 0)
                        if duration > max_duration:
                            raise ValueError(f"Vidéo trop longue: {duration}s > {max_duration}s")
                        
                        # Téléchargement
                        logger.info(f"📥 Téléchargement audio... (tentative {attempt + 1})")
                        ydl.download([url])
                        
                        # Recherche du fichier téléchargé
                        audio_file = self._find_downloaded_file(info.get('title', 'video'))
                        
                        if audio_file and audio_file.exists():
                            # Mise à jour des statistiques
                            self.status["extractions_count"] += 1
                            self.status["last_extraction"] = time.time()
                            
                            processing_time = time.time() - start_time
                            logger.info(f"✅ Extraction réussie en {processing_time:.2f}s")
                            
                            return str(audio_file), {
                                'title': info.get('title', 'Unknown'),
                                'duration': duration,
                                'uploader': info.get('uploader', 'Unknown'),
                                'view_count': info.get('view_count', 0),
                                'upload_date': info.get('upload_date', ''),
                                'description': info.get('description', '')[:200] + '...' if info.get('description') else ''
                            }
                        else:
                            raise FileNotFoundError("Fichier audio non trouvé après téléchargement")
                            
                except Exception as e:
                    logger.warning(f"Tentative {attempt + 1} échouée: {e}")
                    if attempt == 2:  # Dernière tentative
                        raise
                    
                    # Attente avant retry
                    await asyncio.sleep(random.uniform(1, 3))
                    
        except Exception as e:
            self.status["errors_count"] += 1
            logger.error(f"❌ Erreur d'extraction: {e}")
            raise

    def _find_downloaded_file(self, title: str) -> Optional[Path]:
        """Trouve le fichier audio téléchargé"""
        # Nettoyage du titre pour le nom de fichier
        safe_title = re.sub(r'[^\w\s-]', '', title).strip()
        safe_title = re.sub(r'[-\s]+', '-', safe_title)
        
        # Recherche par patterns
        patterns = [
            f"{safe_title}.mp3",
            f"{safe_title}.m4a",
            f"{safe_title}.webm",
            f"{safe_title}.*.mp3",
            f"{safe_title}.*.m4a"
        ]
        
        for pattern in patterns:
            for file_path in self.temp_dir.glob(pattern):
                if file_path.exists():
                    return file_path
        
        # Recherche par extension audio
        for file_path in self.temp_dir.glob("*.mp3"):
            if file_path.exists():
                return file_path
        
        return None

    async def health_check(self) -> Dict[str, Any]:
        """Vérification de l'état du service"""
        try:
            # Test d'import yt-dlp
            import yt_dlp
            
            return {
                "status": "healthy",
                "yt_dlp_version": yt_dlp.version.__version__,
                "temp_dir": str(self.temp_dir),
                "temp_dir_exists": self.temp_dir.exists(),
                "extractions_count": self.status["extractions_count"]
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

    def get_status(self) -> Dict[str, Any]:
        """Retourne le statut du service"""
        return self.status.copy()

    def cleanup_temp_files(self):
        """Nettoie les fichiers temporaires"""
        try:
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_path.unlink()
            logger.info("🧹 Fichiers temporaires nettoyés")
        except Exception as e:
            logger.error(f"Erreur nettoyage: {e}")
