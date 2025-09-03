FROM node:18-alpine

# Install ffmpeg for video/audio processing
RUN apk add --no-cache \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Forcer l'installation d'axios explicitement
RUN npm install axios --omit=dev
RUN npm list axios

# Copy source files (utiliser le serveur chat)
COPY server-chat.js ./
COPY server.js ./
COPY cookies.txt ./
COPY utils/ ./utils/
COPY services/ ./services/

# Create storage and temp directories
RUN mkdir -p storage ultra_temp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
