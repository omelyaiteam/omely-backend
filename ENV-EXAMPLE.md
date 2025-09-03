# Configuration Environnement - OMELY Backend

## Variables Obligatoires

```bash
# Clé API OpenAI (nécessaire pour GPT-4o mini et Whisper)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Configuration serveur
PORT=3001
HOST=0.0.0.0
NODE_ENV=production
```

## Variables Optionnelles

```bash
# Configuration stockage temporaire
TEMP_DIR=temp
MAX_FILE_SIZE=100000000

# Configuration optimisation
MAX_TEXT_LENGTH=200000
CHUNK_SIZE=50000
TIMEOUT_MS=180000
```

## Comment Configurer

### Pour le Développement Local :
1. Créer un fichier `.env` dans le dossier `omely-backend/`
2. Copier le contenu ci-dessus
3. Remplacer `sk-your-openai-api-key-here` par votre vraie clé OpenAI

### Pour le Déploiement :
- **Render** : Ajouter les variables dans les "Environment Variables"
- **Deta** : Configurer dans le dashboard Deta
- **Cyclic** : Ajouter dans les variables d'environnement Cyclic

## Obtenir une Clé OpenAI

1. Aller sur [OpenAI Platform](https://platform.openai.com/)
2. Créer un compte ou se connecter
3. Aller dans "API Keys"
4. Créer une nouvelle clé API
5. Copier la clé et l'ajouter dans votre configuration

⚠️ **Important** : Gardez votre clé API secrète et ne la partagez jamais !
