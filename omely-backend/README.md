<<<<<<< HEAD
# 🎯 OMELY - Système de Summarisation YouTube

Pipeline complet de traitement vidéo : **YouTube URL → MP3 → Whisper → IA Summary**

## 🚀 Fonctionnalités

- **YouTube to MP3** : Téléchargement automatique de l'audio
- **Whisper Transcription** : Transcription précise avec OpenAI Whisper
- **IA Summarisation** : Résumé intelligent avec Hugging Face BART
- **API REST** : Interface simple et efficace
- **Déploiement Fly.io** : Infrastructure cloud optimisée

## 🛠️ Technologies

- **Backend** : Flask + Python 3.11
- **Audio** : yt-dlp + FFmpeg
- **Transcription** : OpenAI Whisper
- **IA** : Hugging Face Transformers (BART-large-CNN)
- **Déploiement** : Fly.io + Docker

## 📦 Installation

### Prérequis
- Python 3.11+
- FFmpeg
- Git

### Installation locale
```bash
# Cloner le projet
git clone <repository>
cd omely-backend

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'application
python app.py
```

### Déploiement Fly.io
```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Se connecter
fly auth login

# Déployer
fly deploy
```

## 🔌 API Endpoints

### POST /summarize
Summariser une vidéo YouTube

**Request:**
```json
{
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response:**
```json
{
  "success": true,
  "video_id": "dQw4w9WgXcQ",
  "video_title": "Rick Astley - Never Gonna Give You Up",
  "video_duration": 212,
  "transcription": "Never gonna give you up...",
  "summary": "Rick Astley performs his hit song...",
  "transcription_length": 1500,
  "summary_length": 200
}
```

### GET /health
Vérifier l'état du service

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### GET /
Page d'accueil avec documentation

## 🎯 Utilisation

### Exemple avec cURL
```bash
curl -X POST http://localhost:8080/summarize \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### Exemple avec JavaScript
```javascript
const response = await fetch('https://omely-backend.fly.dev/summarize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  })
});

const result = await response.json();
console.log(result.summary);
```

## 🔧 Configuration

### Variables d'environnement
- `HUGGINGFACE_API_KEY` : Clé API Hugging Face
- `YOUTUBE_API_KEY` : Clé API YouTube (optionnel)
- `PORT` : Port du serveur (défaut: 8080)

### Modèles Whisper
- **base** : Modèle par défaut (équilibre vitesse/précision)
- **small** : Plus rapide, moins précis
- **medium** : Plus précis, plus lent
- **large** : Le plus précis, le plus lent

## 📊 Performance

- **Temps de traitement** : 2-5 minutes selon la durée de la vidéo
- **Précision transcription** : 95%+ avec Whisper
- **Qualité résumé** : Résumé intelligent et contextuel
- **Mémoire requise** : 2GB RAM minimum

## 🚨 Limitations

- Vidéos YouTube publiques uniquement
- Durée maximale recommandée : 30 minutes
- Limite de bande passante selon le plan Fly.io
- Modèles IA nécessitent un temps de chargement initial

## 🔄 Pipeline de traitement

1. **Extraction ID vidéo** : Parse l'URL YouTube
2. **Téléchargement audio** : yt-dlp + FFmpeg → MP3
3. **Transcription Whisper** : Audio → Texte
4. **Summarisation IA** : Texte → Résumé intelligent
5. **Nettoyage** : Suppression fichiers temporaires

## 🛡️ Sécurité

- Validation des URLs YouTube
- Nettoyage automatique des fichiers
- Gestion des erreurs robuste
- CORS configuré pour le frontend

## 📈 Monitoring

- Logs détaillés de chaque étape
- Endpoint `/health` pour monitoring
- Gestion des timeouts
- Retry automatique en cas d'échec

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - Voir LICENSE pour plus de détails
=======
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
>>>>>>> 59399861cfbc6b1fba6d39c815cf49e3922f95f3
