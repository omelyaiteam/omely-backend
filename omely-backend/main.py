#!/usr/bin/env python3
"""
🎯 OMELY - Système de Transcription YouTube (Production Ready)
FastAPI server with anti-detection features and comprehensive error handling
"""

import os
import time
import logging
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import uvicorn

from services.youtube_extractor import YouTubeExtractor
from services.transcription import TranscriptionService
from services.proxy_manager import ProxyManager
from utils.temp_cleanup import TempCleanup

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialisation de l'application FastAPI
app = FastAPI(
    title="OMELY YouTube Transcription API",
    description="API de transcription YouTube avec anti-détection",
    version="2.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles Pydantic
class TranscriptionRequest(BaseModel):
    youtube_url: HttpUrl
    language: Optional[str] = "auto"
    max_duration: Optional[int] = 7200  # 2 heures max

class TranscriptionResponse(BaseModel):
    status: str
    transcription: Optional[str] = None
    duration: Optional[int] = None
    title: Optional[str] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

# Initialisation des services
youtube_extractor = YouTubeExtractor()
transcription_service = TranscriptionService()
proxy_manager = ProxyManager()
temp_cleanup = TempCleanup()

@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage"""
    logger.info("🚀 Démarrage d'OMELY Transcription API...")
    try:
        # Test des services
        await youtube_extractor.health_check()
        await transcription_service.health_check()
        logger.info("✅ Tous les services sont opérationnels")
    except Exception as e:
        logger.error(f"❌ Erreur d'initialisation: {e}")

@app.get("/")
async def root():
    """Page d'accueil"""
    return {
        "message": "🎯 OMELY YouTube Transcription API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "/extract-transcribe": "POST - Extraire et transcrire une vidéo YouTube",
            "/health": "GET - Vérifier l'état des services",
            "/status": "GET - Statut détaillé du système"
        }
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état des services"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "services": {
                "youtube_extractor": await youtube_extractor.health_check(),
                "transcription_service": await transcription_service.health_check(),
                "proxy_manager": await proxy_manager.health_check()
            }
        }
        return health_status
    except Exception as e:
        logger.error(f"Erreur health check: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def system_status():
    """Statut détaillé du système"""
    try:
        return {
            "system": {
                "uptime": time.time(),
                "memory_usage": "N/A",  # À implémenter si nécessaire
                "temp_files_count": temp_cleanup.get_temp_files_count()
            },
            "services": {
                "youtube_extractor": youtube_extractor.get_status(),
                "transcription_service": transcription_service.get_status(),
                "proxy_manager": proxy_manager.get_status()
            }
        }
    except Exception as e:
        logger.error(f"Erreur status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-transcribe", response_model=TranscriptionResponse)
async def extract_and_transcribe(
    request: TranscriptionRequest,
    background_tasks: BackgroundTasks
):
    """
    Endpoint principal pour extraire et transcrire une vidéo YouTube
    """
    start_time = time.time()
    temp_files = []
    
    try:
        logger.info(f"🎬 Début de traitement pour: {request.youtube_url}")
        
        # Étape 1: Extraction audio
        logger.info("📥 Étape 1: Extraction audio...")
        audio_file, video_info = await youtube_extractor.extract_audio(
            str(request.youtube_url),
            max_duration=request.max_duration
        )
        temp_files.append(audio_file)
        
        # Étape 2: Transcription
        logger.info("🎤 Étape 2: Transcription...")
        transcription_result = await transcription_service.transcribe_audio(
            audio_file,
            language=request.language
        )
        
        # Étape 3: Nettoyage en arrière-plan
        background_tasks.add_task(temp_cleanup.cleanup_files, temp_files)
        
        processing_time = time.time() - start_time
        
        return TranscriptionResponse(
            status="success",
            transcription=transcription_result["text"],
            duration=video_info.get("duration"),
            title=video_info.get("title"),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"❌ Erreur de traitement: {e}")
        
        # Nettoyage en cas d'erreur
        if temp_files:
            background_tasks.add_task(temp_cleanup.cleanup_files, temp_files)
        
        return TranscriptionResponse(
            status="error",
            error=str(e),
            processing_time=time.time() - start_time
        )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Gestionnaire global d'exceptions"""
    logger.error(f"Exception globale: {exc}")
    return {
        "status": "error",
        "error": "Erreur interne du serveur",
        "detail": str(exc) if os.getenv("DEBUG", "false").lower() == "true" else None
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f"🌐 Démarrage du serveur sur {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
