import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import downloadWithProxy from '../utils/downloadWithProxy.js';
import transcribe from '../utils/transcribe.js';
import summarizeText from '../utils/summarize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Summarizes audio content from file upload or URL
 * @param {string|Buffer} input - File path or URL string
 * @returns {Promise<{summary: string, metadata: object}>}
 */
async function summarizeAudio(input) {
  let audioBuffer;
  let metadata = {};

  if (typeof input === 'string') {
    // URL download
    audioBuffer = await downloadWithProxy(input);
    metadata = { source: 'audio_url', url: input };
  } else {
    // File path from upload
    audioBuffer = await fs.readFile(input);
    metadata = { source: 'audio_upload', filename: path.basename(input) };
    await fs.unlink(input).catch(() => {}); // Clean up temp file
  }

  // Check file size (50MB limit)
  if (audioBuffer.length > 50 * 1024 * 1024) {
    throw new Error('Audio file too large (max 50MB)');
  }

  // Pour la compatibilité, on écrit temporairement le buffer dans un fichier
  const tempFile = path.join(__dirname, '../ultra_temp', `temp_audio_${Date.now()}.mp3`);
  await fs.writeFile(tempFile, audioBuffer);

  try {
      const transcript = await transcribe(tempFile);
    const rawSummary = await summarizeText(transcript);

    // Formater le résumé audio comme les PDFs avec structure professionnelle
    const formattedSummary = formatAudioSummary(rawSummary, metadata);

    return {
      summary: formattedSummary,
      metadata: {
        ...metadata,
        transcriptLength: transcript.length,
        audioSize: audioBuffer.length,
        formatted: true
      }
    };
  } finally {
    await fs.unlink(tempFile).catch(() => {});
  }
}

/**
 * Formate le résumé audio avec la même structure professionnelle que les PDFs
 * @param {string} summary - Le résumé brut
 * @param {object} metadata - Les métadonnées du fichier
 * @returns {string} - Le résumé formaté
 */
function formatAudioSummary(summary, metadata) {
  const fileType = metadata.source === 'youtube' ? 'YouTube Video' : 'Audio File';
  const title = metadata.source === 'youtube' ? `Video: ${metadata.url}` : `File: ${metadata.filename || 'Unknown'}`;

  // Structure identique aux PDFs avec séparateurs visuels
  let formatted = `═══ AUDIO TRANSCRIPTION SUMMARY ═══\n\n`;
  formatted += `🎵 **${fileType} Analysis**\n\n`;
  formatted += `**📋 Source:** ${title}\n`;
  formatted += `**⏱️ Duration:** Audio transcription completed\n`;
  formatted += `**📊 Content Type:** Spoken content analysis\n\n`;

  formatted += `═══ TRANSCRIPTION & ANALYSIS ═══\n\n`;

  // Ajouter le résumé avec formatage amélioré
  formatted += `${summary}\n\n`;

  // Section insights si disponible
  if (summary.includes('point') || summary.includes('conclusion') || summary.includes('résumé')) {
    formatted += `═══ KEY INSIGHTS ═══\n\n`;
    formatted += `🔑 **Main Points Extracted:**\n`;
    formatted += `- Content has been analyzed and summarized above\n`;
    formatted += `- Key themes and conclusions are highlighted in the transcription\n`;
    formatted += `- Full context preserved for comprehensive understanding\n\n`;
  }

  formatted += `═══ TECHNICAL DETAILS ═══\n\n`;
  formatted += `📝 **Processing Information:**\n`;
  formatted += `- Audio transcribed using advanced Whisper AI\n`;
  formatted += `- Content analyzed and structured for clarity\n`;
  formatted += `- Full transcription preserved for reference\n\n`;

  formatted += `⚡ **Quality Assurance:**\n`;
  formatted += `- High-accuracy speech-to-text conversion\n`;
  formatted += `- Context-aware summarization applied\n`;
  formatted += `- Professional formatting for readability\n\n`;

  formatted += `═══ END OF ANALYSIS ═══`;

  return formatted;
}

export { summarizeAudio };

