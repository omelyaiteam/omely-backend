import PDFParser from 'pdf2json';

/**
 * Extracts text content from a PDF buffer with ULTRA-PROFESSIONAL extraction
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} - The extracted text content
 */
async function extractPdfText(buffer) {
  return new Promise((resolve, reject) => {
    console.log('📄 DÉBUT EXTRACTION PDF ULTRA-PROFESSIONNELLE...');
    
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', err => {
      console.error('❌ Erreur extraction PDF:', err.parserError);
      reject(new Error('PDF extraction failed: ' + err.parserError));
    });
    
    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const rawText = pdfParser.getRawTextContent();
        
        console.log(`📄 Texte brut extrait: ${rawText.length} caractères`);
        
        // VÉRIFICATION CRITIQUE - Si le texte est trop court, c'est suspect
        if (rawText.length < 10000) {
          console.warn(`⚠️ ATTENTION: Texte très court (${rawText.length} caractères). Extraction probablement incomplète!`);
        }
        
        // EXTRACTION ULTRA-PROFESSIONNELLE avec détection intelligente
        let formattedText = rawText
          // Nettoyer les espaces multiples
          .replace(/\s+/g, ' ')
          
          // DÉTECTION ULTRA-PRÉCISE des principes et points clés
          .replace(/(PRINCIPE[^:]*:)/gi, '\n\n🔑 PRINCIPE: $1\n')
          .replace(/(RÈGLE[^:]*:)/gi, '\n\n📋 RÈGLE: $1\n')
          .replace(/(LOI[^:]*:)/gi, '\n\n⚖️ LOI: $1\n')
          .replace(/(DIFFÉRENCE[^:]*:)/gi, '\n\n⚡ DIFFÉRENCE: $1\n')
          .replace(/(ENSEIGNEMENT[^:]*:)/gi, '\n\n🎓 ENSEIGNEMENT: $1\n')
          .replace(/(STRATÉGIE[^:]*:)/gi, '\n\n🎯 STRATÉGIE: $1\n')
          .replace(/(MÉTHODE[^:]*:)/gi, '\n\n📊 MÉTHODE: $1\n')
          .replace(/(SYSTÈME[^:]*:)/gi, '\n\n🔄 SYSTÈME: $1\n')
          .replace(/(TECHNIQUE[^:]*:)/gi, '\n\n🛠️ TECHNIQUE: $1\n')
          .replace(/(FORMULE[^:]*:)/gi, '\n\n🧮 FORMULE: $1\n')
          
          // Détection des titres de chapitres et sections
          .replace(/(CHAPITRE[^:]*:)/gi, '\n\n📖 CHAPITRE: $1\n')
          .replace(/(PARTIE[^:]*:)/gi, '\n\n📚 PARTIE: $1\n')
          .replace(/(SECTION[^:]*:)/gi, '\n\n📑 SECTION: $1\n')
          .replace(/(CHAPITRE\s+\d+)/gi, '\n\n📖 $1\n')
          .replace(/(PARTIE\s+\d+)/gi, '\n\n📚 $1\n')
          
          // Détection des listes numérotées
          .replace(/(\d+\.\s+[A-Z][^.!?]*)/g, '\n$1')
          .replace(/(\d+\)\s+[A-Z][^.!?]*)/g, '\n$1')
          
          // Détection des citations et phrases importantes
          .replace(/(«[^»]+»)/g, '\n💬 CITATION: $1\n')
          .replace(/("[^"]+")/g, '\n💬 CITATION: $1\n')
          .replace(/([A-Z][^.!?]{20,}[.!?])/g, '\n💡 POINT CLÉ: $1\n')
          
          // Détection des mots-clés importants
          .replace(/(RICHES[^.!?]*)/gi, '\n💰 RICHES: $1\n')
          .replace(/(PAUVRES[^.!?]*)/gi, '\n💸 PAUVRES: $1\n')
          .replace(/(ARGENT[^.!?]*)/gi, '\n💵 ARGENT: $1\n')
          .replace(/(RICHESSE[^.!?]*)/gi, '\n🏆 RICHESSE: $1\n')
          .replace(/(SUCCÈS[^.!?]*)/gi, '\n🎯 SUCCÈS: $1\n')
          .replace(/(ÉCHEC[^.!?]*)/gi, '\n❌ ÉCHEC: $1\n')
          
          // Nettoyer les caractères spéciaux mais garder les accents
          .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}àâäéèêëïîôöùûüÿç]/g, ' ')
          
          // Restaurer les espaces autour de la ponctuation
          .replace(/([.!?])([A-Z])/g, '$1 $2')
          
          // Nettoyer les lignes vides multiples
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          
          .trim();
        
        console.log(`✅ Extraction PDF ULTRA-PROFESSIONNELLE terminée: ${formattedText.length} caractères`);
        
        // ANALYSE DÉTAILLÉE des éléments détectés
        const elements = {
          principes: (formattedText.match(/🔑/g) || []).length,
          regles: (formattedText.match(/📋/g) || []).length,
          lois: (formattedText.match(/⚖️/g) || []).length,
          differences: (formattedText.match(/⚡/g) || []).length,
          enseignements: (formattedText.match(/🎓/g) || []).length,
          strategies: (formattedText.match(/🎯/g) || []).length,
          methodes: (formattedText.match(/📊/g) || []).length,
          systemes: (formattedText.match(/🔄/g) || []).length,
          techniques: (formattedText.match(/🛠️/g) || []).length,
          formules: (formattedText.match(/🧮/g) || []).length,
          citations: (formattedText.match(/💬/g) || []).length,
          pointsCles: (formattedText.match(/💡/g) || []).length,
          chapitres: (formattedText.match(/📖/g) || []).length,
          parties: (formattedText.match(/📚/g) || []).length,
          sections: (formattedText.match(/📑/g) || []).length,
          riches: (formattedText.match(/💰/g) || []).length,
          pauvres: (formattedText.match(/💸/g) || []).length,
          argent: (formattedText.match(/💵/g) || []).length,
          richesse: (formattedText.match(/🏆/g) || []).length,
          succes: (formattedText.match(/🎯/g) || []).length,
          echec: (formattedText.match(/❌/g) || []).length
        };
        
        const totalElements = Object.values(elements).reduce((a, b) => a + b, 0);
        
        console.log(`📊 ANALYSE DÉTAILLÉE:`);
        console.log(`   🔑 Principes: ${elements.principes}`);
        console.log(`   📋 Règles: ${elements.regles}`);
        console.log(`   ⚡ Différences: ${elements.differences}`);
        console.log(`   💬 Citations: ${elements.citations}`);
        console.log(`   📖 Chapitres: ${elements.chapitres}`);
        console.log(`   💰 Concepts riches: ${elements.riches}`);
        console.log(`   💸 Concepts pauvres: ${elements.pauvres}`);
        console.log(`   🏆 Concepts richesse: ${elements.richesse}`);
        console.log(`   📊 TOTAL ÉLÉMENTS: ${totalElements}`);
        
        // VÉRIFICATION CRITIQUE - Si pas assez d'éléments, avertir
        if (totalElements < 20) {
          console.warn(`⚠️ ATTENTION: Seulement ${totalElements} éléments clés détectés. Le PDF pourrait être incomplet ou mal extrait.`);
          console.warn(`⚠️ RECOMMANDATION: Vérifier que le PDF contient bien tout le contenu du livre.`);
        } else if (totalElements < 50) {
          console.warn(`⚠️ ATTENTION: ${totalElements} éléments détectés. Extraction partielle possible.`);
        } else {
          console.log(`✅ EXCELLENT: ${totalElements} éléments clés détectés - Extraction complète réussie!`);
        }
        
        // Ajouter un marqueur de qualité
        if (totalElements >= 50) {
          formattedText = `🚀 EXTRACTION COMPLÈTE - ${totalElements} ÉLÉMENTS CLÉS DÉTECTÉS\n\n` + formattedText;
        } else if (totalElements >= 20) {
          formattedText = `⚠️ EXTRACTION PARTIELLE - ${totalElements} ÉLÉMENTS DÉTECTÉS\n\n` + formattedText;
        } else {
          formattedText = `❌ EXTRACTION INCOMPLÈTE - ${totalElements} ÉLÉMENTS DÉTECTÉS\n\n` + formattedText;
        }
        
        resolve(formattedText);
      } catch (error) {
        reject(new Error('PDF text processing failed: ' + error.message));
      }
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export default extractPdfText;

