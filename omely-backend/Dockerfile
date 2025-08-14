# Dockerfile optimisé pour OMELY Transcription API
# Support GPU et gestion des fichiers temporaires

FROM python:3.11-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN useradd --create-home --shell /bin/bash omely

# Création des dossiers de travail
RUN mkdir -p /app /tmp/omely_audio /tmp/omely_chunks /tmp/omely_cache
RUN chown -R omely:omely /app /tmp/omely_audio /tmp/omely_chunks /tmp/omely_cache

# Changement vers l'utilisateur non-root
USER omely
WORKDIR /app

# Copie des fichiers de dépendances
COPY --chown=omely:omely requirements.txt .

# Installation des dépendances Python
RUN pip install --no-cache-dir --user -r requirements.txt

# Copie du code source
COPY --chown=omely:omely . .

# Création des fichiers __init__.py pour les packages
RUN touch services/__init__.py utils/__init__.py

# Exposition du port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Commande de démarrage
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
