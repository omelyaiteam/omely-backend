#!/bin/bash

echo "🚀 Déploiement OMELY sur Fly.io"
echo "================================"

# Vérifier que fly CLI est installé
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI n'est pas installé"
    echo "Installez-le avec: curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Vérifier la connexion
echo "🔐 Vérification de la connexion..."
if ! fly auth whoami &> /dev/null; then
    echo "❌ Non connecté à Fly.io"
    echo "Connectez-vous avec: fly auth login"
    exit 1
fi

# Déployer l'application
echo "📦 Déploiement en cours..."
fly deploy

# Vérifier le statut
echo "📊 Vérification du statut..."
fly status

echo "✅ Déploiement terminé!"
echo "🌐 URL: https://omely-backend.fly.dev"
echo ""
echo "🔧 Pour configurer les secrets:"
echo "fly secrets set GEMINI_API_KEY=\"your_key\""
echo "fly secrets set YOUTUBE_API_KEY=\"your_key\""
