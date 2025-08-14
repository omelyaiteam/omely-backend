# 🎯 OMELY YouTube Transcription API

Système de transcription YouTube avancé avec anti-détection et traitement local.

## 🚀 Fonctionnalités

- **Extraction YouTube** : Utilise yt-dlp avec techniques anti-détection avancées
- **Transcription locale** : OpenAI Whisper avec support GPU/CPU
- **Anti-détection** : Rotation de user agents, proxies, cookies navigateur
- **Gestion des fichiers** : Nettoyage automatique des fichiers temporaires
- **API REST** : FastAPI avec documentation automatique
- **Production ready** : Optimisé pour fly.io avec Docker

## 🏗️ Architecture

```
backend/
├── main.py                 # Serveur FastAPI principal
├── services/
│   ├── youtube_extractor.py    # Extraction YouTube avec yt-dlp
│   ├── transcription.py        # Service Whisper local
│   └── proxy_manager.py        # Gestion des proxies
├── utils/
│   └── temp_cleanup.py         # Nettoyage des fichiers temporaires
├── requirements.txt            # Dépendances Python
├── Dockerfile                  # Configuration Docker
└── fly.toml                   # Configuration fly.io
```

## 🛠️ Installation

### Prérequis

- Python 3.11+
- FFmpeg
- Git

### Installation locale

```bash
# Cloner le repository
git clone <repository-url>
cd omely-backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur
python main.py
```

### Variables d'environnement

```bash
# Configuration des proxies (optionnel)
PROXY_ENABLED=true
PROXY_LIST=http://proxy1:port,http://proxy2:port
PROXY_ROTATION=true

# Configuration du serveur
PORT=8000
HOST=0.0.0.0
DEBUG=false
```

## 📡 API Endpoints

### GET /
Page d'accueil avec informations sur l'API

### GET /health
Vérification de l'état des services

### GET /status
Statut détaillé du système

### POST /extract-transcribe
Transcription d'une vidéo YouTube

**Request:**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=...",
  "language": "auto",
  "max_duration": 7200
}
```

**Response:**
```json
{
  "status": "success",
  "transcription": "Texte transcrit...",
  "duration": 1830,
  "title": "Titre de la vidéo",
  "processing_time": 45.2
}
```

## 🚀 Déploiement

### Fly.io

```bash
# Installer flyctl
curl -L https://fly.io/install.sh | sh

# Se connecter
fly auth login

# Déployer
fly deploy

# Vérifier le statut
fly status
```

### Docker

```bash
# Construire l'image
docker build -t omely-backend .

# Lancer le conteneur
docker run -p 8000:8000 omely-backend
```

## 🧪 Tests

```bash
# Lancer les tests
python test_new_api.py

# Tests manuels avec curl
curl http://localhost:8000/health
curl http://localhost:8000/status
```

## 🔧 Configuration avancée

### Anti-détection YouTube

Le système utilise plusieurs techniques pour éviter la détection :

- **Rotation de user agents** : 5 user agents différents
- **Headers réalistes** : Headers HTTP complets
- **Cookies navigateur** : Utilisation des cookies Chrome
- **Proxies** : Support de rotation de proxies
- **Retry automatique** : 3 tentatives avec délais aléatoires

### Optimisation Whisper

- **Détection automatique GPU** : Utilise CUDA si disponible
- **Modèle adaptatif** : Choisit le modèle selon la mémoire
- **Chunking** : Découpe les longues vidéos en chunks
- **Support multilingue** : Détection automatique de langue

### Gestion des fichiers

- **Nettoyage automatique** : Suppression des fichiers temporaires
- **Limites de taille** : Max 2GB par fichier, 10GB total
- **Rotation temporelle** : Nettoyage des fichiers de plus de 24h

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Statut détaillé
```bash
curl http://localhost:8000/status
```

### Logs
```bash
# Voir les logs en temps réel
fly logs

# Logs avec filtrage
fly logs --app omely-backend
```

## 🔒 Sécurité

- **Validation des URLs** : Vérification des URLs YouTube
- **Limites de durée** : Max 2 heures par vidéo
- **Limites de taille** : Max 2GB par fichier
- **Rate limiting** : Protection contre les abus
- **Nettoyage automatique** : Suppression des données sensibles

## 🐛 Dépannage

### Problèmes courants

1. **Erreur d'import Whisper**
   ```bash
   pip install --upgrade openai-whisper
   ```

2. **Erreur FFmpeg**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # macOS
   brew install ffmpeg
   
   # Windows
   # Télécharger depuis https://ffmpeg.org/
   ```

3. **Erreur de mémoire**
   - Réduire la taille des chunks
   - Utiliser un modèle Whisper plus petit
   - Augmenter la mémoire sur fly.io

### Logs de debug

```bash
# Activer les logs détaillés
export DEBUG=true
python main.py
```

## 📈 Performance

### Optimisations

- **GPU acceleration** : Utilisation automatique de CUDA
- **Chunking intelligent** : Découpe optimisée des vidéos
- **Cache des modèles** : Réutilisation des modèles Whisper
- **Nettoyage asynchrone** : Nettoyage en arrière-plan

### Métriques

- **Temps de traitement** : ~1-2x la durée de la vidéo
- **Utilisation mémoire** : 2-4GB selon le modèle
- **Taille des fichiers** : ~10-50MB par heure de vidéo

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

- **Issues** : [GitHub Issues](https://github.com/omelyaiteam/omely-backend/issues)
- **Documentation** : [Wiki](https://github.com/omelyaiteam/omely-backend/wiki)
- **Discord** : [Serveur Discord](https://discord.gg/omely)
