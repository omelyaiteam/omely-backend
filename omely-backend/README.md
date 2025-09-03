# OMELY BACKEND - VERSION OPTIMISÉE

Backend léger utilisant GPT-4o mini et Whisper pour le traitement de fichiers PDF, audio et vidéo.

## 🚀 Fonctionnalités

- 📄 **Extraction PDF** : Extraction de texte optimisée
- 🎵 **Transcription Audio** : Utilise Whisper d'OpenAI
- 🎬 **Traitement Vidéo** : Extraction audio + transcription
- 🤖 **Chat IA** : Interface GPT-4o mini
- ⚡ **Ultra-rapide** : Optimisé pour les performances
- ☁️ **Déploiement léger** : Compatible Render, Deta, Cyclic

## 📋 Prérequis

- Node.js 18+
- Clé API OpenAI (pour GPT-4o mini et Whisper)

## 🛠️ Installation

```bash
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` :

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

## 🚀 Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Chat
- `POST /chat` - Chat IA avec mémoire
- `GET /health` - Health check
- `GET /test` - Test route

### Summarization
- `POST /summarize/pdf` - Résume un PDF
- `POST /summarize/audio` - Transcrit et résume un audio
- `POST /summarize/video` - Traite une vidéo complète
- `POST /extract/book` - Extraction complète de livre

## ☁️ Déploiement

### Render

1. Créer un nouveau service Web
2. Connecter votre repo GitHub
3. Configuration :
   - **Runtime** : Node
   - **Build Command** : `npm ci --only=production`
   - **Start Command** : `node server.js`
4. Variables d'environnement :
   - `OPENAI_API_KEY` : Votre clé API OpenAI
   - `NODE_ENV` : `production`
   - `PORT` : `3001`

### Deta

```bash
# Installer Deta CLI
pip install deta

# Déployer
deta deploy
```

### Cyclic

1. Connecter votre repo GitHub
2. Cyclic détectera automatiquement Node.js
3. Ajouter `OPENAI_API_KEY` dans les variables d'environnement

## 📊 Optimisations

- **Mémoire** : Gestion optimisée des fichiers temporaires
- **Performance** : Requêtes parallèles et cache intelligent
- **Taille** : Image Docker minimale (< 200MB)
- **Coût** : Utilise exclusivement GPT-4o mini (économique)

## 📝 Structure

```
omely-backend/
├── server.js           # Serveur principal optimisé
├── utils/
│   ├── openaiService.js    # Service GPT-4o mini
│   ├── transcribe.js       # Service Whisper
│   ├── extractAudio.js     # Extraction audio vidéo
│   └── extractPdfText.js   # Extraction texte PDF
├── temp/               # Fichiers temporaires
├── Dockerfile         # Image optimisée
├── render.yaml        # Configuration Render
└── package.json       # Dépendances minimales
```

---

**OMELY Backend v1.0** - Backend optimisé et prêt pour le déploiement léger ! ⚡
