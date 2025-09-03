# OMELY Backend Ultra-Rapide v5.0 🚀

Backend ultra-rapide pour la summarization de contenu YouTube, audio et vidéo avec **yt-dlp**, **Whisper** et **OpenAI**.

## ✨ Fonctionnalités

- 🎬 **YouTube Summarization** - Téléchargement ultra-rapide avec yt-dlp + proxy
- 🎵 **Audio Transcription** - Whisper AI pour la reconnaissance vocale
- 📝 **Content Summarization** - GPT-3.5 pour des résumés intelligents
- 🔒 **Proxy Integration** - Proxy SOCKS5 configuré pour éviter les blocages
- ⚡ **Ultra-Rapide** - Optimisé pour la vitesse maximale

## 🚀 Installation

### Prérequis

1. **Node.js 18+** installé
2. **yt-dlp** installé globalement
3. **Clé API OpenAI** valide

### Installation de yt-dlp

```bash
# Sur macOS avec Homebrew
brew install yt-dlp

# Sur Ubuntu/Debian
sudo apt update
sudo apt install yt-dlp

# Sur Windows avec Chocolatey
choco install yt-dlp

# Ou avec pip
pip install yt-dlp
```

### Configuration du Backend

1. **Cloner et installer les dépendances**
```bash
cd omely-backend
npm install
```

2. **Configurer la clé OpenAI**
```bash
# Créer un fichier .env (ou définir la variable d'environnement)
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env

# Ou définir la variable d'environnement
export OPENAI_API_KEY="sk-proj-your-key-here"
```

3. **Démarrer le serveur**
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

## 🔧 Configuration

### Variables d'environnement

```env
OPENAI_API_KEY=sk-proj-your-key-here
PORT=3001
NODE_ENV=development
```

### Proxy Configuration

Le proxy SOCKS5 est déjà configuré dans le code :
```javascript
proxy: 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824'
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### YouTube Summarization
```bash
POST /summarize/youtube
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### Audio Summarization
```bash
POST /summarize/audio
Content-Type: multipart/form-data

file: [audio_file.mp3]
```

### Video Summarization
```bash
POST /summarize/video
Content-Type: multipart/form-data

file: [video_file.mp4]
```

### PDF Summarization
```bash
POST /summarize/pdf
Content-Type: multipart/form-data

file: [document.pdf]
```

## 🧪 Tests

### Test rapide du backend
```bash
npm test
```

### Test avec une vraie URL YouTube
```bash
node test-backend.js "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Test manuel avec curl
```bash
# Health check
curl http://localhost:3001/health

# YouTube summarization
curl -X POST http://localhost:3001/summarize/youtube \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=VIDEO_ID"}'
```

## 🚀 Déploiement

### Déploiement local
```bash
npm start
```

### Déploiement sur Fly.io
```bash
npm run deploy
```

## 📊 Performance

- **YouTube Download**: ~5-15 secondes (selon la taille)
- **Whisper Transcription**: ~2-5 secondes
- **GPT Summarization**: ~1-3 secondes
- **Total**: ~8-23 secondes pour une vidéo complète

## 🔍 Debugging

### Logs détaillés
Le serveur affiche des logs détaillés pour chaque étape :
- 🚀 Démarrage des processus
- ✅ Succès des opérations
- ❌ Erreurs détaillées
- ⏱️ Temps de traitement

### Vérification du proxy
```bash
# Test de la connectivité proxy
curl --socks5 gw.dataimpulse.com:824 http://httpbin.org/ip
```

## 🛠️ Dépannage

### Erreur "yt-dlp not found"
```bash
# Installer yt-dlp globalement
pip install yt-dlp

# Ou vérifier le PATH
which yt-dlp
```

### Erreur "OpenAI API key invalid"
```bash
# Vérifier la clé API
echo $OPENAI_API_KEY

# Ou créer le fichier .env
echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
```

### Erreur de proxy
```bash
# Vérifier la connectivité
curl --socks5 gw.dataimpulse.com:824 http://httpbin.org/ip

# Si le proxy ne fonctionne pas, modifier server.js
```

## 🔄 Mise à jour

```bash
git pull origin main
npm install
npm start
```

## 📝 Changelog

### v5.0.0
- 🔄 Backend complètement refondu
- ⚡ Optimisation ultra-rapide
- 🎯 Intégration directe OpenAI + Whisper
- 🔒 Proxy SOCKS5 configuré
- 📊 Logs détaillés et métriques

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

**OMELY Backend Ultra-Rapide v5.0** - Transformez vos vidéos YouTube en résumés intelligents en quelques secondes ! 🚀
