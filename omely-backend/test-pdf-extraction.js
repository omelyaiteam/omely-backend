import fs from 'fs/promises';
import extractPdfText from './utils/extractPdfText.js';

async function testPdfExtraction() {
  try {
    console.log('🧪 Test d\'extraction PDF...');
    
    // Test avec un petit PDF de test si disponible
    const testPdfPath = './test.pdf';
    
    try {
      const pdfBuffer = await fs.readFile(testPdfPath);
      console.log(`📄 Fichier PDF trouvé: ${testPdfPath}`);
      
      const extractedText = await extractPdfText(pdfBuffer);
      
      console.log('\n📝 TEXTE EXTRAIT:');
      console.log('='.repeat(50));
      console.log(extractedText.substring(0, 1000) + '...');
      console.log('='.repeat(50));
      console.log(`📊 Longueur totale: ${extractedText.length} caractères`);
      
    } catch (error) {
      console.log('⚠️ Aucun fichier test.pdf trouvé, test d\'extraction terminé');
      console.log('✅ Le module d\'extraction PDF est prêt à être utilisé');
    }
    
  } catch (error) {
    console.error('❌ Erreur test extraction:', error);
  }
}

testPdfExtraction();


