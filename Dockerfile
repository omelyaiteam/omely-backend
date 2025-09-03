# OMELY BACKEND - IMAGE OPTIMISÉE POUR DÉPLOIEMENT LÉGER
FROM node:18-alpine

# Installer FFmpeg et outils nécessaires
RUN apk add --no-cache \
    ffmpeg \
    curl \
    && rm -rf /var/cache/apk/*

# Créer répertoire de travail
WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p temp

# Variables d'environnement optimisées
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Exposer le port
EXPOSE 3001

# Démarrage optimisé
CMD ["node", "server.js"]
