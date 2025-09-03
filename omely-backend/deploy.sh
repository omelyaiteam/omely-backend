#!/bin/bash

echo "🚀 Déploiement OMELY Node.js Backend sur Fly.io"

# Vérifier que fly est installé
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl n'est pas installé. Installez-le d'abord."
    exit 1
fi

# Créer l'app si elle n'existe pas
echo "📱 Création de l'app Fly.io..."
flyctl apps create omely-node-backend --org personal || echo "App existe déjà"

# Configurer les secrets (UNIQUEMENT sur Fly.io)
echo "🔐 Configuration des secrets..."
read -p "Entrez votre clé OpenAI (sera stockée de façon sécurisée sur Fly.io): " OPENAI_KEY
flyctl secrets set OPENAI_API_KEY="$OPENAI_KEY" -a omely-node-backend

# Optionnel: Redis externe ou utiliser Redis interne
echo "🗄️ Configuration Redis..."
flyctl secrets set REDIS_URL="redis://127.0.0.1:6379" -a omely-node-backend

# Déployer
echo "🚀 Déploiement en cours..."
flyctl deploy -a omely-node-backend

echo "✅ Déploiement terminé!"
echo "🌐 URL: https://omely-node-backend.fly.dev"
echo "🏥 Health: https://omely-node-backend.fly.dev/health"
