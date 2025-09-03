import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import downloadWithProxy from '../utils/downloadWithProxy.js';
import extractPdfText from '../utils/extractPdfText.js';
import summarizeText from '../utils/summarize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Summarizes PDF content from file upload or URL
 * @param {string|Buffer} input - File path or URL string
 * @returns {Promise<{summary: string, metadata: object}>}
 */
async function summarizePdf(input) {
  let buffer;
  let metadata = {};

  if (typeof input === 'string') {
    // URL download
    buffer = await downloadWithProxy(input);
    metadata = { source: 'pdf_url', url: input };
  } else {
    // File path from upload
    buffer = await fs.readFile(input);
    metadata = { source: 'pdf_upload', filename: path.basename(input) };
    await fs.unlink(input).catch(() => {}); // Clean up temp file
  }

  const text = await extractPdfText(buffer);
  const summary = await summarizeText(text);

  return {
    summary,
    metadata: {
      ...metadata,
      textLength: text.length,
      bufferSize: buffer.length
    }
  };
}

export { summarizePdf };












