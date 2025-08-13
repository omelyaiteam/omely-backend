#!/usr/bin/env python3
"""
🎯 OMELY - Système de Summarisation YouTube to MP3 + Whisper + IA
Pipeline complet: YouTube URL → MP3 → Whisper → IA Summary
"""

import os
import re
import json
import tempfile
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import whisper
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Configuration
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "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")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "tAIzaSyBFFIiWNHz6Y_0fNkkxuDT34Is_wBk4Tx8")

class OmelySummarizer:
    def __init__(self):
        self.hf_token = HUGGINGFACE_API_KEY
        self.whisper_model = None
        self.summarizer = None
        
    def load_models(self):
        """Charge les modèles Whisper et Summarizer"""
        try:
            print("🤖 Chargement du modèle Whisper...")
            self.whisper_model = whisper.load_model("base")
            print("✅ Whisper chargé")
            
            print("🧠 Chargement du summarizer...")
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                token=self.hf_token
            )
            print("✅ Summarizer chargé")
            
        except Exception as e:
            print(f"❌ Erreur chargement modèles: {str(e)}")
    
    def extract_video_id(self, video_url):
        """Extrait l'ID de la vidéo YouTube"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, video_url)
            if match:
                return match.group(1)
        return None
    
    def download_audio(self, video_url):
        """Télécharge l'audio YouTube en MP3"""
        try:
            print(f"🎵 Téléchargement audio: {video_url}")
            
            # Configuration yt-dlp
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': '%(id)s.%(ext)s',
                'quiet': True,
                'no_warnings': True
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                video_id = info['id']
                audio_file = f"{video_id}.mp3"
                
                if os.path.exists(audio_file):
                    print(f"✅ Audio téléchargé: {audio_file}")
                    return audio_file, info
                else:
                    raise Exception("Fichier audio non trouvé")
                    
        except Exception as e:
            print(f"❌ Erreur téléchargement: {str(e)}")
            raise
    
    def transcribe_audio(self, audio_file):
        """Transcrit l'audio avec Whisper"""
        try:
            print(f"🎤 Transcription avec Whisper: {audio_file}")
            
            if not self.whisper_model:
                self.load_models()
            
            result = self.whisper_model.transcribe(audio_file)
            transcription = result["text"]
            
            print(f"✅ Transcription: {len(transcription)} caractères")
            return transcription
            
        except Exception as e:
            print(f"❌ Erreur transcription: {str(e)}")
            raise
    
    def create_ai_summary(self, transcription):
        """Créer un résumé avec IA Hugging Face"""
        try:
            print("🧠 Création du résumé IA...")
            
            if not self.summarizer:
                self.load_models()
            
            # Préparer le texte pour le résumé
            if len(transcription) > 1000:
                text_for_summary = transcription[:1000] + "..."
            else:
                text_for_summary = transcription
            
            # Créer le résumé
            summary_result = self.summarizer(
                text_for_summary,
                max_length=200,
                min_length=50,
                do_sample=False
            )
            
            summary = summary_result[0]['summary_text']
            print(f"✅ Résumé IA: {len(summary)} caractères")
            return summary
            
        except Exception as e:
            print(f"❌ Erreur résumé IA: {str(e)}")
            # Fallback: résumé simple
            return self.create_simple_summary(transcription)
    
    def create_simple_summary(self, transcription):
        """Résumé simple de fallback"""
        sentences = transcription.split('.')
        important_sentences = []
        
        for sentence in sentences[:5]:
            sentence = sentence.strip()
            if len(sentence) > 20:
                important_sentences.append(sentence)
        
        if important_sentences:
            summary = '. '.join(important_sentences[:3]) + '.'
        else:
            summary = transcription[:300] + "..." if len(transcription) > 300 else transcription
        
        return summary
    
    def cleanup_files(self, audio_file):
        """Nettoie les fichiers temporaires"""
        try:
            if os.path.exists(audio_file):
                os.remove(audio_file)
                print(f"🗑️ Fichier supprimé: {audio_file}")
        except Exception as e:
            print(f"⚠️ Erreur nettoyage: {str(e)}")
    
    def process_video(self, video_url):
        """Pipeline complet de traitement vidéo"""
        audio_file = None
        
        try:
            print(f"🎬 Traitement de: {video_url}")
            
            # Extraire l'ID vidéo
            video_id = self.extract_video_id(video_url)
            if not video_id:
                raise Exception("Impossible d'extraire l'ID de la vidéo")
            
            print(f"📹 Video ID: {video_id}")
            
            # Télécharger l'audio
            audio_file, video_info = self.download_audio(video_url)
            
            # Transcrire avec Whisper
            transcription = self.transcribe_audio(audio_file)
            
            # Créer le résumé IA
            summary = self.create_ai_summary(transcription)
            
            # Préparer la réponse
            result = {
                "success": True,
                "video_id": video_id,
                "video_title": video_info.get('title', ''),
                "video_duration": video_info.get('duration', 0),
                "transcription": transcription,
                "summary": summary,
                "transcription_length": len(transcription),
                "summary_length": len(summary)
            }
            
            print("✅ Traitement terminé avec succès!")
            return result
            
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
        
        finally:
            # Nettoyer les fichiers
            if audio_file:
                self.cleanup_files(audio_file)

# Instance globale
omely = OmelySummarizer()

@app.route('/')
def home():
    """Page d'accueil"""
    return jsonify({
        "message": "🎯 OMELY - Système de Summarisation YouTube",
        "endpoints": {
            "/summarize": "POST - Summariser une vidéo YouTube",
            "/health": "GET - Vérifier l'état du service"
        }
    })

@app.route('/health')
def health():
    """Vérification de l'état du service"""
    return jsonify({
        "status": "healthy",
        "models_loaded": omely.whisper_model is not None and omely.summarizer is not None
    })

@app.route('/summarize', methods=['POST'])
def summarize_video():
    """Endpoint principal pour summariser une vidéo"""
    try:
        data = request.get_json()
        
        if not data or 'video_url' not in data:
            return jsonify({
                "success": False,
                "error": "URL de vidéo requise"
            }), 400
        
        video_url = data['video_url']
        
        # Valider l'URL YouTube
        if 'youtube.com' not in video_url and 'youtu.be' not in video_url:
            return jsonify({
                "success": False,
                "error": "URL YouTube invalide"
            }), 400
        
        # Traiter la vidéo
        result = omely.process_video(video_url)
        
        if result["success"]:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/load-models', methods=['POST'])
def load_models():
    """Charger les modèles (pour initialisation)"""
    try:
        omely.load_models()
        return jsonify({
            "success": True,
            "message": "Modèles chargés avec succès"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Démarrage d'OMELY...")
    print("📦 Chargement des modèles...")
    omely.load_models()
    
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
