import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let openai = null;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-testing'
  });
} catch (error) {
  console.warn('⚠️ OpenAI client not initialized (missing API key)');
}

/**
 * Transcribes audio file using OpenAI Whisper (optimized for memory usage)
 * @param {string} audioFilePath - Path to the audio file (instead of buffer to save memory)
 * @returns {Promise<string>} - The transcribed text
 */
async function transcribe(audioFilePath) {
  if (!openai) {
    throw new Error('OpenAI client not initialized - missing API key');
  }

  // Vérifier que le fichier existe et obtenir sa taille
  const stats = await fs.stat(audioFilePath);
  console.log(`🎵 Transcription de ${(stats.size / (1024 * 1024)).toFixed(2)}MB avec Whisper...`);

  // Limite de taille pour éviter les timeouts (20MB max pour Whisper)
  const MAX_WHISPER_SIZE = 20 * 1024 * 1024; // 20MB
  if (stats.size > MAX_WHISPER_SIZE) {
    throw new Error(`Fichier audio trop volumineux pour Whisper: ${(stats.size / (1024 * 1024)).toFixed(2)}MB. Maximum: ${MAX_WHISPER_SIZE / (1024 * 1024)}MB. Conseil: compressez le fichier ou utilisez un extrait plus court.`);
  }

  const transcription = await openai.audio.transcriptions.create({
    file: createReadStream(audioFilePath),
    model: 'whisper-1',
    response_format: 'text',
    temperature: 0
  });

  console.log(`✅ Transcription terminée (${transcription.length} caractères)`);
  return transcription;
}

export default transcribe;
