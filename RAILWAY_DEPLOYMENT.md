# 🚀 Déploiement Railway - Backend YouTube Transcription

Guide pour déployer le backend de transcription YouTube sur Railway.

## 📋 Prérequis

- Compte GitHub
- Compte Railway (gratuit)

## 🎯 Étapes de Déploiement

### **1. Créer un Repository GitHub**

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez "New repository"
3. Nommez-le `omely-backend` ou `youtube-transcriber-backend`
4. Créez le repository

### **2. Uploader les Fichiers**

Uploadez ces fichiers dans votre repository :
- `youtube_transcriber.py`
- `requirements.txt`
- `Procfile`
- `runtime.txt`

### **3. Déployer sur Railway**

1. Allez sur [Railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez "New Project"
4. Sélectionnez "Deploy from GitHub repo"
5. Choisissez votre repository
6. Railway détectera automatiquement que c'est Python

### **4. Configuration Railway**

Railway va automatiquement :
- Installer les dépendances Python
- Installer ffmpeg
- Démarrer le serveur

### **5. Obtenir l'URL du Backend**

1. Dans Railway, allez dans votre projet
2. Cliquez sur "Settings"
3. Copiez l'URL de votre service (ex: `https://omely-backend-production.up.railway.app`)

## 🔧 Configuration Frontend

### **Modifier app.html**

Remplacez cette ligne dans `app.html` :
```javascript
const response = await fetch('https://VOTRE-URL-RAILWAY/transcribe', {
```

Par votre vraie URL Railway :
```javascript
const response = await fetch('https://omely-backend-production.up.railway.app/transcribe', {
```

## 🧪 Test

### **Test du Backend**
```bash
curl https://VOTRE-URL-RAILWAY/health
```

### **Test de Transcription**
```bash
curl -X POST https://VOTRE-URL-RAILWAY/transcribe \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=VIDEO_ID"}'
```

## 💰 Coût

- **Railway** : 500 heures/mois gratuites
- **Netlify** : Gratuit
- **Total** : 0€/mois

## 🎉 Résultat

- ✅ Backend en ligne 24/7
- ✅ Transcription YouTube complète
- ✅ Summarization automatique
- ✅ Pas besoin que votre PC soit allumé

## 🆘 Dépannage

### **Erreur "Build failed"**
- Vérifiez que tous les fichiers sont uploadés
- Vérifiez la version Python dans `runtime.txt`

### **Erreur "ffmpeg not found"**
- Railway installe automatiquement ffmpeg
- Si problème, contactez le support Railway

### **Erreur CORS**
- Le backend a CORS activé par défaut
- Si problème, vérifiez l'URL dans le frontend

---

**🎯 Résultat Final** : Transcription YouTube complète en ligne ! 🚀
