import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurer ffmpeg pour utiliser la version statique
ffmpeg.setFfmpegPath(ffmpegStatic);

// Configuration pour éviter les fuites mémoire
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max
const EXTRACTION_TIMEOUT = 300000; // 5 minutes timeout

/**
 * Extracts audio from a video file using streams to avoid memory issues
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the output audio file (optional)
 * @returns {Promise<string>} - Path to the extracted audio file
 */
async function extractAudio(inputPath, outputPath = path.join(__dirname, '../ultra_temp', `audio_${Date.now()}.mp3`)) {
  return new Promise(async (resolve, reject) => {
    try {
      // Vérifier la taille du fichier d'entrée
      const stats = await fs.stat(inputPath);
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(`Fichier trop volumineux: ${(stats.size / (1024 * 1024)).toFixed(2)}MB. Maximum autorisé: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      console.log(`🎵 Extraction audio depuis ${inputPath} vers ${outputPath}`);

      let timeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Timeout lors de l\'extraction audio')), EXTRACTION_TIMEOUT);
      });

      const extractionPromise = new Promise((resolveExtract, rejectExtract) => {
        const command = ffmpeg(inputPath)
          .output(outputPath)
          .audioCodec('libmp3lame')
          .audioBitrate('64k') // Réduit pour économiser mémoire
          .audioChannels(1) // Mono au lieu de stéréo
          .audioFrequency(22050) // Fréquence réduite
          .on('start', (commandLine) => {
            console.log('🔄 FFmpeg command: ' + commandLine);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`📊 Progression extraction: ${progress.percent.toFixed(1)}%`);
            }
          })
          .on('end', async () => {
            try {
              // Vérifier que le fichier de sortie existe et n'est pas vide
              const outputStats = await fs.stat(outputPath);
              if (outputStats.size === 0) {
                throw new Error('Fichier audio de sortie vide');
              }

              console.log(`✅ Audio extrait: ${(outputStats.size / (1024 * 1024)).toFixed(2)}MB`);
              resolveExtract(outputPath);
            } catch (error) {
              rejectExtract(error);
            }
          })
          .on('error', (err) => {
            console.error('❌ Erreur FFmpeg:', err);
            rejectExtract(err);
          });

        command.run();
      });

      const result = await Promise.race([extractionPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      resolve(result);

    } catch (error) {
      console.error('❌ Erreur extraction audio:', error);
      reject(error);
    }
  });
}

export default extractAudio;

