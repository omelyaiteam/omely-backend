// SERVICE D'EXTRACTION AUDIO OPTIMISÉ
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurer ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configuration optimisée
const CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB max
  timeout: 300000, // 5 minutes
  audioCodec: 'libmp3lame',
  audioBitrate: '128k',
  audioChannels: 2,
  audioFrequency: 44100
};

/**
 * Extrait l'audio d'un fichier vidéo
 * @param {string} inputPath - Chemin du fichier vidéo d'entrée
 * @param {string} outputPath - Chemin du fichier audio de sortie (optionnel)
 * @returns {Promise<string>} - Chemin du fichier audio extrait
 */
async function extractAudio(inputPath, outputPath = null) {
  return new Promise(async (resolve, reject) => {
    try {
      // Vérifier que le fichier d'entrée existe
      const stats = await fs.stat(inputPath);
      const fileSizeMB = stats.size / (1024 * 1024);

      console.log(`🎬 Extraction audio depuis vidéo: ${fileSizeMB.toFixed(2)}MB`);

      // Vérifier la taille du fichier
      if (stats.size > CONFIG.maxFileSize) {
        throw new Error(`Fichier vidéo trop volumineux: ${fileSizeMB.toFixed(2)}MB (max: ${CONFIG.maxFileSize / (1024 * 1024)}MB)`);
      }

      // Générer le chemin de sortie si non fourni
      if (!outputPath) {
        outputPath = path.join(__dirname, '../temp', `audio_${Date.now()}.mp3`);
      }

      // Timeout pour éviter les blocages
      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout lors de l\'extraction audio'));
      }, CONFIG.timeout);

      const command = ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec(CONFIG.audioCodec)
        .audioBitrate(CONFIG.audioBitrate)
        .audioChannels(CONFIG.audioChannels)
        .audioFrequency(CONFIG.audioFrequency)
        .on('start', (commandLine) => {
          console.log('🔄 FFmpeg démarré');
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`📊 Extraction: ${progress.percent.toFixed(1)}%`);
          }
        })
        .on('end', async () => {
          clearTimeout(timeoutId);

          try {
            // Vérifier que le fichier de sortie existe et n'est pas vide
            const outputStats = await fs.stat(outputPath);
            if (outputStats.size === 0) {
              throw new Error('Fichier audio de sortie vide');
            }

            const outputSizeMB = outputStats.size / (1024 * 1024);
            console.log(`✅ Audio extrait: ${outputSizeMB.toFixed(2)}MB`);
            resolve(outputPath);

          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          clearTimeout(timeoutId);
          console.error('❌ Erreur FFmpeg:', err.message);
          reject(new Error(`Échec de l'extraction audio: ${err.message}`));
        });

      command.run();

    } catch (error) {
      console.error('❌ Erreur extraction audio:', error);
      reject(error);
    }
  });
}

console.log('✅ Service extraction audio optimisé chargé !');
export default extractAudio;

