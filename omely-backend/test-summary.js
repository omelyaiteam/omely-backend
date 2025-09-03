import { summarizeContentDetailed } from './server.js';

async function testSummary() {
  try {
    console.log('🧪 Test du nouveau système de résumé...');
    
    const testText = `Les Secrets d'un Esprit Millionnaire
    par T. Harv Eker
    
    CHAPITRE 1: VOTRE PLAN FINANCIER INTÉRIEUR
    
    Le plan financier intérieur détermine votre niveau de richesse. Ce plan est créé dans votre enfance et contient toutes vos croyances sur l'argent.
    
    Les 17 différences entre les riches et les pauvres:
    1. Les riches pensent: "Je crée ma vie"
    2. Les pauvres pensent: "La vie m'arrive"
    3. Les riches jouent au jeu de l'argent pour gagner
    4. Les pauvres jouent au jeu de l'argent pour ne pas perdre
    
    CHAPITRE 2: LES DOSSIERS FINANCIERS DE VOTRE ESPRIT
    
    Vos dossiers financiers contiennent vos pensées, croyances et habitudes liées à l'argent. Ces dossiers peuvent être reprogrammés.
    
    Exemple concret: Si vous croyez que "l'argent est la racine de tous les maux", vous repousserez inconsciemment l'argent.`;
    
    console.log('📝 Texte de test:', testText.substring(0, 200) + '...');
    
    const result = await summarizeContentDetailed(testText, 'test');
    
    console.log('\n📊 RÉSULTAT:');
    console.log('='.repeat(50));
    console.log(result.summary);
    console.log('='.repeat(50));
    console.log(`⏱️ Temps de traitement: ${result.summarizationTime}ms`);
    
  } catch (error) {
    console.error('❌ Erreur test résumé:', error);
  }
}

testSummary();


