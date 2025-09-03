import extractPdfText from './extractPdfText.js';

/**
 * Traite un PDF volumineux en le divisant en chunks intelligents
 * @param {Buffer} buffer - Le buffer du PDF
 * @returns {Promise<string>} - Le texte traité et structuré
 */
async function processLargePdf(buffer) {
  try {
    console.log('📄 Début traitement PDF volumineux...');
    
    // Extraire tout le texte
    const fullText = await extractPdfText(buffer);
    
    console.log(`📄 Texte complet extrait: ${fullText.length} caractères`);
    
    // Diviser en chunks intelligents par chapitres
    const chunks = splitIntoChunks(fullText);
    
    console.log(`📄 Divisé en ${chunks.length} chunks intelligents`);
    
    // Traiter chaque chunk et combiner
    let processedText = '';
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`📄 Traitement chunk ${i + 1}/${chunks.length}: ${chunk.length} caractères`);
      
      // Ajouter des marqueurs de chunk
      processedText += `\n\n=== CHUNK ${i + 1}/${chunks.length} ===\n`;
      processedText += chunk;
      processedText += `\n=== FIN CHUNK ${i + 1} ===\n\n`;
    }
    
    console.log(`✅ Traitement PDF volumineux terminé: ${processedText.length} caractères`);
    return processedText;
    
  } catch (error) {
    console.error('❌ Erreur traitement PDF volumineux:', error);
    throw error;
  }
}

/**
 * Divise le texte en chunks intelligents par chapitres
 * @param {string} text - Le texte complet
 * @returns {Array<string>} - Les chunks
 */
function splitIntoChunks(text) {
  const chunks = [];
  const maxChunkSize = 15000; // Taille optimale pour l'IA
  
  // Diviser par chapitres d'abord
  const chapterSplits = text.split(/(📖 CHAPITRE:|📚 PARTIE:|📑 SECTION:)/);
  
  let currentChunk = '';
  
  for (let i = 0; i < chapterSplits.length; i++) {
    const section = chapterSplits[i];
    
    // Si on a un titre de chapitre, commencer un nouveau chunk
    if (section.match(/^(📖 CHAPITRE:|📚 PARTIE:|📑 SECTION:)/)) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
    
    currentChunk += section;
    
    // Si le chunk devient trop gros, le diviser
    if (currentChunk.length > maxChunkSize) {
      // Diviser par paragraphes
      const paragraphs = currentChunk.split(/\n\n/);
      let tempChunk = '';
      
      for (const paragraph of paragraphs) {
        if ((tempChunk + paragraph).length > maxChunkSize) {
          if (tempChunk.length > 0) {
            chunks.push(tempChunk.trim());
            tempChunk = '';
          }
        }
        tempChunk += paragraph + '\n\n';
      }
      
      currentChunk = tempChunk;
    }
  }
  
  // Ajouter le dernier chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export default processLargePdf;


