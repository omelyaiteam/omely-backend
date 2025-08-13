# 🚀 Déploiement Fly.io - Guide Complet

## 📋 Prérequis
1. Créer un compte sur [fly.io](https://fly.io)
2. Installer Fly CLI : `curl -L https://fly.io/install.sh | sh`

## 🔧 Étapes de Déploiement

### 1. Se connecter à Fly.io
```bash
fly auth login
```

### 2. Aller dans le dossier backend
```bash
cd omely-backend
```

### 3. Créer l'application Fly.io
```bash
fly launch
```
- Répondre "no" à "Would you like to set up a Postgresql database now?"
- Répondre "no" à "Would you like to set up an Upstash Redis database now?"
- Répondre "no" à "Would you like to deploy now?"

### 4. Déployer l'application
```bash
fly deploy
```

### 5. Vérifier le déploiement
```bash
fly status
```

### 6. Tester l'endpoint
```bash
curl https://omely-backend.fly.dev/health
```

## ✅ Avantages Fly.io
- ✅ **Pas de limite de timeout** (30 minutes max)
- ✅ **3 machines gratuites** par mois
- ✅ **Support vidéos jusqu'à 10 minutes**
- ✅ **Qualité audio normale**
- ✅ **Modèle Whisper "base"** (plus précis)

## 🔗 URL de Production
- **Backend** : `https://omely-backend.fly.dev`
- **Frontend** : Votre site Netlify (inchangé)

## 🧪 Test
1. Allez sur votre site
2. Testez avec une vidéo YouTube de 5-10 minutes
3. La transcription devrait fonctionner parfaitement !
