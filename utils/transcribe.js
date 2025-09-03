// SERVICE WHISPER OPTIMISÉ POUR LA TRANSCRIPTION AUDIO
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

// Configuration optimisée
const CONFIG = {
  maxFileSize: 25 * 1024 * 1024, // 25MB max pour Whisper
  supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'flac'],
  model: 'whisper-1',
  responseFormat: 'text',
  temperature: 0
};

/**
 * Transcrit un fichier audio en texte utilisant OpenAI Whisper
 * @param {string} audioFilePath - Chemin vers le fichier audio
 * @returns {Promise<string>} - Le texte transcrit
 */
async function transcribe(audioFilePath) {
  try {
    // Vérifier que le fichier existe
    const stats = await fs.stat(audioFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    console.log(`🎵 Transcription avec Whisper: ${fileSizeMB.toFixed(2)}MB`);

    // Vérifier la taille du fichier
    if (stats.size > CONFIG.maxFileSize) {
      throw new Error(`Fichier audio trop volumineux: ${fileSizeMB.toFixed(2)}MB (max: ${CONFIG.maxFileSize / (1024 * 1024)}MB)`);
    }

    // Vérifier l'extension du fichier
    const extension = audioFilePath.split('.').pop()?.toLowerCase();
    if (!CONFIG.supportedFormats.includes(extension)) {
      throw new Error(`Format audio non supporté: ${extension}. Formats supportés: ${CONFIG.supportedFormats.join(', ')}`);
    }

    // Créer la transcription
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioFilePath),
      model: CONFIG.model,
      response_format: CONFIG.responseFormat,
      temperature: CONFIG.temperature,
      language: 'fr' // Détection automatique de la langue française
    });

    console.log(`✅ Transcription terminée: ${transcription.length} caractères`);
    return transcription.trim();

  } catch (error) {
    console.error('❌ Erreur transcription Whisper:', error);
    throw new Error(`Échec de la transcription: ${error.message}`);
  }
}

/**
 * Test de connexion au service Whisper
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function testWhisperConnection() {
  try {
    // Test basique de l'API OpenAI
    const response = await openai.models.list();
    const hasWhisper = response.data.some(model => model.id === 'whisper-1');

    return {
      success: hasWhisper,
      message: hasWhisper ? 'Whisper disponible' : 'Whisper non disponible'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

console.log('✅ Service Whisper optimisé chargé !');
export default transcribe;
