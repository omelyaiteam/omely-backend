#!/bin/bash

echo "🚀 Déploiement OMELY sur Fly.io"
echo "================================"

# Vérifier que Fly CLI est installé
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI n'est pas installé"
    echo "📦 Installation de Fly CLI..."
    curl -L https://fly.io/install.sh | sh
    echo "✅ Fly CLI installé"
else
    echo "✅ Fly CLI déjà installé"
fi

# Vérifier la connexion
echo "🔐 Vérification de la connexion..."
if ! fly auth whoami &> /dev/null; then
    echo "🔑 Connexion requise..."
    fly auth login
else
    echo "✅ Déjà connecté"
fi

# Vérifier que l'app existe
echo "📱 Vérification de l'application..."
if ! fly apps list | grep -q "omely-backend"; then
    echo "🆕 Création de l'application..."
    fly apps create omely-backend
else
    echo "✅ Application existante"
fi

# Déployer
echo "🚀 Déploiement en cours..."
fly deploy

# Vérifier le statut
echo "📊 Vérification du statut..."
fly status

echo "✅ Déploiement terminé!"
echo "🌐 URL: https://omely-backend.fly.dev"
echo "📋 Logs: fly logs"
echo "🔧 SSH: fly ssh console"
