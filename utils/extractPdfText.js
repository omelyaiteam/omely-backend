// SERVICE D'EXTRACTION PDF OPTIMISÉ
import PDFParser from 'pdf2json';

// Configuration optimisée
const CONFIG = {
  maxTextLength: 200000,
  timeout: 30000
};

/**
 * Extrait le texte d'un fichier PDF
 * @param {string} filePath - Chemin vers le fichier PDF
 * @returns {Promise<{text: string, extractionTime: number}>}
 */
async function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log('📄 Extraction texte PDF...');

    const pdfParser = new PDFParser();

    // Timeout pour éviter les blocages
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout lors de l\'extraction PDF'));
    }, CONFIG.timeout);

    pdfParser.on('pdfParser_dataError', err => {
      clearTimeout(timeoutId);
      console.error('❌ Erreur extraction PDF:', err.parserError);
      reject(new Error('Échec de l\'extraction PDF: ' + err.parserError));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        clearTimeout(timeoutId);
        const rawText = pdfParser.getRawTextContent();

        console.log(`📄 Texte brut extrait: ${rawText.length} caractères`);

        // Nettoyer et formater le texte
        let formattedText = rawText
          // Nettoyer les espaces multiples
          .replace(/\s+/g, ' ')
          // Détection des sections importantes
          .replace(/(CHAPITRE\s+\d+|PARTIE\s+\d+|SECTION\s+\d+)/gi, '\n\n📖 $1\n')
          .replace(/(PRINCIPE|STRATÉGIE|RÈGLE)/gi, '\n\n🔑 $1')
          // Nettoyer les lignes vides
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();

        // Limiter la longueur si nécessaire
        if (formattedText.length > CONFIG.maxTextLength) {
          console.log(`📚 Texte tronqué: ${formattedText.length} → ${CONFIG.maxTextLength} caractères`);
          formattedText = formattedText.substring(0, CONFIG.maxTextLength) + '...';
        }

        const extractionTime = Date.now() - startTime;
        console.log(`✅ Extraction PDF terminée: ${formattedText.length} caractères en ${extractionTime}ms`);

        resolve({
          text: formattedText,
          extractionTime
        });

      } catch (error) {
        reject(new Error('Traitement du texte PDF échoué: ' + error.message));
      }
    });

    // Charger et parser le fichier
    pdfParser.loadPDF(filePath);
  });
}

console.log('✅ Service extraction PDF optimisé chargé !');
export { extractTextFromPDF };

