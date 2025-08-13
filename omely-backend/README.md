# 🎯 OMELY.AI - YouTube Transcription Backend

Backend Flask pour la transcription automatique de vidéos YouTube avec Whisper AI.

## 🚀 Déploiement Railway

Ce backend est configuré pour être déployé automatiquement sur Railway.

### Endpoints

- `POST /transcribe` - Transcription YouTube
- `GET /health` - Health check

### Variables d'environnement

Aucune variable d'environnement requise pour le moment.

## 🛠️ Technologies

- Flask
- Whisper AI
- yt-dlp
- ffmpeg (installé automatiquement par Railway)

## 📝 Usage

```bash
curl -X POST https://VOTRE-URL-RAILWAY/transcribe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

## 🚀 Déploiement

1. Créez un repository GitHub avec ces fichiers
2. Connectez-le à Railway
3. Railway déploiera automatiquement le backend
4. Copiez l'URL Railway et mettez-la dans le frontend
