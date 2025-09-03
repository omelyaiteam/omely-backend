import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import transcribe from '../utils/transcribe.js';
import summarizeText from '../utils/summarize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROXY = 'socks5://00d3bd63b39069b84eb9:7a942b1b7d9b3782@gw.dataimpulse.com:824';

/**
 * Downloads YouTube audio using yt-dlp with SOCKS5 proxy
 * @param {string} url - YouTube URL
 * @returns {Promise<{success: boolean, audioBuffer: Buffer, downloadTime: number, size: number}>}
 */
async function downloadYouTubeAudio(url) {
  const tempDir = path.join(__dirname, '../ultra_temp');
  await fs.mkdir(tempDir, { recursive: true });

  const outputPath = path.join(tempDir, `yt_${Date.now()}.mp3`);
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', [
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '16K',
      '--proxy', PROXY,
      '--user-agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      '--no-check-certificates',
      '--force-ipv4',
      '--extractor-args', 'youtube:player_client=android_music,youtube:formats=worst',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '--retries', '1',
      '--fragment-retries', '1',
      '--concurrent-fragments', '8',
      '--buffer-size', '4K',
      '--http-chunk-size', '256K',
      '--geo-bypass',
      '--no-keep-video',
      '--prefer-free-formats',
      '--max-filesize', '50M',
      '-o', outputPath,
      url
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    ytDlp.on('close', async (code) => {
      const downloadTime = Date.now() - startTime;
      if (code === 0) {
        try {
          const audioBuffer = await fs.readFile(outputPath);
          await fs.unlink(outputPath);
          resolve({ success: true, audioBuffer, downloadTime, size: audioBuffer.length });
        } catch (error) {
          await fs.unlink(outputPath).catch(() => {});
          reject(error);
        }
      } else {
        await fs.unlink(outputPath).catch(() => {});
        reject(new Error('yt-dlp failed'));
      }
    });

    ytDlp.on('error', reject);

    setTimeout(() => {
      ytDlp.kill();
      reject(new Error('yt-dlp timeout'));
    }, 30000);
  });
}

/**
 * Summarizes YouTube video content
 * @param {string} url - YouTube URL
 * @returns {Promise<{summary: string, metadata: object}>}
 */
async function summarizeYoutube(url) {
  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    throw new Error('Invalid YouTube URL');
  }

  const { success, audioBuffer, downloadTime } = await downloadYouTubeAudio(url);
  if (!success) throw new Error('Audio download failed');

  // Pour la compatibilité, on écrit temporairement le buffer dans un fichier
  const tempFile = path.join(__dirname, '../ultra_temp', `temp_youtube_${Date.now()}.mp3`);
  await fs.writeFile(tempFile, audioBuffer);

  let transcript;
  try {
    transcript = await transcribe(tempFile);
  } finally {
    await fs.unlink(tempFile).catch(() => {});
  }
  const summary = await summarizeText(transcript);

  return {
    summary,
    metadata: {
      source: 'youtube',
      url,
      downloadTime,
      transcriptLength: transcript.length,
      audioSize: audioBuffer.length
    }
  };
}

export { summarizeYoutube };

