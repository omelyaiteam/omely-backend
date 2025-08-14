#!/usr/bin/env python3
"""
Transcription Service with OpenAI Whisper
Support local processing with GPU acceleration
"""

import os
import time
import logging
import asyncio
from typing import Dict, Any, Optional
from pathlib import Path
import whisper
import torch

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        self.model = None
        self.model_name = "base"  # base, small, medium, large
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Configuration des langues supportées
        self.supported_languages = {
            "auto": "auto",
            "fr": "french",
            "en": "english",
            "es": "spanish",
            "de": "german",
            "it": "italian",
            "pt": "portuguese",
            "ru": "russian",
            "ja": "japanese",
            "ko": "korean",
            "zh": "chinese"
        }
        
        self.status = {
            "transcriptions_count": 0,
            "errors_count": 0,
            "last_transcription": None,
            "average_duration": 0,
            "model_loaded": False,
            "device": self.device
        }
        
        # Chargement du modèle au démarrage
        self._load_model()

    def _load_model(self):
        """Charge le modèle Whisper"""
        try:
            logger.info(f"🤖 Chargement du modèle Whisper ({self.model_name}) sur {self.device}...")
            
            # Configuration du modèle selon la mémoire disponible
            if self.device == "cuda":
                # Vérification de la mémoire GPU
                gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3  # GB
                
                if gpu_memory >= 8:
                    self.model_name = "large"
                elif gpu_memory >= 4:
                    self.model_name = "medium"
                elif gpu_memory >= 2:
                    self.model_name = "small"
                else:
                    self.model_name = "base"
                    
                logger.info(f"🎮 GPU détecté: {gpu_memory:.1f}GB - Modèle: {self.model_name}")
            else:
                # CPU - utiliser un modèle plus léger
                self.model_name = "base"
                logger.info("💻 CPU détecté - Modèle: base")
            
            # Chargement du modèle
            self.model = whisper.load_model(self.model_name, device=self.device)
            self.status["model_loaded"] = True
            self.status["model_name"] = self.model_name
            
            logger.info(f"✅ Modèle {self.model_name} chargé avec succès")
            
        except Exception as e:
            logger.error(f"❌ Erreur chargement modèle: {e}")
            self.status["model_loaded"] = False
            raise

    def _validate_audio_file(self, audio_path: str) -> bool:
        """Valide le fichier audio"""
        if not os.path.exists(audio_path):
            return False
        
        # Vérification de la taille (max 2GB)
        file_size = os.path.getsize(audio_path)
        max_size = 2 * 1024 * 1024 * 1024  # 2GB
        
        if file_size > max_size:
            logger.warning(f"Fichier trop volumineux: {file_size / 1024**3:.2f}GB")
            return False
        
        # Vérification de l'extension
        valid_extensions = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.webm']
        file_ext = Path(audio_path).suffix.lower()
        
        if file_ext not in valid_extensions:
            logger.warning(f"Extension non supportée: {file_ext}")
            return False
        
        return True

    def _detect_language(self, audio_path: str) -> str:
        """Détecte automatiquement la langue"""
        try:
            logger.info("🔍 Détection automatique de la langue...")
            result = self.model.detect_language(audio_path)
            detected_lang = result["language"]
            
            # Conversion en nom de langue
            lang_names = {
                "fr": "french", "en": "english", "es": "spanish", "de": "german",
                "it": "italian", "pt": "portuguese", "ru": "russian", "ja": "japanese",
                "ko": "korean", "zh": "chinese"
            }
            
            detected_name = lang_names.get(detected_lang, detected_lang)
            logger.info(f"🌍 Langue détectée: {detected_name} ({detected_lang})")
            
            return detected_lang
            
        except Exception as e:
            logger.warning(f"Erreur détection langue: {e}, utilisation de l'anglais par défaut")
            return "en"

    def _chunk_audio(self, audio_path: str, chunk_duration: int = 1800) -> list:
        """
        Découpe l'audio en chunks pour les longues vidéos
        chunk_duration: durée en secondes (30 minutes par défaut)
        """
        try:
            import librosa
            
            # Chargement de l'audio
            audio, sr = librosa.load(audio_path, sr=None)
            duration = len(audio) / sr
            
            if duration <= chunk_duration:
                return [audio_path]  # Pas besoin de découpage
            
            logger.info(f"✂️ Découpage de l'audio en chunks ({duration:.1f}s total)")
            
            chunks = []
            chunk_samples = int(chunk_duration * sr)
            
            for i in range(0, len(audio), chunk_samples):
                chunk_audio = audio[i:i + chunk_samples]
                chunk_path = f"{audio_path}_chunk_{i//chunk_samples}.wav"
                
                # Sauvegarde du chunk
                librosa.output.write_wav(chunk_path, chunk_audio, sr)
                chunks.append(chunk_path)
            
            logger.info(f"📦 {len(chunks)} chunks créés")
            return chunks
            
        except ImportError:
            logger.warning("librosa non disponible, pas de découpage")
            return [audio_path]
        except Exception as e:
            logger.error(f"Erreur découpage audio: {e}")
            return [audio_path]

    async def transcribe_audio(self, audio_path: str, language: str = "auto") -> Dict[str, Any]:
        """
        Transcrit un fichier audio avec Whisper
        
        Args:
            audio_path: Chemin vers le fichier audio
            language: Langue de transcription ("auto" pour détection automatique)
            
        Returns:
            Dict avec le texte transcrit et les métadonnées
        """
        start_time = time.time()
        
        try:
            # Validation du fichier
            if not self._validate_audio_file(audio_path):
                raise ValueError("Fichier audio invalide")
            
            # Vérification du modèle
            if not self.model:
                raise RuntimeError("Modèle Whisper non chargé")
            
            logger.info(f"🎤 Début transcription: {Path(audio_path).name}")
            
            # Détection de la langue si nécessaire
            if language == "auto":
                detected_lang = self._detect_language(audio_path)
                language = detected_lang
            
            # Découpage en chunks si nécessaire
            chunks = self._chunk_audio(audio_path)
            
            # Transcription des chunks
            transcriptions = []
            for i, chunk_path in enumerate(chunks):
                logger.info(f"📝 Transcription chunk {i+1}/{len(chunks)}...")
                
                # Options de transcription
                options = {
                    "language": language,
                    "task": "transcribe",
                    "fp16": self.device == "cuda",  # Optimisation GPU
                    "verbose": False
                }
                
                # Transcription du chunk
                result = self.model.transcribe(chunk_path, **options)
                transcriptions.append(result["text"])
                
                # Nettoyage du chunk temporaire
                if chunk_path != audio_path and os.path.exists(chunk_path):
                    os.remove(chunk_path)
            
            # Combinaison des transcriptions
            full_transcription = " ".join(transcriptions).strip()
            
            # Mise à jour des statistiques
            self.status["transcriptions_count"] += 1
            self.status["last_transcription"] = time.time()
            
            processing_time = time.time() - start_time
            logger.info(f"✅ Transcription terminée en {processing_time:.2f}s")
            
            return {
                "text": full_transcription,
                "language": language,
                "processing_time": processing_time,
                "chunks_count": len(chunks),
                "model_used": self.model_name
            }
            
        except Exception as e:
            self.status["errors_count"] += 1
            logger.error(f"❌ Erreur transcription: {e}")
            raise

    async def health_check(self) -> Dict[str, Any]:
        """Vérification de l'état du service"""
        try:
            return {
                "status": "healthy" if self.status["model_loaded"] else "unhealthy",
                "model_loaded": self.status["model_loaded"],
                "model_name": self.status.get("model_name", "unknown"),
                "device": self.device,
                "gpu_available": torch.cuda.is_available(),
                "transcriptions_count": self.status["transcriptions_count"]
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

    def get_status(self) -> Dict[str, Any]:
        """Retourne le statut du service"""
        return self.status.copy()

    def get_supported_languages(self) -> Dict[str, str]:
        """Retourne les langues supportées"""
        return self.supported_languages.copy()

    def change_model(self, model_name: str):
        """Change le modèle Whisper"""
        valid_models = ["tiny", "base", "small", "medium", "large"]
        
        if model_name not in valid_models:
            raise ValueError(f"Modèle invalide. Options: {valid_models}")
        
        logger.info(f"🔄 Changement de modèle: {self.model_name} -> {model_name}")
        self.model_name = model_name
        self._load_model()
